(function () {
  const state = {
    profile: null,
    news: [],
    papers: [],
    blog: [],
    activeCategory: "essays"
  };

  const categoryOrder = [
    { id: "essays", label: "\u6742\u6587" },
    { id: "politics", label: "\u601d\u653f\u4e28\u901a\u8bc6" },
    { id: "japanese", label: "\u65e5\u672c\u8bed" },
    { id: "cst-notes", label: "CST\u4e13\u4e1a\u8bfe\u6587\u6863" },
    { id: "high-school", label: "\u9ad8\u4e2d\u65f6\u4ee3" },
    { id: "journals", label: "\u65e5\u5468\u6708\u5b63\u5e74\u8bb0" }
  ];

  const footerContactEmail = "lql24@mails.tsinghua.edu.cn";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    $("#year").textContent = new Date().getFullYear();
    bindNavigation();
    bindReader();

    const [profile, news, papers, blog] = await Promise.all([
      getJson("data/profile.json", {}),
      getJson("data/news.json", []),
      getJson("data/papers.json", { papers: [] }),
      getJson("data/blog-index.json", { entries: [] })
    ]);

    state.profile = profile;
    state.news = Array.isArray(news) ? news : [];
    state.papers = Array.isArray(papers) ? papers : papers.papers || [];
    state.blog = blog.entries || [];

    applyStaticLabels();
    ensureHomepageStyles();
    renderProfile();
    renderNews();
    renderPapers();
    renderBlog();
    updateRoute();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  async function getJson(url, fallback) {
    try {
      const response = await fetch(url, { cache: "no-cache" });
      if (!response.ok) throw new Error(`${url}: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn(error);
      return fallback;
    }
  }

  function bindNavigation() {
    $$(".nav-tab[data-route-target]").forEach((button) => {
      button.addEventListener("click", () => {
        window.location.hash = `#${button.dataset.routeTarget}`;
      });
    });
    window.addEventListener("hashchange", updateRoute);
  }

  function parseRoute() {
    const raw = window.location.hash.replace(/^#/, "");
    const parts = raw.split("/");
    const route = parts[0] || "main";
    const valid = new Set(["main", "info", "scholar", "blog", "doc"]);

    if (!valid.has(route)) {
      return { active: "main", entryId: "", anchor: "" };
    }

    if (route === "doc") {
      return {
        active: route,
        entryId: decodeHashSegment(parts[1] || ""),
        anchor: decodeHashSegment(parts.slice(2).join("/"))
      };
    }

    return {
      active: route,
      entryId: "",
      anchor: decodeHashSegment(parts.slice(1).join("/"))
    };
  }

  function decodeHashSegment(value) {
    try {
      return decodeURIComponent(value || "");
    } catch {
      return value || "";
    }
  }

  function updateRoute() {
    const { active, entryId, anchor } = parseRoute();
    if (active === "info") {
      window.location.replace($('a.nav-tab[href$=".pdf"]').href);
      return;
    }

    $$(".view").forEach((view) => {
      view.hidden = view.id !== `view-${active}`;
    });
    $$(".nav-tab").forEach((button) => {
      const selectedRoute = active === "doc" ? "blog" : active;
      const selected = button.dataset.routeTarget === selectedRoute;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-current", selected ? "page" : "false");
    });

    if (active === "doc") {
      renderDocRoute(entryId, anchor);
      return;
    }

    document.title = "Aoraku | Qingle Liu";
    if (anchor) {
      requestAnimationFrame(() => {
        const target = document.getElementById(anchor);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  function applyStaticLabels() {
    const researchTab = $('[data-route-target="scholar"]');
    if (researchTab) researchTab.textContent = "Research";

    const researchTitle = $("#scholar-title");
    if (researchTitle) researchTitle.textContent = "Research";

    const researchEyebrow = $("#view-scholar .section-heading .eyebrow");
    if (researchEyebrow) researchEyebrow.textContent = "Research";

    const miniProfileLine = $(".mini-profile span");
    if (miniProfileLine) miniProfileLine.textContent = "Department of Computer Science and Technology, Tsinghua University";

    const footerEmail = $(".site-footer a[href^='mailto:']");
    if (footerEmail) {
      footerEmail.href = `mailto:${footerContactEmail}`;
      footerEmail.textContent = footerContactEmail;
    }
  }

  function ensureHomepageStyles() {
    if ($("#homepage-20260706-styles")) return;
    const style = document.createElement("style");
    style.id = "homepage-20260706-styles";
    style.textContent = `
      .resume-section {
        padding-top: 1.8rem;
      }

      .fact-item > span {
        display: block;
        min-width: 0;
        max-width: 100%;
        overflow-wrap: anywhere;
      }

      .fact-item a {
        display: inline;
      }

      .resume-section > h2 {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        margin: 0 0 0.95rem;
        padding: 0.15rem 0 0.5rem;
        border-bottom: 1px solid rgba(66, 92, 134, 0.24);
        color: #233d63;
        font-family: var(--sans);
        font-size: clamp(1.08rem, 1.4vw, 1.28rem);
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .resume-section > h2::before {
        content: "";
        width: 36px;
        height: 4px;
        flex: 0 0 36px;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent), var(--accent-2));
      }

      .entry-topline h3 a {
        color: inherit;
        text-decoration-color: rgba(15, 118, 110, 0.42);
        text-underline-offset: 0.16em;
      }

      .paper-list {
        gap: 1.35rem;
      }

      .research-item {
        display: grid;
        grid-template-columns: minmax(240px, 34%) minmax(0, 1fr);
        gap: 1.2rem;
        align-items: start;
        padding: 1.35rem 0;
        border-top: 1px solid var(--line);
      }

      .research-thumb {
        display: block;
        aspect-ratio: 16 / 10;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #fffdf7;
      }

      .research-thumb img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        padding: 0.45rem;
        background: #fff;
      }

      .research-thumb.is-missing {
        display: grid;
        place-items: center;
        color: var(--muted);
        font-family: var(--mono);
        font-size: 0.8rem;
      }

      .research-thumb.is-missing::after {
        content: "Figure unavailable";
      }

      .research-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem 0.65rem;
        color: var(--muted);
        font-family: var(--mono);
        font-size: 0.8rem;
      }

      .research-item h2 {
        margin: 0.25rem 0 0.35rem;
        font-family: var(--serif);
        font-size: clamp(1.22rem, 2vw, 1.7rem);
        line-height: 1.12;
      }

      .research-authors {
        margin: 0;
        color: #464139;
        font-size: 0.94rem;
      }

      .research-abstract {
        max-width: 780px;
        margin: 0.65rem 0 0;
        color: #34312d;
        line-height: 1.72;
      }

      .research-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.85rem;
      }

      .research-link {
        min-height: 34px;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: rgba(255, 253, 247, 0.78);
        color: #2f2c27;
        padding: 0 0.65rem;
        text-decoration: none;
        font-size: 0.88rem;
        font-weight: 700;
      }

      .research-link:hover,
      .research-link:focus-visible {
        border-color: var(--accent-2);
        color: var(--accent-2);
      }

      .research-link svg {
        width: 15px;
        height: 15px;
      }

      @media (max-width: 760px) {
        .research-item {
          grid-template-columns: 1fr;
        }

        .research-thumb {
          max-width: 540px;
        }
      }

      @media (max-width: 860px) {
        .resume-layout,
        .resume-toc,
        .resume-panel,
        .mini-profile,
        .resume-toc nav {
          min-width: 0;
          max-width: 100%;
        }

        .resume-toc {
          overflow: hidden;
        }

        .resume-toc nav {
          width: 100%;
        }

        .mini-profile > div,
        .mini-profile strong,
        .mini-profile span,
        .resume-contact a,
        .resume-contact span {
          min-width: 0;
          max-width: 100%;
          overflow-wrap: anywhere;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderProfile() {
    if (!state.profile) return;

    $("#profile-name").textContent = state.profile.displayName || "Qingle Liu";
    $("#profile-headline").textContent = state.profile.headline || "";
    $("#profile-bio").textContent = state.profile.bio || "";
    $("#profile-avatar").src = state.profile.avatar || "assets/avatar.jpg";

    $("#quick-facts").innerHTML = (state.profile.quickFacts || [])
      .map((fact) => `<div class="fact-item"><span>${renderInline(fact)}</span></div>`)
      .join("");

    $("#social-links").innerHTML = (state.profile.socials || [])
      .map((item) => {
        const href = item.url || "#";
        const disabled = item.url ? "" : " is-disabled";
        const title = item.url ? item.label : `${item.label} coming soon`;
        return `
          <a class="social-link${disabled}" href="${escapeAttr(href)}" title="${escapeAttr(title)}">
            <i data-lucide="${escapeAttr(item.icon || "link")}"></i>
            <span>${escapeHtml(item.label)}</span>
          </a>
        `;
      })
      .join("");
  }

  function renderNews() {
    const target = $("#news-list");
    if (!state.news.length) {
      target.innerHTML = emptyState("No news yet.");
      return;
    }

    target.innerHTML = state.news
      .map(
        (item) => `
          <article class="news-item">
            <time datetime="${escapeAttr(item.date || "")}">${formatMonth(item.date)}</time>
            <div>
              <h3>${escapeHtml(item.title || "Untitled")}</h3>
              <p>${escapeHtml(item.body || "")}</p>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderPapers() {
    const target = $("#paper-list");
    if (!state.papers.length) {
      target.innerHTML = emptyState("No public papers yet.");
      return;
    }

    target.innerHTML = state.papers
      .map(renderResearchItem)
      .join("");

    $$(".research-thumb img", target).forEach((image) => {
      image.addEventListener("error", () => {
        const frame = image.closest(".research-thumb");
        if (frame) frame.classList.add("is-missing");
        image.remove();
      });
    });
  }

  function renderResearchItem(paper) {
    const links = paper.links || (paper.url ? [{ label: "Open", url: paper.url }] : []);
    const image = paper.image
      ? `
        <a class="research-thumb" href="${escapeAttr(paper.url || paper.image)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeAttr(paper.title || "paper")}">
          <img src="${escapeAttr(paper.image)}" alt="First figure from ${escapeAttr(paper.title || "paper")}" loading="lazy" />
        </a>
      `
      : "";

    return `
      <article class="research-item${paper.image ? "" : " research-item-text"}">
        ${image}
        <div class="research-body">
          <div class="research-meta">
            ${paper.date ? `<time datetime="${escapeAttr(paper.date)}">${formatMonth(paper.date)}</time>` : ""}
            ${paper.venue ? `<span>${escapeHtml(paper.venue)}</span>` : ""}
          </div>
          <h2>${escapeHtml(paper.title || "Untitled paper")}</h2>
          ${paper.authors ? `<p class="research-authors">${escapeHtml(paper.authors)}</p>` : ""}
          ${paper.authorNote ? `<p class="research-author-note">${escapeHtml(paper.authorNote)}</p>` : ""}
          ${paper.abstract ? `<p class="research-abstract">${escapeHtml(paper.abstract)}</p>` : ""}
          ${
            links.length
              ? `<div class="research-actions">${links
                  .map(
                    (link) => `
                      <a class="research-link" href="${escapeAttr(link.url)}" target="_blank" rel="noreferrer">
                        <i data-lucide="external-link"></i>
                        <span>${escapeHtml(link.label || "Open")}</span>
                      </a>
                    `
                  )
                  .join("")}</div>`
              : ""
          }
        </div>
      </article>
    `;
  }

  function renderBlog() {
    renderCategories();
    renderBlogList();
  }

  function renderCategories() {
    const counts = categoryOrder.reduce((acc, category) => ({ ...acc, [category.id]: 0 }), {});
    state.blog.forEach((entry) => {
      categoryOrder.forEach((category) => {
        if (matchesBlogCategory(entry, category.id)) {
          counts[category.id] += 1;
        }
      });
    });

    $("#blog-categories").innerHTML = categoryOrder
      .map(
        (category) => `
          <button class="category-button ${state.activeCategory === category.id ? "is-active" : ""}" type="button" data-category="${category.id}">
            <span>${escapeHtml(category.label)}</span>
            <strong>${counts[category.id] || 0}</strong>
          </button>
        `
      )
      .join("");

    $$(".category-button").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeCategory = button.dataset.category;
        hideReader();
        renderBlog();
      });
    });
  }

  function renderBlogList() {
    const target = $("#blog-list");
    const entries = state.blog.filter((entry) => matchesBlogCategory(entry, state.activeCategory));

    if (!entries.length) {
      target.innerHTML = emptyState("No entries yet.");
      return;
    }

    target.innerHTML = entries
      .map(
        (entry) => `
          <article class="blog-item">
            <div>
              <div class="item-meta">
                <span>${escapeHtml(getEntryCategoryDisplay(entry))}</span>
                <time datetime="${escapeAttr(entry.date || "")}">${formatDate(entry.date)}</time>
              </div>
              <h2>${escapeHtml(entry.title || "Untitled")}</h2>
              ${entry.summary ? `<p>${escapeHtml(entry.summary)}</p>` : ""}
              ${
                entry.tags && entry.tags.length
                  ? `<div class="tag-list">${entry.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>`
                  : ""
              }
            </div>
            <button class="text-button" type="button" data-entry-id="${escapeAttr(entry.id)}">Read</button>
          </article>
        `
      )
      .join("");

    $$("[data-entry-id]", target).forEach((button) => {
      button.addEventListener("click", () => openEntry(button.dataset.entryId));
    });
  }

  function matchesBlogCategory(entry, categoryId) {
    const categories = getEntryCategories(entry);
    if (categoryId === "essays") {
      return (
        categories.includes("essays") ||
        (entry.starred && (categories.includes("politics") || categories.includes("high-school")))
      );
    }
    return categories.includes(categoryId);
  }

  function getEntryCategories(entry) {
    if (Array.isArray(entry.categories) && entry.categories.length) {
      return entry.categories.filter(Boolean);
    }
    return entry.category ? [entry.category] : [];
  }

  function getEntryCategoryDisplay(entry) {
    if (Array.isArray(entry.categoryLabels) && entry.categoryLabels.length) {
      return entry.categoryLabels.filter(Boolean).join(" / ");
    }
    return entry.categoryLabel || "";
  }

  function bindReader() {
    const readerClose = $("#reader-close");
    if (readerClose) readerClose.addEventListener("click", hideReader);

    const docBack = $("#doc-back");
    if (docBack) {
      docBack.addEventListener("click", () => {
        window.location.hash = "#blog";
      });
    }
  }

  function openEntry(id) {
    if (!id) return;
    window.location.hash = `#doc/${encodeURIComponent(id)}`;
  }

  async function renderDocRoute(id, anchor = "") {
    const entry = state.blog.find((item) => item.id === id);
    const docMeta = $("#doc-meta");
    const docContent = $("#doc-content");
    const docToc = $("#doc-toc");

    if (!docMeta || !docContent || !docToc) return;

    if (!entry) {
      document.title = "Document not found | Aoraku";
      docMeta.innerHTML = `<h1 id="doc-title">Document not found</h1>`;
      docContent.innerHTML = emptyState("This document does not exist yet.");
      docToc.innerHTML = "";
      docToc.hidden = true;
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    document.title = `${entry.title || "Document"} | Aoraku`;
    docMeta.innerHTML = `
      <div class="item-meta" aria-label="Document metadata">
        <span>${escapeHtml(getEntryCategoryDisplay(entry))}</span>
        <time datetime="${escapeAttr(entry.date || "")}">${formatDate(entry.date)}</time>
      </div>
    `;
    docContent.innerHTML = `<div class="loading-line">Loading...</div>`;
    docToc.innerHTML = "";
    docToc.hidden = true;

    try {
      if (entry.type === "pdf") {
        const pdfSources = Array.isArray(entry.pdfs) && entry.pdfs.length ? entry.pdfs : [entry.source];
        docContent.innerHTML = `
          <div class="pdf-toolbar">
            ${pdfSources
              .map(
                (source, index) => `
                  <a class="text-button" href="${escapeAttr(source)}" target="_blank" rel="noreferrer">
                    ${pdfSources.length > 1 ? `Open PDF ${index + 1}` : "Open PDF"}
                  </a>
                `
              )
              .join("")}
          </div>
          ${pdfSources
            .map(
              (source, index) => `
                <iframe
                  class="pdf-frame"
                  src="${escapeAttr(source)}"
                  title="${escapeAttr(entry.title)}${pdfSources.length > 1 ? ` part ${index + 1}` : ""}"
                ></iframe>
              `
            )
            .join("")}
        `;
      } else if (entry.type === "docx") {
        docContent.innerHTML = await renderDocx(entry.source);
      } else {
        const response = await fetch(entry.source, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Could not load ${entry.source}`);
        const text = await response.text();
        docContent.innerHTML = renderDocumentText(text, entry.type, entry.source, entry.title);
      }

      const mainTitle = $("h1", docContent);
      if (mainTitle) mainTitle.id = "doc-title";
      highlightCodeBlocks(docContent);
      buildReaderToc(docContent, docToc, entry.id);
      if (window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise([docContent]).catch(console.warn);
      }
      if (window.lucide) {
        window.lucide.createIcons();
      }

      requestAnimationFrame(() => {
        const target = anchor ? document.getElementById(anchor) : null;
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "auto" });
        }
      });
    } catch (error) {
      console.warn(error);
      docContent.innerHTML = emptyState("This document could not be loaded.");
      docToc.innerHTML = "";
      docToc.hidden = true;
    }
  }


  function highlightCodeBlocks(root) {
    $$('pre code', root).forEach((code) => {
      const language = normalizeCodeLanguage(code);
      const source = code.textContent || '';
      if (window.hljs && language !== 'plaintext' && window.hljs.getLanguage(language)) {
        try {
          const highlighted = window.hljs.highlight(source, {
            language,
            ignoreIllegals: true
          });
          code.innerHTML = highlighted.value;
          code.classList.add('hljs', `language-${language}`);
          code.dataset.highlighted = 'yes';
          return;
        } catch {
          // Fall through to plain rendering.
        }
      }
      code.textContent = source;
      code.classList.add('hljs');
      code.dataset.highlighted = 'plain';
    });
  }

  function normalizeCodeLanguage(code) {
    const languageClass = Array.from(code.classList).find((name) => name.startsWith('language-'));
    const language = languageClass ? languageClass.replace('language-', '').toLowerCase() : '';
    const aliases = {
      asmx86: 'x86asm',
      asm: 'x86asm',
      'x86-64': 'x86asm',
      x64: 'x86asm',
      'c++': 'cpp',
      cc: 'cpp',
      cxx: 'cpp',
      sv: 'verilog',
      systemverilog: 'verilog',
      text: 'plaintext',
      txt: 'plaintext'
    };
    const normalized = aliases[language] || language || 'plaintext';
    if (languageClass) {
      code.classList.remove(languageClass);
    }
    code.classList.add(`language-${normalized}`);
    return normalized;
  }

  function hideReader() {
    const reader = $("#blog-reader");
    if (reader) reader.hidden = true;
  }

  async function renderDocx(source) {
    if (!window.mammoth) {
      return emptyState("DOCX rendering library is unavailable.");
    }
    const response = await fetch(source);
    if (!response.ok) throw new Error(`Could not load ${source}`);
    const arrayBuffer = await response.arrayBuffer();
    const result = await window.mammoth.convertToHtml({ arrayBuffer });
    return sanitize(result.value || "");
  }

  function renderDocumentText(text, type, source, title = "") {
    const [, rawBody] = parseFrontMatter(text);
    const body = normalizeDocumentTitle(rawBody, title);
    let html = "";
    if (type === "markdown" && window.marked) {
      const protectedMath = protectMarkdownMath(body);
      window.marked.setOptions({ gfm: true, breaks: false });
      html = sanitize(window.marked.parse(protectedMath.text));
      html = restoreProtectedMath(html, protectedMath.segments);
    } else {
      html = simpleMarkdown(body);
    }
    return resolveDocumentUrls(html, source);
  }

  function normalizeDocumentTitle(body, title) {
    const normalized = String(body || "").replace(/\r\n/g, "\n").replace(/^\uFEFF/, "");
    const safeTitle = String(title || "Untitled").trim() || "Untitled";
    const lines = normalized.split("\n");
    let index = 0;
    while (index < lines.length && !lines[index].trim()) index += 1;
    if (index < lines.length && /^#{1,2}\s+/.test(lines[index].trim())) {
      lines[index] = `# ${safeTitle}`;
    } else {
      lines.splice(index, 0, `# ${safeTitle}`, "");
    }
    return lines.join("\n");
  }

  function protectMarkdownMath(markdown) {
    const segments = [];
    const source = String(markdown || "").replace(/\r\n/g, "\n");
    let output = "";
    let fence = "";
    let index = 0;

    while (index < source.length) {
      const lineStart = index === 0 || source[index - 1] === "\n";
      if (lineStart) {
        const nextLineBreak = source.indexOf("\n", index);
        const lineEnd = nextLineBreak === -1 ? source.length : nextLineBreak;
        const line = source.slice(index, lineEnd);
        const lineChunk = source.slice(index, nextLineBreak === -1 ? source.length : nextLineBreak + 1);
        const fenceMatch = line.match(/^\s*(```|~~~)/);
        if (fenceMatch) {
          if (!fence) {
            fence = fenceMatch[1];
          } else if (fence === fenceMatch[1]) {
            fence = "";
          }
          output += lineChunk;
          index += lineChunk.length;
          continue;
        }
        if (fence) {
          output += lineChunk;
          index += lineChunk.length;
          continue;
        }
      }

      if (source.startsWith("$$", index)) {
        const end = findDisplayMathEnd(source, index + 2);
        if (end !== -1) {
          const raw = source.slice(index, end + 2);
          output += addMathSegment(normalizeDisplayMath(raw, source, index), segments);
          index = end + 2;
          continue;
        }
      }
      if (source[index] === "$" && source[index + 1] !== "$" && source[index - 1] !== "$" && source[index - 1] !== "\\") {
        const end = findInlineMathEnd(source, index + 1);
        if (end !== -1) {
          output += addMathSegment(source.slice(index, end + 1), segments);
          index = end + 1;
          continue;
        }
      }
      output += source[index];
      index += 1;
    }
    return { text: output, segments };
  }

  function findDisplayMathEnd(text, start) {
    for (let index = start; index < text.length - 1; index += 1) {
      if (text[index] === "$" && text[index + 1] === "$" && text[index - 1] !== "\\") return index;
    }
    return -1;
  }

  function normalizeDisplayMath(raw, source, start) {
    const lineStart = source.lastIndexOf("\n", start - 1) + 1;
    const before = source.slice(lineStart, start);
    const inBlockquote = /^\s*(?:>\s*)+$/.test(before);
    const display = inBlockquote
      ? raw.split("\n").map((line, lineIndex) => (
          lineIndex === 0 ? line : line.replace(/^\s*(?:>\s*)+/, "")
        )).join("\n")
      : raw;
    return `\\[\n${display.slice(2, -2).trim()}\n\\]`;
  }

  function findInlineMathEnd(text, start) {
    for (let index = start; index < text.length; index += 1) {
      if (text[index] === "\n") return -1;
      if (text[index] === "$" && text[index - 1] !== "\\" && text[index + 1] !== "$") return index;
    }
    return -1;
  }

  function addMathSegment(raw, segments) {
    const token = `AORAKUMATHTOKEN${segments.length}X`;
    segments.push({ token, raw });
    return token;
  }

  function restoreProtectedMath(html, segments) {
    return segments.reduce((value, segment) => (
      value.split(segment.token).join(escapeHtml(segment.raw))
    ), html);
  }
  function resolveDocumentUrls(html, source) {
    const template = document.createElement("template");
    template.innerHTML = html;
    const base = new URL(source, window.location.href);
    $$("img[src], a[href], iframe[src]", template.content).forEach((node) => {
      const attr = node.hasAttribute("src") ? "src" : "href";
      const value = node.getAttribute(attr);
      if (!value || value.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(value)) return;
      node.setAttribute(attr, new URL(value, base).href);
    });
    return template.innerHTML;
  }

  function parseFrontMatter(text) {
    const normalized = text.replace(/\r\n/g, "\n");
    if (!normalized.startsWith("---\n")) return [{}, text];
    const end = normalized.indexOf("\n---\n", 4);
    if (end === -1) return [{}, text];
    return [{}, normalized.slice(end + 5)];
  }

  function buildReaderToc(contentRoot, tocRoot, entryId = "") {
    const headings = $$("h2, h3", contentRoot);
    if (!headings.length) {
      tocRoot.hidden = true;
      return;
    }

    const seen = new Map();
    tocRoot.hidden = false;
    tocRoot.innerHTML = headings
      .map((heading, index) => {
        const baseId = heading.id || `section-${index + 1}-${slugify(heading.textContent) || "part"}`;
        const nextCount = (seen.get(baseId) || 0) + 1;
        seen.set(baseId, nextCount);
        heading.id = nextCount === 1 ? baseId : `${baseId}-${nextCount}`;
        const href = entryId
          ? `#doc/${encodeURIComponent(entryId)}/${encodeURIComponent(heading.id)}`
          : `#blog/${encodeURIComponent(heading.id)}`;
        return `<a class="${heading.tagName.toLowerCase()}" href="${escapeAttr(href)}">${escapeHtml(heading.textContent)}</a>`;
      })
      .join("");
  }

  function renderInline(value) {
    if (!value) return "";
    if (window.marked?.parseInline) {
      return sanitize(window.marked.parseInline(String(value)));
    }
    return simpleInline(String(value));
  }

  function simpleMarkdown(text) {
    const blocks = text
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        if (/^###\s+/.test(block)) return `<h3>${simpleInline(block.replace(/^###\s+/, ""))}</h3>`;
        if (/^##\s+/.test(block)) return `<h2>${simpleInline(block.replace(/^##\s+/, ""))}</h2>`;
        if (/^#\s+/.test(block)) return `<h2>${simpleInline(block.replace(/^#\s+/, ""))}</h2>`;
        if (/^[-*]\s+/m.test(block)) {
          return `<ul>${block
            .split("\n")
            .map((line) => line.replace(/^[-*]\s+/, "").trim())
            .filter(Boolean)
            .map((line) => `<li>${simpleInline(line)}</li>`)
            .join("")}</ul>`;
        }
        return `<p>${simpleInline(block).replace(/\n/g, "<br>")}</p>`;
      })
      .join("");
    return sanitize(blocks);
  }

  function simpleInline(value) {
    return escapeHtml(value)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  }

  function sanitize(html) {
    return window.DOMPurify ? window.DOMPurify.sanitize(html) : html;
  }

  function emptyState(message) {
    return `<div class="empty-state">${escapeHtml(message)}</div>`;
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    }).format(date);
  }

  function formatMonth(value) {
    if (!value) return "";
    const match = String(value).match(/^(\d{4})-(\d{2})/);
    if (!match) return formatDate(value);
    const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short"
    }).format(date);
  }

  function slugify(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-|-$/g, "");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }
})();




