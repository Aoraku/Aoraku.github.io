---
title: Blog content guide
---

Put future files in one of these folders:

- `essays` for 杂文
- `cst-notes` for CST专业课文档
- `journals` for 日周月季年记

Supported extensions are `.md`, `.txt`, `.pdf`, and `.docx`.

For `.md` or `.txt`, optional front matter can be used:

```yaml
---
title: Example title
date: 2026-07-01
summary: Short abstract shown in the blog list.
tags: [AI, notes]
---
```

Run `python scripts/sync_content.py` before previewing or pushing.

