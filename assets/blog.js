(function () {
  const state = {
    blog: [],
    activeCategory: "selected",
    renderedId: null,
    request: 0
  };

  let categoryOrder = [];
  let stopReaderTracking = () => {};

  const footerContactEmail = "lql24@mails.tsinghua.edu.cn";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    $("#year").textContent = new Date().getFullYear();
    window.addEventListener("hashchange", updateRoute);
    window.addEventListener("popstate", updateRoute);
    document.addEventListener("click", event => {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute("download")) return;
      if (link.classList.contains("skip-link")) {
        event.preventDefault();
        const main = $("#main-content"); main.tabIndex = -1; main.focus(); main.scrollIntoView();
        return;
      }
      const url = new URL(link.getAttribute("href"), location.href);
      if (url.origin === location.origin && /^\/blog(?:\/|$)/.test(url.pathname)) {
        event.preventDefault();
        $('#selected-menu').open = false;
        if (link.classList.contains('category-button') && new URLSearchParams(location.search).get('view') === 'list') url.searchParams.set('view','list');
        navigate(url.pathname + url.search);
      }
    });
    bindReader();
    $('#layout-toggle').addEventListener('click', () => {
      const list = new URLSearchParams(location.search).get('view') === 'list';
      navigate(`/blog/${state.activeCategory}${list ? '' : '?view=list'}`);
    });

    const index = await getJson("data/blog-index.json", { entries: [] });
    state.blog = index.entries || [];
    categoryOrder = index.categories || [];
    $('#selected-articles').innerHTML = state.blog.filter(e => e.selected).map(e => `<a href="/blog/${e.id}"><small>${escapeHtml(getEntryCategoryDisplay(e))}</small>${escapeHtml(e.title)}</a>`).join('') || '<p>暂无精選文章</p>';
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

  function navigate(url) {
    history.pushState({}, "", url);
    updateRoute();
  }

  function parseRoute() {
    const legacy = location.hash.match(/^#doc\/([^/]+)(?:\/(.*))?$/);
    if (legacy) {
      const key = decodeURIComponent(legacy[1]);
      const entry = state.blog.find(item => item.id === key || item.legacyId === key);
      const section = decodeURIComponent(legacy[2] || "").match(/^section-(\d+)/);
      if (entry) history.replaceState({}, "", `/blog/${entry.id}${section ? `?section=${section[1]}` : ''}`);
    } else if (location.hash === '#blog') {
      history.replaceState({}, "", '/blog');
    }
    const path = location.pathname.replace(/\/+$/, '');
    const slug = path.split('/')[2] || '';
    const list = new URLSearchParams(location.search).get('view') === 'list';
    const section = new URLSearchParams(location.search).get('section');
    return {
      active: /^\d+$/.test(slug) ? 'doc' : (!slug && !list ? 'metro' : 'blog'),
      entryId: slug,
      category: categoryOrder.some(c => c.id === slug) ? slug : 'selected',
      anchor: /^\d+$/.test(section || '') ? `section-${section}` : ''
    };
  }

  function scrollToSection(anchor) {
    requestAnimationFrame(() => {
      const target = anchor && document.getElementById(anchor);
      if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
      else window.scrollTo({top:0, behavior:'auto'});
    });
  }

  function updateRoute() {
    const { active, entryId, category, anchor } = parseRoute();
    stopReaderTracking();
    window.StationPlatform.cancel();
    const list = new URLSearchParams(location.search).get('view') === 'list';
    $('#view-blog').classList.toggle('list-mode', list);
    $('#layout-label').textContent = list ? '路线图模式' : '列表模式';
    $('#layout-toggle').setAttribute('aria-pressed', String(list));
    document.body.dataset.blogView = active;
    $('#selected-menu').open = false;
    $$(".view").forEach(view => { view.hidden = view.id !== `view-${active}`; });
    if (active === 'doc') {
      if (state.renderedId === entryId) { trackReader(); scrollToSection(anchor); }
      else renderDocRoute(entryId, anchor);
      return;
    }
    state.request += 1;
    state.renderedId = null;
    state.activeCategory = category;
    renderBlog();
    document.title = active === 'metro' ? "Aoraku's Blog: Cyber Metro" : `${categoryOrder.find(c => c.id === category)?.label || 'Blog'} | Cyber Metro`;
    window.scrollTo({top:0, behavior:'auto'});
  }

  function renderBlog() {
    renderCategories();
    renderBlogList();
    const category = categoryOrder.find(c => c.id === state.activeCategory);
    $('#blog-title').textContent = category?.label || '精選';
    const selected = state.activeCategory === 'selected';
    const line = document.body.dataset.blogView === 'metro' ? 'ak' : selected ? 'selected' : ['highschool','cst','frontier'].includes(state.activeCategory) ? 'g' : 'ak';
    document.body.dataset.line = line;
    $('#station-badge').hidden = selected;
    $('#station-badge').className = `line-symbol ${line}`;
    $('#station-badge').innerHTML = selected ? '' : window.CyberMetro.lineIcon(line);
    window.StationPlatform.render(document.body.dataset.blogView === 'blog' ? state.activeCategory : null, navigate);
  }

  function renderCategories() {
    $("#blog-categories").innerHTML = categoryOrder
      .map(
        (category) => `
          <a class="category-button ${state.activeCategory === category.id ? "is-active" : ""}" href="/blog/${category.id}" ${state.activeCategory === category.id ? 'aria-current="page"' : ""}>
            <span>${escapeHtml(category.label)}</span>
          </a>
        `
      )
      .join("");

  }

  function renderBlogList() {
    const target = $("#blog-list");
    const entries = state.blog.filter((entry) => matchesBlogCategory(entry, state.activeCategory));

    if (!entries.length) {
      target.innerHTML = "";
      return;
    }

    target.innerHTML = entries.map(entry => `
      <a class="article-card" href="/blog/${entry.id}" aria-label="${escapeAttr(entry.title)}">
        <div class="card-meta"><time datetime="${escapeAttr(entry.date || '')}">${escapeHtml(entry.date || '')}</time></div>
        <h2>${escapeHtml(entry.title || 'Untitled')}</h2>
        ${entry.summary ? `<p class="card-summary">${escapeHtml(entry.summary)}</p>` : ''}
        <span class="card-category">${escapeHtml(getEntryCategoryDisplay(entry))}</span>
      </a>`).join('');
  }

  function matchesBlogCategory(entry, categoryId) {
    return categoryId === 'selected' ? entry.selected : getEntryCategories(entry).includes(categoryId);
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
        navigate(`/blog/${state.activeCategory}`);
      });
    }
  }

  async function renderDocRoute(id, anchor = "") {
    const request = ++state.request;
    state.renderedId = null;
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

    state.activeCategory = getEntryCategories(entry).find(c => ["highschool","cst","frontier"].includes(c)) || getEntryCategories(entry)[0] || "selected";
    $('#doc-back-label').textContent = categoryOrder.find(c => c.id === state.activeCategory)?.label || '路線図';
    renderBlog();
    document.title = `${entry.title || "Document"} | Aoraku`;
    docMeta.innerHTML = `
      <div class="item-meta" aria-label="Document metadata">
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
          <h1>${escapeHtml(entry.title)}</h1>
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
        const html = await renderDocx(entry.source);
        if(request !== state.request) return;
        docContent.innerHTML = `<h1>${escapeHtml(entry.title)}</h1>` + html;
      } else {
        const response = await fetch(entry.source, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Could not load ${entry.source}`);
        const text = await response.text();
        if(request !== state.request) return;
        docContent.innerHTML = renderDocumentText(text, entry.type, entry.source, entry.title);
      }

      if(request !== state.request) return;
      state.renderedId = id;
      const mainTitle = $("h1", docContent);
      if (mainTitle) mainTitle.id = "doc-title";
      highlightCodeBlocks(docContent);
      buildReaderToc(docContent, docToc, entry.id);
      if (window.MathJax?.typesetPromise) {
        await window.MathJax.typesetPromise([docContent]).catch(console.warn);
        if(request !== state.request) return;
      }
      if (window.lucide) {
        window.lucide.createIcons();
      }

      trackReader();
      requestAnimationFrame(() => {
        const target = anchor ? document.getElementById(anchor) : null;
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "auto" });
        }
      });
    } catch (error) {
      if(request !== state.request) return;
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
    const [meta, rawBody] = parseFrontMatter(text);
    const body = normalizeDocumentTitle(rawBody, title, meta.title);
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

  function normalizeDocumentTitle(body, title, sourceTitle = title) {
    const normalized = String(body || "").replace(/\r\n/g, "\n").replace(/^\uFEFF/, "");
    const safeTitle = String(title || "Untitled").trim() || "Untitled";
    const lines = normalized.split("\n");
    let index = 0;
    while (index < lines.length && !lines[index].trim()) index += 1;
    const heading = index < lines.length && lines[index].trim().match(/^#{1,2}\s+(.+?)\s*#*$/);
    const plain = value => String(value).replace(/<[^>]*>/g, "").replace(/[*_`]/g, "").trim();
    if (heading && [safeTitle, sourceTitle].some(t => plain(heading[1]) === plain(t || ""))) {
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
    const base = new URL(source, document.baseURI);
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
    const match = normalized.slice(4, end).match(/^title:\s*(.*?)\s*$/m);
    const title = match ? match[1].replace(/^([\"'])(.*)\1$/, "$2") : "";
    return [{ title }, normalized.slice(end + 5)];
  }

  function buildReaderToc(contentRoot, tocRoot, entryId = "") {
    const headings = $$("h1, h2, h3", contentRoot).filter(h => h.id !== "doc-title");
    if (!headings.length) {
      tocRoot.hidden = true;
      return;
    }

    tocRoot.hidden = false;
    tocRoot.innerHTML = headings
      .map((heading, index) => {
        heading.id = `section-${index + 1}`;
        const href = `/blog/${entryId}?section=${index + 1}`;
        return `<a class="${heading.tagName.toLowerCase()}" href="${escapeAttr(href)}">${escapeHtml(heading.textContent)}</a>`;
      })
      .join("");
  }

  function trackReader() {
    stopReaderTracking();
    const content = $('#doc-content'), toc = $('#doc-toc');
    const headings = $$('h1, h2, h3', content).filter(h => h.id !== 'doc-title');
    const links = $$('a', toc);
    if (!headings.length || !links.length) return;
    let frame = 0, current = -1;
    const update = () => {
      frame = 0;
      const threshold = $('.doc-header').getBoundingClientRect().height + 24;
      let index = 0;
      for (let i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top <= threshold) index = i;
        else break;
      }
      if (window.scrollY + innerHeight >= document.documentElement.scrollHeight - 3) index = headings.length - 1;
      if (index === current) return;
      current = index;
      links.forEach((link, i) => {
        link.classList.toggle('is-active', i === index);
        if (i === index) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      const active = links[index], bounds = toc.getBoundingClientRect(), item = active.getBoundingClientRect();
      if (item.top < bounds.top || item.bottom > bounds.bottom) toc.scrollTop += item.top - bounds.top - bounds.height / 3;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(schedule);
    resize.observe(content);
    window.addEventListener('scroll', schedule, {passive:true});
    window.addEventListener('resize', schedule);
    stopReaderTracking = () => {
      cancelAnimationFrame(frame); resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
    schedule();
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




