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
    experience_list,
    experience_add,
    experience_update,
    experience_delete,
    stack_list,
    stack_add,
    stack_update,
    stack_delete,
    blog_list,
    blog_add,
    blog_update,
    blog_delete,
    gallery_list,
    gallery_add,
    gallery_update,
    gallery_delete,
    resume_set_from_markdown_file,
)
from resume import create_resume
from server import run_server

SESSION_EXPIRES_DAYS = 7
ADMIN_SERVER_PORT = 3001


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


def _entity_menu(name: str, list_fn, add_fn, update_fn, delete_fn) -> None:
    while True:
        print(f"\n--- {name} ---")
        print("1. List")
        print("2. Add")
        print("3. Update")
        print("4. Delete")
        print("5. Back")
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
            return
        else:
            print("Invalid choice.")


def resume_menu() -> None:
    while True:
        print("\n--- Resume ---")
        print("1. Generate markdown from source file (PDF/DOCX/TXT)")
        print("2. Upload edited markdown file to Supabase")
        print("3. Back")
        choice = input("\nChoice: ").strip()
        if choice == "1":
            create_resume()
        elif choice == "2":
            resume_set_from_markdown_file()
        elif choice == "3":
            return
        else:
            print("Invalid choice.")


def logged_in_menu() -> None:
    while True:
        print("\n--- Admin ---")
        print("1. Projects")
        print("2. Experience")
        print("3. Stack")
        print("4. Gallery")
        print("5. Blog")
        print("6. Resume")
        print("7. Logout")
        choice = input("\nChoice: ").strip()
        if choice == "1":
            _entity_menu("Projects", projects_list, projects_add, projects_update, projects_delete)
        elif choice == "2":
            _entity_menu("Experience", experience_list, experience_add, experience_update, experience_delete)
        elif choice == "3":
            _entity_menu("Stack", stack_list, stack_add, stack_update, stack_delete)
        elif choice == "4":
            _entity_menu("Gallery", gallery_list, gallery_add, gallery_update, gallery_delete)
        elif choice == "5":
            _entity_menu("Blog", blog_list, blog_add, blog_update, blog_delete)
        elif choice == "6":
            resume_menu()
        elif choice == "7":
            clear_session()
            print("Logged out.\n")
            return
        else:
            print("Invalid choice.")


def _choose_mode() -> str:
    print("Pfolio Admin\n")
    print("1. Start server (http://localhost:3001)")
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
                run_server(ADMIN_SERVER_PORT)
            except KeyboardInterrupt:
                print("\nServer stopped.")
            sys.exit(0)
        logged_in_menu()
