/* =========================================================
   ALAEAI – ULTIMATE SUPER SCRIPT.JS
   - Search + filters (type + origin)
   - Card click → premium modal
   - Admin mode (simple login)
   - Lazy image loading + no duplicates
   - Keyword tooltips
   - Smooth, safe, all in one file
   ========================================================= */

let isAdmin = false;
let lessons = [];
let currentSearch = "";
let currentCategory = "toutes";
let currentOrigin = "toutes";

let lessonModal;
let lessonModalContent;
let lessonModalClose;
let tooltipEl;

/* -----------------------------
   INIT
----------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  initTooltip();
  initLessons();
  initSearch();
  initCategoryFilters();
  initOriginFilters();
  initAdminLogin();
  initHeroButtons();
  initLessonModal();
  initLessonCardClicks();
  initLazyImages();
  applyFilters();
});

/* -----------------------------
   LESSONS COLLECTOR
----------------------------- */

function initLessons() {
  const cards = document.querySelectorAll(".lesson-card");
  lessons = Array.from(cards).map(card => {
    const title = (card.querySelector(".lesson-title")?.textContent || "").trim();
    const typeLabel = (card.querySelector(".lesson-type-label")?.textContent || "").trim().toLowerCase();
    const description = (card.querySelector(".lesson-description")?.textContent || "").trim();
    const bodyText = (card.querySelector(".lesson-body")?.innerText || "").trim();

    const type = card.dataset.type || inferTypeFromLabel(typeLabel);
    const origin = (card.dataset.origin || "officielle").toLowerCase();

    return {
      el: card,
      title,
      type,
      origin,
      searchable: (title + " " + description + " " + bodyText).toLowerCase()
    };
  });
}

function inferTypeFromLabel(label) {
  if (label.includes("orthographe")) return "orthographe";
  if (label.includes("grammaire")) return "grammaire";
  if (label.includes("conjugaison")) return "conjugaison";
  if (label.includes("vocabulaire")) return "vocabulaire";
  if (label.includes("expression")) return "expression écrite";
  if (label.includes("compréhension")) return "compréhension orale";
  return "autre";
}

/* -----------------------------
   SEARCH
----------------------------- */

function initSearch() {
  const searchBoxInput = document.querySelector(".search-box input");
  const searchBtn = document.querySelector(".search-btn");

  if (!searchBoxInput) return;

  searchBoxInput.addEventListener("input", () => {
    currentSearch = searchBoxInput.value.toLowerCase();
    applyFilters();
  });

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      currentSearch = searchBoxInput.value.toLowerCase();
      applyFilters();
    });
  }
}

/* -----------------------------
   CATEGORY FILTERS (TYPE)
----------------------------- */

function initCategoryFilters() {
  const buttons = document.querySelectorAll(".category-btn");
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = (btn.dataset.category || "toutes").toLowerCase();
      applyFilters();
    });
  });
}

/* -----------------------------
   ORIGIN FILTERS (OFFICIELLE / UPLOADÉE / CRÉÉE)
----------------------------- */

function initOriginFilters() {
  const chips = document.querySelectorAll(".filter-chip");
  if (!chips.length) return;

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentOrigin = (chip.dataset.origin || "toutes").toLowerCase();
      applyFilters();
    });
  });
}

/* -----------------------------
   APPLY FILTERS
----------------------------- */

function applyFilters() {
  let visibleCount = 0;

  lessons.forEach(lesson => {
    const matchesSearch =
      !currentSearch ||
      lesson.searchable.includes(currentSearch);

    const matchesCategory =
      currentCategory === "toutes" ||
      lesson.type === currentCategory;

    const matchesOrigin =
      currentOrigin === "toutes" ||
      lesson.origin === currentOrigin;

    const show = matchesSearch && matchesCategory && matchesOrigin;
    lesson.el.style.display = show ? "" : "none";
    if (show) visibleCount++;
  });

  const noResults = document.querySelector(".no-results");
  if (noResults) {
    noResults.style.display = visibleCount === 0 ? "flex" : "none";
  }
}

/* -----------------------------
   ADMIN LOGIN
----------------------------- */

function initAdminLogin() {
  const loginBtn = document.querySelector("#adminLoginBtn");
  if (!loginBtn) return;

  loginBtn.addEventListener("click", () => {
    const pwd = prompt("Mot de passe administrateur :");
    if (!pwd) return;

    // Simple demo password – change if you want
    if (pwd === "alae" || pwd === "admin123") {
      isAdmin = true;
      document.body.classList.add("admin-active");
      alert("Mode administrateur activé.");
    } else {
      alert("Mot de passe incorrect.");
    }
  });
}

/* -----------------------------
   HERO BUTTONS (SCROLL TO LESSONS)
----------------------------- */

function initHeroButtons() {
  const exploreBtn = document.querySelector("#exploreLessonsBtn");
  const lessonsSection = document.querySelector("#lessonsSection");

  if (exploreBtn && lessonsSection) {
    exploreBtn.addEventListener("click", () => {
      lessonsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

/* -----------------------------
   TOOLTIP FOR KEYWORDS
----------------------------- */

function initTooltip() {
  tooltipEl = document.getElementById("tooltip");
  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.id = "tooltip";
    tooltipEl.classList.add("hidden");
    document.body.appendChild(tooltipEl);
  }

  document.addEventListener("mouseover", e => {
    const target = e.target.closest(".keyword");
    if (!target) {
      hideTooltip();
      return;
    }
    const text = target.dataset.tooltip || target.getAttribute("title");
    if (!text) return;
    showTooltip(text, e.pageX, e.pageY);
  });

  document.addEventListener("mousemove", e => {
    if (!tooltipEl || tooltipEl.classList.contains("hidden")) return;
    positionTooltip(e.pageX, e.pageY);
  });

  document.addEventListener("mouseout", e => {
    if (e.target.closest(".keyword")) hideTooltip();
  });
}

function showTooltip(text, x, y) {
  tooltipEl.textContent = text;
  tooltipEl.classList.remove("hidden");
  positionTooltip(x, y);
}

function positionTooltip(x, y) {
  tooltipEl.style.left = x + "px";
  tooltipEl.style.top = y + "px";
}

function hideTooltip() {
  if (!tooltipEl) return;
  tooltipEl.classList.add("hidden");
}

/* -----------------------------
   MODAL – CREATION
----------------------------- */

function initLessonModal() {
  lessonModal = document.createElement("div");
  lessonModal.id = "lessonViewModal";
  lessonModal.className = "lesson-view-modal hidden";

  lessonModal.innerHTML = `
    <div class="lesson-view-backdrop"></div>
    <div class="lesson-view-dialog">
      <button class="lesson-view-close" aria-label="Fermer">✕</button>
      <div class="lesson-view-content"></div>
    </div>
  `;

  document.body.appendChild(lessonModal);

  lessonModalContent = lessonModal.querySelector(".lesson-view-content");
  lessonModalClose = lessonModal.querySelector(".lesson-view-close");

  lessonModalClose.addEventListener("click", closeLessonModal);
  lessonModal.querySelector(".lesson-view-backdrop")
    .addEventListener("click", closeLessonModal);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeLessonModal();
  });
}

/* -----------------------------
   MODAL – OPEN / CLOSE
----------------------------- */

function openLessonModal(card) {
  const title = card.querySelector(".lesson-title")?.textContent || "";
  const typeLabel = card.querySelector(".lesson-type-label")?.textContent || "";
  const description = card.querySelector(".lesson-description")?.textContent || "";
  const body = card.querySelector(".lesson-body")?.innerHTML || "";
  const imgEl = card.querySelector(".lesson-image");
  const imgSrc = imgEl?.getAttribute("data-src") || imgEl?.src || "";

  lessonModalContent.innerHTML = `
    <div class="lesson-view-header">
      ${imgSrc ? `<img src="${imgSrc}" class="lesson-view-image" alt="${title}">` : ""}
      <div class="lesson-view-info">
        <div class="lesson-view-type">${typeLabel}</div>
        <h2 class="lesson-view-title">${title}</h2>
        <p class="lesson-view-description">${description}</p>
      </div>
    </div>
    <div class="lesson-view-body">
      ${body}
    </div>
    ${isAdmin ? `
      <button class="lesson-view-edit-btn">Modifier la leçon</button>
    ` : ""}
  `;

  const editBtn = lessonModalContent.querySelector(".lesson-view-edit-btn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      alert("Ici tu peux brancher un vrai éditeur plus tard.");
    });
  }

  lessonModal.classList.remove("hidden");
  setTimeout(() => lessonModal.classList.add("visible"), 10);
}

function closeLessonModal() {
  if (!lessonModal) return;
  lessonModal.classList.remove("visible");
  setTimeout(() => lessonModal.classList.add("hidden"), 200);
}

/* -----------------------------
   CARD CLICK → MODAL
----------------------------- */

function initLessonCardClicks() {
  const cards = document.querySelectorAll(".lesson-card");
  cards.forEach(card => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => openLessonModal(card));
  });
}

/* -----------------------------
   LAZY IMAGES (HERO + CARDS)
----------------------------- */

function initLazyImages() {
  const images = document.querySelectorAll(".lesson-image, .hero-image-main");
  if (!("IntersectionObserver" in window)) {
    images.forEach(img => {
      const dataSrc = img.getAttribute("data-src");
      if (dataSrc) img.src = dataSrc;
      img.classList.add("loaded");
    });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      const dataSrc = img.getAttribute("data-src");
      if (dataSrc && img.src !== dataSrc) {
        img.src = dataSrc;
      }
      img.addEventListener("load", () => img.classList.add("loaded"), { once: true });
      observer.unobserve(img);
    });
  }, {
    rootMargin: "80px 0px",
    threshold: 0.1
  });

  images.forEach(img => observer.observe(img));
}
