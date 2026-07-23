#!/usr/bin/env python3
"""Tkinter admin GUI for Pfolio (same CRUD as the terminal CLI).

Uses the device's native ttk theme so it matches Windows / macOS / Linux UI.
Layout mirrors the web dashboard: sidebar nav + main content.
"""
from __future__ import annotations

import json
import sys
import tkinter as tk
import tkinter.font as tkfont
from tkinter import filedialog, messagebox, ttk
from typing import Callable

from crud import (
    blog_delete_by_id,
    blog_insert,
    blog_update_by_id,
    experience_delete_by_id,
    experience_insert,
    experience_update_by_id,
    gallery_append_images,
    gallery_delete_by_id,
    gallery_insert,
    gallery_update_by_id,
    get_projects_list,
    projects_delete_by_id,
    projects_insert,
    projects_update_by_id,
    resume_upload_from_file,
    set_file_for_record,
    set_positions,
    stack_delete_by_id,
    stack_insert,
    stack_update_by_id,
)
from resume import create_resume
from supabase_client import client


NAV_ITEMS = (
    ("Projects", "projects"),
    ("Experience", "experience"),
    ("Stack", "stack"),
    ("Gallery", "gallery"),
    ("Blog", "blog"),
    ("Resume", "resume"),
)


def _native_theme(root: tk.Tk) -> str:
    """Pick the closest native look for this OS."""
    style = ttk.Style(root)
    available = set(style.theme_names())
    preferred: list[str] = []
    if sys.platform.startswith("win"):
        preferred = ["vista", "xpnative", "winnative"]
    elif sys.platform == "darwin":
        preferred = ["aqua"]
    else:
        preferred = ["clam", "alt", "default"]
    for name in preferred:
        if name in available:
            try:
                style.theme_use(name)
                return name
            except tk.TclError:
                continue
    return style.theme_use()


def _style(root: tk.Tk) -> None:
    theme = _native_theme(root)
    style = ttk.Style(root)

    base = tkfont.nametofont("TkDefaultFont")
    try:
        family = base.cget("family")
        size = int(base.cget("size"))
    except Exception:
        family, size = ("Segoe UI" if sys.platform.startswith("win") else "Helvetica"), 10

    heading = tkfont.Font(family=family, size=size + 5, weight="bold")
    brand = tkfont.Font(family=family, size=size + 1, weight="bold")
    muted = tkfont.Font(family=family, size=max(8, size - 1))
    root._fonts = (heading, brand, muted)  # type: ignore[attr-defined]

    style.configure("Head.TLabel", font=heading)
    style.configure("Brand.TLabel", font=brand)
    style.configure("Muted.TLabel", font=muted)
    style.configure("Sidebar.TFrame", padding=0)
    style.configure("Content.TFrame", padding=0)
    style.configure("Toolbar.TFrame", padding=(16, 12))
    style.configure("Nav.TButton", padding=(12, 8), anchor="w")
    style.configure("NavActive.TButton", padding=(12, 8), anchor="w")
    style.configure("Treeview", rowheight=max(26, size + 14))
    if theme in {"clam", "alt", "default"}:
        style.configure("Treeview", borderwidth=0)


class FormDialog(tk.Toplevel):
    def __init__(self, master, title: str, fields: list[tuple[str, str, str]], on_save: Callable[[dict], None]):
        super().__init__(master)
        self.title(title)
        self.resizable(True, True)
        self.transient(master)
        self.grab_set()
        self._vars: dict[str, tk.Variable | tk.Text] = {}
        self._on_save = on_save

        body = ttk.Frame(self, padding=16)
        body.pack(fill="both", expand=True)
        ttk.Label(body, text=title, style="Head.TLabel").pack(anchor="w", pady=(0, 12))

        form = ttk.Frame(body)
        form.pack(fill="both", expand=True)
        form.columnconfigure(1, weight=1)

        for i, (key, label, kind) in enumerate(fields):
            ttk.Label(form, text=label).grid(row=i, column=0, sticky="nw", padx=(0, 10), pady=6)
            cell = ttk.Frame(form)
            cell.grid(row=i, column=1, sticky="ew", pady=6)
            cell.columnconfigure(0, weight=1)

            if kind == "area":
                text = tk.Text(cell, height=5, width=48, wrap="word", undo=True)
                text.grid(row=0, column=0, sticky="ew")
                self._vars[key] = text
            elif kind == "file":
                var = tk.StringVar()
                ttk.Entry(cell, textvariable=var).grid(row=0, column=0, sticky="ew")
                ttk.Button(
                    cell,
                    text="Browse…",
                    command=lambda v=var: self._browse(v),
                ).grid(row=0, column=1, padx=(8, 0))
                self._vars[key] = var
            else:
                var = tk.StringVar()
                ttk.Entry(cell, textvariable=var).grid(row=0, column=0, sticky="ew")
                self._vars[key] = var

        btns = ttk.Frame(body)
        btns.pack(fill="x", pady=(16, 0))
        ttk.Button(btns, text="Cancel", command=self.destroy).pack(side="right", padx=(8, 0))
        ttk.Button(btns, text="Save", command=self._save).pack(side="right")

        self.geometry("580x460")
        self.wait_visibility()
        self.focus_set()

    @staticmethod
    def _browse(var: tk.StringVar) -> None:
        path = filedialog.askopenfilename(
            title="Choose file",
            filetypes=[
                ("Images", "*.png *.jpg *.jpeg *.webp *.gif"),
                ("Documents", "*.pdf *.docx *.txt *.md"),
                ("All files", "*.*"),
            ],
        )
        if path:
            var.set(path)

    def set_values(self, data: dict) -> None:
        for key, var in self._vars.items():
            val = data.get(key)
            if isinstance(var, tk.Text):
                var.delete("1.0", "end")
                if val is not None:
                    var.insert("1.0", str(val))
            elif isinstance(var, tk.Variable):
                if isinstance(val, (list, dict)):
                    var.set(json.dumps(val))
                else:
                    var.set("" if val is None else str(val))

    def _save(self) -> None:
        out: dict = {}
        for key, var in self._vars.items():
            if isinstance(var, tk.Text):
                out[key] = var.get("1.0", "end").strip()
            else:
                out[key] = var.get().strip()
        try:
            self._on_save(out)
            self.destroy()
        except Exception as e:
            messagebox.showerror("Save failed", str(e), parent=self)


class SectionView(ttk.Frame):
    def __init__(
        self,
        master,
        title: str,
        table: str,
        columns: list[tuple[str, str]],
        refresh: Callable[[], list[dict]],
        on_add: Callable[[], None],
        on_edit: Callable[[dict], None],
        on_delete: Callable[[dict], None],
    ):
        super().__init__(master, style="Content.TFrame")
        self._table = table
        self._refresh_fn = refresh
        self._rows: list[dict] = []
        self._drag_iid: str | None = None

        toolbar = ttk.Frame(self, style="Toolbar.TFrame")
        toolbar.pack(fill="x")
        ttk.Label(toolbar, text=title, style="Head.TLabel").pack(side="left")
        ttk.Button(toolbar, text="New", command=on_add).pack(side="right")
        ttk.Button(toolbar, text="Refresh", command=self.reload).pack(side="right", padx=(0, 8))

        ttk.Separator(self, orient="horizontal").pack(fill="x")

        table_wrap = ttk.Frame(self, padding=(12, 10))
        table_wrap.pack(fill="both", expand=True)
        table_wrap.columnconfigure(0, weight=1)
        table_wrap.rowconfigure(0, weight=1)

        cols = [c[0] for c in columns]
        self.tree = ttk.Treeview(table_wrap, columns=cols, show="headings", selectmode="browse")
        for key, label in columns:
            self.tree.heading(key, text=label)
            self.tree.column(key, width=160 if key != "id" else 220, stretch=True)
        scroll = ttk.Scrollbar(table_wrap, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scroll.set)
        self.tree.grid(row=0, column=0, sticky="nsew")
        scroll.grid(row=0, column=1, sticky="ns")
        self.tree.bind("<Double-1>", lambda _e: self._edit_selected(on_edit))
        self.tree.bind("<Return>", lambda _e: self._edit_selected(on_edit))
        self.tree.bind("<Delete>", lambda _e: self._delete_selected(on_delete))
        self.tree.bind("<ButtonPress-1>", self._on_drag_start)
        self.tree.bind("<B1-Motion>", self._on_drag_motion)
        self.tree.bind("<ButtonRelease-1>", self._on_drag_drop)

        actions = ttk.Frame(self, padding=(12, 0, 12, 12))
        actions.pack(fill="x")
        ttk.Button(actions, text="Open / Edit", command=lambda: self._edit_selected(on_edit)).pack(side="left")
        ttk.Button(actions, text="Delete", command=lambda: self._delete_selected(on_delete)).pack(
            side="left", padx=(8, 0)
        )
        ttk.Button(actions, text="Move up", command=lambda: self._nudge(-1)).pack(side="left", padx=(16, 0))
        ttk.Button(actions, text="Move down", command=lambda: self._nudge(1)).pack(side="left", padx=(8, 0))
        ttk.Label(actions, text="Drag rows to reorder", style="Muted.TLabel").pack(side="right")

    def reload(self) -> None:
        for i in self.tree.get_children():
            self.tree.delete(i)
        try:
            self._rows = self._refresh_fn() or []
        except Exception as e:
            messagebox.showerror("Load failed", str(e), parent=self)
            self._rows = []
            return
        cols = self.tree["columns"]
        for row in self._rows:
            values = []
            for c in cols:
                v = row.get(c)
                if isinstance(v, (list, dict)):
                    values.append(json.dumps(v)[:80])
                else:
                    values.append("" if v is None else str(v)[:80])
            self.tree.insert("", "end", iid=str(row.get("id")), values=values)

    def _selected(self) -> dict | None:
        sel = self.tree.selection()
        if not sel:
            return None
        rid = sel[0]
        for row in self._rows:
            if str(row.get("id")) == rid:
                return row
        return None

    def _ordered_ids(self) -> list[str]:
        return list(self.tree.get_children(""))

    def _persist_order(self, select_id: str | None = None) -> None:
        ids = self._ordered_ids()
        if not set_positions(self._table, ids):
            messagebox.showerror("Reorder failed", "Could not save that order.", parent=self)
            self.reload()
            return
        self.reload()
        if select_id and self.tree.exists(select_id):
            self.tree.selection_set(select_id)
            self.tree.see(select_id)

    def _nudge(self, direction: int) -> None:
        sel = self.tree.selection()
        if not sel:
            messagebox.showinfo("Select a row", "Pick an item first.", parent=self)
            return
        iid = sel[0]
        ids = self._ordered_ids()
        i = ids.index(iid)
        j = i + direction
        if j < 0 or j >= len(ids):
            return
        self.tree.move(iid, "", j)
        self._persist_order(iid)

    def _on_drag_start(self, event) -> None:
        row = self.tree.identify_row(event.y)
        self._drag_iid = row or None

    def _on_drag_motion(self, event) -> None:
        if not self._drag_iid:
            return
        target = self.tree.identify_row(event.y)
        if not target or target == self._drag_iid:
            return
        self.tree.move(self._drag_iid, "", self.tree.index(target))

    def _on_drag_drop(self, _event) -> None:
        if not self._drag_iid:
            return
        moved = self._drag_iid
        self._drag_iid = None
        self._persist_order(moved)

    def _edit_selected(self, on_edit: Callable[[dict], None]) -> None:
        row = self._selected()
        if not row:
            messagebox.showinfo("Select a row", "Pick an item first.", parent=self)
            return
        on_edit(row)

    def _delete_selected(self, on_delete: Callable[[dict], None]) -> None:
        row = self._selected()
        if not row:
            messagebox.showinfo("Select a row", "Pick an item first.", parent=self)
            return
        if not messagebox.askyesno("Delete?", "This cannot be undone.", parent=self):
            return
        try:
            on_delete(row)
            self.reload()
        except Exception as e:
            messagebox.showerror("Delete failed", str(e), parent=self)


class AdminApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Pfolio Admin")
        self.geometry("1040x680")
        self.minsize(860, 540)
        try:
            self.tk.call("tk", "scaling", 1.15 if sys.platform.startswith("win") else 1.0)
        except tk.TclError:
            pass
        _style(self)

        shell = ttk.Frame(self)
        shell.pack(fill="both", expand=True)

        sidebar = ttk.Frame(shell, style="Sidebar.TFrame", width=200, padding=(10, 12))
        sidebar.pack(side="left", fill="y")
        sidebar.pack_propagate(False)

        brand = ttk.Frame(sidebar)
        brand.pack(fill="x", pady=(0, 8))
        ttk.Label(brand, text="Pfolio", style="Brand.TLabel").pack(anchor="w")
        ttk.Label(brand, text="Admin", style="Muted.TLabel").pack(anchor="w")
        ttk.Separator(sidebar, orient="horizontal").pack(fill="x", pady=(8, 10))

        self._nav_buttons: dict[str, ttk.Button] = {}
        nav_cmds = {
            "projects": self._show_projects,
            "experience": self._show_experience,
            "stack": self._show_stack,
            "gallery": self._show_gallery,
            "blog": self._show_blog,
            "resume": self._show_resume,
        }
        for label, key in NAV_ITEMS:
            btn = ttk.Button(
                sidebar,
                text=label,
                style="Nav.TButton",
                command=lambda k=key, c=nav_cmds[key]: self._navigate(k, c),
            )
            btn.pack(fill="x", pady=1)
            self._nav_buttons[key] = btn

        ttk.Frame(sidebar).pack(expand=True, fill="both")
        ttk.Separator(sidebar, orient="horizontal").pack(fill="x", pady=(8, 8))
        ttk.Button(sidebar, text="Quit", command=self.destroy).pack(fill="x")

        ttk.Separator(shell, orient="vertical").pack(side="left", fill="y")

        self.content = ttk.Frame(shell, style="Content.TFrame")
        self.content.pack(side="left", fill="both", expand=True)

        self._current: str | None = None
        self._navigate("projects", self._show_projects)

    def _set_active_nav(self, key: str) -> None:
        for name, btn in self._nav_buttons.items():
            btn.configure(style="NavActive.TButton" if name == key else "Nav.TButton")

    def _navigate(self, key: str, show: Callable[[], None]) -> None:
        self._set_active_nav(key)
        self._current = key
        show()

    def _clear_content(self) -> None:
        for child in self.content.winfo_children():
            child.destroy()

    def _swap(self, factory: Callable[[], SectionView]) -> None:
        self._clear_content()
        view = factory()
        view.pack(fill="both", expand=True)
        view.reload()

    def _show_projects(self) -> None:
        def factory():
            return SectionView(
                self.content,
                "Projects",
                "projects",
                [("title", "Title"), ("category", "Category"), ("id", "Id")],
                refresh=lambda: get_projects_list() or [],
                on_add=self._add_project,
                on_edit=self._edit_project,
                on_delete=lambda r: projects_delete_by_id(str(r["id"])),
            )

        self._swap(factory)

    def _add_project(self) -> None:
        fields = [
            ("title", "Title", "text"),
            ("category", "Category", "text"),
            ("description", "Description", "area"),
            ("tags", "Tags (comma)", "text"),
            ("github_url", "GitHub URL", "text"),
            ("live_url", "Live URL", "text"),
            ("image_path", "Local cover image", "file"),
        ]

        def save(data: dict) -> None:
            row = {
                "title": data["title"],
                "category": data.get("category") or None,
                "description": data.get("description") or None,
                "tags": [t.strip() for t in data.get("tags", "").split(",") if t.strip()],
                "github_url": data.get("github_url") or None,
                "live_url": data.get("live_url") or None,
            }
            pid = projects_insert(row, data.get("image_path") or None)
            if not pid:
                raise RuntimeError("Insert failed")
            messagebox.showinfo("Added", f"Project {pid}", parent=self)
            self._show_projects()

        FormDialog(self, "New project", fields, save)

    def _edit_project(self, row: dict) -> None:
        fields = [
            ("title", "Title", "text"),
            ("category", "Category", "text"),
            ("description", "Description", "area"),
            ("tags", "Tags (comma)", "text"),
            ("github_url", "GitHub URL", "text"),
            ("live_url", "Live URL", "text"),
            ("image_path", "Replace cover", "file"),
        ]

        def save(data: dict) -> None:
            changes = {
                "title": data["title"],
                "category": data.get("category") or None,
                "description": data.get("description") or None,
                "tags": [t.strip() for t in data.get("tags", "").split(",") if t.strip()],
                "github_url": data.get("github_url") or None,
                "live_url": data.get("live_url") or None,
            }
            if not projects_update_by_id(str(row["id"]), changes):
                raise RuntimeError("Update failed")
            path = data.get("image_path") or ""
            if path:
                set_file_for_record("projects", str(row["id"]), "image", path)
            self._show_projects()

        dlg = FormDialog(self, "Edit project", fields, save)
        tags = row.get("tags") or []
        dlg.set_values({**row, "tags": ", ".join(tags) if isinstance(tags, list) else tags, "image_path": ""})

    def _show_experience(self) -> None:
        def factory():
            return SectionView(
                self.content,
                "Experience",
                "experience",
                [("title", "Title"), ("company", "Company"), ("id", "Id")],
                refresh=lambda: (
                    client.table("experience").select("*").order("position").order("id").execute().data or []
                ),
                on_add=self._add_experience,
                on_edit=self._edit_experience,
                on_delete=lambda r: experience_delete_by_id(str(r["id"])),
            )

        self._swap(factory)

    def _add_experience(self) -> None:
        fields = [
            ("title", "Title", "text"),
            ("company", "Company", "text"),
            ("role", "Role", "text"),
            ("location", "Location", "text"),
            ("description", "Description", "area"),
            ("logo_path", "Local logo", "file"),
        ]

        def save(data: dict) -> None:
            row = {k: data.get(k) or None for k in ("title", "company", "role", "location", "description")}
            row["title"] = data["title"]
            eid = experience_insert(row, data.get("logo_path") or None)
            if not eid:
                raise RuntimeError("Insert failed")
            self._show_experience()

        FormDialog(self, "New experience", fields, save)

    def _edit_experience(self, row: dict) -> None:
        fields = [
            ("title", "Title", "text"),
            ("company", "Company", "text"),
            ("role", "Role", "text"),
            ("location", "Location", "text"),
            ("description", "Description", "area"),
            ("logo_path", "Replace logo", "file"),
        ]

        def save(data: dict) -> None:
            changes = {k: data.get(k) or None for k in ("title", "company", "role", "location", "description")}
            if not experience_update_by_id(str(row["id"]), changes):
                raise RuntimeError("Update failed")
            if data.get("logo_path"):
                set_file_for_record("experience", str(row["id"]), "logo", data["logo_path"])
            self._show_experience()

        dlg = FormDialog(self, "Edit experience", fields, save)
        dlg.set_values({**row, "logo_path": ""})

    def _show_stack(self) -> None:
        def factory():
            return SectionView(
                self.content,
                "Stack",
                "stack",
                [("category", "Category"), ("tools", "Tools"), ("id", "Id")],
                refresh=lambda: (client.table("stack").select("*").order("position").order("id").execute().data or []),
                on_add=self._add_stack,
                on_edit=self._edit_stack,
                on_delete=lambda r: stack_delete_by_id(str(r["id"])),
            )

        self._swap(factory)

    def _add_stack(self) -> None:
        fields = [("category", "Category", "text"), ("tools", "Tools", "text"), ("description", "Description", "area")]

        def save(data: dict) -> None:
            if not stack_insert(data):
                raise RuntimeError("Insert failed")
            self._show_stack()

        FormDialog(self, "New stack entry", fields, save)

    def _edit_stack(self, row: dict) -> None:
        fields = [("category", "Category", "text"), ("tools", "Tools", "text"), ("description", "Description", "area")]

        def save(data: dict) -> None:
            if not stack_update_by_id(str(row["id"]), data):
                raise RuntimeError("Update failed")
            self._show_stack()

        dlg = FormDialog(self, "Edit stack", fields, save)
        dlg.set_values(row)

    def _show_gallery(self) -> None:
        def factory():
            return SectionView(
                self.content,
                "Gallery",
                "gallery",
                [("title", "Title"), ("subtitle", "Subtitle"), ("tone", "Tone"), ("id", "Id")],
                refresh=lambda: (
                    client.table("gallery").select("*").order("position").order("id").execute().data or []
                ),
                on_add=self._add_gallery,
                on_edit=self._edit_gallery,
                on_delete=lambda r: gallery_delete_by_id(str(r["id"])),
            )

        self._swap(factory)

    def _add_gallery(self) -> None:
        fields = [
            ("title", "Title", "text"),
            ("subtitle", "Subtitle", "text"),
            ("tone", "Tone (dark/light)", "text"),
            ("src_path", "Primary image", "file"),
            ("extra_path", "Extra image", "file"),
        ]

        def save(data: dict) -> None:
            path = data.get("src_path") or ""
            if not path:
                raise RuntimeError("Primary image path is required")
            row = {
                "title": data["title"],
                "subtitle": data.get("subtitle") or "",
                "tone": data.get("tone") or "dark",
                "src": "",
            }
            gid = gallery_insert(
                row,
                src_path=path,
                project_srcs_path=data.get("extra_path") or None,
            )
            if not gid:
                raise RuntimeError("Insert failed")
            self._show_gallery()

        FormDialog(self, "New gallery item", fields, save)

    def _edit_gallery(self, row: dict) -> None:
        fields = [
            ("title", "Title", "text"),
            ("subtitle", "Subtitle", "text"),
            ("tone", "Tone", "text"),
            ("src_path", "Replace primary", "file"),
            ("extra_path", "Append extra image", "file"),
        ]

        def save(data: dict) -> None:
            changes = {
                "title": data["title"],
                "subtitle": data.get("subtitle") or "",
                "tone": data.get("tone") or "dark",
            }
            if not gallery_update_by_id(str(row["id"]), changes):
                raise RuntimeError("Update failed")
            if data.get("src_path"):
                set_file_for_record("gallery", str(row["id"]), "src", data["src_path"])
            if data.get("extra_path"):
                gallery_append_images(str(row["id"]), None, data["extra_path"])
            self._show_gallery()

        dlg = FormDialog(self, "Edit gallery", fields, save)
        dlg.set_values({**row, "src_path": "", "extra_path": ""})

    def _show_blog(self) -> None:
        def factory():
            return SectionView(
                self.content,
                "Blog",
                "blog_posts",
                [("title", "Title"), ("slug", "Slug"), ("category", "Category"), ("id", "Id")],
                refresh=lambda: (
                    client.table("blog_posts").select("*").order("position").order("id").execute().data or []
                ),
                on_add=self._add_blog,
                on_edit=self._edit_blog,
                on_delete=lambda r: blog_delete_by_id(str(r["id"])),
            )

        self._swap(factory)

    def _add_blog(self) -> None:
        fields = [
            ("title", "Title", "text"),
            ("slug", "Slug", "text"),
            ("category", "Category", "text"),
            ("excerpt", "Excerpt", "area"),
            ("body", "Body (markdown)", "area"),
            ("cover_path", "Cover image", "file"),
        ]

        def save(data: dict) -> None:
            row = {
                "title": data["title"],
                "slug": data["slug"],
                "category": data.get("category") or None,
                "excerpt": data.get("excerpt") or None,
                "body": data.get("body") or "",
            }
            bid = blog_insert(row, data.get("cover_path") or None)
            if not bid:
                raise RuntimeError("Insert failed")
            self._show_blog()

        FormDialog(self, "New post", fields, save)

    def _edit_blog(self, row: dict) -> None:
        fields = [
            ("title", "Title", "text"),
            ("slug", "Slug", "text"),
            ("category", "Category", "text"),
            ("excerpt", "Excerpt", "area"),
            ("body", "Body (markdown)", "area"),
            ("cover_path", "Replace cover", "file"),
        ]

        def save(data: dict) -> None:
            changes = {
                "title": data["title"],
                "slug": data["slug"],
                "category": data.get("category") or None,
                "excerpt": data.get("excerpt") or None,
                "body": data.get("body") or "",
            }
            if not blog_update_by_id(str(row["id"]), changes):
                raise RuntimeError("Update failed")
            if data.get("cover_path"):
                set_file_for_record("blog_posts", str(row["id"]), "cover_image", data["cover_path"])
            self._show_blog()

        dlg = FormDialog(self, "Edit post", fields, save)
        dlg.set_values({**row, "cover_path": ""})

    def _show_resume(self) -> None:
        self._clear_content()
        frame = ttk.Frame(self.content, style="Content.TFrame")
        frame.pack(fill="both", expand=True)

        toolbar = ttk.Frame(frame, style="Toolbar.TFrame")
        toolbar.pack(fill="x")
        ttk.Label(toolbar, text="Resume", style="Head.TLabel").pack(side="left")
        ttk.Separator(frame, orient="horizontal").pack(fill="x")

        body = ttk.Frame(frame, padding=16)
        body.pack(fill="both", expand=True)

        def gen() -> None:
            path = filedialog.askopenfilename(
                parent=self,
                title="Resume source",
                filetypes=[("Documents", "*.pdf *.docx *.txt *.md"), ("All", "*.*")],
            )
            if not path:
                return
            try:
                out = create_resume(path)
                if out:
                    messagebox.showinfo("Resume", f"Markdown written to:\n{out}", parent=self)
                else:
                    messagebox.showerror("Resume", "Generation failed.", parent=self)
            except Exception as e:
                messagebox.showerror("Resume", str(e), parent=self)

        def upload() -> None:
            path = filedialog.askopenfilename(
                parent=self,
                title="Resume markdown",
                filetypes=[("Markdown", "*.md *.markdown *.txt"), ("All", "*.*")],
            )
            if not path:
                return
            if resume_upload_from_file(path):
                messagebox.showinfo("Resume", "Saved to Supabase.", parent=self)
            else:
                messagebox.showerror("Resume", "Upload failed.", parent=self)

        ttk.Button(body, text="Generate from PDF / DOCX / TXT", command=gen).pack(anchor="w", pady=(0, 8))
        ttk.Button(body, text="Upload markdown to Supabase", command=upload).pack(anchor="w")


def run_admin_gui() -> None:
    app = AdminApp()
    app.mainloop()


if __name__ == "__main__":
    run_admin_gui()
