// =========================
// Sélecteurs
// =========================
const body = document.body;

// Dark mode
const darkModeToggle = document.getElementById('darkModeToggle');

// Recherche
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// Catégories
const categoryButtons = document.querySelectorAll('.category-btn');

// Filtres par type
const filterChips = document.querySelectorAll('.filter-chip');

// Grille de leçons
const lessonsContainer = document.getElementById('lessonsContainer');
const lessonCards = () => Array.from(document.querySelectorAll('#lessonsContainer .lesson-card'));

// No results
const noResultsMessage = document.getElementById('noResultsMessage');
const resetFiltersButton = document.getElementById('resetFiltersButton');

// Tooltip
const tooltip = document.getElementById('tooltip');

// Hero buttons
const scrollLessonsBtn = document.getElementById('scrollLessons');
const scrollServicesBtn = document.getElementById('scrollServices');
const servicesSection = document.getElementById('servicesSection');

// Admin
const adminLoginButton = document.getElementById('adminLoginButton');
const adminLogoutButton = document.getElementById('adminLogoutButton');
const adminModal = document.getElementById('adminModal');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const adminLoginConfirmButton = document.getElementById('adminLoginConfirmButton');
const adminError = document.getElementById('adminError');
const adminOnlyElements = document.querySelectorAll('.admin-only');

// Create lesson
const openCreateLessonModalButton = document.getElementById('openCreateLessonModal');
const createLessonModal = document.getElementById('createLessonModal');
const createLessonConfirmButton = document.getElementById('createLessonConfirmButton');
const createLessonError = document.getElementById('createLessonError');
const lessonTitleInput = document.getElementById('lessonTitleInput');
const lessonCategorySelect = document.getElementById('lessonCategorySelect');
const lessonTypeSelect = document.getElementById('lessonTypeSelect');
const lessonDescriptionInput = document.getElementById('lessonDescriptionInput');
const lessonImageInput = document.getElementById('lessonImageInput');
const dynamicLessonsCount = document.getElementById('dynamicLessonsCount');

// Modal close
const modalCloseButtons = document.querySelectorAll('.modal-close');
const modalBackdrops = document.querySelectorAll('.modal-backdrop');

// =========================
// État global
// =========================
let isDarkMode = false;
let isAdmin = false;
let activeCategory = 'all';
let activeTypeFilter = 'all';
let dynamicLessons = [];

const ADMIN_PASSWORD = 'alae-admin-2026';

// =========================
// Utilitaires
// =========================
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.remove('hidden');
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add('hidden');
}

function closeAllModals() {
  [adminModal, createLessonModal].forEach(m => m && m.classList.add('hidden'));
}

function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {}
}

function safeLocalStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

// =========================
// Dark mode
// =========================
function applyDarkModeState() {
  if (isDarkMode) {
    body.classList.add('dark-mode');
    if (darkModeToggle) darkModeToggle.setAttribute('aria-pressed', 'true');
  } else {
    body.classList.remove('dark-mode');
    if (darkModeToggle) darkModeToggle.setAttribute('aria-pressed', 'false');
  }
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  applyDarkModeState();
  safeLocalStorageSet('alaeai_dark_mode', isDarkMode ? '1' : '0');
}

function initDarkMode() {
  const stored = safeLocalStorageGet('alaeai_dark_mode');
  if (stored === '1') {
    isDarkMode = true;
  }
  applyDarkModeState();
}

// =========================
// Admin
// =========================
function updateAdminUI() {
  if (isAdmin) {
    adminLoginButton?.classList.add('hidden');
    adminLogoutButton?.classList.remove('hidden');
    adminOnlyElements.forEach(el => el.classList.remove('hidden'));
  } else {
    adminLoginButton?.classList.remove('hidden');
    adminLogoutButton?.classList.add('hidden');
    adminOnlyElements.forEach(el => el.classList.add('hidden'));
  }
}

function setAdminState(value) {
  isAdmin = value;
  updateAdminUI();
  safeLocalStorageSet('alaeai_is_admin', isAdmin ? '1' : '0');
}

function initAdminState() {
  const stored = safeLocalStorageGet('alaeai_is_admin');
  if (stored === '1') {
    isAdmin = true;
  }
  updateAdminUI();
}

function initAdminModal() {
  adminLoginButton?.addEventListener('click', () => {
    adminError.classList.add('hidden');
    adminPasswordInput.value = '';
    openModal(adminModal);
    setTimeout(() => adminPasswordInput.focus(), 50);
  });

  adminLogoutButton?.addEventListener('click', () => {
    setAdminState(false);
  });

  adminLoginConfirmButton?.addEventListener('click', () => {
    const pwd = adminPasswordInput.value;
    if (pwd === ADMIN_PASSWORD) {
      adminError.classList.add('hidden');
      setAdminState(true);
      closeModal(adminModal);
    } else {
      adminError.textContent = 'Mot de passe incorrect.';
      adminError.classList.remove('hidden');
    }
  });

  adminPasswordInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adminLoginConfirmButton.click();
    }
  });

  modalCloseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      if (!modalId) return;
      const modal = document.getElementById(modalId);
      closeModal(modal);
    });
  });

  modalBackdrops.forEach(backdrop => {
    backdrop.addEventListener('click', () => {
      const modal = backdrop.closest('.modal');
      closeModal(modal);
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
}

// =========================
// Filtres leçons
// =========================
function updateNoResultsState() {
  const visibleCards = lessonCards().filter(card => card.style.display !== 'none');
  if (visibleCards.length === 0) {
    noResultsMessage?.classList.remove('hidden');
  } else {
    noResultsMessage?.classList.add('hidden');
  }
}

function applyFilters() {
  const searchValue = normalizeText(searchInput ? searchInput.value : '');
  const cards = lessonCards();

  cards.forEach(card => {
    const cardCategory = card.getAttribute('data-category') || 'all';
    const cardType = card.getAttribute('data-type') || 'officielle';

    let visible = true;

    if (activeCategory !== 'all' && cardCategory !== activeCategory) {
      visible = false;
    }

    if (activeTypeFilter !== 'all' && cardType !== activeTypeFilter) {
      visible = false;
    }

    if (visible && searchValue) {
      const titleEl = card.querySelector('.lesson-title');
      const descEl = card.querySelector('.lesson-description');
      const bodyEl = card.querySelector('.lesson-body');

      const titleText = titleEl ? normalizeText(titleEl.textContent) : '';
      const descText = descEl ? normalizeText(descEl.textContent) : '';
      const bodyText = bodyEl ? normalizeText(bodyEl.textContent) : '';

      const combined = `${titleText} ${descText} ${bodyText}`;
      if (!combined.includes(searchValue)) {
        visible = false;
      }
    }

    if (visible) {
      card.style.display = '';
      card.classList.remove('hidden');
    } else {
      card.style.display = 'none';
      card.classList.add('hidden');
    }
  });

  updateNoResultsState();
}

function setActiveCategory(category) {
  activeCategory = category;
  categoryButtons.forEach(btn => {
    const cat = btn.getAttribute('data-category') || 'all';
    const isActive = cat === category;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  applyFilters();
}

function setActiveTypeFilter(type) {
  activeTypeFilter = type;
  filterChips.forEach(chip => {
    const filter = chip.getAttribute('data-filter') || 'all';
    chip.classList.toggle('active', filter === type);
  });
  applyFilters();
}

// =========================
// Recherche
// =========================
function handleSearch() {
  applyFilters();
}

function resetFilters() {
  if (searchInput) searchInput.value = '';
  setActiveCategory('all');
  setActiveTypeFilter('all');
  applyFilters();
}

function initSearchAndFilters() {
  searchButton?.addEventListener('click', e => {
    e.preventDefault();
    handleSearch();
  });

  searchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  });

  searchInput?.addEventListener('input', () => {
    applyFilters();
  });

  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category') || 'all';
      setActiveCategory(cat);
    });
  });

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.getAttribute('data-filter') || 'all';
      setActiveTypeFilter(filter);
    });
  });

  resetFiltersButton?.addEventListener('click', () => {
    resetFilters();
  });
}

// =========================
// Tooltips mots-clés
// =========================
function initKeywordTooltips() {
  const keywords = document.querySelectorAll('.keyword');

  keywords.forEach(keyword => {
    keyword.addEventListener('mouseenter', e => {
      const text = keyword.getAttribute('data-tooltip');
      if (!text || !tooltip) return;
      tooltip.textContent = text;
      tooltip.classList.remove('hidden');
      positionTooltip(e);
    });

    keyword.addEventListener('mousemove', e => {
      positionTooltip(e);
    });

    keyword.addEventListener('mouseleave', () => {
      if (!tooltip) return;
      tooltip.classList.add('hidden');
    });

    keyword.addEventListener('focus', e => {
      const text = keyword.getAttribute('data-tooltip');
      if (!text || !tooltip) return;
      tooltip.textContent = text;
      tooltip.classList.remove('hidden');
      const rect = keyword.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.top = `${rect.top - 10}px`;
    });

    keyword.addEventListener('blur', () => {
      if (!tooltip) return;
      tooltip.classList.add('hidden');
    });
  });
}

function positionTooltip(e) {
  if (!tooltip) return;
  const offset = 14;
  const x = e.clientX + offset;
  const y = e.clientY + offset;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

// =========================
// Hero scroll
// =========================
function initHeroScroll() {
  if (scrollLessonsBtn && lessonsContainer) {
    scrollLessonsBtn.addEventListener('click', () => {
      window.scrollTo({
        top: lessonsContainer.offsetTop - 70,
        behavior: 'smooth'
      });
    });
  }

  if (scrollServicesBtn && servicesSection) {
    scrollServicesBtn.addEventListener('click', () => {
      window.scrollTo({
        top: servicesSection.offsetTop - 70,
        behavior: 'smooth'
      });
    });
  }
}

// =========================
// Images : fade-in
// =========================
function initImageLoadingEffects() {
  const images = document.querySelectorAll('.lesson-image, .hero-image-main');
  images.forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
    }
  });
}

// =========================
// Admin : création de leçons
// =========================
function updateDynamicLessonsCount() {
  if (!dynamicLessonsCount) return;
  dynamicLessonsCount.textContent = `${dynamicLessons.length} ajoutée(s)`;
}

function createLessonCardDOM(lesson) {
  const article = document.createElement('article');
  article.className = 'lesson-card';
  article.setAttribute('data-category', lesson.category);
  article.setAttribute('data-type', lesson.type);

  const media = document.createElement('div');
  media.className = 'lesson-card-media';

  const img = document.createElement('img');
  img.className = 'lesson-image';
  img.alt = lesson.title;
  img.loading = 'lazy';
  img.src =
    lesson.image ||
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80';

  img.addEventListener('load', () => {
    img.classList.add('loaded');
  });

  media.appendChild(img);

  const content = document.createElement('div');
  content.className = 'lesson-card-content';

  const typeLabel = document.createElement('div');
  typeLabel.className = 'lesson-type-label';
  typeLabel.textContent = `${capitalizeCategory(lesson.category)} · Leçon créée`;

  const title = document.createElement('h3');
  title.className = 'lesson-title';
  title.textContent = lesson.title;

  const desc = document.createElement('p');
  desc.className = 'lesson-description';
  desc.textContent = lesson.description;

  const body = document.createElement('div');
  body.className = 'lesson-body';
  const p = document.createElement('p');
  p.textContent = 'Leçon ajoutée par l’administrateur. Tu peux la compléter avec des exemples, des exercices et des mots-clés.';
  body.appendChild(p);

  content.appendChild(typeLabel);
  content.appendChild(title);
  content.appendChild(desc);
  content.appendChild(body);

  article.appendChild(media);
  article.appendChild(content);

  return article;
}

function capitalizeCategory(cat) {
  switch (cat) {
    case 'orthographe':
      return 'Orthographe';
    case 'grammaire':
      return 'Grammaire';
    case 'conjugaison':
      return 'Conjugaison';
    case 'vocabulaire':
      return 'Vocabulaire';
    case 'expression':
      return 'Expression écrite';
    case 'comprehension':
      return 'Compréhension orale';
    default:
      return cat;
  }
}

function validateLessonForm() {
  const title = lessonTitleInput.value.trim();
  const description = lessonDescriptionInput.value.trim();

  if (!title) {
    return 'Le titre de la leçon est obligatoire.';
  }
  if (!description) {
    return 'La description courte est obligatoire.';
  }
  return '';
}

function handleCreateLesson() {
  const error = validateLessonForm();
  if (error) {
    createLessonError.textContent = error;
    createLessonError.classList.remove('hidden');
    return;
  }

  createLessonError.classList.add('hidden');

  const lesson = {
    title: lessonTitleInput.value.trim(),
    category: lessonCategorySelect.value,
    type: lessonTypeSelect.value,
    description: lessonDescriptionInput.value.trim(),
    image: lessonImageInput.value.trim()
  };

  dynamicLessons.push(lesson);
  safeLocalStorageSet('alaeai_dynamic_lessons', JSON.stringify(dynamicLessons));
  updateDynamicLessonsCount();

  const card = createLessonCardDOM(lesson);
  lessonsContainer.appendChild(card);

  // Réinitialiser le formulaire
  lessonTitleInput.value = '';
  lessonDescriptionInput.value = '';
  lessonImageInput.value = '';
  lessonCategorySelect.value = 'orthographe';
  lessonTypeSelect.value = 'created';

  closeModal(createLessonModal);
  initKeywordTooltips();
  initImageLoadingEffects();
  applyFilters();
}

function loadDynamicLessonsFromStorage() {
  const stored = safeLocalStorageGet('alaeai_dynamic_lessons');
  if (!stored) return;
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      dynamicLessons = parsed;
      dynamicLessons.forEach(lesson => {
        const card = createLessonCardDOM(lesson);
        lessonsContainer.appendChild(card);
      });
      updateDynamicLessonsCount();
    }
  } catch (e) {
    // ignore
  }
}

function initCreateLessonModal() {
  openCreateLessonModalButton?.addEventListener('click', () => {
    if (!isAdmin) return;
    createLessonError.classList.add('hidden');
    openModal(createLessonModal);
    setTimeout(() => lessonTitleInput.focus(), 50);
  });

  createLessonConfirmButton?.addEventListener('click', () => {
    handleCreateLesson();
  });

  lessonTitleInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleCreateLesson();
    }
  });
}

// =========================
// Init global
// =========================
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initAdminState();
  initAdminModal();
  initKeywordTooltips();
  initSearchAndFilters();
  initHeroScroll();
  initImageLoadingEffects();
  loadDynamicLessonsFromStorage();
  updateDynamicLessonsCount();

  darkModeToggle?.addEventListener('click', () => {
    toggleDarkMode();
  });

  setActiveCategory('all');
  setActiveTypeFilter('all');
  applyFilters();

  initCreateLessonModal();
});
