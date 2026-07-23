#!/usr/bin/env python3
"""Modern desktop admin for Pfolio (same CRUD as the terminal CLI).

Built on CustomTkinter, which gives what plain ttk cannot: rounded cards,
hover states, soft elevation and real icons. Colours are the same shadcn
neutral tokens the web dashboard uses, given as (light, dark) pairs so the app
follows the system appearance for free.

Icons are drawn at runtime from vector specs in lucide's style (24px grid,
~2px round-capped strokes), so there are no image assets to ship and they
recolour with the theme.
"""
from __future__ import annotations

import json
import sys
import tkinter as tk
from tkinter import filedialog, messagebox
from typing import Callable

import customtkinter as ctk
from PIL import Image, ImageChops, ImageDraw

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
    ("Projects", "projects", "grid"),
    ("Experience", "experience", "briefcase"),
    ("Stack", "stack", "layers"),
    ("Gallery", "gallery", "image"),
    ("Blog", "blog", "file-text"),
    ("Resume", "resume", "scroll"),
)

# ---------------------------------------------------------------- tokens ----
# Same shadcn neutral ramp as server/dashboard (globals.css), as (light, dark).
# CustomTkinter resolves the pair against the active appearance mode, so every
# widget below is theme-correct without a second code path.
BG = ("#ffffff", "#0a0a0a")
SIDEBAR = ("#fafafa", "#141414")
CARD = ("#ffffff", "#171717")
FG = ("#0a0a0a", "#fafafa")
MUTED_FG = ("#737373", "#a3a3a3")
BORDER = ("#e5e5e5", "#2a2a2a")
HOVER = ("#f4f4f4", "#242424")
ACCENT = ("#efefef", "#272727")
PRIMARY = ("#171717", "#fafafa")
PRIMARY_FG = ("#fafafa", "#171717")
PRIMARY_HOVER = ("#2e2e2e", "#e2e2e2")
DANGER = ("#e7000b", "#ff6467")
DANGER_HOVER = ("#c50009", "#ff8a8c")
INPUT_BG = ("#ffffff", "#101010")
# Tk has no box-shadow; a hairline band under a card reads as soft elevation.
SHADOW = ("#ececec", "#000000")

RADIUS = 10
RADIUS_LG = 14
ROW_H = 42


def _font(size: int = 13, weight: str = "normal") -> ctk.CTkFont:
    family = "Segoe UI Variable Text" if sys.platform.startswith("win") else None
    return ctk.CTkFont(family=family, size=size, weight=weight)


# ----------------------------------------------------------------- icons ----
# Vector specs on lucide's 24x24 grid. Primitives:
#   ("line", x1, y1, x2, y2) | ("poly", [(x, y), ...], closed)
#   ("rect", x1, y1, x2, y2) | ("circle", cx, cy, r) | ("dot", cx, cy, r)
#   ("arc", cx, cy, r, start_deg, end_deg)
_ICON_SPECS: dict[str, list[tuple]] = {
    "grid": [("rect", 3, 3, 10.5, 10.5), ("rect", 13.5, 3, 21, 10.5),
             ("rect", 3, 13.5, 10.5, 21), ("rect", 13.5, 13.5, 21, 21)],
    "briefcase": [("rect", 3, 7, 21, 20), ("poly", [(9, 7), (9, 4), (15, 4), (15, 7)], False),
                  ("line", 3, 12.5, 21, 12.5)],
    "layers": [("poly", [(12, 3), (21, 8), (12, 13), (3, 8)], True),
               ("poly", [(3.5, 12), (12, 16.5), (20.5, 12)], False),
               ("poly", [(3.5, 16), (12, 20.5), (20.5, 16)], False)],
    "image": [("rect", 3, 4, 21, 20), ("dot", 8.6, 9.6, 1.5),
              ("poly", [(3, 17.5), (9, 11.5), (13.5, 16), (16.5, 13), (21, 17.5)], False)],
    "file-text": [("poly", [(6, 2), (14, 2), (20, 8), (20, 22), (6, 22)], True),
                  ("poly", [(14, 2), (14, 8), (20, 8)], False),
                  ("line", 9, 13, 17, 13), ("line", 9, 17, 17, 17)],
    "scroll": [("poly", [(6, 2), (14, 2), (20, 8), (20, 22), (6, 22)], True),
               ("poly", [(14, 2), (14, 8), (20, 8)], False),
               ("line", 9, 12.5, 17, 12.5), ("line", 9, 16.5, 14, 16.5)],
    "plus": [("line", 12, 5, 12, 19), ("line", 5, 12, 19, 12)],
    "refresh": [("arc", 12, 12, 8, 300, 200), ("poly", [(20.5, 4), (20.5, 10.5), (14, 10.5)], False)],
    "trash": [("line", 3, 6, 21, 6), ("poly", [(5.5, 6), (6.5, 21), (17.5, 21), (18.5, 6)], False),
              ("poly", [(9, 6), (9, 3), (15, 3), (15, 6)], False),
              ("line", 10, 10, 10, 17), ("line", 14, 10, 14, 17)],
    "pencil": [("poly", [(4, 20), (4, 15), (16, 3), (21, 8), (9, 20)], True), ("line", 14, 5, 19, 10)],
    "chevron-up": [("poly", [(6, 15), (12, 9), (18, 15)], False)],
    "chevron-down": [("poly", [(6, 9), (12, 15), (18, 9)], False)],
    "sun": [("circle", 12, 12, 4.4), ("line", 12, 1.5, 12, 4), ("line", 12, 20, 12, 22.5),
            ("line", 1.5, 12, 4, 12), ("line", 20, 12, 22.5, 12),
            ("line", 4.6, 4.6, 6.4, 6.4), ("line", 17.6, 17.6, 19.4, 19.4),
            ("line", 19.4, 4.6, 17.6, 6.4), ("line", 6.4, 17.6, 4.6, 19.4)],
    "power": [("arc", 12, 12, 8, 300, 240), ("line", 12, 2.5, 12, 11)],
    "upload": [("line", 12, 20, 12, 6), ("poly", [(6, 12), (12, 6), (18, 12)], False),
               ("line", 3.5, 21.5, 20.5, 21.5)],
    "sparkles": [("poly", [(9, 3), (11, 8), (16, 10), (11, 12), (9, 17), (7, 12), (2, 10), (7, 8)], True),
                 ("poly", [(17.5, 14), (18.6, 17), (21.5, 18), (18.6, 19), (17.5, 22),
                           (16.4, 19), (13.5, 18), (16.4, 17)], True)],
    "inbox": [("poly", [(3, 13), (8, 13), (9.5, 16), (14.5, 16), (16, 13), (21, 13)], False),
              ("poly", [(3, 13), (6, 4), (18, 4), (21, 13), (21, 20), (3, 20)], True)],
}
_SS = 4  # supersample, then LANCZOS down — PIL strokes are not anti-aliased
_ICON_TONES: dict[str, tuple[str, str]] = {
    "default": ("#404040", "#d4d4d4"),
    "muted": ("#737373", "#a3a3a3"),
    "strong": ("#0a0a0a", "#fafafa"),
    "on_primary": ("#fafafa", "#171717"),
    "danger": ("#e7000b", "#ff6467"),
}
_ICON_CACHE: dict[tuple, ctk.CTkImage] = {}


def _stroke(draw: ImageDraw.ImageDraw, pts: list, colour: str, w: int, closed: bool) -> None:
    """Polyline with round joints and caps, the way lucide draws."""
    path = list(pts) + ([pts[0]] if closed and len(pts) > 2 else [])
    draw.line(path, fill=colour, width=w, joint="curve")
    r = w / 2.0
    for x, y in path:
        draw.ellipse([x - r, y - r, x + r, y + r], fill=colour)


def _render_icon(name: str, colour: str, size: int) -> Image.Image:
    px = size * _SS
    k = px / 24.0

    if name == "moon":  # crescent reads far better as a mask subtraction
        big = Image.new("L", (px, px), 0)
        ImageDraw.Draw(big).ellipse([2.5 * k, 2.5 * k, 21.5 * k, 21.5 * k], fill=255)
        cut = Image.new("L", (px, px), 0)
        ImageDraw.Draw(cut).ellipse([8 * k, -2 * k, 27 * k, 17 * k], fill=255)
        img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
        img.paste(Image.new("RGBA", (px, px), colour), (0, 0), ImageChops.subtract(big, cut))
        return img.resize((size, size), Image.LANCZOS)

    img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    w = max(1, int(round(1.9 * k)))
    for prim in _ICON_SPECS.get(name, []):
        kind = prim[0]
        if kind == "line":
            _, x1, y1, x2, y2 = prim
            _stroke(d, [(x1 * k, y1 * k), (x2 * k, y2 * k)], colour, w, False)
        elif kind == "poly":
            _, pts, closed = prim
            _stroke(d, [(x * k, y * k) for x, y in pts], colour, w, closed)
        elif kind == "rect":
            _, x1, y1, x2, y2 = prim
            _stroke(d, [(x1 * k, y1 * k), (x2 * k, y1 * k), (x2 * k, y2 * k), (x1 * k, y2 * k)],
                    colour, w, True)
        elif kind == "circle":
            _, cx, cy, r = prim
            d.ellipse([(cx - r) * k, (cy - r) * k, (cx + r) * k, (cy + r) * k],
                      outline=colour, width=w)
        elif kind == "dot":
            _, cx, cy, r = prim
            d.ellipse([(cx - r) * k, (cy - r) * k, (cx + r) * k, (cy + r) * k], fill=colour)
        elif kind == "arc":
            _, cx, cy, r, a0, a1 = prim
            d.arc([(cx - r) * k, (cy - r) * k, (cx + r) * k, (cy + r) * k],
                  a0, a1, fill=colour, width=w)
    return img.resize((size, size), Image.LANCZOS)


def icon(name: str, size: int = 18, tone: str = "default") -> ctk.CTkImage:
    key = (name, size, tone)
    if key not in _ICON_CACHE:
        light, dark = _ICON_TONES.get(tone, _ICON_TONES["default"])
        _ICON_CACHE[key] = ctk.CTkImage(
            light_image=_render_icon(name, light, size),
            dark_image=_render_icon(name, dark, size),
            size=(size, size),
        )
    return _ICON_CACHE[key]


def _entry(master, var: tk.StringVar) -> ctk.CTkEntry:
    return ctk.CTkEntry(
        master,
        textvariable=var,
        height=38,
        corner_radius=RADIUS,
        border_width=1,
        border_color=BORDER,
        fg_color=INPUT_BG,
        text_color=FG,
        font=_font(12),
    )


def _ghost_button(master, text: str, command, ico: str | None = None, width: int = 100):
    return ctk.CTkButton(
        master,
        text=text,
        image=icon(ico, 16) if ico else None,
        compound="left",
        width=width,
        height=38,
        corner_radius=RADIUS,
        fg_color="transparent",
        border_width=1,
        border_color=BORDER,
        text_color=FG,
        hover_color=HOVER,
        font=_font(12),
        command=command,
    )


class FormDialog(ctk.CTkToplevel):
    def __init__(self, master, title: str, fields: list[tuple[str, str, str]], on_save: Callable[[dict], None]):
        super().__init__(master)
        self.title(title)
        self.configure(fg_color=BG)
        self.resizable(True, True)
        self.transient(master)
        self.geometry("660x600")
        self.minsize(520, 420)
        self._vars: dict[str, tk.Variable | ctk.CTkTextbox] = {}
        self._on_save = on_save

        header = ctk.CTkFrame(self, fg_color="transparent")
        header.pack(fill="x", padx=26, pady=(24, 0))
        ctk.CTkLabel(header, text=title, font=_font(19, "bold"), text_color=FG).pack(anchor="w")
        ctk.CTkLabel(
            header,
            text="These fields map straight to the table columns.",
            font=_font(12),
            text_color=MUTED_FG,
        ).pack(anchor="w", pady=(3, 0))

        body = ctk.CTkScrollableFrame(self, fg_color="transparent")
        body.pack(fill="both", expand=True, padx=20, pady=(16, 0))
        body.grid_columnconfigure(0, weight=1)

        for i, (key, label, kind) in enumerate(fields):
            ctk.CTkLabel(
                body, text=label, font=_font(12, "bold"), text_color=FG, anchor="w"
            ).grid(row=i * 2, column=0, sticky="ew", padx=6, pady=(12 if i else 0, 5))

            if kind == "area":
                box = ctk.CTkTextbox(
                    body,
                    height=104,
                    corner_radius=RADIUS,
                    border_width=1,
                    border_color=BORDER,
                    fg_color=INPUT_BG,
                    text_color=FG,
                    font=_font(12),
                    wrap="word",
                )
                box.grid(row=i * 2 + 1, column=0, sticky="ew", padx=6)
                self._vars[key] = box
            elif kind == "file":
                cell = ctk.CTkFrame(body, fg_color="transparent")
                cell.grid(row=i * 2 + 1, column=0, sticky="ew", padx=6)
                cell.grid_columnconfigure(0, weight=1)
                var = tk.StringVar()
                _entry(cell, var).grid(row=0, column=0, sticky="ew")
                _ghost_button(
                    cell, "Browse", lambda v=var: self._browse(v), "inbox", 104
                ).grid(row=0, column=1, padx=(8, 0))
                self._vars[key] = var
            else:
                var = tk.StringVar()
                _entry(body, var).grid(row=i * 2 + 1, column=0, sticky="ew", padx=6)
                self._vars[key] = var

        footer = ctk.CTkFrame(self, fg_color="transparent")
        footer.pack(fill="x", padx=26, pady=20)
        ctk.CTkButton(
            footer,
            text="Save",
            width=112,
            height=40,
            corner_radius=RADIUS,
            fg_color=PRIMARY,
            hover_color=PRIMARY_HOVER,
            text_color=PRIMARY_FG,
            font=_font(13, "bold"),
            command=self._save,
        ).pack(side="right")
        _ghost_button(footer, "Cancel", self.destroy, None, 100).pack(side="right", padx=(0, 10))

        # CTkToplevel builds asynchronously; grabbing too early loses the modal
        # or flashes the window behind its parent.
        self.after(90, self._claim_focus)

    def _claim_focus(self) -> None:
        try:
            self.grab_set()
            self.lift()
            self.focus_force()
        except tk.TclError:
            pass

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
            # CTkTextbox is NOT a tk.Text subclass — check it explicitly or
            # multi-line fields silently never populate.
            if isinstance(var, ctk.CTkTextbox):
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
            if isinstance(var, ctk.CTkTextbox):
                out[key] = var.get("1.0", "end").strip()
            else:
                out[key] = var.get().strip()
        try:
            self._on_save(out)
            self.destroy()
        except Exception as e:
            messagebox.showerror("Save failed", str(e), parent=self)


class SectionView(ctk.CTkFrame):
    """Card table: hoverable rows, background-highlight selection, drag reorder.

    Signature is unchanged from the ttk version so every section handler below
    keeps working untouched.
    """

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
        super().__init__(master, fg_color="transparent")
        self._table = table
        self._refresh_fn = refresh
        self._columns = columns
        self._on_edit = on_edit
        self._on_delete = on_delete
        self._rows: list[dict] = []
        self._order: list[str] = []
        self._row_widgets: dict[str, ctk.CTkFrame] = {}
        self._selected_id: str | None = None
        self._hovered_id: str | None = None
        self._dragged = False
        self._empty: ctk.CTkLabel | None = None

        bar = ctk.CTkFrame(self, fg_color="transparent")
        bar.pack(fill="x", padx=28, pady=(24, 16))
        heads = ctk.CTkFrame(bar, fg_color="transparent")
        heads.pack(side="left")
        ctk.CTkLabel(heads, text=title, font=_font(22, "bold"), text_color=FG).pack(anchor="w")
        ctk.CTkLabel(
            heads,
            text="Double click a row to edit. Drag rows to reorder.",
            font=_font(12),
            text_color=MUTED_FG,
        ).pack(anchor="w", pady=(2, 0))

        ctk.CTkButton(
            bar,
            text="New",
            image=icon("plus", 16, "on_primary"),
            compound="left",
            width=108,
            height=38,
            corner_radius=RADIUS,
            fg_color=PRIMARY,
            hover_color=PRIMARY_HOVER,
            text_color=PRIMARY_FG,
            font=_font(13, "bold"),
            command=on_add,
        ).pack(side="right")
        _ghost_button(bar, "Refresh", self.reload, "refresh", 112).pack(side="right", padx=(0, 10))

        # Tk has no box-shadow — a frame peeking 3px below the card reads as lift.
        shadow = ctk.CTkFrame(self, fg_color=SHADOW, corner_radius=RADIUS_LG)
        shadow.pack(fill="both", expand=True, padx=28)
        card = ctk.CTkFrame(
            shadow, fg_color=CARD, corner_radius=RADIUS_LG, border_width=1, border_color=BORDER
        )
        card.pack(fill="both", expand=True, pady=(0, 3))

        head = ctk.CTkFrame(card, fg_color="transparent")
        head.pack(fill="x", padx=16, pady=(14, 0))
        self._configure_cols(head)
        for i, (_key, label) in enumerate(columns):
            ctk.CTkLabel(
                head, text=label.upper(), font=_font(10, "bold"), text_color=MUTED_FG, anchor="w"
            ).grid(row=0, column=i, sticky="ew", padx=(10, 10))
        ctk.CTkFrame(card, height=1, fg_color=BORDER).pack(fill="x", padx=16, pady=(10, 0))

        self._body = ctk.CTkScrollableFrame(card, fg_color="transparent")
        self._body.pack(fill="both", expand=True, padx=8, pady=8)

        foot = ctk.CTkFrame(self, fg_color="transparent")
        foot.pack(fill="x", padx=28, pady=(14, 22))
        _ghost_button(foot, "Open", self._edit_selected, "pencil", 104).pack(side="left")
        _ghost_button(foot, "Up", lambda: self._nudge(-1), "chevron-up", 88).pack(side="left", padx=(10, 0))
        _ghost_button(foot, "Down", lambda: self._nudge(1), "chevron-down", 100).pack(side="left", padx=(10, 0))
        ctk.CTkButton(
            foot,
            text="Delete",
            image=icon("trash", 16, "on_primary"),
            compound="left",
            width=108,
            height=38,
            corner_radius=RADIUS,
            fg_color=DANGER,
            hover_color=DANGER_HOVER,
            text_color="#ffffff",
            font=_font(13),
            command=self._delete_selected,
        ).pack(side="right")
        self._count = ctk.CTkLabel(foot, text="", font=_font(12), text_color=MUTED_FG)
        self._count.pack(side="right", padx=(0, 16))

    # ------------------------------------------------------------ layout --
    def _configure_cols(self, widget) -> None:
        for i, (key, _label) in enumerate(self._columns):
            widget.grid_columnconfigure(i, weight=2 if key == "id" else 3, uniform="col")

    def _repack(self) -> None:
        for rid in self._order:
            w = self._row_widgets.get(rid)
            if w is not None:
                w.pack_forget()
        for rid in self._order:
            w = self._row_widgets.get(rid)
            if w is not None:
                w.pack(fill="x", padx=2, pady=1)

    def _make_row(self, rid: str, row: dict) -> ctk.CTkFrame:
        frame = ctk.CTkFrame(self._body, fg_color="transparent", corner_radius=RADIUS)
        self._configure_cols(frame)
        for i, (key, _label) in enumerate(self._columns):
            v = row.get(key)
            text = json.dumps(v) if isinstance(v, (list, dict)) else ("" if v is None else str(v))
            ctk.CTkLabel(
                frame,
                text=text[:80],
                anchor="w",
                font=_font(11 if key == "id" else 13),
                text_color=MUTED_FG if key == "id" else FG,
            ).grid(row=0, column=i, sticky="ew", padx=(10, 10), pady=10)
        self._bind_row(frame, rid)
        return frame

    def _bind_row(self, widget, rid: str) -> None:
        # CTk widgets are composites, so the inner tk widgets need the bindings
        # too or clicks land on a child and never reach the row.
        widget.bind("<Enter>", lambda _e, r=rid: self._set_hover(r))
        widget.bind("<Leave>", lambda _e, r=rid: self._set_hover(None))
        widget.bind("<Button-1>", lambda _e, r=rid: self._select(r))
        widget.bind("<Double-Button-1>", lambda _e, r=rid: self._open(r))
        widget.bind("<B1-Motion>", lambda e, r=rid: self._drag(e, r))
        widget.bind("<ButtonRelease-1>", lambda _e: self._drop())
        for child in widget.winfo_children():
            self._bind_row(child, rid)

    def _paint(self, rid: str) -> None:
        w = self._row_widgets.get(rid)
        if w is None:
            return
        if rid == self._selected_id:
            w.configure(fg_color=ACCENT)
        elif rid == self._hovered_id:
            w.configure(fg_color=HOVER)
        else:
            w.configure(fg_color="transparent")

    def _set_hover(self, rid: str | None) -> None:
        previous, self._hovered_id = self._hovered_id, rid
        for r in {previous, rid}:
            if r:
                self._paint(r)

    def _select(self, rid: str) -> None:
        previous, self._selected_id = self._selected_id, rid
        for r in {previous, rid}:
            if r:
                self._paint(r)

    # -------------------------------------------------------------- data --
    def reload(self) -> None:
        for w in self._row_widgets.values():
            w.destroy()
        self._row_widgets.clear()
        self._order.clear()
        self._selected_id = None
        self._hovered_id = None
        if self._empty is not None:
            self._empty.destroy()
            self._empty = None

        try:
            self._rows = self._refresh_fn() or []
        except Exception as e:
            messagebox.showerror("Load failed", str(e), parent=self)
            self._rows = []
            self._count.configure(text="Could not load")
            return

        for row in self._rows:
            rid = str(row.get("id"))
            self._order.append(rid)
            self._row_widgets[rid] = self._make_row(rid, row)
        self._repack()

        n = len(self._rows)
        self._count.configure(text="No items yet" if n == 0 else f"{n} item{'' if n == 1 else 's'}")
        if n == 0:
            self._empty = ctk.CTkLabel(
                self._body,
                text="Nothing here yet.\nUse New to add the first one.",
                font=_font(13),
                text_color=MUTED_FG,
                justify="center",
            )
            self._empty.pack(pady=48)

    def _row_by_id(self, rid: str | None) -> dict | None:
        if not rid:
            return None
        for row in self._rows:
            if str(row.get("id")) == rid:
                return row
        return None

    def _persist_order(self, keep: str | None = None) -> None:
        if not set_positions(self._table, list(self._order)):
            messagebox.showerror("Reorder failed", "Could not save that order.", parent=self)
        self.reload()
        if keep and keep in self._row_widgets:
            self._select(keep)

    def _nudge(self, direction: int) -> None:
        if not self._selected_id:
            messagebox.showinfo("Select a row", "Pick an item first.", parent=self)
            return
        i = self._order.index(self._selected_id)
        j = i + direction
        if j < 0 or j >= len(self._order):
            return
        self._order.insert(j, self._order.pop(i))
        self._repack()
        self._persist_order(self._selected_id)

    # ------------------------------------------------------------- drag ---
    def _index_at(self, y_root: int) -> int | None:
        for idx, rid in enumerate(self._order):
            w = self._row_widgets.get(rid)
            if w is None:
                continue
            top = w.winfo_rooty()
            if top <= y_root <= top + w.winfo_height():
                return idx
        return None

    def _drag(self, event, rid: str) -> None:
        if rid not in self._order:
            return
        i = self._order.index(rid)
        target = self._index_at(event.y_root)
        if target is None or target == i:
            return
        self._order.insert(target, self._order.pop(i))
        self._dragged = True
        self._select(rid)
        self._repack()

    def _drop(self) -> None:
        if not self._dragged:
            return
        self._dragged = False
        self._persist_order(self._selected_id)

    # ----------------------------------------------------------- actions --
    def _open(self, rid: str) -> None:
        row = self._row_by_id(rid)
        if row:
            self._on_edit(row)

    def _edit_selected(self) -> None:
        row = self._row_by_id(self._selected_id)
        if not row:
            messagebox.showinfo("Select a row", "Pick an item first.", parent=self)
            return
        self._on_edit(row)

    def _delete_selected(self) -> None:
        row = self._row_by_id(self._selected_id)
        if not row:
            messagebox.showinfo("Select a row", "Pick an item first.", parent=self)
            return
        if not messagebox.askyesno("Delete?", "This cannot be undone.", parent=self):
            return
        try:
            self._on_delete(row)
            self.reload()
        except Exception as e:
            messagebox.showerror("Delete failed", str(e), parent=self)


class AdminApp(ctk.CTk):
    def __init__(self):
        ctk.set_appearance_mode("system")
        super().__init__()
        self.title("Pfolio Admin")
        self.geometry("1200x760")
        self.minsize(940, 600)
        self.configure(fg_color=BG)
        self._dark = ctk.get_appearance_mode() == "Dark"

        shell = ctk.CTkFrame(self, fg_color="transparent")
        shell.pack(fill="both", expand=True)

        sidebar = ctk.CTkFrame(shell, width=246, corner_radius=0, fg_color=SIDEBAR)
        sidebar.pack(side="left", fill="y")
        sidebar.pack_propagate(False)

        brand = ctk.CTkFrame(sidebar, fg_color="transparent")
        brand.pack(fill="x", padx=18, pady=(24, 22))
        mark = ctk.CTkFrame(brand, width=38, height=38, corner_radius=RADIUS, fg_color=PRIMARY)
        mark.pack(side="left")
        mark.pack_propagate(False)
        ctk.CTkLabel(
            mark, text="P", font=_font(18, "bold"), text_color=PRIMARY_FG
        ).pack(expand=True)
        titles = ctk.CTkFrame(brand, fg_color="transparent")
        titles.pack(side="left", padx=(12, 0))
        ctk.CTkLabel(titles, text="Pfolio", font=_font(15, "bold"), text_color=FG).pack(anchor="w")
        ctk.CTkLabel(titles, text="Content admin", font=_font(11), text_color=MUTED_FG).pack(anchor="w")

        ctk.CTkLabel(
            sidebar, text="MANAGE", font=_font(10, "bold"), text_color=MUTED_FG, anchor="w"
        ).pack(fill="x", padx=24, pady=(0, 8))

        self._nav_buttons: dict[str, ctk.CTkButton] = {}
        self._nav_icons: dict[str, str] = {}
        self._nav_cmds = {
            "projects": self._show_projects,
            "experience": self._show_experience,
            "stack": self._show_stack,
            "gallery": self._show_gallery,
            "blog": self._show_blog,
            "resume": self._show_resume,
        }
        for label, key, ico in NAV_ITEMS:
            self._nav_icons[key] = ico
            btn = ctk.CTkButton(
                sidebar,
                text=label,
                image=icon(ico, 18, "muted"),
                compound="left",
                anchor="w",
                height=40,
                corner_radius=RADIUS,
                fg_color="transparent",
                hover_color=HOVER,
                text_color=MUTED_FG,
                font=_font(13),
                command=lambda k=key: self._navigate(k, self._nav_cmds[k]),
            )
            btn.pack(fill="x", padx=14, pady=2)
            self._nav_buttons[key] = btn

        ctk.CTkFrame(sidebar, fg_color="transparent").pack(expand=True, fill="both")
        ctk.CTkFrame(sidebar, height=1, fg_color=BORDER).pack(fill="x", padx=18, pady=(10, 10))

        self._theme_btn = ctk.CTkButton(
            sidebar,
            text="Light mode" if self._dark else "Dark mode",
            image=icon("sun" if self._dark else "moon", 18, "muted"),
            compound="left",
            anchor="w",
            height=38,
            corner_radius=RADIUS,
            fg_color="transparent",
            hover_color=HOVER,
            text_color=MUTED_FG,
            font=_font(13),
            command=self._toggle_theme,
        )
        self._theme_btn.pack(fill="x", padx=14, pady=2)
        ctk.CTkButton(
            sidebar,
            text="Quit",
            image=icon("power", 18, "muted"),
            compound="left",
            anchor="w",
            height=38,
            corner_radius=RADIUS,
            fg_color="transparent",
            hover_color=HOVER,
            text_color=MUTED_FG,
            font=_font(13),
            command=self.destroy,
        ).pack(fill="x", padx=14, pady=(2, 18))

        ctk.CTkFrame(shell, width=1, fg_color=BORDER).pack(side="left", fill="y")

        self.content = ctk.CTkFrame(shell, fg_color=BG, corner_radius=0)
        self.content.pack(side="left", fill="both", expand=True)

        self._current: str | None = None
        self._navigate("projects", self._show_projects)

    def _toggle_theme(self) -> None:
        self._dark = not self._dark
        ctk.set_appearance_mode("dark" if self._dark else "light")
        self._theme_btn.configure(
            text="Light mode" if self._dark else "Dark mode",
            image=icon("sun" if self._dark else "moon", 18, "muted"),
        )

    def _set_active_nav(self, key: str) -> None:
        # Selected reads as a background highlight, not a colour swap.
        for name, btn in self._nav_buttons.items():
            active = name == key
            btn.configure(
                fg_color=ACCENT if active else "transparent",
                text_color=FG if active else MUTED_FG,
                font=_font(13, "bold" if active else "normal"),
                image=icon(self._nav_icons[name], 18, "strong" if active else "muted"),
            )

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
        frame = ctk.CTkFrame(self.content, fg_color="transparent")
        frame.pack(fill="both", expand=True)

        bar = ctk.CTkFrame(frame, fg_color="transparent")
        bar.pack(fill="x", padx=28, pady=(24, 16))
        ctk.CTkLabel(bar, text="Resume", font=_font(22, "bold"), text_color=FG).pack(anchor="w")
        ctk.CTkLabel(
            bar,
            text="Convert a document to markdown, then publish it.",
            font=_font(12),
            text_color=MUTED_FG,
        ).pack(anchor="w", pady=(2, 0))

        body = ctk.CTkFrame(frame, fg_color="transparent")
        body.pack(fill="both", expand=True, padx=28)

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

        cards = (
            ("sparkles", "Generate markdown",
             "Reads a PDF, DOCX or TXT and writes the markdown source.",
             "Choose a document", gen, False),
            ("upload", "Publish to Supabase",
             "Uploads a markdown file so the site serves it.",
             "Choose markdown", upload, True),
        )
        for ico, heading, blurb, label, cmd, primary in cards:
            shadow = ctk.CTkFrame(body, fg_color=SHADOW, corner_radius=RADIUS_LG)
            shadow.pack(fill="x", pady=(0, 14))
            card = ctk.CTkFrame(
                shadow, fg_color=CARD, corner_radius=RADIUS_LG, border_width=1, border_color=BORDER
            )
            card.pack(fill="x", pady=(0, 3))

            row = ctk.CTkFrame(card, fg_color="transparent")
            row.pack(fill="x", padx=20, pady=20)
            badge = ctk.CTkFrame(row, width=40, height=40, corner_radius=RADIUS, fg_color=ACCENT)
            badge.pack(side="left")
            badge.pack_propagate(False)
            ctk.CTkLabel(badge, text="", image=icon(ico, 20, "strong")).pack(expand=True)

            texts = ctk.CTkFrame(row, fg_color="transparent")
            texts.pack(side="left", padx=(14, 0), fill="x", expand=True)
            ctk.CTkLabel(texts, text=heading, font=_font(14, "bold"), text_color=FG).pack(anchor="w")
            ctk.CTkLabel(texts, text=blurb, font=_font(12), text_color=MUTED_FG).pack(anchor="w", pady=(2, 0))

            if primary:
                ctk.CTkButton(
                    row, text=label, width=156, height=38, corner_radius=RADIUS,
                    fg_color=PRIMARY, hover_color=PRIMARY_HOVER, text_color=PRIMARY_FG,
                    font=_font(13, "bold"), command=cmd,
                ).pack(side="right")
            else:
                _ghost_button(row, label, cmd, None, 156).pack(side="right")


def run_admin_gui() -> None:
    app = AdminApp()
    app.mainloop()


if __name__ == "__main__":
    run_admin_gui()
