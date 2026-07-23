# Pfolio Admin CLI

Admin login and content management. Single admin row in Supabase; password stored encrypted with a wrapper key. Session is bound to this device only.

## Setup

1. Apply the admin schema in Supabase SQL Editor:
   - `pfolio/app/app/lib/database/admin.sql`

2. Create `.env` in `app_admincli/` (or parent) with:
   - `SUPABASE_URL` – your Supabase project URL
   - `SUPABASE_KEY` – service role key (required for CRUD)
   - `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_TOKEN` – needed for image uploads
   Copy `.env.example` if you want a blank template.

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
- **When logged in**: Projects, Experience, Stack, Gallery, Blog – each with List / Add / Update / Delete. Only an authenticated admin can use these; the CLI uses the service role key for Supabase writes.
- **Logout** – clear local session.

Run:

```bash
cd pfolio/app_admincli
python main.py
```

## Dashboard

Choosing **1. Open the dashboard** asks how to run it:

1. **Dev** (default, hot reload) — no production build
2. **Production** — builds, then starts
3. **Cancel**

Empty input picks Dev. The dashboard is the Next.js app at http://localhost:3002.

It lives in `server/dashboard/` and needs its own `.env.local`. Copy
`server/dashboard/.env.example` and fill it in.

Image uploads from the dashboard call the same Python helpers the CLI uses
(`server/upload_action.py`) — there is no separate upload HTTP server. Set
`GITHUB_*` in `app_admincli/.env`.

Sign in with the same wrapper key and password as the CLI.

Editing only writes back the fields you actually change, so touching one field
never rewrites the rest of the row. The CLI update prompts behave the same way
and show the current value in brackets.

Replacing a stored image overwrites the existing GitHub file at the same path
(so existing links keep working). Replacing an `http(s)` URL uploads a new
endpoint. Deleting a record clears its uploaded files first.
