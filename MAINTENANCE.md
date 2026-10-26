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

- `/main`: academic homepage, rendered by `assets/app.js`. `/` opens Main.
- `/research`: full publication list.
- `/blog`: serif blog, rendered by `assets/blog.js`. Categories use `/blog/selected`, `/blog/journal`, `/blog/highschool`, `/blog/japanese`, `/blog/cst`, `/blog/frontier`, `/blog/society`, `/blog/poem`, `/blog/philosophy`, `/blog/music`, and `/blog/travel`.
- `/blog/60`: an article identified by its permanent numeric ID; headings use `?section=1`.
- `/travel`: interactive travel globe. Country routes include `/travel/156`, `/travel/392`, and `/travel/840`; regions include `/travel/156/110000`, `/travel/392/01`, and `/travel/840/01`. The homepage opens Travel in a new tab.
- Legacy Main, Research, article, and Travel hash links redirect to their path equivalents.
- `/assets/CV_Qingle_Liu.pdf`: direct CV link.

`assets/styles.css` defines the academic layout and the locally hosted Lato font. The Research page heading shares the homepage name’s Lato styling; research paper titles use Georgia. `assets/blog.css` defines the serif blog layout. `assets/brand.css` and `assets/brand.js` control seven red-and-white marks shared by all pages. Clicking the mark cycles through seal, music, code, phantom, Monogatari, EVA, and shinobi styles; the choice persists in local storage. The adjacent name links home. The vectors in `assets/brand/` include outlined lettering for consistent rendering across browsers. The seal uses bold Songti with its lettering and frame rotated together; the music mark has an outlined G-clef and note-head terminals; phantom uses black-and-white cut-paper tiles with red borders; EVA uses contrasting character sizes and staggered Mincho lettering in white on red, without a thickening stroke. Shinobi uses custom vertical brush lettering in the transparent `assets/brand/shinobi.png`, generated with the built-in image tool from the supplied calligraphy references; its generation prompt is recorded in `assets/brand/shinobi-prompt.txt`. The mark cannot be selected or dragged and has no hover tooltip; its accessible button label still announces the current and next style. Institutional logo assets and their source links are in `assets/logos/`. `assets/theme.js` defaults to light mode and persists the visitor's choice in local storage. Section underlines are red in light mode and cyan in dark mode.

In `data/papers.json`, set `selected: true` on the five homepage papers. The complete list is shown on Research. Author strings retain contributor markers such as `*`; Qingle Liu's name is underlined automatically. Both publication lists have expandable author lists.

## Travel journal

Travel records belong in `data/travel/visits.json`; photographs belong in `assets/travel/`. See `data/travel/SOURCES.md` for the record schema, map sources, and boundary convention. The atlas supports 34 Chinese province-level regions, 47 Japanese prefectures, and 50 US states. Records automatically highlight the associated country and region. The place picker lists only countries with published notes. The globe rotates by default (except when reduced motion is enabled); selecting a place or dragging pauses rotation. The Rotate/Pause button controls it explicitly. The globe stage and its controls keep the same desktop geometry across World View and country views, while rotation and zoom animate continuously.

## Local preview

```sh
node scripts/serve-static.mjs 8765
```

Open `http://127.0.0.1:8765/`. To validate the GitHub Pages artifact, run `python3 scripts/prepare_pages_artifact.py tmp/site-preview`, then serve that directory. The artifact includes the homepage, Blog, Travel, local fonts, maps, PDF, and indexed article files.

## Blog metadata and editing desk

`data/blog-metadata.json` is the canonical metadata registry: stable numeric ID, source document, title, date, categories, selected flag, tags, and summary. An article belongs to at least one actual category; the independent `selected` flag adds it to 精选. Titles and categories can change without changing the article URL. Keep IDs and document associations stable; do not reuse an ID for another article.

Start the preview server above, then start the local editing desk in another terminal:

```sh
python3 scripts/serve-blog-editor.py
```

Open `http://127.0.0.1:8767/editor/`. Choose an article, edit its fields, and save with the button or Cmd/Ctrl+S. Saving updates the registry and generated index, with backups in `.cache/blog-editor/backups/`. Refresh the preview to see the result. The editor binds only to loopback and is excluded from the public artifact. Saving does not publish the site.

Articles sort by registry date, newest first. `scripts/sync_content.py` produces `data/blog-index.json`. Metadata from a new document's front matter is imported on its first sync; subsequent edits belong in the registry or editing desk.

`reports/blog-audit.md` contains the 60-entry structure inventory. The editor also shows each article's finding. Run `python3 scripts/audit_blog.py` to regenerate it. The inventory distinguishes missing displayed headings, chapter-like text outside heading markup, and attachments requiring manual review. Article bodies are maintained in their source files.

## Add A New Document

Recommended layout for Markdown with images:

```text
content/blog/cst-notes/my-new-note/index.md
content/blog/cst-notes/my-new-note/image-1.png
content/blog/cst-notes/my-new-note/image-2.png
```

Markdown images can use relative paths such as `![](image-1.png)`. Include front matter with `title`, `date` (YYYY-MM-DD), `summary`, and `tags`. Run the sync script to allocate a permanent numeric ID, then assign categories in the editor.

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
