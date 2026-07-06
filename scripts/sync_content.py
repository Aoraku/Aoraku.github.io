#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BLOG_ROOT = ROOT / "content" / "blog"
OUT_PATH = ROOT / "data" / "blog-index.json"

SCAN_ROOTS = ("essays", "cst-notes", "journals")
CATEGORY_LABELS = {
    "essays": "\u6742\u6587",
    "politics": "\u601d\u653f\u4e28\u901a\u8bc6",
    "japanese": "\u65e5\u672c\u8bed",
    "cst-notes": "CST\u4e13\u4e1a\u8bfe\u6587\u6863",
    "high-school": "\u9ad8\u4e2d\u65f6\u4ee3",
    "journals": "\u65e5\u5468\u6708\u5b63\u5e74\u8bb0",
}
ESSAY_SUBCATEGORIES = {
    "\u6742\u6587": "essays",
    "\u601d\u653f\u4e28\u901a\u8bc6": "politics",
    "\u65e5\u672c\u8bed": "japanese",
    "\u9ad8\u4e2d\u65f6\u4ee3": "high-school",
}
SUPPORTED = {
    ".md": "markdown",
    ".markdown": "markdown",
    ".txt": "text",
    ".pdf": "pdf",
    ".docx": "docx",
}


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^\w\u4e00-\u9fff.-]+", "-", value, flags=re.UNICODE)
    value = re.sub(r"-{2,}", "-", value).strip("-")
    return value or "untitled"


def parse_scalar(value: str):
    value = value.strip()
    if not value:
        return ""
    if value.lower() in {"true", "false"}:
        return value.lower() == "true"
    if value.startswith("[") and value.endswith("]"):
        raw_items = value[1:-1].split(",")
        return [item.strip().strip("'\"") for item in raw_items if item.strip()]
    return value.strip("'\"")


def parse_front_matter(text: str) -> tuple[dict, str]:
    normalized = text.replace("\r\n", "\n")
    if not normalized.startswith("---\n"):
        return {}, text
    end = normalized.find("\n---\n", 4)
    if end == -1:
        return {}, text

    meta: dict[str, object] = {}
    block = normalized[4:end]
    body = normalized[end + 5 :]
    for line in block.splitlines():
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            continue
        key, value = line.split(":", 1)
        meta[key.strip()] = parse_scalar(value)
    return meta, body


def read_text_meta(path: Path) -> dict:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        text = path.read_text(encoding="utf-8-sig", errors="replace")
    meta, _body = parse_front_matter(text)
    return meta


def file_date(path: Path) -> str:
    modified = dt.datetime.fromtimestamp(path.stat().st_mtime)
    return modified.date().isoformat()


def title_from_stem(path: Path) -> str:
    stem = re.sub(r"^\d{4}[-_.]\d{2}[-_.]\d{2}[-_ ]*", "", path.stem)
    return stem.replace("_", " ").replace("-", " ").strip() or path.stem


def classify_path(root_category: str, path: Path) -> tuple[str, str]:
    if root_category != "essays":
        category = root_category
        return category, CATEGORY_LABELS[category]

    rel = path.relative_to(BLOG_ROOT / root_category)
    first_part = rel.parts[0] if rel.parts else ""
    category = ESSAY_SUBCATEGORIES.get(first_part, "essays")
    return category, CATEGORY_LABELS[category]


def discover_entries() -> list[dict]:
    entries: list[dict] = []
    for root_category in SCAN_ROOTS:
        category_dir = BLOG_ROOT / root_category
        if not category_dir.exists():
            category_dir.mkdir(parents=True, exist_ok=True)
            continue

        for path in sorted(category_dir.rglob("*")):
            if not path.is_file():
                continue
            if path.name.startswith("_") or path.name.startswith(".") or path.name.lower() == "readme.md":
                continue
            kind = SUPPORTED.get(path.suffix.lower())
            if not kind:
                continue

            meta = read_text_meta(path) if kind in {"markdown", "text"} else {}
            source_path = path
            entry_kind = kind
            pdf_sources: list[Path] = []
            pdf_ref = meta.get("pdf") if kind in {"markdown", "text"} else None
            pdfs_ref = meta.get("pdfs") if kind in {"markdown", "text"} else None
            if isinstance(pdf_ref, str) and pdf_ref.strip():
                pdf_path = (path.parent / pdf_ref.strip()).resolve()
                if pdf_path.exists():
                    source_path = pdf_path
                    entry_kind = "pdf"
                    pdf_sources = [pdf_path]
            elif isinstance(pdfs_ref, list):
                pdf_paths = [
                    (path.parent / str(item).strip()).resolve()
                    for item in pdfs_ref
                    if str(item).strip()
                ]
                pdf_paths = [item for item in pdf_paths if item.exists()]
                if pdf_paths:
                    source_path = pdf_paths[0]
                    entry_kind = "pdf"
                    pdf_sources = pdf_paths

            rel = source_path.relative_to(ROOT).as_posix()
            title = str(meta.get("title") or title_from_stem(path))
            date = str(meta.get("date") or file_date(path))
            category, label = classify_path(root_category, path)
            entry_id = slugify(f"{root_category}-{path.relative_to(BLOG_ROOT).with_suffix("").as_posix()}")
            tags = meta.get("tags") or []
            if isinstance(tags, str):
                tags = [item.strip() for item in tags.split(",") if item.strip()]

            entry = {
                "id": entry_id,
                "title": title,
                "date": date,
                "category": category,
                "categoryLabel": label,
                "summary": str(meta.get("summary") or ""),
                "tags": tags,
                "starred": bool(meta.get("starred")),
                "type": entry_kind,
                "source": rel,
            }
            if len(pdf_sources) > 1:
                entry["pdfs"] = [item.relative_to(ROOT).as_posix() for item in pdf_sources]
            entries.append(entry)

    entries.sort(key=lambda item: (item.get("date", ""), item.get("title", "")), reverse=True)
    return entries


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate the blog index for Aoraku.github.io.")
    parser.add_argument("--check", action="store_true", help="Fail if the generated index differs.")
    args = parser.parse_args()

    payload = {
        "generatedAt": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(),
        "entries": discover_entries(),
    }
    rendered = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"

    if args.check:
        current = json.loads(OUT_PATH.read_text(encoding="utf-8")) if OUT_PATH.exists() else {}
        if current.get("entries") != payload["entries"]:
            print(f"{OUT_PATH} is out of date. Run python scripts/sync_content.py")
            return 1
        return 0

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(rendered, encoding="utf-8")
    print(f"Wrote {OUT_PATH.relative_to(ROOT)} with {len(payload['entries'])} entries.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())



