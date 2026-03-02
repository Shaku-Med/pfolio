import os
import platform
from pathlib import Path


def get_device_fingerprint() -> str:
    parts = [platform.node() or "unknown"]
    try:
        if os.name == "posix":
            for p in ("/etc/machine-id", "/var/lib/dbus/machine-id"):
                if Path(p).exists():
                    parts.append(Path(p).read_text().strip()[:32])
                    break
        elif os.name == "nt":
            parts.append(os.environ.get("COMPUTERNAME", "") or os.environ.get("COMPUTERIDENTIFIER", ""))
    except Exception:
        pass
    return "|".join(parts)
