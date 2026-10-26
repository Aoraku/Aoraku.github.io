# Aoraku.github.io

Aoraku / Qingle Liu personal homepage.

Local repository:

`/Volumes/LaCie/Aoraku.github.io`

Public site:

<https://aoraku.github.io/>

## Quick Edit Map

- Main text: `data/profile.json`
- News: `data/news.json`
- CV PDF: `assets/CV_Qingle_Liu.pdf`
- Research / papers: `data/papers.json`
- Blog bodies: `content/blog/`; metadata: `data/blog-metadata.json`
- Local Blog editor: run `python3 scripts/serve-blog-editor.py`, then open `http://127.0.0.1:8767/editor/`
- Travel notes: `data/travel/visits.json` (served at `/travel/`)

See `MAINTENANCE.md` for details.

## Publish

```sh
cd /Volumes/LaCie/Aoraku.github.io
python3 scripts/sync_content.py
git add .
git commit -m "Update homepage"
git push
```

Do not commit GitHub tokens or other secrets.
