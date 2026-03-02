# Pfolio Admin CLI

Admin login and content management. Single admin row in Supabase; password stored encrypted with a wrapper key. Session is bound to this device only.

## Setup

1. Apply the admin schema in Supabase SQL Editor:
   - `pfolio/app/app/lib/database/admin.sql`

2. Create `.env` in `app_admincli/` (or parent) with:
   - `SUPABASE_URL` – your Supabase project URL
   - `SUPABASE_KEY` – service role key (required for CRUD)

3. Install dependencies:
   ```bash
   cd pfolio/app_admincli
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

## First-time: set password

1. Run: `python main.py`
2. Choose **2. Make password**
3. Enter a **wrapper key** (min 16 characters). You need it every time you log in.
4. Enter and confirm your **admin password**
5. Copy the printed encrypted string and run in Supabase SQL Editor:
   ```sql
   INSERT INTO admin (encrypted_password) VALUES ('<paste>');
   ```
6. Choose **1. Login** and enter the same wrapper key and password.

## Device-bound session

The saved session is encrypted with a key derived from a device fingerprint (hostname + machine-id where available). If the session file is copied to another machine, it cannot be decrypted there; you must log in again on the new device.

## Usage

- **Login** – wrapper key + password. Session saved for 7 days and bound to this device.
- **Make password** – first-time setup.
- **When logged in**: Projects, Experience, Stack, Blog – each with List / Add / Update / Delete. Only an authenticated admin can use these; the CLI uses the service role key for Supabase writes.
- **Logout** – clear local session.

Run:

```bash
cd pfolio/app_admincli
python main.py
```
