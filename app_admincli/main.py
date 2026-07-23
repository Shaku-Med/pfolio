#!/usr/bin/env python3
import getpass
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import bcrypt

from auth import get_admin_row, verify_credentials
from supabase_client import client
from security import encrypt, decrypt
from device import get_device_fingerprint
from crud import (
    projects_list,
    projects_add,
    projects_update,
    projects_delete,
    get_projects_list,
    experience_list,
    experience_add,
    experience_update,
    experience_delete,
    get_experience_list,
    stack_list,
    stack_add,
    stack_update,
    stack_delete,
    get_stack_list,
    blog_list,
    blog_add,
    blog_update,
    blog_delete,
    get_blog_list,
    gallery_list,
    gallery_add,
    gallery_update,
    gallery_delete,
    get_gallery_list,
    move_item,
    resume_set_from_markdown_file,
    resume_set_from_tex_file,
    SELECTED_TABLES,
    SELECTED_TABLE_LABELS,
    selected_list,
    selected_add,
    selected_remove,
    selected_move,
    get_available_for_selected,
)
from resume import create_resume
from server import DASHBOARD_PORT, choose_dashboard_mode, run_dashboard


def choose_cli_surface() -> str | None:
    print("\nHow do you want to work?\n")
    print("1. GUI (window — default)")
    print("2. Terminal CLI (stick to the pain)")
    print("3. Cancel")
    while True:
        choice = input("\nChoice (1/2/3, Enter = 1): ").strip()
        if choice == "" or choice == "1":
            return "gui"
        if choice == "2":
            return "cli"
        if choice == "3":
            return None
        print("Enter 1, 2, 3, or press Enter for GUI.")

SESSION_EXPIRES_DAYS = 7


def _session_dir() -> Path:
    return Path(__file__).resolve().parent


def _session_path() -> Path:
    return _session_dir() / ".admin_session"


def _key_path() -> Path:
    return _session_dir() / ".pfolio_session_key"


def _get_or_create_session_key() -> str:
    p = _key_path()
    if p.exists():
        return p.read_text().strip()
    key = os.urandom(32).hex()
    p.write_text(key)
    try:
        p.chmod(0o600)
    except Exception:
        pass
    return key


def _session_encryption_key() -> str:
    return _get_or_create_session_key() + get_device_fingerprint()


def save_session(wrapper: str, password: str) -> None:
    key = _session_encryption_key()
    payload = json.dumps({"wrapper": wrapper, "password": password})
    encrypted_payload = encrypt(payload, key)
    expires = (
        (datetime.now(timezone.utc) + timedelta(days=SESSION_EXPIRES_DAYS))
        .isoformat()
        .replace("+00:00", "Z")
    )
    _session_path().write_text(
        json.dumps({"encrypted": encrypted_payload, "expires_at": expires})
    )
    try:
        _session_path().chmod(0o600)
    except Exception:
        pass


def load_session() -> tuple[str, str] | None:
    p = _session_path()
    if not p.exists():
        return None
    try:
        data = json.loads(p.read_text())
        expires = data.get("expires_at")
        if expires and datetime.fromisoformat(
            expires.replace("Z", "+00:00")
        ) < datetime.now(timezone.utc):
            return None
        key = _session_encryption_key()
        payload = json.loads(decrypt(data["encrypted"], key))
        return (payload["wrapper"], payload["password"])
    except Exception:
        try:
            p.unlink()
        except Exception:
            pass
        return None


def clear_session() -> None:
    p = _session_path()
    if p.exists():
        try:
            p.unlink()
        except Exception:
            pass


def make_password() -> None:
    print("\n--- Set admin password ---")
    print("The wrapper key encrypts your password in the database.")
    print("It must be at least 16 characters. You need it to log in.\n")
    wrapper = getpass.getpass("Enter wrapper key (min 16 chars): ").strip()
    if len(wrapper) < 16:
        print("Error: Wrapper key must be at least 16 characters.")
        return
    password = getpass.getpass("Enter your admin password: ").strip()
    if not password:
        print("Error: Password cannot be empty.")
        return
    password_again = getpass.getpass("Confirm admin password: ").strip()
    if password != password_again:
        print("Error: Passwords do not match.")
        return
    hashed = bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt(rounds=10)
    ).decode("utf-8")
    try:
        encrypted_hashed = encrypt(hashed, wrapper)
    except Exception as e:
        print(f"Error: {e}")
        return
    print("\n" + "=" * 60)
    print("Copy the encrypted value below and insert it in Supabase.")
    print("Run in Supabase SQL Editor:")
    print("  INSERT INTO admin (encrypted_password) VALUES ('<paste below>');")
    print("=" * 60)
    print(encrypted_hashed)
    print("=" * 60)
    print("\nThen choose 'Login' and sign in with your wrapper key and password.\n")


def login() -> bool:
    row = get_admin_row()
    if not row:
        print(
            "No admin account found. Choose 'Make password' first and insert the encrypted value into the database."
        )
        return False
    print("\n--- Admin login ---")
    wrapper = getpass.getpass("Wrapper key: ").strip()
    password = getpass.getpass("Password: ").strip()
    if not verify_credentials(wrapper, password):
        print("Login failed: wrong wrapper key or password.")
        return False
    print("Logged in.\n")
    save_session(wrapper, password)
    return True


def main_menu() -> None:
    while True:
        print("1. Login")
        print("2. Make password (first-time setup)")
        print("3. Exit")
        choice = input("\nChoice: ").strip()
        if choice == "2":
            make_password()
        elif choice == "1":
            if login():
                logged_in_menu()
        elif choice == "3":
            print("Bye.")
            sys.exit(0)
        else:
            print("Invalid choice.")


def _entity_menu(name: str, table: str, list_fn, get_list_fn, add_fn, update_fn, delete_fn) -> None:
    while True:
        print(f"\n--- {name} ---")
        print("1. List")
        print("2. Add")
        print("3. Update")
        print("4. Delete")
        print("5. Reorder (move up/down)")
        print("6. Back")
        choice = input("\nChoice: ").strip()
        if choice == "1":
            list_fn()
        elif choice == "2":
            add_fn()
        elif choice == "3":
            update_fn()
        elif choice == "4":
            delete_fn()
        elif choice == "5":
            rows = list_fn()
            if not rows:
                continue
            idx = input("Id to move: ").strip()
            if not idx:
                continue
            way = input("Direction (u=up / d=down): ").strip().lower()
            direction = -1 if way in ("u", "up") else 1 if way in ("d", "down") else 0
            if direction == 0:
                print("Enter u or d.")
                continue
            if move_item(table, idx, direction, get_list_fn):
                print("Moved.")
                list_fn()
            else:
                print("Could not move that.")
        elif choice == "6":
            return
        else:
            print("Invalid choice.")


def resume_menu() -> None:
    while True:
        print("\n--- Resume ---")
        print("1. Generate markdown from source file (PDF/DOCX/TXT)")
        print("2. Upload edited markdown file to Supabase")
        print("3. Upload LaTeX source (.tex) to Supabase")
        print("4. Back")
        choice = input("\nChoice: ").strip()
        if choice == "1":
            create_resume()
        elif choice == "2":
            resume_set_from_markdown_file()
        elif choice == "3":
            resume_set_from_tex_file()
        elif choice == "4":
            return
        else:
            print("Invalid choice.")


def selected_menu() -> None:
    tables = list(SELECTED_TABLES)
    while True:
        print("\n--- Selected (home teasers) ---")
        for i, key in enumerate(tables, start=1):
            print(f"{i}. {SELECTED_TABLE_LABELS[key]}")
        print(f"{len(tables) + 1}. Back")
        choice = input("\nChoice: ").strip()
        if choice == str(len(tables) + 1):
            return
        if not choice.isdigit() or not (1 <= int(choice) <= len(tables)):
            print("Invalid choice.")
            continue
        table = tables[int(choice) - 1]
        _selected_table_menu(table)


def _selected_table_menu(table: str) -> None:
    label = SELECTED_TABLE_LABELS.get(table, table)
    while True:
        print(f"\n--- Selected · {label} ---")
        print("1. List selected")
        print("2. Add")
        print("3. Remove")
        print("4. Reorder (move up/down)")
        print("5. List available (not selected)")
        print("6. Back")
        choice = input("\nChoice: ").strip()
        if choice == "1":
            selected_list(table)
        elif choice == "2":
            avail = get_available_for_selected(table)
            if not avail:
                print("Nothing left to add.")
                continue
            print("Available:")
            for row in avail:
                print(f"  {row['item_id']}: {row['label']}")
            selected_add(table)
        elif choice == "3":
            rows = selected_list(table)
            if not rows:
                continue
            selected_remove(table)
        elif choice == "4":
            rows = selected_list(table)
            if not rows:
                continue
            idx = input("Id to move: ").strip()
            if not idx:
                continue
            way = input("Direction (u=up / d=down): ").strip().lower()
            direction = -1 if way in ("u", "up") else 1 if way in ("d", "down") else 0
            if direction == 0:
                print("Enter u or d.")
                continue
            if selected_move(table, idx, direction):
                print("Moved.")
                selected_list(table)
            else:
                print("Could not move that.")
        elif choice == "5":
            avail = get_available_for_selected(table)
            if not avail:
                print("Nothing available — everything is already selected.")
            else:
                for row in avail:
                    print(f"  {row['item_id']}: {row['label']}")
        elif choice == "6":
            return
        else:
            print("Invalid choice.")


def logged_in_menu() -> None:
    while True:
        print("\n--- Admin ---")
        print("1. Selected (home teasers)")
        print("2. Projects")
        print("3. Experience")
        print("4. Stack")
        print("5. Gallery")
        print("6. Blog")
        print("7. Resume")
        print("8. Logout")
        choice = input("\nChoice: ").strip()
        if choice == "1":
            selected_menu()
        elif choice == "2":
            _entity_menu(
                "Projects", "projects", projects_list, get_projects_list, projects_add, projects_update, projects_delete
            )
        elif choice == "3":
            _entity_menu(
                "Experience",
                "experience",
                experience_list,
                get_experience_list,
                experience_add,
                experience_update,
                experience_delete,
            )
        elif choice == "4":
            _entity_menu("Stack", "stack", stack_list, get_stack_list, stack_add, stack_update, stack_delete)
        elif choice == "5":
            _entity_menu(
                "Gallery", "gallery", gallery_list, get_gallery_list, gallery_add, gallery_update, gallery_delete
            )
        elif choice == "6":
            _entity_menu("Blog", "blog_posts", blog_list, get_blog_list, blog_add, blog_update, blog_delete)
        elif choice == "7":
            resume_menu()
        elif choice == "8":
            clear_session()
            print("Logged out.\n")
            return
        else:
            print("Invalid choice.")


def _choose_mode() -> str:
    print("Pfolio Admin\n")
    print(f"1. Open the dashboard (http://localhost:{DASHBOARD_PORT})")
    print("2. Use CLI")
    print("3. Exit")
    while True:
        choice = input("\nChoice (1/2/3): ").strip()
        if choice in ("1", "2", "3"):
            return choice
        print("Enter 1, 2, or 3.")


if __name__ == "__main__":
    while True:
        session = load_session()
        if session and get_admin_row() and verify_credentials(session[0], session[1]):
            print("Logged in (session restored).\n")
        else:
            while True:
                print("Pfolio Admin\n")
                print("1. Login")
                print("2. Make password (first-time setup)")
                print("3. Exit")
                choice = input("\nChoice: ").strip()
                if choice == "3":
                    print("Bye.")
                    sys.exit(0)
                if choice == "2":
                    make_password()
                    continue
                if choice == "1":
                    if login():
                        break
                    continue
                print("Invalid choice.")

        mode = _choose_mode()
        if mode == "3":
            print("Bye.")
            sys.exit(0)
        if mode == "1":
            try:
                dash_mode = choose_dashboard_mode()
                if dash_mode is None:
                    print("Cancelled.\n")
                    continue
                run_dashboard(dash_mode)
            except KeyboardInterrupt:
                print("\nDashboard stopped.")
            sys.exit(0)
        surface = choose_cli_surface()
        if surface is None:
            print("Cancelled.\n")
            continue
        if surface == "gui":
            # Imported lazily so the terminal CLI keeps working on a machine
            # that never installed the GUI extras.
            try:
                from admin_gui import run_admin_gui
            except ImportError as e:
                print(f"\nGUI unavailable ({e}).")
                print("Install the desktop extras with: pip install -r requirements.txt\n")
                continue

            run_admin_gui()
            continue
        logged_in_menu()
