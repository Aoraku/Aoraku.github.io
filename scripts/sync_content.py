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
METADATA_PATH = ROOT / "data" / "blog-metadata.json"
CATEGORIES = [
    {"id": key, "label": label} for key, label in [
        ("selected", "精選"), ("journal", "雑感"), ("highschool", "高校時代"),
        ("japanese", "日本語"), ("cst", "CST"), ("frontier", "先端"),
        ("society", "社会"), ("poem", "詩歌"), ("philosophy", "哲学"),
        ("arts", "文藝")
    ]
]
CATEGORY_NAMES = {item["id"]: item["label"] for item in CATEGORIES}

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


def normalize_categories(value: object, fallback: str) -> list[str]:
    if isinstance(value, list):
        raw_items = [str(item).strip() for item in value if str(item).strip()]
    elif isinstance(value, str) and value.strip():
        raw_items = [item.strip() for item in value.split(",") if item.strip()]
    else:
        raw_items = []

    categories: list[str] = []
    for item in raw_items:
        category = ESSAY_SUBCATEGORIES.get(item, item)
        if category in CATEGORY_LABELS and category not in categories:
            categories.append(category)

    if fallback not in categories:
        categories.append(fallback)
    return categories or [fallback]


def discover_documents() -> list[dict]:
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
            categories = normalize_categories(meta.get("categories"), category)
            category_labels = [CATEGORY_LABELS[item] for item in categories]
            entry_id = slugify(f"{root_category}-{path.relative_to(BLOG_ROOT).with_suffix("").as_posix()}")
            tags = meta.get("tags") or []
            if isinstance(tags, str):
                tags = [item.strip() for item in tags.split(",") if item.strip()]

            entry = {
                "id": entry_id,
                "document": path.relative_to(ROOT).as_posix(),
                "title": title,
                "date": date,
                "category": categories[0],
                "categoryLabel": " / ".join(category_labels) if len(category_labels) > 1 else label,
                "summary": str(meta.get("summary") or ""),
                "tags": tags,
                "starred": bool(meta.get("starred")),
                "type": entry_kind,
                "source": rel,
            }
            if len(categories) > 1:
                entry["categories"] = categories
                entry["categoryLabels"] = category_labels
            if len(pdf_sources) > 1:
                entry["pdfs"] = [item.relative_to(ROOT).as_posix() for item in pdf_sources]
            entries.append(entry)

    entries.sort(key=lambda item: (item.get("date", ""), item.get("title", "")), reverse=True)
    return entries


def discover_entries(save_registry=True) -> list[dict]:
    registry = json.loads(METADATA_PATH.read_text(encoding="utf-8")) if METADATA_PATH.exists() else {"version": 1, "articles": {}}
    articles = registry["articles"]
    by_document = {item["document"]: (key, item) for key, item in articles.items()}
    labels = CATEGORY_NAMES
    entries = []
    changed = False
    for original in discover_documents():
        document = original["document"]
        if document not in by_document:
            article_id = str(max([int(key) for key in articles] or [0]) + 1)
            old = original.get("categories", [original["category"]])
            mapped = {"essays": "journal", "journals": "journal", "high-school": "highschool", "cst-notes": "cst", "politics": "society"}
            categories = list(dict.fromkeys(mapped.get(c, c) for c in old))
            item = {"document": document, "legacyId": original["id"], "title": original["title"],
                    "date": original["date"], "categories": categories,
                    "selected": "essays" in old or bool(original.get("starred")),
                    "tags": original.get("tags", []), "summary": original.get("summary", "")}
            articles[article_id] = item
            by_document[document] = (article_id, item)
            changed = True
        article_id, meta = by_document[document]
        categories = meta["categories"]
        if not categories or any(c not in labels or c == "selected" for c in categories):
            raise ValueError(f"Invalid categories for article {article_id}")
        entry = {"id": article_id, "legacyId": meta["legacyId"],
                 "title": meta["title"], "date": meta["date"],
                 "category": categories[0], "categories": categories,
                 "categoryLabel": " / ".join(labels[c] for c in categories),
                 "categoryLabels": [labels[c] for c in categories],
                 "selected": bool(meta["selected"]), "summary": meta["summary"], "tags": meta["tags"],
                 "type": original["type"], "source": original["source"]}
        if "pdfs" in original:
            entry["pdfs"] = original["pdfs"]
        entries.append(entry)
    if changed and save_registry:
        METADATA_PATH.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    entries.sort(key=lambda item: (item["date"], item["title"]), reverse=True)
    return entries


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate the blog index for Aoraku.github.io.")
    parser.add_argument("--check", action="store_true", help="Fail if the generated index differs.")
    args = parser.parse_args()

    payload = {
        "generatedAt": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(),
        "categories": CATEGORIES,
        "entries": discover_entries(save_registry=not args.check),
    }
    rendered = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"

    if args.check:
        current = json.loads(OUT_PATH.read_text(encoding="utf-8")) if OUT_PATH.exists() else {}
        if current.get("entries") != payload["entries"] or current.get("categories") != CATEGORIES:
            print(f"{OUT_PATH} is out of date. Run python scripts/sync_content.py")
            return 1
        return 0

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(rendered, encoding="utf-8")
    print(f"Wrote {OUT_PATH.relative_to(ROOT)} with {len(payload['entries'])} entries.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())



