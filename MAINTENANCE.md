# Homepage Maintenance

Local repository:

`/Volumes/LaCie/Aoraku.github.io`

Remote repository:

`https://github.com/Aoraku/Aoraku.github.io`

Public site:

`https://aoraku.github.io/`

## Edit Map

Main introduction, education, coursework, experience, honors, services, and social links:

- `data/profile.json`

Main News:

- `data/news.json`

CV PDF:

- `assets/CV_Qingle_Liu.pdf`

Research / papers:

- `data/papers.json`

Blog content:

- Essays: `content/blog/essays/`
- CST course notes: `content/blog/cst-notes/`
- Journals: `content/blog/journals/`

## Pages and styling

- `/` and `/#main`: academic homepage, rendered by `assets/app.js`.
- `/#research`: full publication list. `/#scholar` is an alias.
- `/blog/`: serif blog and document reader, rendered by `assets/blog.js`.
- `/travel/`: interactive travel globe, rendered by `assets/travel.js`. The homepage opens it in a new tab.
- `/assets/CV_Qingle_Liu.pdf`: direct CV link.

`assets/styles.css` defines the academic layout and the locally hosted Lato font. Research headings use Georgia. `assets/blog.css` defines the serif blog layout. `assets/brand.css` and `assets/brand.js` control six red-and-white vector marks shared by all pages. Clicking the mark cycles through seal, music, code, phantom, Monogatari, and EVA styles; the choice persists in local storage. The adjacent name links home. The vectors in `assets/brand/` include outlined lettering for consistent rendering across browsers. The seal uses bold Songti with its lettering and frame rotated together; the music mark has an outlined G-clef and note-head terminals; phantom uses black-and-white cut-paper tiles with red borders; EVA uses tightly set, heavy high-contrast Mincho lettering in white on red. The mark cannot be selected or dragged and has no hover tooltip; its accessible button label still announces the current and next style. Institutional logo assets and their source links are in `assets/logos/`. `assets/theme.js` defaults to light mode and persists the visitor's choice in local storage. Section underlines are red in light mode and cyan in dark mode.

In `data/papers.json`, set `selected: true` on the five homepage papers. The complete list is shown on Research. Author strings retain contributor markers such as `*`; Qingle Liu's name is underlined automatically. Both publication lists have expandable author lists.

## Travel journal

Travel records belong in `data/travel/visits.json`; photographs belong in `assets/travel/`. See `data/travel/SOURCES.md` for the record schema, map sources, and boundary convention. The atlas supports 34 Chinese province-level regions, 47 Japanese prefectures, and 50 US states. Records automatically highlight the associated country and region. The place picker lists only countries with published notes. The globe rotates by default (except when reduced motion is enabled); selecting a place or dragging pauses rotation. The Rotate/Pause button controls it explicitly. The globe stage and its controls keep the same desktop geometry across World View and country views, while rotation and zoom animate continuously.

## Local preview

```sh
node scripts/serve-static.mjs 8765
```

Open `http://127.0.0.1:8765/`. To validate the GitHub Pages artifact, run `python3 scripts/prepare_pages_artifact.py tmp/site-preview`, then serve that directory. The artifact includes the homepage, Blog, Travel, local fonts, maps, PDF, and indexed article files.

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

Run in a terminal:

```sh
cd /Volumes/LaCie/Aoraku.github.io
python3 scripts/sync_content.py
git status
git add .
git commit -m "Update homepage"
git push
```

GitHub Actions will redeploy the site.
