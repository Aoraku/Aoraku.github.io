# Aoraku.github.io

Aoraku / Qingle Liu personal homepage.

Local repository:

`C:\Users\liuqi\Documents\Homepage`

Public site:

<https://aoraku.github.io/>

## Quick Edit Map

- Main text: `data/profile.json`
- News: `data/news.json`
- My info / resume: `data/resume.json`
- Scholar / papers: `data/papers.json`
- Blog: `content/blog/`

See `MAINTENANCE.md` for details.

## Publish

```powershell
cd C:\Users\liuqi\Documents\Homepage
python scripts\sync_content.py
git add .
git commit -m "Update homepage"
git push
```

Do not commit GitHub tokens or other secrets.
