# Aoraku.github.io

Personal homepage for Qingle Liu / Aoraku.

## Structure

- `index.html` is the GitHub Pages entry point.
- `assets/` contains CSS, JavaScript, favicon, and avatar image.
- `data/profile.json`, `data/resume.json`, `data/news.json`, and `data/papers.json` drive Main, My info, News, and Scholar.
- `content/blog/` stores future blog documents.
- `scripts/sync_content.py` scans blog documents and regenerates `data/blog-index.json`.

## Add blog content

Place files in:

- `content/blog/essays/` for 杂文
- `content/blog/cst-notes/` for CST专业课文档
- `content/blog/journals/` for 日周月季年记

Supported formats: `.md`, `.txt`, `.pdf`, `.docx`.

For Markdown or text files, optional front matter:

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

Preview locally:

```bash
python -m http.server 8000
```

Open <http://localhost:8000>.

## Deploy

Push this repository to `https://github.com/Aoraku/Aoraku.github.io`. The included GitHub Actions workflow regenerates the blog index and deploys the static site to GitHub Pages.

Do not commit GitHub tokens or other secrets.

