"""Load admin CLI env from the nearest .env file."""
from pathlib import Path

from dotenv import load_dotenv

_ROOT = Path(__file__).resolve().parent


def load_admin_env() -> Path | None:
    """Load the first .env found under app_admincli/, then nearby fallbacks.

    Returns the path that was loaded, or None if nothing was found.
    """
    candidates = [
        _ROOT / ".env",
        _ROOT.parent / "app" / ".env",
        _ROOT.parent / ".env",
    ]
    for path in candidates:
        if path.is_file():
            load_dotenv(path, override=False)
            return path
    # Still call load_dotenv so a process-level .env / cwd .env can apply.
    load_dotenv(override=False)
    return None
