// =========================
// Sélecteurs principaux
// =========================
const body = document.body;

// Dark mode
const darkModeToggle = document.getElementById('darkModeToggle');

// Recherche
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// Catégories (nav du haut)
const categoryButtons = document.querySelectorAll('.category-btn');

// Grille de leçons
const lessonsContainer = document.getElementById('lessonsContainer');
const lessonCards = () => Array.from(document.querySelectorAll('#lessonsContainer .lesson-card'));

// Filtres par type (sidebar)
const filterChips = document.querySelectorAll('.filter-chip');

// Tooltip mots-clés
const tooltip = document.getElementById('tooltip');

// Admin
const adminStatusLabel = document.getElementById('adminStatusLabel');
const adminLoginButton = document.getElementById('adminLoginButton');
const adminLogoutButton = document.getElementById('adminLogoutButton');
const adminModal = document.getElementById('adminModal');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const adminLoginConfirmButton = document.getElementById('adminLoginConfirmButton');
const adminError = document.getElementById('adminError');

// Boutons admin-only
const adminOnlyElements = document.querySelectorAll('.admin-only');

// Upload modal
const uploadModal = document.getElementById('uploadModal');
const uploadTitleInput = document.getElementById('uploadTitleInput');
const uploadCategorySelect = document.getElementById('uploadCategorySelect');
const uploadFileInput = document.getElementById('uploadFileInput');
const uploadError = document.getElementById('uploadError');
const uploadConfirmButton = document.getElementById('uploadConfirmButton');
const openUploadModalButton = document.getElementById('openUploadModalButton');

// Create modal
const createModal = document.getElementById('createModal');
const createTitleInput = document.getElementById('createTitleInput');
const createCategorySelect = document.getElementById('createCategorySelect');
const createEditor = document.getElementById('createEditor');
const createError = document.getElementById('createError');
const createConfirmButton = document.getElementById('createConfirmButton');
const openCreateModalButton = document.getElementById('openCreateModalButton');

// Modals close buttons
const modalCloseButtons = document.querySelectorAll('.modal-close');
const modalBackdrops = document.querySelectorAll('.modal-backdrop');

// Hero buttons (optionnel)
const heroPrimaryButton = document.querySelector('.hero-actions .btn.btn-primary');
const heroSecondaryButton = document.querySelector('.hero-actions .btn.btn-outline');

// =========================
// État global
// =========================
let isDarkMode = false;
let isAdmin = false;
let activeCategory = 'all';
let activeTypeFilter = 'all';

// =========================
// Utilitaires
// =========================
function openModal(modal) {
  if (!modal) return;
  modal.classList.remove('hidden');
  body.classList.add('modal-open');
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add('hidden');
  body.classList.remove('modal-open');
}

function closeAllModals() {
  [adminModal, uploadModal, createModal].forEach(m => m && m.classList.add('hidden'));
  body.classList.remove('modal-open');
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// =========================
// Dark mode
// =========================
function applyDarkModeState() {
  if (isDarkMode) {
    body.classList.add('dark-mode');
  } else {
    body.classList.remove('dark-mode');
  }
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  applyDarkModeState();
  try {
    localStorage.setItem('alaeai_dark_mode', isDarkMode ? '1' : '0');
  } catch (e) {}
}

function initDarkMode() {
  try {
    const stored = localStorage.getItem('alaeai_dark_mode');
    if (stored === '1') {
      isDarkMode = true;
    }
  } catch (e) {}
  applyDarkModeState();
}

// =========================
// Admin
// =========================
const ADMIN_PASSWORD = 'alae-admin-2026';

function updateAdminUI() {
  if (isAdmin) {
    adminStatusLabel.textContent = 'Administrateur';
    adminLoginButton.classList.add('hidden');
    adminLogoutButton.classList.remove('hidden');
    adminOnlyElements.forEach(el => el.classList.remove('hidden'));
  } else {
    adminStatusLabel.textContent = 'Visiteur';
    adminLoginButton.classList.remove('hidden');
    adminLogoutButton.classList.add('hidden');
    adminOnlyElements.forEach(el => el.classList.add('hidden'));
  }
}

function setAdminState(value) {
  isAdmin = value;
  updateAdminUI();
  try {
    localStorage.setItem('alaeai_is_admin', isAdmin ? '1' : '0');
  } catch (e) {}
}

function initAdminState() {
  try {
    const stored = localStorage.getItem('alaeai_is_admin');
    if (stored === '1') {
      isAdmin = true;
    }
  } catch (e) {}
  updateAdminUI();
}

// =========================
// Filtres leçons
// =========================
function applyFilters() {
  const searchValue = normalizeText(searchInput ? searchInput.value : '');
  const cards = lessonCards();

  cards.forEach(card => {
    const cardCategory = card.getAttribute('data-category') || 'all';
    const cardType = card.getAttribute('data-type') || 'base';

    let visible = true;

    // Filtre catégorie
    if (activeCategory !== 'all' && cardCategory !== activeCategory) {
      visible = false;
    }

    // Filtre type
    if (activeTypeFilter !== 'all' && cardType !== activeTypeFilter) {
      visible = false;
    }

    // Filtre recherche
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
      card.classList.remove('hidden');
      card.style.display = '';
    } else {
      card.classList.add('hidden');
      card.style.display = 'none';
    }
  });
}

function setActiveCategory(category) {
  activeCategory = category;
  categoryButtons.forEach(btn => {
    const cat = btn.getAttribute('data-category') || 'all';
    if (cat === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  applyFilters();
}

function setActiveTypeFilter(type) {
  activeTypeFilter = type;
  filterChips.forEach(chip => {
    const filter = chip.getAttribute('data-filter') || 'all';
    if (filter === type) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
  applyFilters();
}

// =========================
// Recherche
// =========================
function handleSearch() {
  applyFilters();
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
  });
}

function positionTooltip(e) {
  if (!tooltip) return;
  const offset = 12;
  const x = e.clientX + offset;
  const y = e.clientY + offset;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

// =========================
// Upload de fichier (carte dynamique)
// =========================
function createUploadedLessonCard(title, category, fileName) {
  const article = document.createElement('article');
  article.className = 'lesson-card';
  article.setAttribute('data-category', category);
  article.setAttribute('data-type', 'upload');

  const imageUrl1 = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80';
  const imageUrl2 = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80';

  article.innerHTML = `
    <div class="lesson-card-media">
      <img class="lesson-image" src="${imageUrl1}" alt="Document uploadé - ${title}" />
      <img class="secondary-image" src="${imageUrl2}" alt="Document partagé - ${title}" />
    </div>
    <div class="lesson-card-content">
      <div class="lesson-type-label">${capitalize(category)} · Document partagé</div>
      <h3 class="lesson-title">${escapeHtml(title)}</h3>
      <p class="lesson-description">Fichier partagé : ${escapeHtml(fileName)}. Le contenu peut être utilisé comme support d’exercices ou de révision.</p>
      <div class="lesson-body">
        <p>Ce document a été uploadé via la plateforme. Il peut contenir des exercices, des fiches de cours ou des activités à imprimer.</p>
        <p>Tu peux l’utiliser en complément des leçons officielles pour approfondir un point précis du programme.</p>
      </div>
    </div>
  `;

  lessonsContainer.appendChild(article);
  initKeywordTooltips();
  applyFilters();
}

function handleUploadConfirm() {
  if (!isAdmin) {
    uploadError.textContent = 'Seuls les administrateurs peuvent uploader des fichiers.';
    uploadError.classList.remove('hidden');
    return;
  }

  const title = uploadTitleInput.value.trim();
  const category = uploadCategorySelect.value;
  const file = uploadFileInput.files[0];

  if (!title || !file) {
    uploadError.textContent = 'Merci d’indiquer un titre et de choisir un fichier Word.';
    uploadError.classList.remove('hidden');
    return;
  }

  uploadError.classList.add('hidden');
  createUploadedLessonCard(title, category, file.name);

  uploadTitleInput.value = '';
  uploadFileInput.value = '';
  closeModal(uploadModal);
}

// =========================
// Création de document (carte dynamique)
// =========================
function createCreatedLessonCard(title, category, contentHtml) {
  const article = document.createElement('article');
  article.className = 'lesson-card';
  article.setAttribute('data-category', category);
  article.setAttribute('data-type', 'created');

  const imageUrl1 = 'https://images.unsplash.com/photo-1517840933442-d2d1a05edb75?auto=format&fit=crop&w=1200&q=80';
  const imageUrl2 = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80';

  article.innerHTML = `
    <div class="lesson-card-media">
      <img class="lesson-image" src="${imageUrl1}" alt="Document créé - ${title}" />
      <img class="secondary-image" src="${imageUrl2}" alt="Document généré - ${title}" />
    </div>
    <div class="lesson-card-content">
      <div class="lesson-type-label">${capitalize(category)} · Document créé</div>
      <h3 class="lesson-title">${escapeHtml(title)}</h3>
      <p class="lesson-description">Document rédigé directement depuis la plateforme, prêt à être utilisé en classe ou en autonomie.</p>
      <div class="lesson-body">
        ${contentHtml}
      </div>
    </div>
  `;

  lessonsContainer.appendChild(article);
  initKeywordTooltips();
  applyFilters();
}

function handleCreateConfirm() {
  if (!isAdmin) {
    createError.textContent = 'Seuls les administrateurs peuvent créer des documents.';
    createError.classList.remove('hidden');
    return;
  }

  const title = createTitleInput.value.trim();
  const category = createCategorySelect.value;
  const content = createEditor.innerHTML.trim();

  if (!title || !content || content === 'Commence à écrire ta leçon ici. Tu peux utiliser les boutons ci-dessus pour mettre en forme le texte, ajouter des listes et structurer ton contenu.') {
    createError.textContent = 'Merci d’indiquer un titre et un contenu.';
    createError.classList.remove('hidden');
    return;
  }

  createError.classList.add('hidden');
  createCreatedLessonCard(title, category, content);

  createTitleInput.value = '';
  createEditor.innerHTML = 'Commence à écrire ta leçon ici. Tu peux utiliser les boutons ci-dessus pour mettre en forme le texte, ajouter des listes et structurer ton contenu.';
  closeModal(createModal);
}

// =========================
// Éditeur (toolbar)
// =========================
function initEditorToolbar() {
  const buttons = document.querySelectorAll('.editor-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const command = btn.getAttribute('data-editor-command');
      if (!command) return;
      document.execCommand(command, false, null);
      createEditor.focus();
    });
  });
}

// =========================
// Hero buttons
// =========================
function initHeroButtons() {
  if (heroPrimaryButton) {
    heroPrimaryButton.addEventListener('click', () => {
      window.scrollTo({
        top: lessonsContainer.offsetTop - 80,
        behavior: 'smooth'
      });
    });
  }

  if (heroSecondaryButton) {
    heroSecondaryButton.addEventListener('click', () => {
      const servicesSection = document.querySelector('.services-section');
      if (!servicesSection) return;
      window.scrollTo({
        top: servicesSection.offsetTop - 80,
        behavior: 'smooth'
      });
    });
  }
}

// =========================
// Admin modal events
// =========================
function initAdminModal() {
  if (adminLoginButton) {
    adminLoginButton.addEventListener('click', () => {
      adminError.classList.add('hidden');
      adminPasswordInput.value = '';
      openModal(adminModal);
      setTimeout(() => adminPasswordInput.focus(), 50);
    });
  }

  if (adminLogoutButton) {
    adminLogoutButton.addEventListener('click', () => {
      setAdminState(false);
    });
  }

  if (adminLoginConfirmButton) {
    adminLoginConfirmButton.addEventListener('click', () => {
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
  }

  if (adminPasswordInput) {
    adminPasswordInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        adminLoginConfirmButton.click();
      }
    });
  }
}

// =========================
// Upload / Create modals events
// =========================
function initUploadModal() {
  if (openUploadModalButton) {
    openUploadModalButton.addEventListener('click', () => {
      uploadError.classList.add('hidden');
      uploadTitleInput.value = '';
      uploadFileInput.value = '';
      openModal(uploadModal);
    });
  }

  if (uploadConfirmButton) {
    uploadConfirmButton.addEventListener('click', e => {
      e.preventDefault();
      handleUploadConfirm();
    });
  }
}

function initCreateModal() {
  if (openCreateModalButton) {
    openCreateModalButton.addEventListener('click', () => {
      createError.classList.add('hidden');
      if (!createEditor.innerHTML.trim()) {
        createEditor.innerHTML = 'Commence à écrire ta leçon ici. Tu peux utiliser les boutons ci-dessus pour mettre en forme le texte, ajouter des listes et structurer ton contenu.';
      }
      openModal(createModal);
    });
  }

  if (createConfirmButton) {
    createConfirmButton.addEventListener('click', e => {
      e.preventDefault();
      handleCreateConfirm();
    });
  }
}

// =========================
// Modals close / backdrop
// =========================
function initModalClose() {
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
// Recherche / filtres events
// =========================
function initSearchAndFilters() {
  if (searchButton) {
    searchButton.addEventListener('click', e => {
      e.preventDefault();
      handleSearch();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
    });

    searchInput.addEventListener('input', () => {
      applyFilters();
    });
  }

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
}

// =========================
// Helpers
// =========================
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// =========================
// Init global
// =========================
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initAdminState();
  initKeywordTooltips();
  initEditorToolbar();
  initHeroButtons();
  initAdminModal();
  initUploadModal();
  initCreateModal();
  initModalClose();
  initSearchAndFilters();

  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      toggleDarkMode();
    });
  }

  setActiveCategory('all');
  setActiveTypeFilter('all');
  applyFilters();
});
