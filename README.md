# Build your own portfolio from this repo

This is a full portfolio setup: a public site, a database, an admin dashboard,
and a command line tool. Everything here runs on free tiers. Nothing in this
guide costs money.

Follow the sections in order. If you only want the site running locally, stop
after step 6.

---

## What you get

**The site** at `app/`. React Router 7 in framework mode with server rendering,
Tailwind 4, and shadcn components. It shows projects, experience, stack,
gallery, blog, a resume page, search, and a contact form. Fourteen colour
themes, light and dark.

**The admin** at `app_admincli/`. A Python tool with two ways in: a Next.js
dashboard in your browser, or a plain command line menu. Both edit the same
database. Both are locked behind one password.

**The database** is Supabase Postgres. Row level security is on, and the public
site can only read.

**Images** live in a GitHub repo you own. The site proxies them so the repo
stays private if you want it to.

### How the pieces talk

```
Browser  ->  Portfolio site (port 3000)  ->  Supabase (read only)
                     |
                     +-> /api/load/image/*  ->  your image repo on GitHub

Browser  ->  Admin dashboard (port 3002)  ->  Supabase (read and write)
                     |
                     +-> Upload service (port 3001, Python)  ->  GitHub
```

Only the dashboard and the CLI can write. The public site never can.

---

## 1. What you need first

| Thing | Why | Cost |
| --- | --- | --- |
| Node 20 or newer | Runs the site and the dashboard | free |
| Python 3.11 or newer | Runs the admin tool | free |
| A Supabase project | Database | free tier |
| A GitHub account | Code, image hosting, deploys | free |
| ffmpeg on your PATH | Compresses images before upload | free |
| An SMTP mailbox | Contact form delivery | free with most providers |

Check what you have:

```bash
node --version && npm --version && python --version && ffmpeg -version
```

If ffmpeg is missing, image uploads will fail with a clear error. Everything
else keeps working. You can add it later.

---

## 2. Clone and install

```bash
git clone https://github.com/Shaku-Med/pfolio.git my-portfolio
```

The repo root is an npm workspace. Installing from the root covers the site.

```bash
cd my-portfolio && npm install
```

Then the admin tool:

```bash
cd app_admincli && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt
```

On macOS or Linux the activate line is `source venv/bin/activate` instead.

The dashboard installs itself the first time you launch it, so skip it for now.

---

## 3. Set up Supabase

Create a project at supabase.com. Free tier is fine.

Open the SQL Editor and run these files from
`app/app/lib/database/schema/`, in this order. Paste the contents of each and
run it.

1. `schemas.sql` creates every content table and turns on row level security
2. `admin.sql` creates the single admin account table
3. Then each remaining `.sql` file in that folder. They are the database
   functions the site calls for lists, search, and detail pages. Run
   `zz_position_order.sql` last — it adds a stable `position` column used for
   drag-and-drop ordering in the admin dashboard.

From Project Settings, then API, copy three values. You will need all of them.

- the Project URL
- the `anon` public key
- the `service_role` secret key

**These two keys are very different.** The anon key respects row level
security, so it can only read what the policies allow. The service role key
ignores every policy and can do anything. The public site gets the anon key.
The admin tool gets the service role key. Never mix them up, and never put the
service role key anywhere a browser can reach.

### Lock down the admin table

`admin.sql` ships with a permissive policy so that first setup works. Once you
have logged in successfully, tighten it. The admin tool uses the service role
key, which bypasses policies anyway, so it keeps working:

```sql
drop policy if exists "admin full access" on public.admin;
revoke all on public.admin from anon, authenticated;
```

Without this, anything holding your anon key can read your encrypted password
row. It is encrypted and then hashed, so it is not directly usable, but there
is no reason to hand it out.

---

## 4. Set up the image repo

Create a second GitHub repo. This is where uploaded images go. It can be
private. Call it whatever you like.

Then make a personal access token: GitHub Settings, Developer settings,
Personal access tokens, Fine grained tokens. Give it access to only that one
repo, with **Contents: Read and write**. Nothing else. Copy the token now
because GitHub shows it once.

Images are stored as `/MM_DD_YYYY/<record id>/<random>.png`. The site reads
them back through its own proxy, so visitors never hit GitHub directly and the
repo can stay private.

---

## 5. Environment files

Three files, none of them committed. All three are already in `.gitignore`.

### `app/.env` for the public site

```
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=your-anon-key

GITHUB_OWNER=your-github-username
GITHUB_REPO=your-image-repo

SITE_URL=http://localhost:3000

SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@example.com
SMTP_PASS=your-app-password
SMTP_FROM=you@example.com
CONTACT_TO_EMAIL=you@example.com
```

Set `SITE_URL` to your real domain in production. It drives canonical URLs and
social preview images, so a wrong value here quietly hurts your search results.

Use `SUPABASE_ANON_KEY`, not the service role key. The site falls back to
`SUPABASE_KEY` if the anon key is absent, which is convenient and also a very
easy way to accidentally run your public site with god mode credentials. Set
the anon key explicitly.

For SMTP, use an app password, never your real mailbox password. Gmail calls
these App Passwords and requires two factor authentication first.

### `app_admincli/.env` for the admin tool

```
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_KEY=your-service-role-key

GITHUB_OWNER=your-github-username
GITHUB_REPO=your-image-repo
GITHUB_TOKEN=your-fine-grained-token

ADMIN_UPLOAD_TOKEN=
```

This one gets the **service role** key, because it writes.

Generate the upload token and paste it in:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### `app_admincli/server/dashboard/.env.local` for the dashboard

Copy `.env.example` next to it and fill it in:

```
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_KEY=your-service-role-key
DASHBOARD_SESSION_SECRET=
ADMIN_UPLOAD_TOKEN=
UPLOAD_SERVICE_URL=http://127.0.0.1:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`ADMIN_UPLOAD_TOKEN` must be character for character the same as the one in
`app_admincli/.env`. That shared value is how the dashboard proves it is
allowed to talk to the upload service.

Generate the session secret separately. It must be at least 32 characters:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Every one of these is checked at startup and fails loudly if missing. Nothing
falls back to a default silently.

---

## 6. Create your admin password

```bash
cd app_admincli && python main.py
```

Choose **2. Make password**.

You will be asked for two things. The **wrapper key** is at least 16 characters
and encrypts your password before it ever reaches the database. The **password**
is what you type to log in. You need both every time. Neither is recoverable, so
put them in a password manager now.

The tool prints an encrypted string. Copy it and run this in the Supabase SQL
Editor:

```sql
INSERT INTO admin (encrypted_password) VALUES ('<paste it here>');
```

Only one admin row is allowed. A database trigger blocks a second one.

Now choose **1. Login** and sign in to confirm it worked.

Your login is then remembered for 7 days, encrypted against a fingerprint of
this machine. Copying the session file to another computer will not work there.

---

## 7. Run it

The site, from the repo root:

```bash
npm run dev
```

That serves the portfolio at http://localhost:3000.

The admin, in a second terminal:

```bash
cd app_admincli && python main.py
```

Pick **1** for the dashboard at http://localhost:3002, or **2** for the command
line menu. The first dashboard launch installs packages and builds, so give it
a minute. After that it starts immediately.

Starting the dashboard also starts the upload service on 127.0.0.1:3001. Both
bind to localhost only and are not reachable from your network.

Sign in with the same wrapper key and password.

### Adding content

Fill in Projects, Experience, Stack, Gallery, and Blog from either interface.
The site reads them straight away.

Two things worth knowing about editing. Saving only writes the fields you
actually changed, so nothing else on the row is touched, and every edited field
is marked before you save. To attach an image, save the item first, then open
it again and pick a file. Replacing an image later overwrites the same file on
GitHub, so links already shared keep working, and deleting an item removes its
images too.

---

## 8. Make it yours

| What | Where |
| --- | --- |
| Name, description, keywords, social image | `app/app/lib/seo/constants.ts` |
| Colour themes | `app/app/lib/styles/themes/` |
| Icons and favicons | `app/public/` |
| Resume PDF and LaTeX source | `app/public/resumes/` |
| Footer links and nav | `app/app/components/Footer.tsx` and `Nav.tsx` |
| Home page sections | `app/app/routes/home/sections/` |
| Dashboard fields | `app_admincli/server/dashboard/src/lib/resources.ts` |

That last one is worth a note. Every dashboard table, form field, and validation
rule comes from that single file. Add an entry there and the list, the form, and
the save logic all follow. You do not touch the components.

Check before committing that no `.env` file is staged, the resume PDF is yours,
and any private notes in `resume.tex` are gone. The source is shown publicly on
the resume page, comments included.

---

## 9. Deploy

Production is **Docker on EC2**, same pattern as Memories, but a separate
image, compose project, and loopback port so both sites share one box safely.

| Site | Container | Host bind | Nginx → |
| --- | --- | --- | --- |
| Memories (`free_file`) | `memories-app` | `127.0.0.1:3000` | memories.brozy.org |
| Portfolio (`pfolio`) | `pfolio-app` | `127.0.0.1:3001` | medzy.brozy.org |

Admin is **not** deployed. It stays on your machine.

### GitHub secrets (this repo only)

Under Settings → Secrets and variables → Actions:

| Secret | What goes in it |
| --- | --- |
| `ENV_FILE` | Full production `app/.env` (set `SITE_URL=https://medzy.brozy.org`) |
| `EC2_HOST` | Server address |
| `EC2_USERNAME` | SSH user (e.g. `deployer`) |
| `EC2_SSH_KEY` | Private key for that user |

Same secret *names* as before on pfolio — do not reuse or edit free_file’s
secrets; each GitHub repo has its own.

### One-time EC2 prep (free disk, then Docker)

The old workflow SCP’d the whole `app/` tree. That usually left a huge
`node_modules` under `/var/www/medzy.brozy.org` and is why `/` hit ~86% of 47GB.
Memories Docker images also grow if never pruned.

SSH in, then:

```bash
# see what is eating space
df -h /
sudo du -xh /var/www --max-depth=2 | sort -h | tail
docker system df

# run the prep script from this repo (safe: does not touch memories-app)
bash scripts/ec2-prep-docker.sh
```

Point nginx for `medzy.brozy.org` at **`http://127.0.0.1:3001`** (leave Memories on 3000).

### Every push to `main`

`.github/workflows/portfolio.yml` typechecks, builds the image on GitHub Actions,
pushes to GHCR (`ghcr.io/<owner>/pfolio/app:<sha>`), SCPs only
`docker-compose.yml` + `.env`, then pulls and restarts `pfolio-app` on the EC2.

You can also run the workflow manually (Actions → Deploy Portfolio to EC2).

### Local container smoke test

```bash
# from repo root
docker build -f app/Dockerfile -t pfolio-app:local .
cd app && printf 'APP_IMAGE=pfolio-app:local\n' > .env.deploy
# need a real .env first
docker compose --env-file .env.deploy up -d
```

Whatever you pick, keep the service role key off the public site, and put it
behind HTTPS.

---

## 10. Security checklist

Worth reading once before you go live.

- Public site uses the **anon** key. Admin uses the **service role** key.
- Row level security is on for every table, and the public policies are read
  only. Do not loosen them.
- Restrict the `admin` table policy after your first successful login. See
  step 3.
- No `.env` file is ever committed. Check `git status` before you push.
- The GitHub token is scoped to one repo with contents write and nothing else.
- SMTP uses an app password, not your mailbox password.
- Admin services listen on localhost only.
- The contact form is rate limited and origin checked.
- The dashboard session cookie is httpOnly, signed, and expires after 8 hours.
- Rotate `DASHBOARD_SESSION_SECRET` if you ever suspect a leak. It signs every
  session and changing it logs everyone out.

---

## Troubleshooting

**Address already in use on 3002.** Something still holds the port. Find it with
`Get-NetTCPConnection -LocalPort 3002 -State Listen` on Windows, or
`lsof -i :3002` elsewhere, then stop that process.

**Dashboard says an env var is empty.** It reads
`app_admincli/server/dashboard/.env.local`. Values are read at build time, so
after changing one, delete the `.next` folder and start again.

**Images do not appear.** Confirm `GITHUB_OWNER` and `GITHUB_REPO` are set in
both `app/.env` and `app_admincli/.env`, and that the site is running, since
previews load through it.

**Uploads fail.** Usually ffmpeg is missing from PATH, or `GITHUB_TOKEN` lacks
contents write on that repo.

**Login always fails.** The wrapper key and the password are two separate
secrets and both must match. If the admin row was inserted with a different
wrapper key, delete the row and redo step 6.

**Typecheck or build errors after pulling.** Run `npm install` at the root, and
again inside `app_admincli/server/dashboard`.
