import bcrypt

from supabase_client import client
from security import decrypt


def get_admin_row():
    r = client.table("admin").select("id, encrypted_password").limit(1).execute()
    if not r.data or len(r.data) == 0:
        return None
    return r.data[0]


def verify_credentials(wrapper: str, password: str) -> bool:
    row = get_admin_row()
    if not row:
        return False
    try:
        decrypted_hash = decrypt(row["encrypted_password"], wrapper)
    except Exception:
        return False
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"), decrypted_hash.encode("utf-8")
        )
    except Exception:
        return False
