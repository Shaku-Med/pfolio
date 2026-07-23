import os
import shutil
import subprocess
import sys
from pathlib import Path

DASHBOARD_PORT = 3002
DASHBOARD_DIR = Path(__file__).resolve().parent / "dashboard"


def _npm() -> str | None:
    for name in ("npm.cmd", "npm") if os.name == "nt" else ("npm",):
        found = shutil.which(name)
        if found:
            return found
    return None


def _env_ready() -> tuple[bool, str]:
    env_file = DASHBOARD_DIR / ".env.local"
    if not env_file.exists():
        return False, "server/dashboard/.env.local is missing. Copy .env.example and fill it in."
    text = env_file.read_text(encoding="utf-8", errors="replace")
    for key in ("SUPABASE_URL", "SUPABASE_KEY", "DASHBOARD_SESSION_SECRET"):
        line = next((l for l in text.splitlines() if l.strip().startswith(f"{key}=")), None)
        if not line or not line.split("=", 1)[1].strip():
            return False, f"{key} is empty in server/dashboard/.env.local."
    return True, ""


def _run(npm: str, args: list[str]) -> int:
    process = subprocess.Popen([npm, *args], cwd=str(DASHBOARD_DIR))
    try:
        return process.wait()
    except KeyboardInterrupt:
        process.terminate()
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
        return 0


def choose_dashboard_mode() -> str | None:
    """Ask how to run the dashboard. Returns 'dev', 'prod', or None (cancel).

    Empty input defaults to dev.
    """
    print("\nHow do you want to run the dashboard?\n")
    print("1. Dev (hot reload — default)")
    print("2. Production (build, then start)")
    print("3. Cancel")
    while True:
        choice = input("\nChoice (1/2/3, Enter = 1): ").strip()
        if choice == "" or choice == "1":
            return "dev"
        if choice == "2":
            return "prod"
        if choice == "3":
            return None
        print("Enter 1, 2, 3, or press Enter for Dev.")


def run_dashboard(mode: str = "dev") -> None:
    """Start the Next.js dashboard. mode is 'dev' or 'prod'."""
    if not DASHBOARD_DIR.is_dir():
        print("The dashboard folder is missing. Expected it at app_admincli/server/dashboard.")
        return

    npm = _npm()
    if not npm:
        print("npm was not found on PATH. Install Node 20 or newer and try again.")
        return

    ok, problem = _env_ready()
    if not ok:
        print(problem)
        return

    if not (DASHBOARD_DIR / "node_modules").is_dir():
        print("Installing dashboard packages, this only happens once.\n")
        if _run(npm, ["install"]) != 0:
            print("npm install failed.")
            return

    if mode == "prod":
        print("Building the dashboard for production…\n")
        if _run(npm, ["run", "build"]) != 0:
            print("The build failed.")
            return
        script = "start"
    else:
        script = "dev"

    print(f"\nDashboard running at http://localhost:{DASHBOARD_PORT}")
    print("Press Ctrl+C to stop.\n")
    code = _run(npm, ["run", script])
    if code not in (0, None):
        print(f"\nThe dashboard exited with code {code}.")
        sys.exit(code)
