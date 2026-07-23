import json
from pathlib import Path

from supabase_client import client
from lib.github import (
    upload_image_for_record,
    replace_image_at_endpoint,
    purge_endpoints,
)

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}

# Columns holding uploaded file endpoints, so deletes can clean GitHub too.
FILE_FIELDS = {
    "projects": ("image",),
    "experience": ("logo",),
    "gallery": ("src", "project_srcs"),
    "blog_posts": ("cover_image",),
}

# Columns stored as string[] of endpoints (append / replace-at-index).
LIST_FILE_COLUMNS = {
    ("gallery", "project_srcs"),
}


def _endpoints_in(row: dict, fields) -> list:
    found = []
    for field in fields:
        value = row.get(field)
        if isinstance(value, list):
            found.extend(v for v in value if isinstance(v, str))
        elif isinstance(value, str):
            found.append(value)
    return found


def purge_files_for_record(table: str, idx: str) -> int:
    fields = FILE_FIELDS.get(table)
    if not fields:
        return 0
    try:
        r = client.table(table).select("*").eq("id", idx).execute()
    except Exception:
        return 0
    if not getattr(r, "data", None):
        return 0
    return purge_endpoints(_endpoints_in(r.data[0], fields))


def _is_http_endpoint(value: object) -> bool:
    return isinstance(value, str) and value.strip().lower().startswith("http")


def _endpoint_for_slot(local_path: str, current: object, record_id: str) -> str | None:
    """Reuse the stored path when we can; otherwise upload a fresh endpoint."""
    if isinstance(current, str) and current.strip() and not _is_http_endpoint(current):
        return replace_image_at_endpoint(local_path, current)
    return upload_image_for_record(local_path, record_id)


def _as_endpoint_list(value: object) -> list[str]:
    if isinstance(value, list):
        return [v for v in value if isinstance(v, str)]
    if isinstance(value, str) and value.strip():
        # Recover if a bug previously wrote a bare string into a list column.
        return [value.strip()]
    return []


def set_file_for_record(
    table: str,
    idx: str,
    column: str,
    local_path: str,
    index: int | None = None,
) -> dict | None:
    """Replace in place when something is already stored, otherwise upload fresh.

    For list columns (e.g. gallery.project_srcs):
    - index is None → append a new endpoint
    - index is set → replace that slot (http/empty → new endpoint; stored path → in place)
    Returns {"endpoint": str, "endpoints": list|None} so scalar and list callers share one shape.
    """
    try:
        r = client.table(table).select(column).eq("id", idx).execute()
    except Exception:
        return None
    if not getattr(r, "data", None):
        return None
    current = r.data[0].get(column)
    is_list = (table, column) in LIST_FILE_COLUMNS or isinstance(current, list)

    if is_list:
        endpoints = _as_endpoint_list(current)
        if index is None:
            endpoint = upload_image_for_record(local_path, idx)
            if not endpoint:
                return None
            endpoints.append(endpoint)
        else:
            if index < 0 or index >= len(endpoints):
                return None
            endpoint = _endpoint_for_slot(local_path, endpoints[index], idx)
            if not endpoint:
                return None
            endpoints[index] = endpoint
        client.table(table).update({column: endpoints}).eq("id", idx).execute()
        return {"endpoint": endpoint, "endpoints": endpoints}

    current_str = current if isinstance(current, str) else ""
    endpoint = _endpoint_for_slot(local_path, current_str, idx)
    if not endpoint:
        return None
    client.table(table).update({column: endpoint}).eq("id", idx).execute()
    return {"endpoint": endpoint, "endpoints": None}


def remove_file_from_list(table: str, idx: str, column: str, index: int) -> list | None:
    """Drop one entry from a list file column; purge stored (non-http) endpoints."""
    if (table, column) not in LIST_FILE_COLUMNS:
        return None
    try:
        r = client.table(table).select(column).eq("id", idx).execute()
    except Exception:
        return None
    if not getattr(r, "data", None):
        return None
    endpoints = _as_endpoint_list(r.data[0].get(column))
    if index < 0 or index >= len(endpoints):
        return None
    removed = endpoints.pop(index)
    if isinstance(removed, str) and removed.strip() and not _is_http_endpoint(removed):
        purge_endpoints([removed])
    client.table(table).update({column: endpoints}).eq("id", idx).execute()
    return endpoints


def _parse_list(s: str) -> list:
    if not s or not s.strip():
        return []
    return [x.strip() for x in s.split(",") if x and x.strip()]


def _parse_json(s: str, default=None):
    if default is None:
        default = []
    if not s or not s.strip():
        return default
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        return default


def _normalize_tags(val) -> list:
    """Return list of non-empty tag strings. Filters out '', whitespace, and invalid items."""
    if val is None:
        return []
    if isinstance(val, str):
        return _parse_list(val)
    if isinstance(val, list):
        return [str(x).strip() for x in val if x is not None and str(x).strip()]
    return []


def _normalize_links(val) -> list:
    """Return list of {label, url} with non-empty label and url. Filters invalid entries."""
    if not isinstance(val, list):
        return []
    out = []
    for item in val:
        if not isinstance(item, dict):
            continue
        label = (item.get("label") or "").strip()
        url = (item.get("url") or "").strip()
        if label and url:
            out.append({"label": label, "url": url, **{k: v for k, v in item.items() if k in ("icon",) and v}})
    return out


def _empty_to_none(val):
    """Return None if val is None, empty string, or whitespace-only; else return val (stripped for str)."""
    if val is None:
        return None
    s = str(val).strip()
    return None if s == "" else (s if isinstance(val, str) else val)


def _show(val, limit: int = 60) -> str:
    """Current value for an edit prompt, trimmed so the line stays readable."""
    if val is None:
        return ""
    if isinstance(val, (list, dict)):
        s = json.dumps(val, ensure_ascii=False)
    else:
        s = str(val)
    s = " ".join(s.split())
    return s if len(s) <= limit else s[: limit - 1] + "…"


def _collect_image_paths_from_dir(path_str: str) -> list[Path]:
    """Return up to 50 image files in the given directory (non-recursive)."""
    if not path_str:
        return []
    d = Path(path_str).expanduser()
    if not d.is_dir():
        print("Directory not found for project_srcs:", d)
        return []
    paths: list[Path] = []
    for p in d.iterdir():
        if p.is_file() and p.suffix.lower() in IMAGE_EXTS:
            paths.append(p)
    paths = sorted(paths)
    if len(paths) > 50:
        print(f"Found {len(paths)} images; only the first 50 will be uploaded.")
        paths = paths[:50]
    return paths


def _upload_many_images(local_paths: list[Path], record_id: str) -> list[str]:
    """Upload many local image files for a record and return endpoint paths."""
    endpoints: list[str] = []
    for p in local_paths:
        ep = upload_image_for_record(str(p), record_id)
        if ep:
            endpoints.append(ep)
    return endpoints


def _next_position(table: str) -> int:
    """Next position for a new row (append at the end)."""
    try:
        r = (
            client.table(table)
            .select("position")
            .order("position", desc=True)
            .limit(1)
            .execute()
        )
        rows = r.data or []
        if rows and isinstance(rows[0].get("position"), int):
            return rows[0]["position"] + 1
    except Exception:
        pass
    return 0


def set_positions(table: str, ids: list[str]) -> bool:
    """Persist display order: ids[0] → position 0, ids[1] → 1, …"""
    if not ids:
        return False
    try:
        for position, idx in enumerate(ids):
            r = client.table(table).update({"position": position}).eq("id", idx).execute()
            if getattr(r, "error", None):
                return False
        return True
    except Exception:
        return False


def move_item(table: str, idx: str, direction: int, list_fn) -> bool:
    """Move one row up (-1) or down (+1) in position order."""
    rows = list_fn() or []
    ids = [str(r["id"]) for r in rows]
    if idx not in ids:
        return False
    i = ids.index(idx)
    j = i + direction
    if j < 0 or j >= len(ids):
        return False
    ids[i], ids[j] = ids[j], ids[i]
    return set_positions(table, ids)


def get_projects_list():
    r = client.table("projects").select("*").order("position").order("id").execute()
    return r.data or []


def projects_list():
    rows = get_projects_list()
    if not rows:
        print("No projects.")
        return []
    for row in rows:
        print(f"  {row['id']}: {row['title']}")
    return rows


def projects_insert(row: dict, image_path: str | None = None) -> str | None:
    row = dict(row)
    row["tags"] = _normalize_tags(row.get("tags"))
    row["links"] = _normalize_links(row.get("links"))
    row["github_url"] = _empty_to_none(row.get("github_url"))
    row["live_url"] = _empty_to_none(row.get("live_url"))
    row["details_md"] = _empty_to_none(row.get("details_md"))
    if "position" not in row:
        row["position"] = _next_position("projects")
    r = client.table("projects").insert(row).execute()
    if getattr(r, "error", None):
        return None
    rec = (r.data or [None])[0]
    if not rec:
        return None
    if image_path:
        endpoint = upload_image_for_record(image_path, rec["id"])
        if endpoint:
            client.table("projects").update({"image": endpoint}).eq("id", rec["id"]).execute()
    return rec["id"]


def projects_add():
    category = input("category: ").strip() or ""
    title = input("title: ").strip() or ""
    description = input("description: ").strip() or ""
    tags = _parse_list(input("tags (comma-separated): "))
    img_path = input("local image path: ").strip()
    if not img_path:
        print("Image path is required.")
        return
    image_alt = input("image_alt: ").strip() or ""
    github_url = input("github_url (optional): ").strip() or None
    live_url = input("live_url (optional): ").strip() or None
    links_raw = input("links (JSON array, optional): ").strip()
    links = _normalize_links(_parse_json(links_raw, []))
    row = {
        "category": category,
        "title": title,
        "description": description,
        "tags": tags,
        "image_alt": image_alt,
        "github_url": github_url,
        "live_url": live_url,
        "links": links,
    }
    pid = projects_insert(row, img_path)
    if pid:
        print("Added with image.")
    else:
        print("Error: insert failed.")


def projects_update_by_id(idx: str, row: dict) -> bool:
    row = dict(row)
    if "tags" in row:
        row["tags"] = _normalize_tags(row["tags"])
    if "links" in row:
        row["links"] = _normalize_links(row["links"])
    if "github_url" in row:
        row["github_url"] = _empty_to_none(row["github_url"])
    if "live_url" in row:
        row["live_url"] = _empty_to_none(row["live_url"])
    if "details_md" in row:
        row["details_md"] = _empty_to_none(row["details_md"])
    r = client.table("projects").update({k: v for k, v in row.items() if k != "id"}).eq("id", idx).execute()
    return not getattr(r, "error", None)


def projects_delete_by_id(idx: str) -> bool:
    purge_files_for_record("projects", idx)
    r = client.table("projects").delete().eq("id", idx).execute()
    return not getattr(r, "error", None)


def projects_update():
    rows = projects_list()
    if not rows:
        return
    idx = input("Enter id to edit: ").strip()
    if not idx:
        return
    r = client.table("projects").select("*").eq("id", idx).execute()
    if not r.data:
        print("Not found.")
        return
    row = r.data[0]
    changes = {}
    for key in ("category", "title", "description", "image", "image_alt", "github_url", "live_url"):
        val = input(f"{key} [{_show(row.get(key))}]: ").strip()
        if val:
            changes[key] = val
    tags_in = input(f"tags [{_show(row.get('tags'))}]: ").strip()
    if tags_in:
        changes["tags"] = _parse_list(tags_in)
    links_in = input(f"links [{_show(row.get('links'))}]: ").strip()
    if links_in:
        changes["links"] = _normalize_links(_parse_json(links_in, row.get("links") or []))
    if not changes:
        print("Nothing changed.")
        return
    if projects_update_by_id(idx, changes):
        print("Updated.")
    else:
        print("Error: update failed.")


def projects_delete():
    rows = projects_list()
    if not rows:
        return
    idx = input("Enter id to delete: ").strip()
    if not idx:
        return
    confirm = input("Delete? (y/N): ").strip().lower()
    if confirm != "y":
        return
    if projects_delete_by_id(idx):
        print("Deleted.")
    else:
        print("Error: delete failed.")


def get_experience_list():
    r = client.table("experience").select("*").order("position").order("id").execute()
    return r.data or []


def experience_list():
    rows = get_experience_list()
    if not rows:
        print("No experience entries.")
        return []
    for row in rows:
        print(f"  {row['id']}: {row['title']} @ {row.get('company', '')}")
    return rows


def experience_insert(row: dict, logo_path: str | None = None) -> str | None:
    row = dict(row)
    row["highlights"] = _normalize_tags(row.get("highlights"))
    row["tags"] = _normalize_tags(row.get("tags"))
    row["challenges"] = _normalize_tags(row.get("challenges"))
    row["learnings"] = _normalize_tags(row.get("learnings"))
    row["company"] = _empty_to_none(row.get("company"))
    row["location"] = _empty_to_none(row.get("location"))
    row["logo"] = _empty_to_none(row.get("logo"))
    row["development_summary"] = _empty_to_none(row.get("development_summary"))
    row["details_md"] = _empty_to_none(row.get("details_md"))
    if "position" not in row:
        row["position"] = _next_position("experience")
    r = client.table("experience").insert(row).execute()
    if getattr(r, "error", None):
        return None
    rec = (r.data or [None])[0]
    if not rec:
        return None
    if logo_path:
        endpoint = upload_image_for_record(logo_path, rec["id"])
        if endpoint:
            client.table("experience").update({"logo": endpoint}).eq("id", rec["id"]).execute()
    return rec["id"]


def experience_add():
    period_from = input("period from (e.g. 2021-01-01): ").strip() or ""
    period_to = input("period to (date or text, e.g. Now): ").strip() or ""
    row = {
        "role": input("role: ").strip() or "",
        "title": input("title: ").strip() or "",
        "period": {"from": period_from, "to": period_to},
        "description": input("description: ").strip() or "",
        "company": input("company (optional): ").strip() or None,
        "location": input("location (optional): ").strip() or None,
        "logo": input("logo url (optional): ").strip() or None,
        "highlights": _parse_list(input("highlights (comma-separated): ")),
        "tags": _parse_list(input("tags (comma-separated): ")),
        "development_summary": input("development_summary (optional): ").strip() or None,
        "challenges": _parse_list(input("challenges (comma-separated): ")),
        "learnings": _parse_list(input("learnings (comma-separated): ")),
    }
    eid = experience_insert(row)
    if eid:
        logo_path = input("local logo image path (optional): ").strip()
        if logo_path:
            endpoint = upload_image_for_record(logo_path, eid)
            if endpoint:
                client.table("experience").update({"logo": endpoint}).eq("id", eid).execute()
                print("Logo uploaded.")
        print("Added.")
    else:
        print("Error: insert failed.")


def experience_update_by_id(idx: str, row: dict) -> bool:
    row = dict(row)
    for key in ("highlights", "tags", "challenges", "learnings"):
        if key in row:
            row[key] = _normalize_tags(row[key])
    for key in ("company", "location", "logo", "development_summary", "details_md"):
        if key in row:
            row[key] = _empty_to_none(row[key])
    r = client.table("experience").update({k: v for k, v in row.items() if k != "id"}).eq("id", idx).execute()
    return not getattr(r, "error", None)


def experience_delete_by_id(idx: str) -> bool:
    purge_files_for_record("experience", idx)
    r = client.table("experience").delete().eq("id", idx).execute()
    return not getattr(r, "error", None)


def experience_update():
    experience_list()
    idx = input("Enter id to edit: ").strip()
    if not idx:
        return
    r = client.table("experience").select("*").eq("id", idx).execute()
    if not r.data:
        print("Not found.")
        return
    row = r.data[0]
    changes = {}
    period = row.get("period") or {}
    current_from = period.get("from", "")
    current_to = period.get("to", "")
    new_from = input(f"period from [{current_from}]: ").strip()
    new_to = input(f"period to [{current_to}]: ").strip()
    if new_from or new_to:
        changes["period"] = {
            "from": new_from or current_from,
            "to": new_to or current_to,
        }
    for key in ("role", "title", "description", "company", "location", "logo", "development_summary"):
        val = input(f"{key} [{_show(row.get(key))}]: ").strip()
        if val:
            changes[key] = val
    for key in ("highlights", "tags", "challenges", "learnings"):
        val = input(f"{key} [{_show(row.get(key))}]: ").strip()
        if val:
            changes[key] = _parse_list(val)
    if not changes:
        print("Nothing changed.")
        return
    if experience_update_by_id(idx, changes):
        print("Updated.")
    else:
        print("Error: update failed.")


def experience_delete():
    experience_list()
    idx = input("Enter id to delete: ").strip()
    if not idx:
        return
    if input("Delete? (y/N): ").strip().lower() != "y":
        return
    if experience_delete_by_id(idx):
        print("Deleted.")
    else:
        print("Error: delete failed.")


def get_stack_list():
    r = client.table("stack").select("*").order("position").order("id").execute()
    return r.data or []


def stack_list():
    rows = get_stack_list()
    if not rows:
        print("No stack entries.")
        return []
    for row in rows:
        print(f"  {row['id']}: {row['category']} - {row['tools']}")
    return rows


def stack_insert(row: dict) -> str | None:
    row = dict(row)
    if "position" not in row:
        row["position"] = _next_position("stack")
    r = client.table("stack").insert(row).execute()
    if getattr(r, "error", None):
        return None
    rec = (r.data or [None])[0]
    return rec["id"] if rec else None


def stack_update_by_id(idx: str, row: dict) -> bool:
    r = client.table("stack").update({k: v for k, v in row.items() if k != "id"}).eq("id", idx).execute()
    return not getattr(r, "error", None)


def stack_delete_by_id(idx: str) -> bool:
    r = client.table("stack").delete().eq("id", idx).execute()
    return not getattr(r, "error", None)


def stack_add():
    row = {
        "category": input("category: ").strip() or "",
        "tools": input("tools: ").strip() or "",
        "description": input("description: ").strip() or "",
    }
    if stack_insert(row):
        print("Added.")
    else:
        print("Error: insert failed.")


def stack_update():
    stack_list()
    idx = input("Enter id to edit: ").strip()
    if not idx:
        return
    r = client.table("stack").select("*").eq("id", idx).execute()
    if not r.data:
        print("Not found.")
        return
    row = r.data[0]
    changes = {}
    for key in ("category", "tools", "description"):
        val = input(f"{key} [{_show(row.get(key))}]: ").strip()
        if val:
            changes[key] = val
    if not changes:
        print("Nothing changed.")
        return
    if stack_update_by_id(idx, changes):
        print("Updated.")
    else:
        print("Error: update failed.")


def stack_delete():
    stack_list()
    idx = input("Enter id to delete: ").strip()
    if not idx:
        return
    if input("Delete? (y/N): ").strip().lower() != "y":
        return
    if stack_delete_by_id(idx):
        print("Deleted.")
    else:
        print("Error: delete failed.")


def get_blog_list():
    r = client.table("blog_posts").select("*").order("position").order("id").execute()
    return r.data or []


def blog_list():
    rows = get_blog_list()
    if not rows:
        print("No blog posts.")
        return []
    for row in rows:
        print(f"  {row['id']}: {row['title']} ({row['date']})")
    return rows


def blog_insert(row: dict, cover_image_path: str | None = None) -> str | None:
    row = dict(row)
    row["date"] = _empty_to_none(row.get("date"))
    row["read_time"] = _empty_to_none(row.get("read_time"))
    row["cover_image"] = _empty_to_none(row.get("cover_image"))
    row["tags"] = _normalize_tags(row.get("tags"))
    if "position" not in row:
        row["position"] = _next_position("blog_posts")
    r = client.table("blog_posts").insert(row).execute()
    if getattr(r, "error", None):
        return None
    rec = (r.data or [None])[0]
    if not rec:
        return None
    if cover_image_path:
        endpoint = upload_image_for_record(cover_image_path, rec["id"])
        if endpoint:
            client.table("blog_posts").update({"cover_image": endpoint}).eq("id", rec["id"]).execute()
    return rec["id"]


def blog_update_by_id(idx: str, row: dict, cover_image_path: str | None = None) -> bool:
    row = dict(row)
    if "date" in row:
        row["date"] = _empty_to_none(row["date"])
    if "read_time" in row:
        row["read_time"] = _empty_to_none(row["read_time"])
    if "cover_image" in row:
        row["cover_image"] = _empty_to_none(row["cover_image"])
    if "tags" in row:
        row["tags"] = _normalize_tags(row["tags"])
    if cover_image_path:
        endpoint = upload_image_for_record(cover_image_path, idx)
        if endpoint:
            row["cover_image"] = endpoint
    r = client.table("blog_posts").update({k: v for k, v in row.items() if k != "id"}).eq("id", idx).execute()
    return not getattr(r, "error", None)


def blog_delete_by_id(idx: str) -> bool:
    purge_files_for_record("blog_posts", idx)
    r = client.table("blog_posts").delete().eq("id", idx).execute()
    return not getattr(r, "error", None)


def blog_add():
    slug = input("slug: ").strip()
    if not slug:
        print("slug required.")
        return
    row = {
        "slug": slug,
        "title": input("title: ").strip() or "",
        "category": input("category: ").strip() or "",
        "excerpt": input("excerpt: ").strip() or "",
        "date": _empty_to_none(input("date (YYYY-MM-DD): ").strip()),
        "read_time": input("read_time (optional): ").strip() or None,
        "tags": _parse_list(input("tags (comma-separated): ")),
        "cover_image": input("cover_image url (optional): ").strip() or None,
        "body": "",
    }
    print("body (multi-line; empty line to finish):")
    while True:
        line = input()
        if not line:
            break
        row["body"] = (row["body"] + "\n" + line) if row["body"] else line
    if blog_insert(row):
        print("Added.")
    else:
        print("Error: insert failed.")


def blog_update():
    blog_list()
    idx = input("Enter id to edit: ").strip()
    if not idx:
        return
    r = client.table("blog_posts").select("*").eq("id", idx).execute()
    if not r.data:
        print("Not found.")
        return
    row = r.data[0]
    changes = {}
    for key in ("slug", "title", "category", "excerpt", "date", "read_time", "cover_image", "body"):
        val = input(f"{key} [{_show(row.get(key))}]: ").strip()
        if val:
            changes[key] = val
    tags_in = input(f"tags [{_show(row.get('tags'))}]: ").strip()
    if tags_in:
        changes["tags"] = _parse_list(tags_in)
    if not changes:
        print("Nothing changed.")
        return
    if blog_update_by_id(idx, changes):
        print("Updated.")
    else:
        print("Error: update failed.")


def blog_delete():
    blog_list()
    idx = input("Enter id to delete: ").strip()
    if not idx:
        return
    if input("Delete? (y/N): ").strip().lower() != "y":
        return
    if blog_delete_by_id(idx):
        print("Deleted.")
    else:
        print("Error: delete failed.")


def get_gallery_list():
    r = client.table("gallery").select("*").order("position").order("id").execute()
    return r.data or []


def gallery_list():
    rows = get_gallery_list()
    if not rows:
        print("No gallery items.")
        return []
    for row in rows:
        print(f"  {row['id']}: {row['title']}")
    return rows


def gallery_insert(
    row: dict,
    src_path: str | None = None,
    project_srcs_dir: str | None = None,
    project_srcs_path: str | None = None,
) -> str | None:
    row = dict(row)
    row["details_md"] = _empty_to_none(row.get("details_md"))
    base_srcs = row.get("project_srcs") or []
    if not isinstance(base_srcs, list):
        base_srcs = []
    row["project_srcs"] = base_srcs
    # src is NOT NULL in the gallery table, so ensure we insert a non-null value;
    # the real src will be set after upload below.
    if "src" not in row or row.get("src") is None:
        row["src"] = ""
    if "position" not in row:
        row["position"] = _next_position("gallery")
    r = client.table("gallery").insert(row).execute()
    if getattr(r, "error", None):
        return None
    rec = (r.data or [None])[0]
    if not rec:
        return None
    gid = rec["id"]

    updates: dict[str, object] = {}
    if src_path:
        ep = upload_image_for_record(src_path, gid)
        if ep:
            updates["src"] = ep

    extra_paths: list[Path] = []
    if project_srcs_dir:
        extra_paths.extend(_collect_image_paths_from_dir(project_srcs_dir))
    if project_srcs_path:
        p = Path(project_srcs_path).expanduser()
        if p.is_file():
            extra_paths.append(p)
        else:
            print("project_srcs path not found:", p)
    if extra_paths:
        endpoints = _upload_many_images(extra_paths, gid)
        if endpoints:
            merged = base_srcs.copy()
            merged.extend(endpoints)
            updates["project_srcs"] = merged

    if updates:
        client.table("gallery").update(updates).eq("id", gid).execute()

    return gid


def gallery_update_by_id(idx: str, row: dict) -> bool:
    row = dict(row)
    if "details_md" in row:
        row["details_md"] = _empty_to_none(row["details_md"])
    if "project_srcs" in row and not isinstance(row["project_srcs"], list):
        try:
            parsed = json.loads(str(row["project_srcs"]))
            row["project_srcs"] = parsed if isinstance(parsed, list) else []
        except Exception:
            row["project_srcs"] = []
    r = client.table("gallery").update({k: v for k, v in row.items() if k != "id"}).eq("id", idx).execute()
    return not getattr(r, "error", None)


def gallery_append_images(
    idx: str,
    project_srcs_dir: str | None = None,
    project_srcs_path: str | None = None,
) -> None:
    """Append extra images from a directory or single path to gallery.project_srcs."""
    extra_paths: list[Path] = []
    if project_srcs_dir:
        extra_paths.extend(_collect_image_paths_from_dir(project_srcs_dir))
    if project_srcs_path:
        p = Path(project_srcs_path).expanduser()
        if p.is_file():
            extra_paths.append(p)
        elif project_srcs_path:
            print("project_srcs path not found:", p)
    if not extra_paths:
        return
    endpoints = _upload_many_images(extra_paths, idx)
    if not endpoints:
        return
    r = client.table("gallery").select("project_srcs").eq("id", idx).execute()
    current = []
    if getattr(r, "data", None):
        val = r.data[0].get("project_srcs")
        if isinstance(val, list):
            current = val
    current.extend(endpoints)
    client.table("gallery").update({"project_srcs": current}).eq("id", idx).execute()


def gallery_delete_by_id(idx: str) -> bool:
    purge_files_for_record("gallery", idx)
    r = client.table("gallery").delete().eq("id", idx).execute()
    return not getattr(r, "error", None)


def gallery_add():
    title = input("title: ").strip() or ""
    subtitle = input("subtitle: ").strip() or ""
    tone = input("tone (dark/light): ").strip() or "dark"
    src_path = input("primary image path: ").strip()
    if not src_path:
        print("primary image path is required.")
        return
    row = {
        "title": title,
        "subtitle": subtitle,
        "tone": tone if tone in ("dark", "light") else "dark",
        "details_md": input("details_md (optional, markdown): ").strip() or None,
    }
    gid = gallery_insert(row, src_path=src_path)
    if not gid:
        print("Error: insert failed.")
        return
    print("Gallery item created with id:", gid)
    use_dir = input("Import extra images from directory for project_srcs? (y/N): ").strip().lower() == "y"
    extra = []
    if use_dir:
        dir_path = input("Directory path with images: ").strip()
        print("WARNING: Make sure this directory does not contain sensitive images before proceeding.")
        paths = _collect_image_paths_from_dir(dir_path)
        if paths:
            extra = _upload_many_images(paths, gid)
    else:
        single = input("Single extra image path (optional): ").strip()
        if single:
            ep = upload_image_for_record(single, gid)
            if ep:
                extra = [ep]
    if extra:
        r = client.table("gallery").select("project_srcs").eq("id", gid).execute()
        current = []
        if getattr(r, "data", None):
            val = r.data[0].get("project_srcs")
            if isinstance(val, list):
                current = val
        current.extend(extra)
        client.table("gallery").update({"project_srcs": current}).eq("id", gid).execute()
        print(f"Added {len(extra)} extra image(s) to project_srcs.")
    else:
        print("No extra images added.")


def gallery_update():
    rows = gallery_list()
    if not rows:
        return
    idx = input("Enter id to edit: ").strip()
    if not idx:
        return
    r = client.table("gallery").select("*").eq("id", idx).execute()
    if not r.data:
        print("Not found.")
        return
    row = r.data[0]
    changes = {}
    for key in ("title", "subtitle", "tone"):
        val = input(f"{key} [{_show(row.get(key))}]: ").strip()
        if val:
            changes[key] = val
    details = input(f"details_md [{_show(row.get('details_md'))}]: ").strip()
    if details:
        changes["details_md"] = details
    if changes:
        if not gallery_update_by_id(idx, changes):
            print("Error: update failed.")
            return
        print("Fields updated.")

    # Primary image — same replace / new-endpoint rules as the dashboard
    primary = input(f"Replace primary image from local path? [{_show(row.get('src'))}] (blank = keep): ").strip()
    if primary:
        result = set_file_for_record("gallery", idx, "src", primary)
        if result and result.get("endpoint"):
            print("Primary image updated:", result["endpoint"])
        else:
            print("Primary image upload failed.")

    # More images (project_srcs)
    while True:
        r2 = client.table("gallery").select("project_srcs").eq("id", idx).execute()
        current = []
        if getattr(r2, "data", None):
            val = r2.data[0].get("project_srcs")
            if isinstance(val, list):
                current = [v for v in val if isinstance(v, str)]
            elif isinstance(val, str) and val.strip():
                current = [val.strip()]
        print(f"\nMore images ({len(current)}):")
        if not current:
            print("  (none)")
        else:
            for i, ep in enumerate(current):
                print(f"  [{i}] {_show(ep, 80)}")
        print("a = append file(s)  r = replace at index  d = delete at index  Enter = done")
        action = input("More images action: ").strip().lower()
        if not action:
            break
        if action == "a":
            extra_dir = input("Directory (optional): ").strip()
            extra_single = input("Single image path (optional): ").strip()
            if extra_dir or extra_single:
                gallery_append_images(idx, extra_dir or None, extra_single or None)
                print("Appended.")
            else:
                print("Nothing to append.")
        elif action == "r":
            raw_i = input("Index to replace: ").strip()
            path = input("Local image path: ").strip()
            try:
                i = int(raw_i)
            except ValueError:
                print("Bad index.")
                continue
            if not path:
                print("Need a path.")
                continue
            result = set_file_for_record("gallery", idx, "project_srcs", path, i)
            if result and result.get("endpoint"):
                print("Replaced:", result["endpoint"])
            else:
                print("Replace failed (check index / path / GitHub env).")
        elif action == "d":
            raw_i = input("Index to delete: ").strip()
            try:
                i = int(raw_i)
            except ValueError:
                print("Bad index.")
                continue
            removed = remove_file_from_list("gallery", idx, "project_srcs", i)
            if removed is None:
                print("Delete failed.")
            else:
                print(f"Removed. {len(removed)} left.")
        else:
            print("Use a, r, d, or Enter.")

    print("Done.")


def gallery_delete():
    rows = gallery_list()
    if not rows:
        return
    idx = input("Enter id to delete: ").strip()
    if not idx:
        return
    if input("Delete? (y/N): ").strip().lower() != "y":
        return
    if gallery_delete_by_id(idx):
        print("Deleted.")
    else:
        print("Error: delete failed.")


def resume_upsert_body(body_md: str) -> bool:
    body = body_md.strip()
    if not body:
        return False
    r = client.table("resume").select("id").limit(1).execute()
    if not getattr(r, "data", None) or not r.data:
        client.table("resume").insert({"id": "default", "body_md": body}).execute()
    else:
        rid = r.data[0]["id"]
        client.table("resume").update({"body_md": body}).eq("id", rid).execute()
    return True


def resume_upload_from_file(path: str) -> bool:
    p = Path(path).expanduser()
    if not p.exists():
        return False
    body = p.read_text(encoding="utf-8", errors="replace")
    return resume_upsert_body(body)


def resume_set_from_markdown_file():
    path_str = input("Edited resume markdown path: ").strip()
    if not path_str:
        return
    if resume_upload_from_file(path_str):
        print("Resume saved to Supabase.")
    else:
        print("File not found or save failed.")


# LaTeX source for the resume "Source" tab on the site.
TEX_SUFFIXES = {".tex", ".latex", ".ltx"}
# The web viewer refuses to render past 400k chars, so anything bigger is a
# mistake (or a wrong file) — reject it here rather than store what won't show.
MAX_TEX_CHARS = 400_000


def resume_upsert_tex(body_tex: str) -> bool:
    """Store the LaTeX source on the single resume row."""
    body = body_tex.strip()
    if not body or len(body) > MAX_TEX_CHARS:
        return False
    r = client.table("resume").select("id").limit(1).execute()
    if not getattr(r, "data", None) or not r.data:
        client.table("resume").insert({"id": "default", "body_tex": body}).execute()
    else:
        rid = r.data[0]["id"]
        client.table("resume").update({"body_tex": body}).eq("id", rid).execute()
    return True


def resume_upload_tex_from_file(path: str) -> bool:
    """Validate then upload a .tex/.latex/.ltx file. Fails closed."""
    try:
        p = Path(path).expanduser()
        if not p.is_file():
            return False
        if p.suffix.lower() not in TEX_SUFFIXES:
            return False
        if p.stat().st_size > MAX_TEX_CHARS * 4:  # utf-8 worst case per char
            return False
        body = p.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return False
    return resume_upsert_tex(body)


def resume_set_from_tex_file():
    path_str = input("Resume LaTeX source (.tex) path: ").strip()
    if not path_str:
        return
    if resume_upload_tex_from_file(path_str):
        print("LaTeX source saved to Supabase.")
    else:
        print("Not saved. Needs an existing .tex, .latex or .ltx file under 400k characters.")


# ---------------------------------------------------------------------------
# Selected / featured items (home teasers)
# ---------------------------------------------------------------------------

SELECTED_TABLES = ("projects", "stack", "gallery", "blog_posts")

SELECTED_TABLE_LABELS = {
    "projects": "Projects (Selected work)",
    "stack": "Stack",
    "gallery": "Gallery",
    "blog_posts": "Blog",
}


def _selected_label(table: str, row: dict) -> str:
    if table == "stack":
        return f"{row.get('category', '')} — {row.get('tools', '')}".strip(" —")
    return str(row.get("title") or row.get("slug") or row.get("id") or "")


def get_selected_rows(table_name: str) -> list[dict]:
    """Selected rows for a content table, ordered by selected_items.position."""
    if table_name not in SELECTED_TABLES:
        return []
    r = (
        client.table("selected_items")
        .select("id, item_id, position")
        .eq("table_name", table_name)
        .order("position")
        .order("id")
        .execute()
    )
    selected = r.data or []
    if not selected:
        return []
    ids = [str(row["item_id"]) for row in selected]
    content = client.table(table_name).select("*").in_("id", ids).execute()
    by_id = {str(row["id"]): row for row in (content.data or [])}
    out = []
    for row in selected:
        item = by_id.get(str(row["item_id"]))
        if not item:
            continue
        out.append(
            {
                "selected_id": str(row["id"]),
                "item_id": str(row["item_id"]),
                "position": row.get("position") or 0,
                "label": _selected_label(table_name, item),
                "item": item,
            }
        )
    return out


def get_available_for_selected(table_name: str) -> list[dict]:
    if table_name not in SELECTED_TABLES:
        return []
    selected_ids = {row["item_id"] for row in get_selected_rows(table_name)}
    rows = client.table(table_name).select("*").order("position").order("id").execute()
    out = []
    for row in rows.data or []:
        iid = str(row["id"])
        if iid in selected_ids:
            continue
        out.append({"item_id": iid, "label": _selected_label(table_name, row), "item": row})
    return out


def selected_list(table_name: str) -> list[dict]:
    rows = get_selected_rows(table_name)
    label = SELECTED_TABLE_LABELS.get(table_name, table_name)
    if not rows:
        print(f"No selected {label.lower()} yet.")
        return []
    print(f"Selected — {label}:")
    for row in rows:
        print(f"  {row['item_id']}: {row['label']}")
    return rows


def selected_add(table_name: str, item_id: str | None = None) -> bool:
    if table_name not in SELECTED_TABLES:
        return False
    idx = (item_id or input("Item id to feature: ").strip()).strip()
    if not idx:
        return False
    existing = (
        client.table("selected_items")
        .select("id")
        .eq("table_name", table_name)
        .eq("item_id", idx)
        .limit(1)
        .execute()
    )
    if existing.data:
        print("Already selected.")
        return False
    check = client.table(table_name).select("id").eq("id", idx).limit(1).execute()
    if not check.data:
        print("That id was not found.")
        return False
    position = 0
    try:
        top = (
            client.table("selected_items")
            .select("position")
            .eq("table_name", table_name)
            .order("position", desc=True)
            .limit(1)
            .execute()
        )
        if top.data and isinstance(top.data[0].get("position"), int):
            position = top.data[0]["position"] + 1
    except Exception:
        position = 0
    r = (
        client.table("selected_items")
        .insert({"table_name": table_name, "item_id": idx, "position": position})
        .execute()
    )
    if getattr(r, "error", None):
        print("Could not add.")
        return False
    print("Added to selected.")
    return True


def selected_remove(table_name: str, item_id: str | None = None) -> bool:
    if table_name not in SELECTED_TABLES:
        return False
    idx = (item_id or input("Item id to remove from selected: ").strip()).strip()
    if not idx:
        return False
    r = (
        client.table("selected_items")
        .delete()
        .eq("table_name", table_name)
        .eq("item_id", idx)
        .execute()
    )
    if getattr(r, "error", None):
        print("Could not remove.")
        return False
    print("Removed from selected.")
    return True


def set_selected_positions(table_name: str, item_ids: list[str]) -> bool:
    if not item_ids or table_name not in SELECTED_TABLES:
        return False
    try:
        for position, idx in enumerate(item_ids):
            r = (
                client.table("selected_items")
                .update({"position": position})
                .eq("table_name", table_name)
                .eq("item_id", idx)
                .execute()
            )
            if getattr(r, "error", None):
                return False
        return True
    except Exception:
        return False


def selected_move(table_name: str, item_id: str, direction: int) -> bool:
    rows = get_selected_rows(table_name)
    ids = [row["item_id"] for row in rows]
    if item_id not in ids:
        return False
    i = ids.index(item_id)
    j = i + direction
    if j < 0 or j >= len(ids):
        return False
    ids[i], ids[j] = ids[j], ids[i]
    return set_selected_positions(table_name, ids)
