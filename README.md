# Aoraku.github.io

Personal homepage for Qingle Liu / Aoraku.

## Structure

- `index.html` is the GitHub Pages entry point.
- `assets/` contains CSS, JavaScript, favicon, and avatar image.
- `data/profile.json` drives the Main page profile text, quick facts, and social links.
- `data/news.json` drives News on the Main page.
- `data/resume.json` drives My info.
- `data/papers.json` drives Scholar.
- `content/blog/` stores Blog documents.
- `scripts/sync_content.py` scans Blog documents and regenerates `data/blog-index.json`.

## Edit Content

Main page text: edit `data/profile.json`.

News: edit `data/news.json` and add items with `date`, `title`, and `body`.

My info: edit `data/resume.json`.

Scholar: edit `data/papers.json`.

Blog categories:

- `content/blog/essays/` for essays
- `content/blog/cst-notes/` for CST course notes
- `content/blog/journals/` for daily/weekly/monthly/quarterly/yearly journals

Supported Blog formats: `.md`, `.txt`, `.pdf`, `.docx`.

## Blog Front Matter

For Markdown or text files, put writing time in front matter. Blog sorting uses this `date`, not Git commit time.

```yaml
---
title: My article
date: 2026-07-01
summary: One-line summary.
tags: [course, note]
---
```

Then run:

```bash
python scripts/sync_content.py
```

## Preview

```bash
python -m http.server 8000
```

Open <http://localhost:8000>.

## Deploy

```bash
git add .
git commit -m "Update homepage"
git push
```

GitHub Actions deploys the static site to <https://aoraku.github.io/>.

Do not commit GitHub tokens or other secrets.
