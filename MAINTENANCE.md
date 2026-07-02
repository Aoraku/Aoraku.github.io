# Maintenance

This site is data-driven. Most content changes do not require editing HTML/CSS/JS.

## Where To Edit

Main page profile, headline, bio, social links, and quick facts:

- `data/profile.json`

Main page News:

- `data/news.json`

My info / resume:

- `data/resume.json`

Scholar / papers:

- `data/papers.json`

Blog documents:

- `content/blog/essays/`
- `content/blog/cst-notes/`
- `content/blog/journals/`

## Blog Sorting

Blog sorting uses the document writing date from front matter:

```yaml
---
title: Example title
date: 2026-07-01
summary: Short abstract.
tags: [CST, note]
---
```

If `date` is missing, the sync script falls back to the file modified date. For reliable GitHub Pages ordering, keep `date` in every article.

After adding or editing Blog files, run:

```bash
python scripts/sync_content.py
```

## Publish Changes

```bash
git add .
git commit -m "Update homepage"
git push
```

GitHub Actions will rebuild and publish the site.
