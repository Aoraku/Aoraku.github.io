(function () {
  const state = {
    profile: null,
    resume: null,
    news: [],
    papers: [],
    blog: [],
    activeCategory: "all"
  };

  const categoryOrder = [
    { id: "all", label: "All" },
    { id: "essays", label: "\u6742\u6587" },
    { id: "cst-notes", label: "CST\u4e13\u4e1a\u8bfe\u6587\u6863" },
    { id: "journals", label: "\u65e5\u5468\u6708\u5b63\u5e74\u8bb0" }
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    $("#year").textContent = new Date().getFullYear();
    bindNavigation();
    bindReader();

    const [profile, resume, news, papers, blog] = await Promise.all([
      getJson("data/profile.json", {}),
      getJson("data/resume.json", {}),
      getJson("data/news.json", []),
      getJson("data/papers.json", { papers: [] }),
      getJson("data/blog-index.json", { entries: [] })
    ]);

    state.profile = profile;
    state.resume = resume;
    state.news = Array.isArray(news) ? news : [];
    state.papers = Array.isArray(papers) ? papers : papers.papers || [];
    state.blog = blog.entries || [];

    renderProfile();
    renderNews();
    renderResume();
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
    $$(".nav-tab").forEach((button) => {
      button.addEventListener("click", () => {
        window.location.hash = `#${button.dataset.routeTarget}`;
      });
    });
    window.addEventListener("hashchange", updateRoute);
  }

  function parseRoute() {
    const raw = window.location.hash.replace(/^#/, "");
    const [route, rawAnchor] = raw.split("/");
    const valid = new Set(["main", "info", "scholar", "blog"]);
    let anchor = rawAnchor || "";
    try {
      anchor = decodeURIComponent(anchor);
    } catch {
      // Keep the raw anchor if the browser hash contains an incomplete escape sequence.
    }
    return {
      active: valid.has(route) ? route : "main",
      anchor: valid.has(route) ? anchor : ""
    };
  }

  function updateRoute() {
    const { active, anchor } = parseRoute();

    $$(".view").forEach((view) => {
      view.hidden = view.id !== `view-${active}`;
    });
    $$(".nav-tab").forEach((button) => {
      const selected = button.dataset.routeTarget === active;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-current", selected ? "page" : "false");
    });
    if (anchor) {
      requestAnimationFrame(() => {
        const target = document.getElementById(anchor);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  function renderProfile() {
    if (!state.profile) return;

    $("#profile-name").textContent = state.profile.displayName || "Qingle Liu";
    $("#profile-headline").textContent = state.profile.headline || "";
    $("#profile-bio").textContent = state.profile.bio || "";
    $("#profile-avatar").src = state.profile.avatar || "assets/avatar.jpg";

    $("#quick-facts").innerHTML = (state.profile.quickFacts || [])
      .map((fact) => `<div class="fact-item">${escapeHtml(fact)}</div>`)
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
            <time datetime="${escapeAttr(item.date || "")}">${formatDate(item.date)}</time>
            <div>
              <h3>${escapeHtml(item.title || "Untitled")}</h3>
              <p>${escapeHtml(item.body || "")}</p>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderResume() {
    const resume = state.resume || {};
    const header = $("#resume-header");
    const sections = $("#resume-sections");
    const toc = $("#resume-toc-links");

    header.innerHTML = `
      <h2>${escapeHtml(resume.name || "Qingle Liu")}</h2>
      <div class="resume-contact">
        ${contactLink("mail", resume.email, resume.email ? `mailto:${resume.email}` : "")}
        ${contactLink("phone", resume.phone, resume.phone ? `tel:${resume.phone.replace(/\s+/g, "")}` : "")}
        <span><i data-lucide="map-pin"></i>${escapeHtml(resume.affiliation || "")}</span>
      </div>
    `;

    const sectionList = resume.sections || [];
    toc.innerHTML = sectionList
      .map((section) => `<a href="#info/${escapeAttr(section.id)}">${escapeHtml(section.title)}</a>`)
      .join("");

    sections.innerHTML = sectionList
      .map(
        (section) => `
          <section id="${escapeAttr(section.id)}" class="resume-section">
            <h2>${escapeHtml(section.title)}</h2>
            ${(section.entries || []).map(renderResumeEntry).join("")}
          </section>
        `
      )
      .join("");
  }

  function renderResumeEntry(entry) {
    const bullets = entry.bullets || [];
    return `
      <article class="resume-entry">
        <div class="entry-topline">
          <h3>${escapeHtml(entry.title || "")}</h3>
          ${entry.date ? `<time>${escapeHtml(entry.date)}</time>` : ""}
        </div>
        <div class="entry-subline">
          ${entry.subtitle ? `<span>${renderInline(entry.subtitle)}</span>` : ""}
          ${entry.meta ? `<span>${escapeHtml(entry.meta)}</span>` : ""}
        </div>
        ${
          bullets.length
            ? `<ul>${bullets.map((bullet) => `<li>${renderInline(bullet)}</li>`).join("")}</ul>`
            : ""
        }
      </article>
    `;
  }

  function contactLink(icon, label, href) {
    if (!label) return "";
    return href
      ? `<a href="${escapeAttr(href)}"><i data-lucide="${icon}"></i>${escapeHtml(label)}</a>`
      : `<span><i data-lucide="${icon}"></i>${escapeHtml(label)}</span>`;
  }

  function renderPapers() {
    const target = $("#paper-list");
    if (!state.papers.length) {
      target.innerHTML = emptyState("No public papers yet.");
      return;
    }

    target.innerHTML = state.papers
      .map(
        (paper) => `
          <article class="paper-item">
            <div>
              <h2>${escapeHtml(paper.title || "Untitled paper")}</h2>
              <p>${escapeHtml(paper.authors || "")}</p>
              <span>${escapeHtml([paper.venue, paper.year].filter(Boolean).join(" | "))}</span>
            </div>
            ${
              paper.url
                ? `<a class="text-button" href="${escapeAttr(paper.url)}" target="_blank" rel="noreferrer">Open</a>`
                : ""
            }
          </article>
        `
      )
      .join("");
  }

  function renderBlog() {
    renderCategories();
    renderBlogList();
  }

  function renderCategories() {
    const counts = state.blog.reduce(
      (acc, entry) => {
        acc.all += 1;
        acc[entry.category] = (acc[entry.category] || 0) + 1;
        return acc;
      },
      { all: 0 }
    );

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
    const entries =
      state.activeCategory === "all"
        ? state.blog
        : state.blog.filter((entry) => entry.category === state.activeCategory);

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
                <span>${escapeHtml(entry.categoryLabel || "")}</span>
                <time datetime="${escapeAttr(entry.date || "")}">${formatDate(entry.date)}</time>
                <span>${escapeHtml((entry.type || "").toUpperCase())}</span>
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

  function bindReader() {
    $("#reader-close").addEventListener("click", hideReader);
  }

  async function openEntry(id) {
    const entry = state.blog.find((item) => item.id === id);
    if (!entry) return;

    const reader = $("#blog-reader");
    const readerMeta = $("#reader-meta");
    const readerContent = $("#reader-content");
    const readerToc = $("#reader-toc");

    reader.hidden = false;
    readerMeta.innerHTML = `
      <div class="item-meta">
        <span>${escapeHtml(entry.categoryLabel || "")}</span>
        <time datetime="${escapeAttr(entry.date || "")}">${formatDate(entry.date)}</time>
        <span>${escapeHtml((entry.type || "").toUpperCase())}</span>
      </div>
      <h2>${escapeHtml(entry.title || "Untitled")}</h2>
    `;
    readerContent.innerHTML = `<div class="loading-line">Loading...</div>`;
    readerToc.innerHTML = "";

    try {
      if (entry.type === "pdf") {
        readerContent.innerHTML = `<iframe class="pdf-frame" src="${escapeAttr(entry.source)}" title="${escapeAttr(entry.title)}"></iframe>`;
      } else if (entry.type === "docx") {
        readerContent.innerHTML = await renderDocx(entry.source);
      } else {
        const response = await fetch(entry.source, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Could not load ${entry.source}`);
        const text = await response.text();
        readerContent.innerHTML = renderDocumentText(text, entry.type, entry.source);
      }
      buildReaderToc(readerContent, readerToc);
      if (window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise([readerContent]).catch(console.warn);
      }
      reader.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      console.warn(error);
      readerContent.innerHTML = emptyState("This document could not be loaded.");
    }
  }

  function hideReader() {
    $("#blog-reader").hidden = true;
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

  function renderDocumentText(text, type, source) {
    const [, body] = parseFrontMatter(text);
    let html = "";
    if (type === "markdown" && window.marked) {
      window.marked.setOptions({ gfm: true, breaks: false });
      html = sanitize(window.marked.parse(body));
    } else {
      html = simpleMarkdown(body);
    }
    return resolveDocumentUrls(html, source);
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

  function buildReaderToc(contentRoot, tocRoot) {
    const headings = $$("h2, h3", contentRoot);
    if (!headings.length) {
      tocRoot.hidden = true;
      return;
    }
    tocRoot.hidden = false;
    tocRoot.innerHTML = headings
      .map((heading, index) => {
        if (!heading.id) heading.id = `section-${index + 1}-${slugify(heading.textContent)}`;
        return `<a class="${heading.tagName.toLowerCase()}" href="#blog/${escapeAttr(heading.id)}">${escapeHtml(heading.textContent)}</a>`;
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




