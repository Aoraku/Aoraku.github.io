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

CATEGORIES = {
    "essays": "\u6742\u6587",
    "cst-notes": "CST\u4e13\u4e1a\u8bfe\u6587\u6863",
    "journals": "\u65e5\u5468\u6708\u5b63\u5e74\u8bb0",
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
    meta, body = parse_front_matter(text)
    if not meta.get("summary"):
        first_para = next((p.strip() for p in re.split(r"\n\s*\n", body) if p.strip()), "")
        meta["summary"] = re.sub(r"[#*_>`\[\]()-]", "", first_para)[:180]
    return meta


def file_date(path: Path) -> str:
    modified = dt.datetime.fromtimestamp(path.stat().st_mtime)
    return modified.date().isoformat()


def title_from_stem(path: Path) -> str:
    stem = re.sub(r"^\d{4}[-_.]\d{2}[-_.]\d{2}[-_ ]*", "", path.stem)
    return stem.replace("_", " ").replace("-", " ").strip() or path.stem


def discover_entries() -> list[dict]:
    entries: list[dict] = []
    for category, label in CATEGORIES.items():
        category_dir = BLOG_ROOT / category
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
            rel = path.relative_to(ROOT).as_posix()
            title = str(meta.get("title") or title_from_stem(path))
            date = str(meta.get("date") or file_date(path))
            entry_id = slugify(f"{category}-{path.stem}")
            tags = meta.get("tags") or []
            if isinstance(tags, str):
                tags = [item.strip() for item in tags.split(",") if item.strip()]

            entries.append(
                {
                    "id": entry_id,
                    "title": title,
                    "date": date,
                    "category": category,
                    "categoryLabel": label,
                    "summary": str(meta.get("summary") or ""),
                    "tags": tags,
                    "type": kind,
                    "source": rel,
                }
            )

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



