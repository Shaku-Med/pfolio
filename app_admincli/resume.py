import json
from datetime import datetime, timezone
from pathlib import Path
import re


try:
    import mammoth  # type: ignore
except Exception:
    mammoth = None  # type: ignore

try:
    from pypdf import PdfReader  # type: ignore
except Exception:
    PdfReader = None  # type: ignore


def _resume_dir() -> Path:
    base = Path(__file__).resolve().parent
    d = base / "resume_store"
    d.mkdir(exist_ok=True)
    return d


def _normalize_plain_text_to_markdown(text: str) -> str:
    lines = text.splitlines()
    out: list[str] = []
    first_heading_done = False

    for i, raw in enumerate(lines):
        s = raw.rstrip()
        if not s.strip():
            if out and out[-1] != "":
                out.append("")
            continue

        stripped = s.lstrip()

        if stripped.startswith(">"):
            out.append(stripped)
            continue

        if all(ch == "-" for ch in stripped) and len(stripped) >= 3:
            out.append("---")
            continue

        m = re.match(r"^([\-\*\u2022])\s+(.*)$", stripped)
        if m:
            bullet_text = m.group(2).strip()
            out.append(f"- {bullet_text}")
            continue

        m_num = re.match(r"^(\d+)[\.\)]\s+(.*)$", stripped)
        if m_num:
            num = m_num.group(1)
            bullet_text = m_num.group(2).strip()
            out.append(f"{num}. {bullet_text}")
            continue

        if s.lstrip().startswith("#"):
            out.append(s)
            first_heading_done = True
            continue

        letters = [ch for ch in s if ch.isalpha()]
        is_all_caps = bool(letters) and all(ch.isupper() for ch in letters)
        is_short = len(s) <= 60

        if i == 0 or (is_all_caps and is_short):
            level = 1 if not first_heading_done else 2
            out.append(f"{'#' * level} {s.strip()}")
            first_heading_done = True
        else:
            out.append(s)

    while out and out[-1] == "":
        out.pop()

    return "\n".join(out).strip()


def _convert_docx_to_markdown(path: Path) -> str:
    if mammoth is None:
        raise RuntimeError("mammoth is required for .docx conversion but is not installed.")
    with path.open("rb") as f:
        result = mammoth.convert_to_markdown(f)  # type: ignore[attr-defined]
    return (result.value or "").strip()


def _convert_pdf_to_markdown(path: Path) -> str:
    if PdfReader is None:
        raise RuntimeError("pypdf is required for .pdf conversion but is not installed.")
    reader = PdfReader(str(path))  # type: ignore[call-arg]
    chunks: list[str] = []
    for page in reader.pages:  # type: ignore[union-attr]
        text = page.extract_text() or ""
        if text.strip():
            chunks.append(text.strip())
    raw_text = "\n".join(chunks)
    return _normalize_plain_text_to_markdown(raw_text)


def _convert_text_to_markdown(path: Path, treat_as_markdown: bool) -> str:
    raw = path.read_text(encoding="utf-8", errors="replace")
    if treat_as_markdown:
        return raw
    return _normalize_plain_text_to_markdown(raw)


def _convert_to_markdown(path: Path) -> str:
    ext = path.suffix.lower()
    if ext in {".md", ".markdown"}:
        return _convert_text_to_markdown(path, treat_as_markdown=True)
    if ext in {".txt", ""}:
        return _convert_text_to_markdown(path, treat_as_markdown=False)
    if ext == ".docx":
        return _convert_docx_to_markdown(path)
    if ext == ".pdf":
        return _convert_pdf_to_markdown(path)
    raise RuntimeError(f"Unsupported resume format: {ext or 'unknown'}")


def create_resume() -> None:
    src_str = input("Local resume file path (pdf / docx / md / txt): ").strip()
    if not src_str:
        print("No path entered.")
        return
    src = Path(src_str).expanduser()
    if not src.exists():
        print("File not found.")
        return

    try:
        markdown = _convert_to_markdown(src)
    except Exception as e:
        print(f"Conversion failed: {e}")
        return

    out_dir = _resume_dir()
    out_md = out_dir / "resume.md"
    meta_path = out_dir / "resume.json"

    out_md.write_text(markdown, encoding="utf-8")

    meta = {
        "source_path": str(src.resolve()),
        "source_uri": src.resolve().as_uri(),
        "source_mtime": datetime.fromtimestamp(src.stat().st_mtime, tz=timezone.utc).isoformat(),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "markdown_path": str(out_md.resolve()),
    }
    meta_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")

    print("\nResume markdown created.")
    print(f"  Source local URL: {meta['source_uri']}")
    print(f"  Markdown path:    {meta['markdown_path']}")
    print("\nOpen the markdown file, review and edit it as needed.")
    print("When you're happy with it, choose 'Resume' ->")
    print("'Upload edited markdown file to Supabase' and provide the path.")

