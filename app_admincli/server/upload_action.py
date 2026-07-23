"""One-shot image actions for the Next.js dashboard (no long-running upload server).

Reads one JSON object from stdin, writes one JSON object to stdout.
Actions: upload | remove | purge
"""
from __future__ import annotations

import base64
import json
import os
import sys
import tempfile
from pathlib import Path

# Ensure app_admincli is on the path when run as a script.
_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from env_load import load_admin_env  # noqa: E402

load_admin_env()

import crud  # noqa: E402

ALLOWED_COLUMNS = {
    "projects": {"image"},
    "experience": {"logo"},
    "gallery": {"src", "project_srcs"},
    "blog_posts": {"cover_image"},
}
LIST_COLUMNS = {
    "gallery": {"project_srcs"},
}
SAFE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}


def _out(payload: dict, code: int = 0) -> None:
    sys.stdout.write(json.dumps(payload))
    sys.stdout.flush()
    raise SystemExit(code)


def _parse_index(raw):
    if raw is None or raw == "":
        return None
    try:
        value = int(raw)
    except (TypeError, ValueError):
        return False
    if value < 0:
        return False
    return value


def do_upload(body: dict) -> None:
    table = str(body.get("table") or "")
    column = str(body.get("column") or "")
    record_id = str(body.get("id") or "")
    filename = str(body.get("filename") or "upload.png")
    content_b64 = body.get("content_b64")
    index = _parse_index(body.get("index"))

    if table not in ALLOWED_COLUMNS or column not in ALLOWED_COLUMNS[table]:
        _out({"error": "That field does not take a file"}, 1)
    if index is False:
        _out({"error": "Bad request"}, 1)
    if index is not None and column not in LIST_COLUMNS.get(table, set()):
        _out({"error": "That field does not take a file index"}, 1)
    if not record_id or not isinstance(content_b64, str) or not content_b64:
        _out({"error": "Bad request"}, 1)

    suffix = Path(filename).suffix.lower()
    if suffix not in SAFE_SUFFIXES:
        _out({"error": "Use a jpg, png or webp image"}, 1)

    try:
        raw = base64.b64decode(content_b64, validate=True)
    except Exception:
        _out({"error": "Bad file data"}, 1)
    if not raw or len(raw) > 12 * 1024 * 1024:
        _out({"error": "That file is too big"}, 1)

    tmp = Path(tempfile.gettempdir()) / f"pfolio_upload_{os.urandom(8).hex()}{suffix}"
    try:
        tmp.write_bytes(raw)
        result = crud.set_file_for_record(table, record_id, column, str(tmp), index)
    finally:
        try:
            tmp.unlink()
        except OSError:
            pass

    if not result or not result.get("endpoint"):
        _out({"error": "The upload did not go through"}, 1)
    payload = {"endpoint": result["endpoint"]}
    if result.get("endpoints") is not None:
        payload["endpoints"] = result["endpoints"]
    _out(payload)


def do_remove(body: dict) -> None:
    table = str(body.get("table") or "")
    column = str(body.get("column") or "")
    record_id = str(body.get("id") or "")
    index = _parse_index(body.get("index"))

    if table not in LIST_COLUMNS or column not in LIST_COLUMNS[table]:
        _out({"error": "That field does not take a file index"}, 1)
    if not record_id or index is None or index is False:
        _out({"error": "Bad request"}, 1)

    endpoints = crud.remove_file_from_list(table, record_id, column, index)
    if endpoints is None:
        _out({"error": "Could not remove that image"}, 1)
    _out({"endpoints": endpoints})


def do_purge(body: dict) -> None:
    table = str(body.get("table") or "")
    record_id = str(body.get("id") or "")
    if table not in ALLOWED_COLUMNS or not record_id:
        _out({"error": "Bad request"}, 1)
    removed = crud.purge_files_for_record(table, record_id)
    _out({"removed": removed})


def main() -> None:
    try:
        body = json.load(sys.stdin)
    except (ValueError, OSError):
        _out({"error": "Bad request"}, 1)
    if not isinstance(body, dict):
        _out({"error": "Bad request"}, 1)

    action = str(body.get("action") or "").strip().lower()
    if action == "upload":
        do_upload(body)
    if action == "remove":
        do_remove(body)
    if action == "purge":
        do_purge(body)
    _out({"error": "Unknown action"}, 1)


if __name__ == "__main__":
    main()
