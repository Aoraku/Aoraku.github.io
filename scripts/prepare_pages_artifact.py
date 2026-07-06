#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
BLOG_INDEX = DATA_DIR / "blog-index.json"
SITE_FILES = ("index.html", "assets", "data", ".nojekyll")
PUBLIC_BLOG_ROOT = Path("content") / "blog-public"


def slugify_ascii(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-{2,}", "-", value).strip("-")
    return value[:48].strip("-") or "entry"


def public_dir_for(entry: dict) -> Path:
    key = str(entry.get("source") or entry.get("id") or entry.get("title") or "entry")
    digest = hashlib.sha1(key.encode("utf-8")).hexdigest()[:10]
    date = re.sub(r"[^0-9]", "", str(entry.get("date") or ""))[:8]
    title = slugify_ascii(str(entry.get("title") or entry.get("id") or "entry"))
    prefix = f"{date}-" if date else ""
    return PUBLIC_BLOG_ROOT / f"{prefix}{title}-{digest}"


def copy_path(source_rel: str, source_to_public: dict[Path, Path], target_root: Path) -> str:
    source = (ROOT / source_rel).resolve()
    source_parent = source.parent
    public_parent = source_to_public[source_parent]
    target_parent = target_root / public_parent
    target_parent.mkdir(parents=True, exist_ok=True)
    if source_parent.is_dir():
        shutil.copytree(source_parent, target_parent, dirs_exist_ok=True)
    else:
      raise FileNotFoundError(source_parent)
    return (public_parent / source.name).as_posix()


def load_blog_index() -> dict:
    if not BLOG_INDEX.exists():
        return {"generatedAt": "", "entries": []}
    return json.loads(BLOG_INDEX.read_text(encoding="utf-8"))


def copy_site_shell(target_root: Path) -> None:
    if target_root.exists():
        shutil.rmtree(target_root)
    target_root.mkdir(parents=True)
    for name in SITE_FILES:
        source = ROOT / name
        target = target_root / name
        if source.is_dir():
            shutil.copytree(source, target)
        elif source.exists():
            shutil.copy2(source, target)


def rewrite_blog_index(target_root: Path) -> None:
    payload = load_blog_index()
    entries = payload.get("entries") if isinstance(payload, dict) else []
    if not isinstance(entries, list):
        entries = []

    source_to_public: dict[Path, Path] = {}
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        public_dir = public_dir_for(entry)
        paths = [entry.get("source")]
        if isinstance(entry.get("pdfs"), list):
            paths.extend(entry["pdfs"])
        for source_rel in paths:
            if not isinstance(source_rel, str) or not source_rel.strip():
                continue
            source_parent = (ROOT / source_rel).resolve().parent
            source_to_public.setdefault(source_parent, public_dir)

    rewritten_entries = []
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        rewritten = dict(entry)
        source = rewritten.get("source")
        if isinstance(source, str) and source.strip():
            rewritten["source"] = copy_path(source, source_to_public, target_root)
        pdfs = rewritten.get("pdfs")
        if isinstance(pdfs, list):
            rewritten["pdfs"] = [
                copy_path(source_rel, source_to_public, target_root)
                for source_rel in pdfs
                if isinstance(source_rel, str) and source_rel.strip()
            ]
        rewritten_entries.append(rewritten)

    rewritten_payload = dict(payload)
    rewritten_payload["entries"] = rewritten_entries
    output = target_root / "data" / "blog-index.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(rewritten_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare a GitHub Pages artifact with short public blog paths.")
    parser.add_argument("target", nargs="?", default="_site", help="Artifact output directory.")
    args = parser.parse_args()

    target_root = (ROOT / args.target).resolve()
    copy_site_shell(target_root)
    rewrite_blog_index(target_root)
    print(f"Prepared {target_root.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
