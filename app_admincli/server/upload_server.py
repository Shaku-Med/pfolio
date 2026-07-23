"""Legacy HTTP upload service — unused.

The dashboard now calls server/upload_action.py via subprocess (same helpers as the CLI).
This module is kept only for reference and can be deleted.
"""
import base64
import hmac
import json
import os
import tempfile
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlparse

import crud

UPLOAD_PORT = 3001
MAX_BODY = 16 * 1024 * 1024
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


def _token() -> str | None:
    value = os.getenv("ADMIN_UPLOAD_TOKEN") or ""
    return value.strip() or None


def _send(handler, status: int, payload: dict) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def _body(handler) -> dict | None:
    try:
        length = int(handler.headers.get("Content-Length") or 0)
    except ValueError:
        return None
    if length <= 0 or length > MAX_BODY:
        return None
    try:
        parsed = json.loads(handler.rfile.read(length).decode("utf-8"))
    except (ValueError, UnicodeDecodeError, OSError):
        return None
    return parsed if isinstance(parsed, dict) else None


def _parse_index(raw) -> int | None | bool:
    """Return int index, None when omitted, or False when invalid."""
    if raw is None or raw == "":
        return None
    try:
        value = int(raw)
    except (TypeError, ValueError):
        return False
    if value < 0:
        return False
    return value


class UploadHandler(BaseHTTPRequestHandler):
    def _authorized(self) -> bool:
        expected = _token()
        if not expected:
            return False
        return hmac.compare_digest(self.headers.get("X-Admin-Token", ""), expected)

    def do_GET(self):
        if urlparse(self.path).path.rstrip("/") in ("", "/health"):
            _send(self, 200, {"ok": True, "service": "pfolio-uploads"})
            return
        _send(self, 404, {"error": "Not found"})

    def do_POST(self):
        if urlparse(self.path).path.rstrip("/") != "/api/upload":
            _send(self, 404, {"error": "Not found"})
            return
        if not self._authorized():
            _send(self, 401, {"error": "Not allowed"})
            return

        body = _body(self)
        if not body:
            _send(self, 400, {"error": "Bad request"})
            return

        table = str(body.get("table") or "")
        column = str(body.get("column") or "")
        record_id = str(body.get("id") or "")
        filename = str(body.get("filename") or "upload.png")
        content_b64 = body.get("content_b64")
        index = _parse_index(body.get("index"))

        if table not in ALLOWED_COLUMNS or column not in ALLOWED_COLUMNS[table]:
            _send(self, 400, {"error": "That field does not take a file"})
            return
        if index is False:
            _send(self, 400, {"error": "Bad request"})
            return
        if index is not None and column not in LIST_COLUMNS.get(table, set()):
            _send(self, 400, {"error": "That field does not take a file index"})
            return
        if not record_id or not isinstance(content_b64, str) or not content_b64:
            _send(self, 400, {"error": "Bad request"})
            return

        suffix = Path(filename).suffix.lower()
        if suffix not in SAFE_SUFFIXES:
            _send(self, 400, {"error": "Use a jpg, png or webp image"})
            return

        try:
            raw = base64.b64decode(content_b64, validate=True)
        except Exception:
            _send(self, 400, {"error": "Bad file data"})
            return
        if not raw or len(raw) > 12 * 1024 * 1024:
            _send(self, 400, {"error": "That file is too big"})
            return

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
            _send(self, 500, {"error": "The upload did not go through"})
            return
        payload = {"endpoint": result["endpoint"]}
        if result.get("endpoints") is not None:
            payload["endpoints"] = result["endpoints"]
        _send(self, 200, payload)

    def do_DELETE(self):
        if urlparse(self.path).path.rstrip("/") != "/api/upload":
            _send(self, 404, {"error": "Not found"})
            return
        if not self._authorized():
            _send(self, 401, {"error": "Not allowed"})
            return

        body = _body(self) or {}
        table = str(body.get("table") or "")
        record_id = str(body.get("id") or "")
        column = str(body.get("column") or "")
        index = _parse_index(body.get("index"))

        # Slot remove: list file column + index
        if column and index is not None and index is not False:
            if table not in LIST_COLUMNS or column not in LIST_COLUMNS[table]:
                _send(self, 400, {"error": "That field does not take a file index"})
                return
            if not record_id:
                _send(self, 400, {"error": "Bad request"})
                return
            endpoints = crud.remove_file_from_list(table, record_id, column, index)
            if endpoints is None:
                _send(self, 400, {"error": "Could not remove that image"})
                return
            _send(self, 200, {"endpoints": endpoints})
            return

        if index is False:
            _send(self, 400, {"error": "Bad request"})
            return

        # Full-record purge (used when deleting a row)
        if table not in ALLOWED_COLUMNS or not record_id:
            _send(self, 400, {"error": "Bad request"})
            return

        removed = crud.purge_files_for_record(table, record_id)
        _send(self, 200, {"removed": removed})

    def log_message(self, *_args):
        pass


def run_uploads(port: int = UPLOAD_PORT) -> None:
    if not _token():
        print("ADMIN_UPLOAD_TOKEN is not set in app_admincli/.env. Uploads stay off until it is.")
        return
    with HTTPServer(("127.0.0.1", port), UploadHandler) as httpd:
        print(f"Upload service on http://127.0.0.1:{port}")
        httpd.serve_forever()
