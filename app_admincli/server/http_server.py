import json
import os
import re
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

import crud

DEFAULT_PORT = 3001
HTML_DIR = os.path.join(os.path.dirname(__file__), "html")
STATIC_FILES = {"/ui/style.css": "style.css", "/ui/app.js": "app.js"}
PAGE_ROUTES = {"/": "dashboard.html", "/dashboard": "dashboard.html"}


def _read_json_body(handler: BaseHTTPRequestHandler) -> dict | None:
    length = handler.headers.get("Content-Length")
    if not length:
        return None
    try:
        n = int(length)
        if n <= 0 or n > 1024 * 1024:
            return None
        raw = handler.rfile.read(n)
        return json.loads(raw.decode("utf-8"))
    except (ValueError, json.JSONDecodeError, OSError):
        return None


def _send_json(handler: BaseHTTPRequestHandler, status: int, data: dict) -> None:
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.end_headers()
    handler.wfile.write(json.dumps(data).encode("utf-8"))


def _send_file(handler: BaseHTTPRequestHandler, filepath: str, content_type: str) -> bool:
    try:
        with open(filepath, "rb") as f:
            data = f.read()
    except OSError:
        return False
    handler.send_response(200)
    handler.send_header("Content-Type", content_type)
    handler.send_header("Content-Length", str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)
    return True


# Path pattern: /api/<resource> or /api/<resource>/<id>
_API_PATTERN = re.compile(r"^/api/([a-z_]+)/?([^/]*)$")


def _opt(val):
    """None or empty string -> None; otherwise return value."""
    if val is None or (isinstance(val, str) and val.strip() == ""):
        return None
    return val


def _is_local_path(s):
    """True if s looks like a local file path (should not be stored as cover_image)."""
    if not s or not isinstance(s, str):
        return False
    s = s.strip()
    if not s:
        return False
    # Windows: C:\, D:\, etc.; or path with backslashes
    if re.match(r"^[a-zA-Z]:[\\/]", s) or "\\" in s:
        return True
    # Unix absolute path
    if s.startswith("/") and not s.startswith("http"):
        return True
    return False


class AdminHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        if path == "/health":
            _send_json(self, 200, {"ok": True, "service": "pfolio-admin", "port": self.server.server_port})
            return
        if path in PAGE_ROUTES:
            fp = os.path.join(HTML_DIR, PAGE_ROUTES[path])
            if _send_file(self, fp, "text/html"):
                return
        if path in STATIC_FILES:
            fp = os.path.join(HTML_DIR, STATIC_FILES[path])
            ctype = "text/css" if path.endswith(".css") else "application/javascript"
            if _send_file(self, fp, ctype):
                return
        m = _API_PATTERN.match(path)
        if not m:
            _send_json(self, 404, {"error": "Not found"})
            return
        resource, id_part = m.group(1), (m.group(2) or "").strip()
        if id_part:
            _send_json(self, 404, {"error": "Not found"})
            return
        if resource == "projects":
            data = crud.get_projects_list()
        elif resource == "experience":
            data = crud.get_experience_list()
        elif resource == "stack":
            data = crud.get_stack_list()
        elif resource == "blog":
            data = crud.get_blog_list()
        elif resource == "gallery":
            data = crud.get_gallery_list()
        else:
            _send_json(self, 404, {"error": "Unknown resource"})
            return
        _send_json(self, 200, {"data": data})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        m = _API_PATTERN.match(path)
        if not m:
            _send_json(self, 404, {"error": "Not found"})
            return
        resource, id_part = m.group(1), (m.group(2) or "").strip()
        body = _read_json_body(self) or {}
        if resource == "projects":
            if not (body.get("title") or "").strip():
                _send_json(self, 400, {"error": "title is required"})
                return
            row = {k: body.get(k) for k in ("category", "title", "description", "tags", "image_alt", "github_url", "live_url", "links", "details_md") if k in body}
            row.setdefault("category", "")
            row.setdefault("title", (body.get("title") or "").strip())
            row.setdefault("description", "")
            row.setdefault("tags", [])
            row.setdefault("image_alt", "")
            row.setdefault("links", [])
            row["github_url"] = _opt(row.get("github_url") or body.get("github_url"))
            row["live_url"] = _opt(row.get("live_url") or body.get("live_url"))
            pid = crud.projects_insert(row, _opt(body.get("image_path")))
            if pid:
                _send_json(self, 201, {"id": pid})
            else:
                _send_json(self, 500, {"error": "Insert failed"})
        elif resource == "experience":
            if not (body.get("title") or "").strip():
                _send_json(self, 400, {"error": "title is required"})
                return
            period = body.get("period") or {}
            row = {
                "role": (body.get("role") or "").strip(),
                "title": (body.get("title") or "").strip(),
                "period": {"from": (period.get("from") or "").strip(), "to": (period.get("to") or "").strip()},
                "description": (body.get("description") or "").strip(),
                "company": _opt(body.get("company")),
                "location": _opt(body.get("location")),
                "logo": _opt(body.get("logo")),
                "highlights": body.get("highlights", []),
                "tags": body.get("tags", []),
                "development_summary": _opt(body.get("development_summary")),
                "challenges": body.get("challenges", []),
                "learnings": body.get("learnings", []),
                "details_md": _opt(body.get("details_md")),
            }
            eid = crud.experience_insert(row, _opt(body.get("logo_path")))
            if eid:
                _send_json(self, 201, {"id": eid})
            else:
                _send_json(self, 500, {"error": "Insert failed"})
        elif resource == "stack":
            if not (body.get("category") or "").strip() or not (body.get("tools") or "").strip():
                _send_json(self, 400, {"error": "category and tools are required"})
                return
            row = {
                "category": (body.get("category") or "").strip(),
                "tools": (body.get("tools") or "").strip(),
                "description": (body.get("description") or "").strip(),
            }
            sid = crud.stack_insert(row)
            if sid:
                _send_json(self, 201, {"id": sid})
            else:
                _send_json(self, 500, {"error": "Insert failed"})
        elif resource == "gallery":
            if not (body.get("title") or "").strip():
                _send_json(self, 400, {"error": "title is required"})
                return
            row = {
                "title": (body.get("title") or "").strip(),
                "subtitle": (body.get("subtitle") or "").strip(),
                "tone": (body.get("tone") or "dark").strip() or "dark",
                "details_md": _opt(body.get("details_md")),
            }
            gid = crud.gallery_insert(
                row,
                src_path=_opt(body.get("src_path")),
                project_srcs_dir=_opt(body.get("project_srcs_dir")),
                project_srcs_path=_opt(body.get("project_srcs_path")),
            )
            if gid:
                _send_json(self, 201, {"id": gid})
            else:
                _send_json(self, 500, {"error": "Insert failed"})
        elif resource == "blog":
            if not (body.get("slug") or "").strip() or not (body.get("title") or "").strip():
                _send_json(self, 400, {"error": "slug and title are required"})
                return
            cover = _opt(body.get("cover_image"))
            if cover and _is_local_path(cover):
                cover = None  # never store local path; use cover_image_path to upload
            row = {
                "slug": (body.get("slug") or "").strip(),
                "title": (body.get("title") or "").strip(),
                "category": (body.get("category") or "").strip(),
                "excerpt": (body.get("excerpt") or "").strip(),
                "date": _opt(body.get("date")),
                "read_time": _opt(body.get("read_time")),
                "tags": body.get("tags", []),
                "cover_image": cover,
                "body": (body.get("body") or "").strip(),
            }
            bid = crud.blog_insert(row, _opt(body.get("cover_image_path")))
            if bid:
                _send_json(self, 201, {"id": bid})
            else:
                _send_json(self, 500, {"error": "Insert failed"})
        elif resource == "resume":
            if "body_md" in body:
                ok = crud.resume_upsert_body(str(body["body_md"]))
            elif "path" in body:
                ok = crud.resume_upload_from_file(str(body["path"]))
            else:
                _send_json(self, 400, {"error": "Provide body_md or path"})
                return
            if ok:
                _send_json(self, 200, {"ok": True})
            else:
                _send_json(self, 400, {"error": "Empty body or file not found"})
        else:
            _send_json(self, 404, {"error": "Unknown resource"})

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        m = _API_PATTERN.match(path)
        if not m:
            _send_json(self, 404, {"error": "Not found"})
            return
        resource, id_part = m.group(1), (m.group(2) or "").strip()
        if not id_part:
            _send_json(self, 400, {"error": "Missing resource id"})
            return
        body = _read_json_body(self) or {}
        if resource == "projects":
            row = {k: body.get(k) for k in ("category", "title", "description", "image", "image_alt", "tags", "github_url", "live_url", "links", "details_md") if k in body}
            ok = crud.projects_update_by_id(id_part, row)
        elif resource == "experience":
            row = {k: body.get(k) for k in ("role", "title", "period", "description", "company", "location", "logo", "highlights", "tags", "development_summary", "challenges", "learnings", "details_md") if k in body}
            ok = crud.experience_update_by_id(id_part, row)
        elif resource == "stack":
            row = {k: body.get(k) for k in ("category", "tools", "description") if k in body}
            ok = crud.stack_update_by_id(id_part, row)
        elif resource == "blog":
            row = {k: body.get(k) for k in ("slug", "title", "category", "excerpt", "date", "read_time", "tags", "cover_image", "body") if k in body}
            if "cover_image" in row and _is_local_path(row.get("cover_image") or ""):
                row["cover_image"] = None  # never store local path
            ok = crud.blog_update_by_id(id_part, row, _opt(body.get("cover_image_path")))
        elif resource == "gallery":
            row = {k: body.get(k) for k in ("title", "subtitle", "src", "tone", "project_srcs", "details_md") if k in body}
            ok = crud.gallery_update_by_id(id_part, row)
            # Optionally append more images from directory or single path
            dir_val = _opt(body.get("project_srcs_dir"))
            single_val = _opt(body.get("project_srcs_path"))
            if ok and (dir_val or single_val):
                crud.gallery_append_images(id_part, dir_val, single_val)
        else:
            _send_json(self, 404, {"error": "Unknown resource"})
            return
        if ok:
            _send_json(self, 200, {"ok": True})
        else:
            _send_json(self, 500, {"error": "Update failed"})

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        m = _API_PATTERN.match(path)
        if not m:
            _send_json(self, 404, {"error": "Not found"})
            return
        resource, id_part = m.group(1), (m.group(2) or "").strip()
        if not id_part:
            _send_json(self, 400, {"error": "Missing resource id"})
            return
        if resource == "projects":
            ok = crud.projects_delete_by_id(id_part)
        elif resource == "experience":
            ok = crud.experience_delete_by_id(id_part)
        elif resource == "stack":
            ok = crud.stack_delete_by_id(id_part)
        elif resource == "blog":
            ok = crud.blog_delete_by_id(id_part)
        elif resource == "gallery":
            ok = crud.gallery_delete_by_id(id_part)
        else:
            _send_json(self, 404, {"error": "Unknown resource"})
            return
        if ok:
            _send_json(self, 200, {"ok": True})
        else:
            _send_json(self, 500, {"error": "Delete failed"})

    def log_message(self, format, *args):
        pass


def run_server(port: int = DEFAULT_PORT) -> None:
    with HTTPServer(("", port), AdminHandler) as httpd:
        print(f"Admin server running at http://localhost:{port}")
        print("Press Ctrl+C to stop.\n")
        httpd.serve_forever()
