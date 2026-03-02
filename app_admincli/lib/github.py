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


def _github_upload(local_path: Path, record_id: str) -> str:
  owner = os.getenv("GITHUB_OWNER")
  repo = os.getenv("GITHUB_REPO")
  token = os.getenv("GITHUB_TOKEN")
  if not owner or not repo or not token:
    raise RuntimeError("GITHUB_OWNER, GITHUB_REPO, and GITHUB_TOKEN must be set in .env.")

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

