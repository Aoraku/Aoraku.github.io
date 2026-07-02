# Homepage Maintenance

Local repository:

`C:\Users\liuqi\Documents\Homepage`

Remote repository:

`https://github.com/Aoraku/Aoraku.github.io`

Public site:

`https://aoraku.github.io/`

## Edit Map

Main profile text, headline, quick facts, and social links:

- `data/profile.json`

Main News:

- `data/news.json`

My info / resume:

- `data/resume.json`

Scholar / papers:

- `data/papers.json`

Blog content:

- Essays: `content/blog/essays/`
- CST course notes: `content/blog/cst-notes/`
- Journals: `content/blog/journals/`

## Blog Summary Text

Each Markdown article can start with front matter:

```yaml
---
title: Article title
date: 2026-07-02
summary: This line is shown in the Blog list. Delete it to hide the summary.
tags: [CST, note]
---
```

The current CST notes are here:

- `content/blog/cst-notes/intro-ai-review/index.md`
- `content/blog/cst-notes/intro-computer-systems-review/index.md`

## Blog Sort Order

Blog entries are sorted by the `date` field in front matter, not by Git commit time.

If `date` is missing, `scripts/sync_content.py` falls back to the file modified date. For predictable ordering, always set `date`.

## Add A New Document

Recommended layout for Markdown with images:

```text
content/blog/cst-notes/my-new-note/index.md
content/blog/cst-notes/my-new-note/image-1.png
content/blog/cst-notes/my-new-note/image-2.png
```

Markdown images can use relative paths such as `![](image-1.png)`.

Supported article file types: `.md`, `.txt`, `.pdf`, `.docx`.

## Publish Changes

Run in PowerShell:

```powershell
cd C:\Users\liuqi\Documents\Homepage
python scripts\sync_content.py
git status
git add .
git commit -m "Update homepage"
git push
```

GitHub Actions will redeploy the site.
