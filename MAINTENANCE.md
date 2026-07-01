# Maintenance

This site is intentionally data-driven.

## News

Edit `data/news.json` and add items with `date`, `title`, and `body`.

## Resume

Edit `data/resume.json`. Each section has a stable `id`, a visible `title`, and an `entries` array. Inline Markdown works in bullet text.

## Scholar

Edit `data/papers.json`:

```json
{
  "papers": [
    {
      "title": "Paper title",
      "authors": "Author A, Author B",
      "venue": "Conference or Journal",
      "year": "2026",
      "url": "https://example.com"
    }
  ]
}
```

## Blog

Drop files into:

- `content/blog/essays/`
- `content/blog/cst-notes/`
- `content/blog/journals/`

Supported formats are `.md`, `.txt`, `.pdf`, and `.docx`.

Then run:

```bash
python scripts/sync_content.py
```

The reader supports Markdown/text directly. PDF opens inline. DOCX renders in the browser when the converter script loads.
