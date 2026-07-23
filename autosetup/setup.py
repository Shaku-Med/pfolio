#!/usr/bin/env python3
"""Pfolio autosetup — fill missing env keys + installs (never wipe existing values)."""
from __future__ import annotations

import os
import secrets
import shutil
import subprocess
import sys
from pathlib import Path

PFOLIO = Path(__file__).resolve().parent.parent
APP = PFOLIO / "app"
ADMIN = PFOLIO / "app_admincli"
DASHBOARD = ADMIN / "server" / "dashboard"


def _ok(msg: str) -> None:
    print(f"  ✓ {msg}")


def _warn(msg: str) -> None:
    print(f"  ! {msg}")


def _ask(label: str, default: str = "") -> str:
    hint = f" [{_mask(default)}]" if default else ""
    raw = input(f"{label}{hint}: ").strip()
    if not raw and default:
        return default
    return raw


def _mask(value: str) -> str:
    if len(value) <= 8:
        return "***" if value else ""
    return f"{value[:4]}…{value[-4:]}"


def _read_env(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.is_file():
        return out
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        s = line.strip()
        if not s or s.startswith("#") or "=" not in s:
            continue
        k, _, v = s.partition("=")
        key = k.strip()
        val = v.strip()
        if key:
            out[key] = val
    return out


def _write_env_additive(path: Path, updates: dict[str, str]) -> tuple[int, int]:
    """Add or fill empty keys only. Never overwrite a non-empty existing value."""
    existing = _read_env(path)
    added = 0
    skipped = 0
    for key, value in updates.items():
        if value == "":
            continue
        cur = existing.get(key, "").strip()
        if cur:
            skipped += 1
            continue
        existing[key] = value
        added += 1
    if added == 0 and path.is_file():
        _ok(f"{path.relative_to(PFOLIO)} — already complete ({skipped} kept)")
        return added, skipped
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(f"{k}={v}" for k, v in existing.items()) + "\n", encoding="utf-8")
    _ok(f"{path.relative_to(PFOLIO)} — added {added}, kept {skipped}")
    return added, skipped


def _run(cmd: list[str], cwd: Path) -> bool:
    print(f"  → {' '.join(cmd)}  ({cwd.name})")
    try:
        r = subprocess.run(cmd, cwd=str(cwd), check=False)
        return r.returncode == 0
    except FileNotFoundError:
        _warn(f"command not found: {cmd[0]}")
        return False


def _which(*names: str) -> str | None:
    for n in names:
        p = shutil.which(n)
        if p:
            return p
    return None


def check_tools() -> None:
    print("\nTools")
    node = _which("node")
    npm = _which("npm.cmd", "npm")
    py = _which("py", "python3", "python")
    ffmpeg = _which("ffmpeg")
    if node:
        _ok(f"node: {node}")
    else:
        _warn("node missing (need Node 20+)")
    if npm:
        _ok(f"npm: {npm}")
    else:
        _warn("npm missing")
    if py:
        _ok(f"python: {py}")
    else:
        _warn("python missing (need 3.11+)")
    if ffmpeg:
        _ok(f"ffmpeg: {ffmpeg}")
    else:
        _warn("ffmpeg missing (image uploads need it)")


def _pick(sources: list[dict[str, str]], *keys: str) -> str:
    for src in sources:
        for key in keys:
            val = (src.get(key) or "").strip()
            if val:
                return val
    return ""


def scan_existing() -> dict[str, dict[str, str]]:
    return {
        "app": _read_env(APP / ".env"),
        "admin": _read_env(ADMIN / ".env"),
        "dashboard": _read_env(DASHBOARD / ".env.local"),
    }


def report_gaps(existing: dict[str, dict[str, str]]) -> dict[str, list[str]]:
    needed = {
        "app": [
            "SUPABASE_URL",
            "SUPABASE_ANON_KEY",
            "GITHUB_OWNER",
            "GITHUB_REPO",
            "SITE_URL",
            "SMTP_HOST",
            "SMTP_PORT",
            "SMTP_USER",
            "SMTP_PASS",
            "SMTP_FROM",
            "CONTACT_TO_EMAIL",
        ],
        "admin": [
            "SUPABASE_URL",
            "SUPABASE_KEY",
            "GITHUB_OWNER",
            "GITHUB_REPO",
            "GITHUB_TOKEN",
        ],
        "dashboard": [
            "SUPABASE_URL",
            "SUPABASE_KEY",
            "DASHBOARD_SESSION_SECRET",
            "NEXT_PUBLIC_SITE_URL",
        ],
    }
    gaps: dict[str, list[str]] = {}
    print("\nExisting env files")
    for name, keys in needed.items():
        path = {"app": APP / ".env", "admin": ADMIN / ".env", "dashboard": DASHBOARD / ".env.local"}[name]
        present = existing[name]
        missing = [k for k in keys if not (present.get(k) or "").strip()]
        # app may use SUPABASE_KEY instead of SUPABASE_ANON_KEY
        if name == "app" and "SUPABASE_ANON_KEY" in missing and (present.get("SUPABASE_KEY") or "").strip():
            missing = [k for k in missing if k != "SUPABASE_ANON_KEY"]
        gaps[name] = missing
        if path.is_file():
            filled = len(keys) - len(missing)
            _ok(f"{path.relative_to(PFOLIO)} — {filled}/{len(keys)} required keys set")
        else:
            _warn(f"{path.relative_to(PFOLIO)} — missing file ({len(missing)} keys needed)")
        if missing:
            print(f"      need: {', '.join(missing)}")
    return gaps


def collect_missing(existing: dict[str, dict[str, str]], gaps: dict[str, list[str]]) -> dict[str, str]:
    all_missing = sorted({k for keys in gaps.values() for k in keys})
    if not all_missing:
        print("\nAll required env keys are already set. Nothing to ask.")
        return {}

    print("\nFill only what's missing (Enter keeps suggested default / blank skips)")
    app, admin, dash = existing["app"], existing["admin"], existing["dashboard"]
    sources = [app, admin, dash]

    prompts: list[tuple[str, str, str]] = [
        ("SUPABASE_URL", "SUPABASE_URL", _pick(sources, "SUPABASE_URL")),
        ("SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY (public site)", _pick([app], "SUPABASE_ANON_KEY", "SUPABASE_KEY")),
        ("SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_KEY (admin)", _pick([admin, dash], "SUPABASE_KEY")),
        ("GITHUB_OWNER", "GITHUB_OWNER", _pick(sources, "GITHUB_OWNER")),
        ("GITHUB_REPO", "GITHUB_REPO", _pick(sources, "GITHUB_REPO")),
        ("GITHUB_TOKEN", "GITHUB_TOKEN", _pick([admin], "GITHUB_TOKEN")),
        ("SITE_URL", "SITE_URL", _pick([app, dash], "SITE_URL", "NEXT_PUBLIC_SITE_URL") or "http://localhost:3000"),
        ("SMTP_HOST", "SMTP_HOST", _pick([app], "SMTP_HOST")),
        ("SMTP_PORT", "SMTP_PORT", _pick([app], "SMTP_PORT") or "587"),
        ("SMTP_SECURE", "SMTP_SECURE", _pick([app], "SMTP_SECURE") or "false"),
        ("SMTP_USER", "SMTP_USER", _pick([app], "SMTP_USER")),
        ("SMTP_PASS", "SMTP_PASS", _pick([app], "SMTP_PASS")),
        ("SMTP_FROM", "SMTP_FROM", _pick([app], "SMTP_FROM")),
        ("CONTACT_TO_EMAIL", "CONTACT_TO_EMAIL", _pick([app], "CONTACT_TO_EMAIL")),
    ]

    need_set = set(all_missing)
    # map logical prompts to gap keys
    ask_for = set()
    if "SUPABASE_URL" in need_set:
        ask_for.add("SUPABASE_URL")
    if "SUPABASE_ANON_KEY" in need_set or (
        "SUPABASE_KEY" in gaps.get("app", []) and not _pick([app], "SUPABASE_ANON_KEY", "SUPABASE_KEY")
    ):
        ask_for.add("SUPABASE_ANON_KEY")
    if "SUPABASE_KEY" in gaps.get("admin", []) or "SUPABASE_KEY" in gaps.get("dashboard", []):
        ask_for.add("SUPABASE_SERVICE_KEY")
    for k in ("GITHUB_OWNER", "GITHUB_REPO", "GITHUB_TOKEN", "SITE_URL", "SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "CONTACT_TO_EMAIL"):
        if k in need_set or (k == "SITE_URL" and "NEXT_PUBLIC_SITE_URL" in need_set):
            ask_for.add(k)

    data: dict[str, str] = {}
    for key, label, default in prompts:
        if key not in ask_for and not (key == "SUPABASE_SERVICE_KEY" and "SUPABASE_SERVICE_KEY" in ask_for):
            if key in ask_for:
                pass
            else:
                continue
        if key not in ask_for:
            continue
        data[key] = _ask(label, default)

    if "DASHBOARD_SESSION_SECRET" in gaps.get("dashboard", []):
        data["DASHBOARD_SESSION_SECRET"] = secrets.token_urlsafe(48)
        _ok("generated DASHBOARD_SESSION_SECRET")

    site = data.get("SITE_URL") or _pick(sources, "SITE_URL", "NEXT_PUBLIC_SITE_URL") or "http://localhost:3000"
    data["SITE_URL"] = data.get("SITE_URL") or site
    data["NEXT_PUBLIC_SITE_URL"] = site
    return data


def write_envs(data: dict[str, str], existing: dict[str, dict[str, str]]) -> None:
    print("\nUpdating env files (additive only)")
    anon = data.get("SUPABASE_ANON_KEY") or _pick([existing["app"]], "SUPABASE_ANON_KEY", "SUPABASE_KEY")
    service = data.get("SUPABASE_SERVICE_KEY") or _pick([existing["admin"], existing["dashboard"]], "SUPABASE_KEY")
    url = data.get("SUPABASE_URL") or _pick([existing["app"], existing["admin"], existing["dashboard"]], "SUPABASE_URL")
    site = data.get("SITE_URL") or data.get("NEXT_PUBLIC_SITE_URL") or "http://localhost:3000"

    _write_env_additive(
        APP / ".env",
        {
            "SUPABASE_URL": url,
            "SUPABASE_ANON_KEY": anon,
            "SUPABASE_KEY": anon,
            "GITHUB_OWNER": data.get("GITHUB_OWNER", ""),
            "GITHUB_REPO": data.get("GITHUB_REPO", ""),
            "SITE_URL": site,
            "SMTP_HOST": data.get("SMTP_HOST", ""),
            "SMTP_PORT": data.get("SMTP_PORT", ""),
            "SMTP_SECURE": data.get("SMTP_SECURE", ""),
            "SMTP_USER": data.get("SMTP_USER", ""),
            "SMTP_PASS": data.get("SMTP_PASS", ""),
            "SMTP_FROM": data.get("SMTP_FROM", ""),
            "CONTACT_TO_EMAIL": data.get("CONTACT_TO_EMAIL", ""),
        },
    )
    _write_env_additive(
        ADMIN / ".env",
        {
            "SUPABASE_URL": url,
            "SUPABASE_KEY": service,
            "GITHUB_OWNER": data.get("GITHUB_OWNER", ""),
            "GITHUB_REPO": data.get("GITHUB_REPO", ""),
            "GITHUB_TOKEN": data.get("GITHUB_TOKEN", ""),
        },
    )
    secret = data.get("DASHBOARD_SESSION_SECRET") or ""
    _write_env_additive(
        DASHBOARD / ".env.local",
        {
            "SUPABASE_URL": url,
            "SUPABASE_KEY": service,
            "DASHBOARD_SESSION_SECRET": secret,
            "NEXT_PUBLIC_SITE_URL": site,
        },
    )


def install_node() -> None:
    print("\nNode installs")
    npm = _which("npm.cmd", "npm")
    if not npm:
        _warn("skip npm — not on PATH")
        return
    if (PFOLIO / "node_modules").is_dir() and (APP / "node_modules").is_dir():
        _ok("portfolio node_modules already present")
    elif not _run([npm, "install"], PFOLIO):
        _warn("root npm install failed")
    else:
        _ok("portfolio workspace deps")

    if (DASHBOARD / "node_modules").is_dir():
        _ok("dashboard node_modules already present")
    elif not _run([npm, "install"], DASHBOARD):
        _warn("dashboard npm install failed")
    else:
        _ok("dashboard deps")


def install_python() -> None:
    print("\nPython install")
    venv = ADMIN / "venv"
    if os.name == "nt":
        py = _which("py")
        create = [py, "-3", "-m", "venv", str(venv)] if py else [sys.executable, "-m", "venv", str(venv)]
        pip = venv / "Scripts" / "pip.exe"
        python = venv / "Scripts" / "python.exe"
    else:
        create = [sys.executable, "-m", "venv", str(venv)]
        pip = venv / "bin" / "pip"
        python = venv / "bin" / "python"

    if not venv.is_dir():
        if not _run(create, ADMIN):
            _warn("venv create failed")
            return
        _ok("venv created")
    else:
        _ok("venv already exists")

    req = ADMIN / "requirements.txt"
    if pip.is_file() and req.is_file():
        if _run([str(pip), "install", "-r", str(req)], ADMIN):
            _ok("admincli requirements")
        else:
            _warn("pip install failed")
    else:
        _warn("pip or requirements.txt missing")

    print("\n  Activate later with:")
    if os.name == "nt":
        print(f"    {venv / 'Scripts' / 'activate'}")
    else:
        print(f"    source {venv / 'bin' / 'activate'}")
    print(f"  Or run: {python} main.py  (from app_admincli)")


def main() -> None:
    print("Pfolio autosetup")
    print(f"Root: {PFOLIO}\n")
    if not (PFOLIO / "package.json").is_file() or not ADMIN.is_dir():
        print("This script must live under pfolio/autosetup/")
        sys.exit(1)

    check_tools()
    existing = scan_existing()
    gaps = report_gaps(existing)
    data = collect_missing(existing, gaps)
    write_envs(data, existing)
    install_node()
    install_python()

    print("\nDone. Existing non-empty env values were left untouched.")
    print("Next:")
    print("  1. Apply SQL in Supabase from app/app/lib/database/schema/")
    print("  2. cd app_admincli && python main.py  → Make password")
    print("  3. npm run dev   (site :3000)")
    print("  4. python main.py → Open dashboard or CLI")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nCancelled.")
        sys.exit(130)
