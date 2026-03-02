import os
from pathlib import Path

from dotenv import load_dotenv

base = Path(__file__).resolve().parent
load_dotenv(base / ".env")
load_dotenv(base.parent / ".env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
if not url or not key:
    raise RuntimeError(
        "Set SUPABASE_URL and SUPABASE_KEY in .env (in app_admincli/ or pfolio/app/.env)"
    )

from supabase import create_client

client = create_client(url, key)
