/**
 * Akropolis Restaurant — Speisekarte page logic
 * Renders MENU_DATA, handles group toggle (Essen/Getränke), category pills (jump nav)
 * and live search filtering.
 */
(function () {
  "use strict";
  if (typeof MENU_DATA === "undefined") return;

  const contentEl = document.getElementById("menuContent");
  const pillsEl = document.getElementById("menuPills");
  const groupBtns = document.querySelectorAll(".menu-group-btn");
  const searchInput = document.getElementById("menuSearch");
  const searchWrap = document.getElementById("menuSearchWrap");
  const searchClear = document.getElementById("menuSearchClear");
  const emptyState = document.getElementById("menuEmpty");

  let activeGroup = "food";
  let searchTerm = "";

  const eur = (n) => n.toFixed(2).replace(".", ",") + " €";

  const normalize = (s) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

  function tagsHtml(item) {
    let out = "";
    if (item.badge) out += `<span class="tag tag-badge">${item.badge}</span>`;
    if (item.veg) out += `<span class="tag tag-veg">Vegetarisch</span>`;
    if (item.spicy) out += `<span class="tag tag-spicy">Scharf</span>`;
    return out ? `<div class="menu-item-tags">${out}</div>` : "";
  }

  function itemHtml(item) {
    const searchBlob = normalize(item.name + " " + (item.desc || ""));
    const matches = !searchTerm || searchBlob.includes(searchTerm);
    return `
      <article class="menu-item reveal" data-search="${matches ? "1" : "0"}" style="${matches ? "" : "display:none;"}">
        <div class="menu-item-main">
          <div class="menu-item-name">
            ${item.num ? `<span class="num">${item.num}</span>` : ""}
            <b>${item.name}</b>
          </div>
          ${item.desc ? `<p class="menu-item-desc">${item.desc}</p>` : ""}
          ${tagsHtml(item)}
        </div>
        <div class="menu-item-price">${eur(item.price)}</div>
      </article>`;
  }

  function categoryHtml(cat, groupId) {
    const items = cat.items.map(itemHtml).join("");
    return `
      <section class="menu-category" id="cat-${groupId}-${cat.id}" data-cat="${cat.id}">
        <div class="menu-category-head reveal">
          <div>
            <h2>${cat.name}</h2>
            ${cat.subtitle ? `<p>${cat.subtitle}</p>` : ""}
          </div>
          <span class="menu-category-count">${cat.items.length} Gerichte</span>
        </div>
        <div class="menu-items">${items}</div>
      </section>`;
  }

  function renderPills(groupId) {
    const cats = MENU_DATA[groupId];
    pillsEl.innerHTML = cats
      .map(
        (cat, i) =>
          `<a href="#cat-${groupId}-${cat.id}" class="menu-pill${i === 0 ? " is-active" : ""}" data-cat="${cat.id}">${cat.name}</a>`
      )
      .join("");
  }

  function render(groupId) {
    const cats = MENU_DATA[groupId];
    contentEl.innerHTML = cats.map((cat) => categoryHtml(cat, groupId)).join("");
    renderPills(groupId);
    initReveal();
    initPillTracking();
    applySearch();
  }

  /* ---------------- Group toggle ---------------- */
  groupBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.dataset.group;
      if (group === activeGroup) return;
      activeGroup = group;
      groupBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
      render(activeGroup);
      window.scrollTo({ top: document.getElementById("menuToolbar").offsetTop - 4, behavior: "smooth" });
    });
  });

  /* ---------------- Pill active tracking on scroll ---------------- */
  let pillObserver = null;
  function initPillTracking() {
    if (pillObserver) pillObserver.disconnect();
    const sections = document.querySelectorAll(".menu-category");
    if (!("IntersectionObserver" in window) || !sections.length) return;
    pillObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const cat = entry.target.dataset.cat;
          pillsEl.querySelectorAll(".menu-pill").forEach((p) => p.classList.toggle("is-active", p.dataset.cat === cat));
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    sections.forEach((s) => pillObserver.observe(s));
  }

  /* ---------------- Reveal on scroll (lightweight, decoupled from animations.js timing) ---------------- */
  function initReveal() {
    const els = document.querySelectorAll(".menu-content .reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            o.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => obs.observe(el));
  }

  /* ---------------- Search ---------------- */
  function applySearch() {
    let totalVisible = 0;
    document.querySelectorAll(".menu-category").forEach((section) => {
      let visibleInCat = 0;
      section.querySelectorAll(".menu-item").forEach((item) => {
        const blob = normalize(item.querySelector("b").textContent + " " + (item.querySelector(".menu-item-desc")?.textContent || ""));
        const match = !searchTerm || blob.includes(searchTerm);
        item.style.display = match ? "" : "none";
        if (match) visibleInCat++;
      });
      section.style.display = visibleInCat === 0 ? "none" : "";
      totalVisible += visibleInCat;
    });
    emptyState.style.display = totalVisible === 0 ? "block" : "none";
    pillsEl.parentElement.style.display = searchTerm ? "none" : "";
  }

  searchInput?.addEventListener("input", () => {
    searchTerm = normalize(searchInput.value.trim());
    searchWrap.classList.toggle("has-value", !!searchInput.value);
    applySearch();
  });
  searchClear?.addEventListener("click", () => {
    searchInput.value = "";
    searchTerm = "";
    searchWrap.classList.remove("has-value");
    applySearch();
    searchInput.focus();
  });

  /* ---------------- Deep link support (?q=gyros or #cat-food-fisch) ---------------- */
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q");

  render(activeGroup);

  if (initialQuery) {
    searchInput.value = initialQuery;
    searchTerm = normalize(initialQuery);
    searchWrap.classList.add("has-value");
    applySearch();
  }
})();
