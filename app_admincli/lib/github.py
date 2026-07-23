import base64
import os
import subprocess
import uuid
from datetime import datetime
from pathlib import Path

import requests
from PIL import Image


def _ensure_ffmpeg() -> None:
  try:
    subprocess.run(
      ["ffmpeg", "-version"],
      stdout=subprocess.DEVNULL,
      stderr=subprocess.DEVNULL,
      check=True,
    )
  except (FileNotFoundError, subprocess.CalledProcessError):
    raise RuntimeError("ffmpeg is required but was not found in PATH.")


def _validate_image(path: Path) -> str:
  try:
    with Image.open(path) as img:
      img.verify()
    with Image.open(path) as img:
      fmt = (img.format or "").lower()
  except Exception as e:
    raise RuntimeError(f"Invalid or corrupted image: {e}")
  if fmt not in {"jpeg", "jpg", "png", "webp"}:
    raise RuntimeError(f"Unsupported image format: {fmt}")
  if fmt == "jpg":
    fmt = "jpeg"
  return fmt


def _compress_image_ffmpeg(src: Path, fmt: str) -> Path:
  _ensure_ffmpeg()
  tmp_dir = Path.cwd() / ".tmp_admincli"
  tmp_dir.mkdir(exist_ok=True)
  ext = ".jpg" if fmt == "jpeg" else f".{fmt}"
  out = tmp_dir / f"{uuid.uuid4().hex}{ext}"
  cmd = [
    "ffmpeg",
    "-y",
    "-i",
    str(src),
    "-vf",
    "scale='min(1600,iw)':'-2'",
    "-qscale:v",
    "3",
    str(out),
  ]
  subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
  return out


def _repo_config() -> tuple[str, str, str]:
  owner = os.getenv("GITHUB_OWNER")
  repo = os.getenv("GITHUB_REPO")
  token = os.getenv("GITHUB_TOKEN")
  if not owner or not repo or not token:
    raise RuntimeError("GITHUB_OWNER, GITHUB_REPO, and GITHUB_TOKEN must be set in .env.")
  return owner, repo, token


def _headers(token: str) -> dict:
  return {
    "Authorization": f"token {token}",
    "Accept": "application/vnd.github+json",
  }


def _contents_url(owner: str, repo: str, api_path: str) -> str:
  return f"https://api.github.com/repos/{owner}/{repo}/contents/{api_path}"


def _api_path(endpoint_path: str) -> str:
  """Stored endpoints look like /MM_DD_YYYY/<record>/<file>. Keep them inside the repo."""
  cleaned = (endpoint_path or "").strip().lstrip("/")
  if not cleaned or ".." in cleaned or cleaned.startswith("http"):
    raise RuntimeError(f"Refusing to touch an unexpected path: {endpoint_path!r}")
  return cleaned


def _current_sha(owner: str, repo: str, token: str, api_path: str) -> str | None:
  resp = requests.get(_contents_url(owner, repo, api_path), headers=_headers(token), timeout=30)
  if resp.status_code == 404:
    return None
  if resp.status_code != 200:
    raise RuntimeError(f"GitHub lookup failed ({resp.status_code}): {resp.text}")
  data = resp.json()
  if isinstance(data, list):
    raise RuntimeError("That endpoint is a folder, not a file.")
  return data.get("sha")


def _github_upload(local_path: Path, record_id: str) -> str:
  owner, repo, token = _repo_config()

  today = datetime.utcnow().strftime("%m_%d_%Y")
  ext = local_path.suffix or ".png"
  random_id = uuid.uuid4().hex
  endpoint_path = f"/{today}/{record_id}/{random_id}{ext}"
  api_path = endpoint_path.lstrip("/")

  with local_path.open("rb") as f:
    content_b64 = base64.b64encode(f.read()).decode("ascii")

  url = f"https://api.github.com/repos/{owner}/{repo}/contents/{api_path}"
  data = {"message": f"upload {api_path}", "content": content_b64}
  headers = {
    "Authorization": f"token {token}",
    "Accept": "application/vnd.github+json",
  }

  resp = requests.put(url, json=data, headers=headers, timeout=30)
  if resp.status_code not in (200, 201):
    raise RuntimeError(f"GitHub upload failed ({resp.status_code}): {resp.text}")

  return endpoint_path


def upload_image_for_record(local_path_str: str, record_id: str) -> str | None:
  if not local_path_str:
    return None
  src = Path(local_path_str).expanduser()
  if not src.exists():
    print("Image file not found.")
    return None
  try:
    fmt = _validate_image(src)
    compressed = _compress_image_ffmpeg(src, fmt)
    endpoint = _github_upload(compressed, record_id)
    return endpoint
  except Exception as e:
    print(f"Image upload failed: {e}")
    return None


def _github_replace(local_path: Path, endpoint_path: str) -> str:
  """Overwrite the file already living at endpoint_path so the stored URL stays valid."""
  owner, repo, token = _repo_config()
  api_path = _api_path(endpoint_path)

  sha = _current_sha(owner, repo, token, api_path)
  if sha is None:
    raise RuntimeError(f"Nothing is stored at {endpoint_path} to replace.")

  with local_path.open("rb") as f:
    content_b64 = base64.b64encode(f.read()).decode("ascii")

  data = {"message": f"replace {api_path}", "content": content_b64, "sha": sha}
  resp = requests.put(
    _contents_url(owner, repo, api_path), json=data, headers=_headers(token), timeout=30
  )
  if resp.status_code not in (200, 201):
    raise RuntimeError(f"GitHub replace failed ({resp.status_code}): {resp.text}")

  return endpoint_path if endpoint_path.startswith("/") else f"/{endpoint_path}"


def replace_image_at_endpoint(local_path_str: str, endpoint_path: str) -> str | None:
  """Swap the image behind an existing endpoint. Keeps the same path on purpose."""
  if not local_path_str or not endpoint_path:
    return None
  src = Path(local_path_str).expanduser()
  if not src.exists():
    print("Image file not found.")
    return None
  try:
    fmt = _validate_image(src)
    compressed = _compress_image_ffmpeg(src, fmt)
    return _github_replace(compressed, endpoint_path)
  except Exception as e:
    print(f"Image replace failed: {e}")
    return None


def delete_endpoint(endpoint_path: str) -> bool:
  """Remove one uploaded file from the repo. Missing files count as already gone."""
  if not endpoint_path:
    return False
  try:
    owner, repo, token = _repo_config()
    api_path = _api_path(endpoint_path)
    sha = _current_sha(owner, repo, token, api_path)
    if sha is None:
      return True
    resp = requests.delete(
      _contents_url(owner, repo, api_path),
      json={"message": f"remove {api_path}", "sha": sha},
      headers=_headers(token),
      timeout=30,
    )
    if resp.status_code not in (200, 201):
      raise RuntimeError(f"GitHub delete failed ({resp.status_code}): {resp.text}")
    return True
  except Exception as e:
    print(f"Could not remove {endpoint_path}: {e}")
    return False


def purge_endpoints(endpoint_paths) -> int:
  """Delete every uploaded file belonging to a record. Returns how many went."""
  removed = 0
  for path in endpoint_paths or []:
    if isinstance(path, str) and path.strip() and not path.strip().startswith("http"):
      if delete_endpoint(path.strip()):
        removed += 1
  return removed

