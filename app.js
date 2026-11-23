const STORAGE_KEY = 'thrifi-v1-items';
const SETTINGS_KEY = 'thrifi-v1-settings';
const USER_DATA_KEYS = [
  STORAGE_KEY,
  SETTINGS_KEY,
  'thrifi-v1-fits',
  'thrifi-v1-check-ins',
  'thrifi-v1-love-dismissed',
  'thrifi-import-draft',
  'thrifi-import-intro-dismissed'
];
let activeUserId = null;

const SEGMENTS = [
  {
    key: 'ready_to_pass_on',
    label: 'Ready to pass on',
    match: item => item.usage_level === 'not_anymore'
  },
  {
    key: 'needs_care',
    label: 'Needs care',
    match: item => item.condition === 'needs_care'
  },
  {
    key: 'rarely_worn',
    label: 'Rarely worn',
    match: item => item.usage_level === 'rarely'
  },
  {
    key: 'in_rotation',
    label: 'In rotation',
    match: item => ['often', 'sometimes'].includes(item.usage_level)
  },
  {
    key: 'not_reviewed',
    label: 'Not reviewed yet',
    match: item => !item.usage_level
  }
];

const CATEGORIES = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'other'];
const FABRICS = ['cotton', 'wool', 'denim', 'linen', 'synthetic', 'leather', 'silk', 'other'];
const SAMPLE_ITEMS = [
  {
    id: 'item-1',
    name: 'Soft knit cardigan',
    category: 'tops',
    fabric: 'cotton',
    colors: ['#d9c2a6'],
    seasons: ['autumn', 'winter'],
    activities: ['everyday'],
    brand: 'MNT',
    size_label: 'M',
    year_acquired: 2022,
    source: 'gifted',
    condition: 'good',
    fit_feedback: 'fits_well',
    usage_level: 'often',
    last_asked_at: '2024-09-10',
    snoozed_until: null,
    note: 'The sleeves loosened after a wash.',
    import_state: 'described',
    status: 'active',
    left_reason: null,
    left_on: null,
    created_at: '2022-10-17T10:00:00.000Z',
    photo: '',
    worn_on: ['2024-09-20', '2024-08-11', '2024-06-02']
  },
  {
    id: 'item-2',
    name: 'Canvas tote',
    category: 'accessories',
    fabric: 'linen',
    colors: ['#8aa784'],
    seasons: ['spring', 'summer'],
    activities: ['outdoor'],
    brand: 'Threefold',
    size_label: 'One size',
    year_acquired: 2021,
    source: 'secondhand',
    condition: 'good',
    fit_feedback: 'fits_well',
    usage_level: 'sometimes',
    last_asked_at: '2024-05-18',
    snoozed_until: null,
    note: 'Good for market days.',
    import_state: 'described',
    status: 'active',
    left_reason: null,
    left_on: null,
    created_at: '2021-02-05T09:00:00.000Z',
    photo: '',
    worn_on: ['2024-07-02', '2024-05-18']
  },
  {
    id: 'item-3',
    name: 'Wide-leg trousers',
    category: 'bottoms',
    fabric: 'wool',
    colors: ['#a39fb0'],
    seasons: ['autumn', 'winter'],
    activities: ['work'],
    brand: 'Field & Form',
    size_label: '10',
    year_acquired: 2019,
    source: 'new',
    condition: 'needs_care',
    fit_feedback: 'runs_large',
    usage_level: 'rarely',
    last_asked_at: '2023-08-11',
    snoozed_until: null,
    note: 'Hem is catching in the back.',
    import_state: 'described',
    status: 'active',
    left_reason: null,
    left_on: null,
    created_at: '2019-09-22T12:00:00.000Z',
    photo: '',
    worn_on: ['2023-12-01']
  },
  {
    id: 'item-4',
    name: 'Utility shirt',
    category: 'tops',
    fabric: 'cotton',
    colors: ['#8ea0c7'],
    seasons: ['spring', 'summer'],
    activities: ['work', 'everyday'],
    brand: 'Stitch & Co',
    size_label: 'L',
    year_acquired: 2024,
    source: 'swapped',
    condition: 'good',
    fit_feedback: 'fits_well',
    usage_level: null,
    last_asked_at: null,
    snoozed_until: null,
    note: '',
    import_state: 'photographed',
    status: 'active',
    left_reason: null,
    left_on: null,
    created_at: '2024-07-03T14:00:00.000Z',
    photo: '',
    worn_on: []
  },
  {
    id: 'item-5',
    name: 'Leather boots',
    category: 'shoes',
    fabric: 'leather',
    colors: ['#4d3d35'],
    seasons: ['autumn', 'winter'],
    activities: ['outdoor', 'formal'],
    brand: 'North Trail',
    size_label: '39',
    year_acquired: 2018,
    source: 'inherited',
    condition: 'good',
    fit_feedback: 'fits_well',
    usage_level: 'not_anymore',
    last_asked_at: '2024-01-03',
    snoozed_until: null,
    note: 'Still hold up, but they have been waiting for a while.',
    import_state: 'described',
    status: 'active',
    left_reason: null,
    left_on: null,
    created_at: '2018-10-15T08:00:00.000Z',
    photo: '',
    worn_on: ['2024-02-14', '2023-11-22']
  },
  {
    id: 'item-6',
    name: 'Wool blazer',
    category: 'outerwear',
    fabric: 'wool',
    colors: ['#d9c8ab'],
    seasons: ['autumn', 'winter'],
    activities: ['formal', 'work'],
    brand: 'Lark & Pine',
    size_label: '8',
    year_acquired: 2017,
    source: 'new',
    condition: 'good',
    fit_feedback: 'runs_small',
    usage_level: 'often',
    last_asked_at: '2024-10-21',
    snoozed_until: null,
    note: 'Feels better with a little more room underneath.',
    import_state: 'described',
    status: 'active',
    left_reason: null,
    left_on: null,
    created_at: '2017-03-07T11:00:00.000Z',
    photo: '',
    worn_on: ['2024-10-21', '2024-09-02', '2024-08-08']
  }
];

const state = {
  view: 'closet',
  segment: 'all',
  colourView: false,
  search: '',
  category: 'all',
  season: 'all',
  activity: 'all',
  fabric: 'all',
  showOverview: true,
  frequency: 'weekly',
  photoQueue: [],
  queueIndex: 0,
  replacingQueuedPhotoId: null,
  importIntroDismissed: false,
  importOverlayOpen: false,
  importPieces: [],
  importCurrentIndex: 0,
  importTab: 'photos',
  finishOverviewOpen: false,
  pendingPhotoDelete: null,
  importStatusTimer: null,
  leavingDraft: null,
  wornTab: 'picker',
  wornStage: 'picker',
  wornSearch: '',
  wornCategory: 'all',
  wornColor: 'all',
  selectedItemIds: [],
  activeFitId: null,
  savedFits: [],
  pendingWearUndo: null,
  fitRenameOpen: false,
  checkIns: [],
  loveDismissed: { itemIds: [], checkInIds: [] }
};

let items = [];

function userStorageKey(key) {
  if (!activeUserId) throw new Error('Wardrobe data is only available after signing in.');
  return `thrifi-user:${activeUserId}:${key}`;
}

function migrateLegacyStorage() {
  const migrationKey = 'thrifi-v1-auth-migrated';
  if (localStorage.getItem(migrationKey) === 'true') return;

  USER_DATA_KEYS.forEach(key => {
    const scopedKey = userStorageKey(key);
    if (localStorage.getItem(scopedKey) === null) {
      const legacyValue = localStorage.getItem(key);
      if (legacyValue !== null) localStorage.setItem(scopedKey, legacyValue);
    }
    localStorage.removeItem(key);
  });
  localStorage.setItem(migrationKey, 'true');
}

function getStoredItems() {
  try {
    const raw = localStorage.getItem(userStorageKey(STORAGE_KEY));
    return raw ? JSON.parse(raw) : SAMPLE_ITEMS;
  } catch (error) {
    return SAMPLE_ITEMS;
  }
}

function saveItems() {
  localStorage.setItem(userStorageKey(STORAGE_KEY), JSON.stringify(items));
}

function getStoredFits() {
  try {
    return JSON.parse(localStorage.getItem(userStorageKey('thrifi-v1-fits')) || '[]');
  } catch (error) {
    return [];
  }
}

function saveFits() {
  localStorage.setItem(userStorageKey('thrifi-v1-fits'), JSON.stringify(state.savedFits));
}

function getStoredCheckIns() {
  try {
    return JSON.parse(localStorage.getItem(userStorageKey('thrifi-v1-check-ins')) || '[]');
  } catch (error) {
    return [];
  }
}

function getStoredLoveDismissals() {
  try {
    const stored = JSON.parse(localStorage.getItem(userStorageKey('thrifi-v1-love-dismissed')) || '{}');
    return {
      itemIds: Array.isArray(stored.itemIds) ? stored.itemIds : [],
      checkInIds: Array.isArray(stored.checkInIds) ? stored.checkInIds : []
    };
  } catch (error) {
    return { itemIds: [], checkInIds: [] };
  }
}

function saveLoveDismissals() {
  localStorage.setItem(userStorageKey('thrifi-v1-love-dismissed'), JSON.stringify(state.loveDismissed));
}

function getStoredSettings() {
  try {
    const raw = localStorage.getItem(userStorageKey(SETTINGS_KEY));
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

function saveSettings() {
  localStorage.setItem(userStorageKey(SETTINGS_KEY), JSON.stringify({
    showOverview: state.showOverview,
    frequency: state.frequency
  }));
}

function getStoredImportDraft() {
  try {
    const raw = localStorage.getItem(userStorageKey('thrifi-import-draft'));
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveImportDraft() {
  const status = document.getElementById('importStatus');
  if (status) status.textContent = 'Saving...';
  try {
    localStorage.setItem(userStorageKey('thrifi-import-draft'), JSON.stringify(state.importPieces));
    if (state.importStatusTimer) clearTimeout(state.importStatusTimer);
    state.importStatusTimer = setTimeout(() => {
      if (status) status.textContent = 'All saved';
      renderContinueCard();
    }, 350);
  } catch (error) {
    if (status) status.textContent = 'Could not save on this device';
  }
  renderContinueCard();
}

function initialize(userId) {
  activeUserId = userId;
  migrateLegacyStorage();
  items = getStoredItems();
  Object.assign(state, getStoredSettings());
  const storedIntro = localStorage.getItem(userStorageKey('thrifi-import-intro-dismissed'));
  state.importIntroDismissed = storedIntro === 'true';
  state.importPieces = getStoredImportDraft();
  state.savedFits = getStoredFits();
  state.checkIns = getStoredCheckIns();
  state.loveDismissed = getStoredLoveDismissals();
  bindEvents();
  renderAll();
}

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => {
      state.view = button.dataset.view;
      renderAll();
    });
  });

  document.getElementById('rediscoverBtn').addEventListener('click', () => {
    const active = items.filter(item => item.status === 'active');
    const chosen = active[Math.floor(Math.random() * active.length)];
    if (!chosen) return;
    const toast = document.getElementById('toast');
    toast.textContent = `${chosen.name} is ready to rediscover.`;
    toast.hidden = false;
    setTimeout(() => {
      toast.hidden = true;
    }, 2500);
  });

  document.getElementById('colourModeBtn').addEventListener('click', () => {
    state.colourView = !state.colourView;
    renderCatalog();
  });

  document.getElementById('filterToggleBtn').addEventListener('click', () => {
    const panel = document.getElementById('catalogFilters');
    panel.hidden = !panel.hidden;
  });

  document.getElementById('segmentStrip').addEventListener('click', event => {
    const button = event.target.closest('[data-segment]');
    if (!button) return;
    state.segment = button.dataset.segment;
    renderCatalog();
    renderOverview();
  });

  document.getElementById('queryInput').addEventListener('input', event => {
    state.search = event.target.value.trim().toLowerCase();
    renderCatalog();
  });

  document.getElementById('categoryFilter').addEventListener('change', event => {
    state.category = event.target.value;
    renderCatalog();
  });

  document.getElementById('seasonFilter').addEventListener('change', event => {
    state.season = event.target.value;
    renderCatalog();
  });

  document.getElementById('activityFilter').addEventListener('change', event => {
    state.activity = event.target.value;
    renderCatalog();
  });

  document.getElementById('fabricFilter').addEventListener('change', event => {
    state.fabric = event.target.value;
    renderCatalog();
  });

  document.getElementById('savePieceForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const existingId = form.dataset.id;
    const item = {
      id: existingId || `item-${Date.now()}`,
      name: form.querySelector('[name="name"]').value.trim() || 'Untitled piece',
      category: form.querySelector('[name="category"]').value,
      fabric: form.querySelector('[name="fabric"]').value,
      colors: [form.querySelector('[name="color"]').value],
      seasons: Array.from(form.querySelectorAll('[name="seasons"]:checked')).map(checkbox => checkbox.value),
      activities: Array.from(form.querySelectorAll('[name="activities"]:checked')).map(checkbox => checkbox.value),
      brand: form.querySelector('[name="brand"]').value.trim(),
      size_label: form.querySelector('[name="sizeLabel"]').value.trim(),
      year_acquired: Number(form.querySelector('[name="yearAcquired"]').value) || new Date().getFullYear(),
      source: form.querySelector('[name="source"]').value,
      condition: form.querySelector('[name="condition"]').value,
      fit_feedback: form.querySelector('[name="fitFeedback"]').value,
      usage_level: null,
      last_asked_at: null,
      snoozed_until: null,
      note: form.querySelector('[name="note"]').value.trim(),
      import_state: 'described',
      status: 'active',
      left_reason: null,
      left_on: null,
      created_at: new Date().toISOString(),
      photo: state.photoQueue[state.queueIndex]?.imageData || '',
      worn_on: []
    };

    if (existingId) {
      const index = items.findIndex(piece => piece.id === existingId);
      if (index >= 0) {
        items[index] = { ...items[index], ...item };
      }
    } else {
      items.unshift(item);
    }

    saveItems();

    if (state.photoQueue.length) {
      state.photoQueue.splice(state.queueIndex, 1);
      if (state.photoQueue.length) {
        state.queueIndex = Math.min(state.queueIndex, state.photoQueue.length - 1);
        form.reset();
        renderQueueState();
        return;
      }
    }

    state.photoQueue = [];
    state.queueIndex = 0;
    form.reset();
    delete form.dataset.id;
    renderAll();
    document.getElementById('queueTitle').textContent = 'Capture all garments';
    document.getElementById('queueCounter').textContent = '0 of 0';
    document.getElementById('queueProgress').style.width = '0%';
  });

  document.getElementById('photoBatchInput').addEventListener('change', async event => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const prepared = [];
    for (const file of files) {
      const imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Unable to read image'));
        reader.readAsDataURL(file);
      });
      prepared.push({ id: `queued-${Date.now()}-${Math.random().toString(16).slice(2)}`, imageData, fileName: file.name });
    }

    if (state.replacingQueuedPhotoId) {
      const index = state.photoQueue.findIndex(item => item.id === state.replacingQueuedPhotoId);
      if (index >= 0) {
        state.photoQueue[index] = prepared[0];
      }
      state.replacingQueuedPhotoId = null;
      renderQueueState();
      event.target.value = '';
      return;
    }

    state.photoQueue = prepared;
    state.queueIndex = 0;
    state.importPieces = prepared.map((photo, index) => ({
      ...createImportPiece(),
      id: `import-piece-${Date.now()}-${index}`,
      garmentPhoto: photo.imageData
    }));
    state.importCurrentIndex = 0;
    state.importTab = 'photos';
    state.importOverlayOpen = true;
    state.importIntroDismissed = false;
    event.target.value = '';
    openImportOverlay();
    renderQueueState();
  });

  document.getElementById('uploadClosetBtn').addEventListener('click', () => {
    openImportOverlay();
  });

  document.getElementById('removeQueuedPhotoBtn').addEventListener('click', () => {
    if (!state.photoQueue.length) return;
    state.photoQueue.splice(state.queueIndex, 1);
    if (!state.photoQueue.length) {
      state.queueIndex = 0;
      renderQueueState();
      return;
    }
    state.queueIndex = Math.min(state.queueIndex, state.photoQueue.length - 1);
    renderQueueState();
  });

  document.getElementById('retakeQueuedPhotoBtn').addEventListener('click', () => {
    if (!state.photoQueue.length) return;
    state.replacingQueuedPhotoId = state.photoQueue[state.queueIndex]?.id || null;
    const input = document.getElementById('photoBatchInput');
    input.click();
  });

  document.getElementById('continueImportBtn').addEventListener('click', () => {
    openImportOverlay();
  });

  document.getElementById('startImportBtn').addEventListener('click', () => {
    state.importIntroDismissed = true;
    localStorage.setItem(userStorageKey('thrifi-import-intro-dismissed'), 'true');
    openImportOverlay();
  });

  document.getElementById('dismissImportIntroBtn').addEventListener('click', () => {
    state.importIntroDismissed = true;
    localStorage.setItem(userStorageKey('thrifi-import-intro-dismissed'), 'true');
    renderImportOverlay();
  });

  document.getElementById('closeImportOverlay').addEventListener('click', () => {
    closeImportOverlay();
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (state.importOverlayOpen) {
      closeImportOverlay();
      return;
    }
    state.leavingDraft = null;
    document.getElementById('detailCard').hidden = true;
  });

  document.getElementById('saveAndCloseImportBtn').addEventListener('click', () => {
    closeImportOverlay();
  });

  document.getElementById('finishImportBtn').addEventListener('click', () => {
    state.finishOverviewOpen = true;
    renderImportOverlay();
  });

  document.getElementById('finishLaterBtn').addEventListener('click', () => {
    state.finishOverviewOpen = false;
    closeImportOverlay();
  });

  document.getElementById('doneImportBtn').addEventListener('click', () => {
    state.importPieces.filter(piece => piece.category).forEach(piece => {
      if (piece.itemId && items.some(item => item.id === piece.itemId)) return;
      const itemId = piece.itemId || `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      piece.itemId = itemId;
      items.unshift({
        id: itemId,
        name: piece.name || 'Untitled piece',
        category: piece.category,
        fabric: piece.fabric || '',
        colors: [piece.color || '#d3d8ae'],
        seasons: piece.seasons || [],
        activities: piece.activities || [],
        brand: piece.brand || '',
        size_label: piece.sizeLabel || '',
        year_acquired: Number(piece.yearAcquired) || new Date().getFullYear(),
        source: piece.source || 'new',
        condition: piece.condition || 'good',
        fit_feedback: piece.fitFeedback || 'fits_well',
        usage_level: null,
        last_asked_at: null,
        snoozed_until: null,
        note: piece.note || '',
        import_state: 'described',
        status: 'active',
        left_reason: null,
        left_on: null,
        created_at: new Date().toISOString(),
        photo: piece.garmentPhoto || '',
        worn_on: []
      });
    });
    saveItems();
    state.importPieces = state.importPieces.filter(piece => !piece.itemId);
    saveImportDraft();
    state.finishOverviewOpen = false;
    closeImportOverlay();
    renderAll();
  });

  document.getElementById('importPhotoInput').addEventListener('change', async event => {
    const [file] = Array.from(event.target.files || []);
    if (!file) return;
    const role = event.target.dataset.role || 'garment';
    const current = getImportCurrentPiece();
    if (!current) return;
    const imageData = await prepareImportImage(file, 1200);
    current[`${role}Photo`] = imageData;
    current[`${role}Thumbnail`] = await resizeImportImage(imageData, 300);
    saveImportDraft();
    if (role === 'label') moveToNextImportPiece();
    renderImportOverlay();
    event.target.value = '';
  });

  document.getElementById('importOverlay').addEventListener('click', event => {
    if (event.target === event.currentTarget) {
      closeImportOverlay();
      return;
    }

    const tab = event.target.closest('[data-import-tab]');
    if (tab) {
      state.importTab = tab.dataset.importTab;
      renderImportOverlay();
      return;
    }

    const dot = event.target.closest('[data-import-index]');
    if (dot) {
      const index = Number(dot.dataset.importIndex);
      const maxIndex = state.importPieces.length;
      if (index >= maxIndex) {
        state.importPieces.push(createImportPiece());
        state.importCurrentIndex = maxIndex;
        state.importTab = 'photos';
      } else {
        state.importCurrentIndex = index;
      }
      renderImportOverlay();
      return;
    }

    if (event.target.closest('#jumpToUnfinishedBtn')) {
      const index = state.importPieces.findIndex(piece => !piece.category || !piece.fabric);
      if (index >= 0) {
        state.importCurrentIndex = index;
        state.importTab = 'details';
        state.finishOverviewOpen = false;
        renderImportOverlay();
      }
      return;
    }

    const deletePhoto = event.target.closest('[data-photo-delete]');
    if (deletePhoto) {
      queuePhotoDelete(deletePhoto.dataset.photoDelete);
      return;
    }

    const finishPiece = event.target.closest('[data-finish-piece]');
    if (finishPiece) {
      state.importCurrentIndex = Number(finishPiece.dataset.finishPiece);
      state.importTab = 'details';
      state.finishOverviewOpen = false;
      renderImportOverlay();
      return;
    }

    if (event.target.closest('[data-same-as-previous]')) {
      const current = getImportCurrentPiece();
      const previous = state.importPieces[state.importCurrentIndex - 1];
      if (current && previous?.fabric) {
        current.fabric = previous.fabric;
        saveImportDraft();
        renderImportOverlay();
      }
      return;
    }

    if (event.target.closest('#toggleMoreDetailsBtn')) {
      const current = getImportCurrentPiece();
      const optionalFields = document.getElementById('optionalImportDetails');
      optionalFields.hidden = !optionalFields.hidden;
      event.target.closest('#toggleMoreDetailsBtn').setAttribute('aria-expanded', String(!optionalFields.hidden));
      if (current) current.moreDetailsOpen = !optionalFields.hidden;
      saveImportDraft();
      return;
    }

    const photoAction = event.target.closest('[data-photo-role]');
    if (photoAction) {
      const input = document.getElementById('importPhotoInput');
      const role = photoAction.dataset.photoRole;
      if (role === 'skip-label') {
        const current = getImportCurrentPiece();
        if (current) {
          current.labelPhoto = '';
          current.labelThumbnail = '';
        }
        saveImportDraft();
        if (current?.garmentPhoto) moveToNextImportPiece();
        renderImportOverlay();
        return;
      }
      input.dataset.role = role;
      input.click();
      return;
    }
  });

  document.getElementById('importTabBody').addEventListener('input', event => {
    const current = getImportCurrentPiece();
    if (!current) return;
    const field = event.target.name;
    if (field === 'importCategory') current.category = event.target.value;
    if (field === 'importFabric') current.fabric = event.target.value;
    if (field === 'importColor') current.color = event.target.value;
    if (field === 'importName') current.name = event.target.value;
    if (field === 'importBrand') current.brand = event.target.value;
    if (field === 'importSizeLabel') current.sizeLabel = event.target.value;
    if (field === 'importYear') current.yearAcquired = Number(event.target.value) || new Date().getFullYear();
    if (field === 'importSource') current.source = event.target.value;
    if (field === 'importCondition') current.condition = event.target.value;
    if (field === 'importFit') current.fitFeedback = event.target.value;
    if (field === 'importNote') current.note = event.target.value;
    if (field === 'importSeasons') current.seasons = Array.from(event.target.selectedOptions).map(option => option.value);
    if (field === 'importActivities') current.activities = Array.from(event.target.selectedOptions).map(option => option.value);
    saveImportDraft();
    updateImportDots();
  });

  document.getElementById('toast').addEventListener('click', event => {
    if (event.target.closest('#undoPhotoDeleteBtn')) undoPhotoDelete();
  });

  document.getElementById('frequencySetting').addEventListener('change', event => {
    state.frequency = event.target.value;
    saveSettings();
    renderCheckInCard();
  });

  document.getElementById('showOverviewToggle').addEventListener('change', event => {
    state.showOverview = event.target.checked;
    saveSettings();
    renderOverview();
  });

  document.getElementById('exportDataBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'thrifi-export.json';
    link.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    if (!window.confirm('Delete all of your wardrobe data from this browser?')) return;
    items = [];
    saveItems();
    renderAll();
  });

  document.getElementById('checkInCard').addEventListener('click', event => {
    const button = event.target.closest('[data-checkin]');
    if (!button) return;
    const itemId = button.dataset.itemId;
    const item = items.find(piece => piece.id === itemId);
    if (!item) return;

    const answer = button.dataset.checkin;
    item.last_asked_at = new Date().toISOString().slice(0, 10);

    if (answer === 'not_now') {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      item.snoozed_until = nextWeek.toISOString();
      item.usage_level = item.usage_level || null;
    } else {
      item.usage_level = answer;
      item.snoozed_until = null;
    }

    saveItems();
    renderAll();
  });

  document.getElementById('deservesLoveView').addEventListener('click', event => {
    const actionButton = event.target.closest('[data-love-action]');
    if (!actionButton) return;
    const item = items.find(piece => piece.id === actionButton.dataset.itemId && piece.status === 'active');
    if (!item) return;
    const action = actionButton.dataset.loveAction;
    if (action === 'pass-on') {
      state.leavingDraft = { itemId: item.id, left_reason: null, left_destination: null, left_note: '' };
      const detail = document.getElementById('detailCard');
      detail.innerHTML = renderItemRemovalPrompt(item, 'reason', state.leavingDraft);
      detail.hidden = false;
      detail.querySelector('[name="leftReason"]').focus();
      return;
    }
    if (action === 'repair' || (action === 'keep-item' && actionButton.dataset.group === 'repair')) {
      item.condition = 'good';
    }
    if (action === 'fits' || (action === 'keep-item' && actionButton.dataset.group === 'fit')) {
      item.fit_status = 'fits';
      if (action === 'fits') item.fit_feedback = 'fits_well';
    }
    if (action === 'keep-item' && actionButton.dataset.group === 'waiting') {
      const checkInId = actionButton.dataset.checkInId;
      if (checkInId && !state.loveDismissed.checkInIds.includes(checkInId)) state.loveDismissed.checkInIds.push(checkInId);
      saveLoveDismissals();
    }
    if (action === 'keep-item' && actionButton.dataset.group === 'not-worn') {
      if (!state.loveDismissed.itemIds.includes(item.id)) state.loveDismissed.itemIds.push(item.id);
      saveLoveDismissals();
    }
    saveItems();
    renderAll();
  });

  document.getElementById('catalogGrid').addEventListener('click', event => {
    const button = event.target.closest('[data-detail-id]');
    if (!button) return;
    const item = items.find(piece => piece.id === button.dataset.detailId);
    if (!item) return;
    const detail = document.getElementById('detailCard');
    detail.innerHTML = renderItemDetail(item);
    detail.hidden = false;
    detail.querySelector('[data-close-detail]').focus();
  });

  document.getElementById('detailCard').addEventListener('click', event => {
    const detail = document.getElementById('detailCard');
    if (event.target === detail || event.target.closest('[data-close-detail]')) {
      state.leavingDraft = null;
      detail.hidden = true;
      return;
    }
    const removeButton = event.target.closest('[data-remove-item]');
    if (removeButton) {
      const item = items.find(piece => piece.id === removeButton.dataset.removeItem);
      if (!item) return;
      state.leavingDraft = { itemId: item.id, left_reason: null, left_destination: null, left_note: '' };
      detail.innerHTML = renderItemRemovalPrompt(item, 'reason', state.leavingDraft);
      detail.querySelector('[name="leftReason"]').focus();
      return;
    }
    const cancelRemoval = event.target.closest('[data-cancel-removal]');
    if (cancelRemoval) {
      const item = items.find(piece => piece.id === cancelRemoval.dataset.cancelRemoval);
      state.leavingDraft = null;
      if (item) detail.innerHTML = renderItemDetail(item);
      return;
    }
    const leaveStep = event.target.closest('[data-leave-step]');
    if (leaveStep) {
      const form = leaveStep.closest('[data-leave-item-form]');
      const item = items.find(piece => piece.id === form?.dataset.leaveItemForm);
      if (!item) return;
      const currentStep = form.dataset.step;
      const draft = state.leavingDraft;
      if (!draft || draft.itemId !== item.id) return;
      if (currentStep === 'reason') {
        draft.left_reason = leaveStep.dataset.skipStep ? null : form.elements.leftReason.value || null;
        detail.innerHTML = renderItemRemovalPrompt(item, 'destination', draft);
      } else if (currentStep === 'destination') {
        draft.left_destination = leaveStep.dataset.skipStep ? null : form.elements.leftDestination.value || null;
        detail.innerHTML = renderItemRemovalPrompt(item, 'note', draft);
        detail.querySelector('[name="leftNote"]').focus();
      }
      return;
    }
    const wornTodayButton = event.target.closest('[data-worn-today]');
    const wornYesterdayButton = event.target.closest('[data-worn-yesterday]');
    const itemId = wornTodayButton ? wornTodayButton.dataset.wornToday : (wornYesterdayButton ? wornYesterdayButton.dataset.wornYesterday : null);
    if (!itemId) return;
    const item = items.find(piece => piece.id === itemId);
    if (!item) return;
    const date = new Date();
    const fallbackDate = wornTodayButton ? date.toISOString().slice(0, 10) : new Date(date.getTime() - 86400000).toISOString().slice(0, 10);
    item.worn_on = item.worn_on || [];
    if (!item.worn_on.includes(fallbackDate)) {
      item.worn_on.push(fallbackDate);
      saveItems();
      renderAll();
    }
  });

  document.getElementById('detailCard').addEventListener('submit', event => {
    const form = event.target.closest('[data-leave-item-form]');
    if (!form) return;
    event.preventDefault();
    const item = items.find(piece => piece.id === form.dataset.leaveItemForm);
    if (!item) return;
    const draft = state.leavingDraft;
    if (!draft || draft.itemId !== item.id) return;
    if (form.dataset.step === 'reason') {
      draft.left_reason = form.elements.leftReason.value || null;
      document.getElementById('detailCard').innerHTML = renderItemRemovalPrompt(item, 'destination', draft);
      return;
    }
    if (form.dataset.step === 'destination') {
      draft.left_destination = form.elements.leftDestination.value || null;
      document.getElementById('detailCard').innerHTML = renderItemRemovalPrompt(item, 'note', draft);
      document.querySelector('#detailCard [name="leftNote"]').focus();
      return;
    }
    const detail = document.getElementById('detailCard');
    item.left_reason = draft.left_reason;
    item.left_destination = draft.left_destination;
    item.left_note = form.elements.leftNote.value.trim();
    item.status = 'left_closet';
    item.left_on = new Date().toISOString().slice(0, 10);
    state.leavingDraft = null;
    saveItems();
    detail.hidden = true;
    renderAll();
  });

  document.getElementById('settingsView').addEventListener('click', event => {
    const restoreButton = event.target.closest('[data-restore-item]');
    if (!restoreButton) return;
    const item = items.find(piece => piece.id === restoreButton.dataset.restoreItem);
    if (!item) return;
    item.status = 'active';
    saveItems();
    renderAll();
  });

  document.getElementById('wornSearch').addEventListener('input', event => {
    state.wornSearch = event.target.value.trim().toLowerCase();
    renderWornPicker();
  });

  document.getElementById('wornCategoryFilter').addEventListener('change', event => {
    state.wornCategory = event.target.value;
    renderWornPicker();
  });

  document.getElementById('wearDateInput').addEventListener('change', updateWearActionLabels);

  document.getElementById('wornTodayView').addEventListener('click', event => {
    const tab = event.target.closest('[data-worn-tab]');
    if (tab) {
      state.wornTab = tab.dataset.wornTab;
      state.wornStage = 'picker';
      state.activeFitId = null;
      renderWornToday();
      return;
    }

    const color = event.target.closest('[data-worn-color]');
    if (color) {
      state.wornColor = color.dataset.wornColor;
      renderWornPicker();
      return;
    }

    const selectPiece = event.target.closest('[data-select-worn-item]');
    if (selectPiece) {
      toggleSelectedItem(selectPiece.dataset.selectWornItem);
      renderWornPicker();
      return;
    }

    if (event.target.closest('#seeOutfitBtn')) {
      state.wornStage = 'overview';
      state.activeFitId = null;
      renderWornToday();
      return;
    }

    if (event.target.closest('#backToWornPickerBtn')) {
      state.wornStage = 'picker';
      state.activeFitId = null;
      renderWornToday();
      return;
    }

    const openFit = event.target.closest('[data-open-fit]');
    if (openFit) {
      const fit = state.savedFits.find(savedFit => savedFit.id === openFit.dataset.openFit);
      if (!fit) return;
      state.selectedItemIds = fit.itemIds.filter(id => items.some(item => item.id === id && item.status === 'active'));
      state.activeFitId = fit.id;
      state.wornTab = 'fits';
      state.wornStage = 'overview';
      document.getElementById('wearDateInput').value = getLocalDateString();
      renderWornToday();
      return;
    }

    if (event.target.closest('#logWornOutfitBtn, #logSavedFitBtn')) {
      logWornItems(state.selectedItemIds, document.getElementById('wearDateInput').value);
      return;
    }

    if (event.target.closest('#renameSavedFitBtn')) {
      state.fitRenameOpen = true;
      renderWornToday();
      document.getElementById('renameFitInput')?.focus();
      return;
    }

    if (event.target.closest('#deleteSavedFitBtn')) {
      state.savedFits = state.savedFits.filter(fit => fit.id !== state.activeFitId);
      saveFits();
      state.activeFitId = null;
      state.wornStage = 'picker';
      renderWornToday();
      return;
    }
  });

  document.getElementById('wornTodayView').addEventListener('submit', event => {
    if (event.target.id === 'saveFitForm') {
      event.preventDefault();
      const itemIds = [...new Set(state.selectedItemIds)].filter(id => items.some(item => item.id === id && item.status === 'active'));
      if (!itemIds.length) return;
      const fit = {
        id: `fit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: document.getElementById('fitNameInput').value.trim(),
        itemIds,
        created_at: new Date().toISOString()
      };
      state.savedFits.unshift(fit);
      saveFits();
      state.activeFitId = fit.id;
      renderWornToday();
      return;
    }

    if (event.target.id === 'renameFitForm') {
      event.preventDefault();
      const fit = state.savedFits.find(savedFit => savedFit.id === state.activeFitId);
      if (!fit) return;
      fit.name = document.getElementById('renameFitInput').value.trim();
      saveFits();
      state.fitRenameOpen = false;
      renderWornToday();
    }
  });

  document.getElementById('toast').addEventListener('click', event => {
    if (event.target.closest('#undoWearLogBtn')) undoWornLog();
  });
}

function getActiveItems() {
  return items.filter(item => item.status === 'active');
}

function getDeservesLoveGroups() {
  const active = getActiveItems();
  const needsRepair = active.filter(item => ['needs_repair', 'needs_care'].includes(item.condition));
  const repairIds = new Set(needsRepair.map(item => item.id));
  const doesntFit = active.filter(item => item.fit_status === 'no_longer_fits' && !repairIds.has(item.id));
  const flaggedIds = new Set([...repairIds, ...doesntFit.map(item => item.id)]);
  const latestWaitingByItem = new Map();
  state.checkIns.forEach((checkIn, index) => {
    const itemId = checkIn.item_id || checkIn.itemId;
    if (!itemId || !['not_me', 'not_sure'].includes(checkIn.reason) || state.loveDismissed.checkInIds.includes(checkIn.id)) return;
    if (!active.some(item => item.id === itemId) || flaggedIds.has(itemId)) return;
    latestWaitingByItem.set(itemId, { checkIn, index });
  });
  const waiting = Array.from(latestWaitingByItem, ([itemId, value]) => ({
    item: active.find(piece => piece.id === itemId),
    checkIn: value.checkIn
  }));
  const waitingIds = new Set(waiting.map(entry => entry.item.id));
  const notWorn = active.filter(item => {
    if (flaggedIds.has(item.id) || waitingIds.has(item.id) || state.loveDismissed.itemIds.includes(item.id)) return false;
    const lastDate = getLastWornDate(item) || item.created_at?.slice(0, 10);
    if (!lastDate) return item.usage_level === 'rarely';
    const date = new Date(`${lastDate}T00:00:00`);
    const daysSince = (new Date(`${getLocalDateString()}T00:00:00`) - date) / 86400000;
    return item.usage_level === 'rarely' || daysSince > 60;
  });
  return [
    { key: 'repair', title: 'Needs a repair', items: needsRepair },
    { key: 'fit', title: "Doesn't fit anymore", items: doesntFit },
    { key: 'not-worn', title: 'Not worn in a while', items: notWorn },
    { key: 'waiting', title: 'Waiting', items: waiting }
  ];
}

function renderDeservesLove() {
  const groups = getDeservesLoveGroups();
  const entries = groups.flatMap(group => group.items);
  const count = new Set(entries.map(entry => entry.item?.id || entry.id)).size;
  document.getElementById('deservesLoveCount').textContent = `${count} ${count === 1 ? 'piece' : 'pieces'}`;
  const groupMarkup = groups.filter(group => group.items.length).map(group => `
    <section class="love-group" aria-labelledby="love-${group.key}-title">
      <header class="love-group-header"><h2 id="love-${group.key}-title">${group.title}</h2><span>${group.items.length}</span></header>
      <div class="love-group-list">${group.items.map(entry => {
        const item = entry.item || entry;
        const waitingReason = entry.checkIn?.reason === 'not_me' ? 'Not really me' : 'Not sure';
        const image = item.photo ? `<img src="${item.photo}" alt="">` : `<span class="love-item-placeholder" style="--tile-color:${item.colors?.[0] || '#d8d8c8'}">${item.category || 'Garment'}</span>`;
        const keepAttrs = group.key === 'waiting' ? `data-check-in-id="${entry.checkIn.id}"` : '';
        const primaryAction = group.key === 'repair' ? `<button class="secondary-button" type="button" data-love-action="repair" data-item-id="${item.id}">Mark as repaired</button>`
          : group.key === 'fit' ? `<button class="secondary-button" type="button" data-love-action="fits" data-item-id="${item.id}">It fits again</button>` : '';
        return `<article class="love-item-row">
          <div class="love-item-identity"><div class="love-item-image">${image}</div><div><h3>${item.name || 'Untitled garment'}</h3><p>${item.category || 'Garment'}${group.key === 'waiting' ? ` · ${waitingReason}` : ''}</p></div></div>
          <div class="love-item-actions">${primaryAction}<button class="secondary-button" type="button" data-love-action="keep-item" data-group="${group.key}" data-item-id="${item.id}" ${keepAttrs}>Keep as it is</button><button class="secondary-button" type="button" data-love-action="pass-on" data-item-id="${item.id}">Passing it on</button></div>
        </article>`;
      }).join('')}</div>
    </section>
  `).join('');
  document.getElementById('deservesLoveGroups').innerHTML = groupMarkup || '<p class="deserves-love-empty">Nothing waiting. Your closet is in good shape for now.</p>';
}

function renderItemDetail(item) {
  return `
    <div class="detail-card__panel">
      <button class="detail-card__close ghost-button" type="button" data-close-detail aria-label="Close item details">×</button>
      <div class="detail-card__top">
        <div class="detail-card__photo" style="background:${item.colors?.[0] || '#d8f04f'}"></div>
        <div>
          <p class="eyebrow text-uppercase">${item.category}</p>
          <h3 id="detailTitle">${item.name}</h3>
          <p>${item.fabric} · ${item.brand || 'No brand noted'}</p>
        </div>
      </div>
      <dl class="detail-list">
        <div><dt>Year acquired</dt><dd>${item.year_acquired}</dd></div>
        <div><dt>Source</dt><dd>${item.source}</dd></div>
        <div><dt>Fit</dt><dd>${item.fit_feedback}</dd></div>
        <div><dt>Condition</dt><dd>${item.condition}</dd></div>
      </dl>
      <div class="detail-actions">
        <button class="secondary" type="button" data-worn-today="${item.id}">Worn today</button>
        <button class="secondary" type="button" data-worn-yesterday="${item.id}">Worn yesterday</button>
        <button class="danger-button" type="button" data-remove-item="${item.id}">Remove garment</button>
      </div>
    </div>
  `;
}

function renderItemRemovalPrompt(item, step, draft) {
  const reasonOptions = [
    ['doesnt_fit', "Doesn't fit"],
    ['worn_out', 'Worn out or damaged'],
    ['not_me', 'Not really me'],
    ['dont_wear', "Don't wear it"],
    ['replaced', 'Replaced it'],
    ['other', 'Other']
  ];
  const destinationOptions = [
    ['donate', 'Donate'],
    ['sell', 'Sell'],
    ['give', 'Give to someone'],
    ['swap', 'Swap'],
    ['recycle', 'Textile recycling'],
    ['repurpose', 'Repurpose'],
    ['throw_away', 'Throw away'],
    ['undecided', 'Not decided yet']
  ];
  let stepContent = '';
  if (step === 'reason') {
    stepContent = `
      <h3>What's the reason?</h3>
      <label class="field-inline">
        <span>Reason (optional)</span>
        <select name="leftReason">
          <option value="">Choose a reason or skip</option>
          ${reasonOptions.map(([value, label]) => `<option value="${value}" ${draft.left_reason === value ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
      </label>
      <div class="detail-actions">
        <button class="secondary-button" type="button" data-cancel-removal="${item.id}">Keep garment</button>
        <button class="secondary-button" type="button" data-leave-step="destination" data-skip-step="true">Skip</button>
        <button class="primary-button" type="button" data-leave-step="destination">Next</button>
      </div>
    `;
  } else if (step === 'destination') {
    stepContent = `
      <h3>What will happen to it?</h3>
      <label class="field-inline">
        <span>Destination (optional)</span>
        <select name="leftDestination">
          <option value="">Choose a destination or skip</option>
          ${destinationOptions.map(([value, label]) => `<option value="${value}" ${draft.left_destination === value ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
      </label>
      <div class="detail-actions">
        <button class="secondary-button" type="button" data-cancel-removal="${item.id}">Keep garment</button>
        <button class="secondary-button" type="button" data-leave-step="note" data-skip-step="true">Skip</button>
        <button class="primary-button" type="button" data-leave-step="note">Next</button>
      </div>
    `;
  } else {
    stepContent = `
      <h3>Anything you'd like to note?</h3>
      <label class="field-inline">
        <span>Note (optional)</span>
        <textarea name="leftNote" rows="3" placeholder="A small memory or detail">${draft.left_note || ''}</textarea>
      </label>
      <div class="detail-actions">
        <button class="secondary-button" type="button" data-cancel-removal="${item.id}">Keep garment</button>
        <button class="primary-button" type="submit">Move to history</button>
      </div>
    `;
  }

  return `
    <div class="detail-card__panel">
      <button class="detail-card__close ghost-button" type="button" data-close-detail aria-label="Close leaving flow">×</button>
      <p class="eyebrow text-uppercase">Leaving my closet · ${item.name}</p>
      <form class="removal-reason-form" data-leave-item-form="${item.id}" data-step="${step}">
        ${stepContent}
      </form>
    </div>
  `;
}

function getSegmentForItem(item) {
  if (item.usage_level === 'not_anymore') return 'ready_to_pass_on';
  if (item.condition === 'needs_care') return 'needs_care';
  if (item.usage_level === 'rarely') return 'rarely_worn';
  if (['often', 'sometimes'].includes(item.usage_level)) return 'in_rotation';
  return 'not_reviewed';
}

function averageYears(activeItemsList) {
  if (!activeItemsList.length) return 0;
  const currentYear = new Date().getFullYear();
  const total = activeItemsList.reduce((sum, item) => sum + (currentYear - Number(item.year_acquired || currentYear)), 0);
  return total / activeItemsList.length;
}

function renderOverview() {
  const overview = document.getElementById('overviewCard');
  const active = getActiveItems();
  const average = averageYears(active);
  document.getElementById('overviewSentence').textContent = `Your pieces have been with you ${average.toFixed(1)} years on average.`;
  overview.hidden = !state.showOverview;

  const segmentOrder = ['in_rotation', 'needs_care', 'rarely_worn', 'ready_to_pass_on', 'not_reviewed'];
  const counts = Object.fromEntries(segmentOrder.map(key => [key, active.filter(item => getSegmentForItem(item) === key).length]));
  const total = active.length || 1;

  const barMarkup = segmentOrder.map(key => {
    const count = counts[key];
    const width = (count / total) * 100;
    const activeClass = state.segment === key ? ' is-active' : '';
    const segmentName = SEGMENTS.find(item => item.key === key)?.label || key;
    return `
      <button class="health-segment${activeClass}" data-segment="${key}" type="button" style="width:${width}%" title="${segmentName}: ${count}">
        <span>${count}</span>
      </button>
    `;
  }).join('');

  document.getElementById('segmentStrip').innerHTML = `
    <div class="health-bar" aria-label="Closet health overview">${barMarkup}</div>
  `;

  document.getElementById('showOverviewToggle').checked = state.showOverview;
  document.getElementById('frequencySetting').value = state.frequency;
}

function renderCheckInCard() {
  const card = document.getElementById('checkInCard');
  if (state.frequency === 'never') {
    card.hidden = true;
    return;
  }

  const frequencyDays = { weekly: 7, monthly: 30 };
  const dueItems = getActiveItems()
    .filter(item => {
      if (!item.last_asked_at) return true;
      if (item.snoozed_until) {
        const snoozed = new Date(item.snoozed_until);
        return snoozed <= new Date();
      }
      const daysSince = (new Date() - new Date(item.last_asked_at)) / 86400000;
      return daysSince >= (frequencyDays[state.frequency] || 7);
    })
    .sort((a, b) => new Date(a.last_asked_at || '2000-01-01') - new Date(b.last_asked_at || '2000-01-01'));

  const item = dueItems[0];
  if (!item) {
    card.hidden = true;
    return;
  }

  card.hidden = false;
  card.innerHTML = `
    <div class="checkin-card__body">
      <p class="eyebrow text-uppercase">Quiet check-in</p>
      <h3>${item.name}</h3>
      <p>Still wear this?</p>
      <div class="checkin-actions">
        <button type="button" data-checkin="often" data-item-id="${item.id}">Often</button>
        <button type="button" data-checkin="sometimes" data-item-id="${item.id}">Sometimes</button>
        <button type="button" data-checkin="rarely" data-item-id="${item.id}">Rarely</button>
        <button type="button" data-checkin="not_anymore" data-item-id="${item.id}">Not anymore</button>
        <button type="button" data-checkin="not_now" data-item-id="${item.id}">Not now</button>
      </div>
    </div>
  `;
}

function renderCatalog() {
  const grid = document.getElementById('catalogGrid');
  const active = getActiveItems().filter(item => {
    if (state.segment !== 'all' && getSegmentForItem(item) !== state.segment) return false;
    if (state.category !== 'all' && item.category !== state.category) return false;
    if (state.season !== 'all' && !item.seasons.includes(state.season)) return false;
    if (state.activity !== 'all' && !item.activities.includes(state.activity)) return false;
    if (state.fabric !== 'all' && item.fabric !== state.fabric) return false;
    if (state.search && !JSON.stringify(Object.values(item)).join(' ').toLowerCase().includes(state.search)) return false;
    return true;
  });

  if (state.colourView) {
    const palette = {};
    active.forEach(item => {
      const color = item.colors[0] || '#d8f04f';
      palette[color] = (palette[color] || 0) + 1;
    });

    if (!Object.keys(palette).length) {
      grid.innerHTML = '<div class="empty-state">No colours to show yet.</div>';
      return;
    }

    grid.innerHTML = Object.entries(palette).map(([color, count]) => `
      <article class="colour-card" style="background:${color}">
        <span>${count} piece${count > 1 ? 's' : ''}</span>
        <strong>${color}</strong>
      </article>
    `).join('');
    return;
  }

  if (!active.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No pieces here yet</h3>
        <p>Add a piece and your closet will start to feel familiar.</p>
        <button class="primary-button" type="button" data-view="add">Add pieces</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = active.map(item => {
    const color = item.colors[0] || '#d8f04f';
    const years = Math.max(0, new Date().getFullYear() - Number(item.year_acquired || new Date().getFullYear()));
    const statusLabel = item.usage_level ? item.usage_level.replace('_', ' ') : 'not reviewed yet';
    return `
      <article class="piece-card">
        <div class="piece-photo" style="background:${color}">
          <span>${item.category}</span>
        </div>
        <div class="piece-card__body">
          <div class="piece-head">
            <h3>${item.name}</h3>
            <span class="swatch" style="background:${color}"></span>
          </div>
          <p class="meta-line">${item.fabric} · ${item.brand || 'No brand yet'}</p>
          <div class="piece-foot">
            <span>${years} years</span>
            <span>${statusLabel}</span>
          </div>
          <div class="piece-actions">
            <button type="button" data-detail-id="${item.id}">Details</button>
            <button type="button" class="primary-button" data-worn-today="${item.id}">Worn today</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  document.querySelectorAll('[data-view="add"]').forEach(button => {
    button.addEventListener('click', () => {
      state.view = 'add';
      renderAll();
    });
  });

  document.querySelectorAll('[data-detail-id]').forEach(button => {
    button.addEventListener('click', () => {
      document.getElementById('detailCard').hidden = false;
      const item = items.find(piece => piece.id === button.dataset.detailId);
      if (!item) return;
      document.getElementById('detailCard').innerHTML = renderItemDetail(item);
      document.getElementById('detailCard').querySelector('[data-close-detail]').focus();
    });
  });

  document.querySelectorAll('[data-worn-today]').forEach(button => {
    button.addEventListener('click', () => {
      const item = items.find(piece => piece.id === button.dataset.wornToday);
      if (!item) return;
      const date = new Date().toISOString().slice(0, 10);
      item.worn_on = item.worn_on || [];
      if (!item.worn_on.includes(date)) {
        item.worn_on.push(date);
      }
      item.usage_level = item.usage_level || 'sometimes';
      saveItems();
      renderAll();
    });
  });

  document.querySelectorAll('[data-worn-yesterday]').forEach(button => {
    button.addEventListener('click', () => {
      const item = items.find(piece => piece.id === button.dataset.wornYesterday);
      if (!item) return;
      const date = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      item.worn_on = item.worn_on || [];
      if (!item.worn_on.includes(date)) {
        item.worn_on.push(date);
      }
      item.usage_level = item.usage_level || 'sometimes';
      saveItems();
      renderAll();
    });
  });
}

function createImportPiece() {
  return {
    id: `import-piece-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    garmentPhoto: '',
    garmentThumbnail: '',
    labelPhoto: '',
    labelThumbnail: '',
    category: '',
    fabric: '',
    color: '#d3d8ae',
    name: '',
    brand: '',
    sizeLabel: '',
    yearAcquired: new Date().getFullYear(),
    source: 'new',
    condition: 'good',
    fitFeedback: 'fits_well',
    seasons: [],
    activities: [],
    note: ''
  };
}

function getArchivedItems() {
  return items.filter(item => item.status === 'left_closet' || ['donated', 'sold', 'discarded'].includes(item.status))
    .sort((a, b) => new Date(b.left_on || 0) - new Date(a.left_on || 0));
}

function getKeptDuration(item) {
  const acquiredYear = Number(item.year_acquired);
  const leftDate = item.left_on ? new Date(`${item.left_on}T00:00:00`) : null;
  if (!Number.isFinite(acquiredYear) || !leftDate || Number.isNaN(leftDate.getTime())) return null;
  const acquiredDate = new Date(acquiredYear, 0, 1);
  return Math.max(0, (leftDate - acquiredDate) / (365.2425 * 24 * 60 * 60 * 1000));
}

function formatKeptDuration(years) {
  if (years === null) return 'Time kept unavailable';
  if (years < 1) return 'Less than a year';
  const wholeYears = Math.floor(years);
  const months = Math.floor((years - wholeYears) * 12);
  return `About ${wholeYears} year${wholeYears === 1 ? '' : 's'}${months ? `, ${months} month${months === 1 ? '' : 's'}` : ''}`;
}

function renderPastGarments() {
  const archived = getArchivedItems();
  const summary = document.getElementById('pastGarmentsSummary');
  const list = document.getElementById('pastGarmentsList');
  if (!archived.length) {
    summary.textContent = 'No garments removed yet';
    list.innerHTML = '<p class="past-garments-empty">Removed garments and their history will appear here.</p>';
    return;
  }

  const durations = archived.map(getKeptDuration).filter(duration => duration !== null);
  const average = durations.length ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length : null;
  const thrownAway = archived.filter(item => item.status === 'discarded' || item.left_destination === 'throw_away').length;
  summary.textContent = `${archived.length} left · ${thrownAway} thrown away · ${formatKeptDuration(average)} average kept`;
  list.innerHTML = archived.map(item => {
    const wearCount = Array.isArray(item.worn_on) ? item.worn_on.length : 0;
    const reason = item.left_reason ? item.left_reason.replaceAll('_', ' ') : 'Reason not noted';
    const destination = item.left_destination ? item.left_destination.replaceAll('_', ' ') : item.status === 'left_closet' ? 'Destination not noted' : item.status;
    const date = item.left_on ? new Date(`${item.left_on}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Date unavailable';
    return `<article class="past-garment-row">
      <div class="past-garment-main">
        <h3>${item.name || 'Untitled garment'}</h3>
        <p>${item.category || 'Garment'} · ${reason} · ${destination}</p>
      </div>
      <div class="past-garment-meta">
        <span>${formatKeptDuration(getKeptDuration(item))}</span>
        <span>Left ${date}</span>
        <span>Worn ${wearCount} time${wearCount === 1 ? '' : 's'}</span>
        <button class="secondary-button" type="button" data-restore-item="${item.id}">Restore</button>
      </div>
    </article>`;
  }).join('');
}

function getImportCurrentPiece() {
  return state.importPieces[state.importCurrentIndex] || null;
}

function prepareImportImage(file, maxDimension) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        resolve(await resizeImportImage(reader.result, maxDimension));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Unable to read image'));
    reader.readAsDataURL(file);
  });
}

function resizeImportImage(source, maxDimension) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    image.onerror = () => reject(new Error('Unable to prepare image'));
    image.src = source;
  });
}

function moveToNextImportPiece() {
  if (state.importCurrentIndex === state.importPieces.length - 1) {
    state.importPieces.push(createImportPiece());
  }
  state.importCurrentIndex = Math.min(state.importCurrentIndex + 1, state.importPieces.length - 1);
  state.importTab = 'photos';
}

function updateImportDots() {
  const dotRow = document.getElementById('importDotRow');
  if (!dotRow) return;
  dotRow.querySelectorAll('[data-import-index]').forEach((dot, index) => {
    if (index >= state.importPieces.length) return;
    const piece = state.importPieces[index];
    const level = piece.category && piece.fabric ? 'full' : piece.category ? 'half' : 'empty';
    dot.classList.remove('empty', 'half', 'full');
    dot.classList.add(level);
  });
}

function queuePhotoDelete(role) {
  if (state.pendingPhotoDelete) commitPhotoDelete();
  const piece = getImportCurrentPiece();
  if (!piece || !piece[`${role}Photo`]) return;
  piece[`${role}DeletePending`] = true;
  state.pendingPhotoDelete = { pieceId: piece.id, role };
  renderImportOverlay();
  const toast = document.getElementById('toast');
  toast.innerHTML = 'Photo deleted <button id="undoPhotoDeleteBtn" class="toast-undo" type="button">Undo</button>';
  toast.hidden = false;
  state.pendingPhotoDelete.timer = setTimeout(commitPhotoDelete, 6000);
}

function undoPhotoDelete() {
  if (!state.pendingPhotoDelete) return;
  clearTimeout(state.pendingPhotoDelete.timer);
  const { pieceId, role } = state.pendingPhotoDelete;
  const piece = state.importPieces.find(item => item.id === pieceId);
  if (piece) delete piece[`${role}DeletePending`];
  state.pendingPhotoDelete = null;
  document.getElementById('toast').hidden = true;
  renderImportOverlay();
}

function commitPhotoDelete() {
  if (!state.pendingPhotoDelete) return;
  const { pieceId, role } = state.pendingPhotoDelete;
  const piece = state.importPieces.find(item => item.id === pieceId);
  if (piece) {
    delete piece[`${role}Photo`];
    delete piece[`${role}Thumbnail`];
    delete piece[`${role}DeletePending`];
  }
  state.pendingPhotoDelete = null;
  document.getElementById('toast').hidden = true;
  saveImportDraft();
  renderImportOverlay();
}

function openImportOverlay() {
  state.importOverlayOpen = true;
  if (!state.importPieces.length) {
    state.importPieces = [createImportPiece()];
    state.importCurrentIndex = 0;
  }
  saveImportDraft();
  renderImportOverlay();
}

function closeImportOverlay() {
  state.importOverlayOpen = false;
  document.getElementById('importOverlay').hidden = true;
}

function renderContinueCard() {
  const card = document.getElementById('continueCard');
  const count = state.importPieces.filter(piece => piece.garmentPhoto || piece.labelPhoto || piece.category).length;
  if (!count) {
    card.hidden = true;
    return;
  }
  card.hidden = false;
  document.getElementById('continueCardTitle').textContent = `${count} photographed`;
}

function renderImportOverlay() {
  const overlay = document.getElementById('importOverlay');
  const intro = document.getElementById('importIntro');
  const content = document.getElementById('importContent');
  const finish = document.getElementById('importFinish');
  const dotRow = document.getElementById('importDotRow');
  const counter = document.getElementById('importCounter');
  const jumpButton = document.getElementById('jumpToUnfinishedBtn');

  if (!state.importOverlayOpen || state.view !== 'add') {
    overlay.hidden = true;
    return;
  }

  overlay.hidden = false;
  dotRow.hidden = !state.importIntroDismissed || state.finishOverviewOpen;
  counter.hidden = !state.importIntroDismissed || state.finishOverviewOpen;
  jumpButton.hidden = !state.importIntroDismissed || state.finishOverviewOpen;
  document.getElementById('finishImportBtn').hidden = !state.importIntroDismissed || state.finishOverviewOpen;
  document.getElementById('saveAndCloseImportBtn').hidden = !state.importIntroDismissed || state.finishOverviewOpen;

  if (!state.importIntroDismissed) {
    intro.hidden = false;
    content.hidden = true;
    finish.hidden = true;
    return;
  }

  intro.hidden = true;
  content.hidden = state.finishOverviewOpen;
  finish.hidden = !state.finishOverviewOpen;
  if (!state.importPieces.length) {
    state.importPieces = [createImportPiece()];
  }

  if (state.importCurrentIndex >= state.importPieces.length) {
    state.importCurrentIndex = state.importPieces.length - 1;
  }

  const pieces = state.importPieces;
  dotRow.innerHTML = pieces.map((piece, index) => {
    const level = piece.category && piece.fabric ? 'full' : piece.category ? 'half' : 'empty';
    const active = index === state.importCurrentIndex ? ' is-active' : '';
    const status = `${piece.category ? 'category set' : 'category missing'}, ${piece.fabric ? 'fabric set' : 'fabric missing'}`;
    return `<button class="import-dot ${level}${active}" data-import-index="${index}" type="button" aria-label="Piece ${index + 1}, ${status}"></button>`;
  }).join('') + `<button class="import-dot add-dot" type="button" data-import-index="${pieces.length}" aria-label="Add new piece">+</button>`;

  const activeDot = dotRow.querySelector('.is-active');
  if (activeDot) activeDot.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  counter.textContent = `Piece ${state.importCurrentIndex + 1} of ${pieces.length}`;
  jumpButton.disabled = !pieces.some(piece => !piece.category || !piece.fabric);

  if (state.finishOverviewOpen) {
    const unfinished = pieces.map((piece, index) => ({ piece, index })).filter(({ piece }) => !piece.category || !piece.fabric);
    const heading = document.getElementById('finishImportHeading');
    const message = document.getElementById('finishImportMessage');
    const grid = document.getElementById('finishImportGrid');
    heading.textContent = unfinished.length ? 'A few pieces have room for more' : 'Your pieces are all described';
    message.textContent = unfinished.length ? `${unfinished.length} ${unfinished.length === 1 ? 'piece has' : 'pieces have'} room for more.` : '';
    grid.innerHTML = unfinished.map(({ piece, index }) => {
      const photo = piece.garmentThumbnail || piece.garmentPhoto;
      return `<button class="finish-import-item" type="button" data-finish-piece="${index}" aria-label="Open piece ${index + 1} details">
        ${photo ? `<img src="${photo}" alt="">` : '<span class="finish-photo-empty">No photo</span>'}
        <span>Piece ${index + 1}</span>
      </button>`;
    }).join('');
    return;
  }

  const current = getImportCurrentPiece();
  if (!current) {
    return;
  }

  const tabBody = document.getElementById('importTabBody');
  const tabs = Array.from(document.querySelectorAll('.import-tab'));
  tabs.forEach(button => button.classList.toggle('is-active', button.dataset.importTab === state.importTab));

  if (state.importTab === 'photos') {
    const categoryHint = ['shoes', 'bags'].includes(current.category) ? 'Photograph from above, showing the whole item.' : 'Flat, from above, near a window, no flash.';
    const photoMarkup = role => {
      const photo = current[`${role}Thumbnail`] || current[`${role}Photo`];
      const pending = current[`${role}DeletePending`];
      const label = role === 'garment' ? 'Garment photo' : 'Label photo';
      if (!photo || pending) return `<div class="import-photo-box camera-guide" aria-label="${label} not added"><span>${pending ? 'Photo will be deleted' : 'Add photo'}</span></div>`;
      return `<div class="import-photo-box photo-thumb"><img src="${photo}" alt="${label}"><button class="photo-delete" type="button" data-photo-delete="${role}" aria-label="Delete ${label}">×</button></div>`;
    };
    tabBody.innerHTML = `
      <div class="import-photo-pair">
        <div class="import-photo-card">
          <label class="import-photo-label">Garment</label>
          ${photoMarkup('garment')}
          <p class="photo-hint">${categoryHint}</p>
          <button class="secondary-button" type="button" data-photo-role="garment">${current.garmentPhoto ? 'Replace photo' : 'Upload photo'}</button>
        </div>
        <div class="import-photo-card">
          <label class="import-photo-label">Label</label>
          ${photoMarkup('label')}
          <p class="photo-hint">Care and composition tags.</p>
          <button class="secondary-button" type="button" data-photo-role="label">${current.labelPhoto ? 'Replace photo' : 'Choose from gallery'}</button>
          <button class="secondary-button" type="button" data-photo-role="skip-label">Skip label</button>
        </div>
      </div>
      <div class="import-step-actions">
        <button class="secondary-button" type="button" data-import-index="${Math.max(0, state.importCurrentIndex - 1)}" aria-label="Previous piece">← Previous</button>
        <button class="secondary-button" type="button" data-import-index="${state.importCurrentIndex + 1}" aria-label="Next piece">Next →</button>
      </div>
    `;
  } else {
    const photoMarkup = (image, alt) => image ? `<img src="${image}" alt="${alt}">` : '<span>No photo</span>';
    tabBody.innerHTML = `
      <div class="import-details-grid">
        <div class="import-photos-inline">
          <div class="detail-mini-photo">${photoMarkup(current.garmentThumbnail || current.garmentPhoto, 'Garment photo')}</div>
          <div class="detail-mini-photo">${photoMarkup(current.labelThumbnail || current.labelPhoto, 'Label photo')}</div>
        </div>

        <label class="field-inline">
          <span>Category</span>
          <select name="importCategory">
            <option value="">Choose a category</option>
            ${CATEGORIES.map(category => `<option value="${category}" ${current.category === category ? 'selected' : ''}>${category}</option>`).join('')}
          </select>
        </label>

        <label class="field-inline">
          <span>Fabric</span>
          <select name="importFabric">
            <option value="">Choose a fabric</option>
            ${FABRICS.map(fabric => `<option value="${fabric}" ${current.fabric === fabric ? 'selected' : ''}>${fabric}</option>`).join('')}
          </select>
        </label>

        <button class="text-button" type="button" data-same-as-previous ${state.importCurrentIndex === 0 || !pieces[state.importCurrentIndex - 1]?.fabric ? 'disabled' : ''}>Same as previous</button>

        <label class="field-inline">
          <span>Colour</span>
          <input type="color" name="importColor" value="${current.color || '#d3d8ae'}">
        </label>

        <button id="toggleMoreDetailsBtn" class="text-button" type="button" aria-expanded="${Boolean(current.moreDetailsOpen)}">${current.moreDetailsOpen ? 'Hide extra details' : 'Add more details'}</button>
        <div id="optionalImportDetails" class="optional-import-details" ${current.moreDetailsOpen ? '' : 'hidden'}>

        <label class="field-inline">
          <span>Name</span>
          <input type="text" name="importName" value="${current.name || ''}" placeholder="Soft cotton cardigan">
        </label>

        <label class="field-inline">
          <span>Brand</span>
          <input type="text" name="importBrand" value="${current.brand || ''}" placeholder="Optional">
        </label>

        <label class="field-inline">
          <span>Size</span>
          <input type="text" name="importSizeLabel" value="${current.sizeLabel || ''}" placeholder="Optional">
        </label>

        <label class="field-inline">
          <span>Year it came to you</span>
          <input type="number" name="importYear" value="${current.yearAcquired || new Date().getFullYear()}" min="1900">
        </label>

        <label class="field-inline">
          <span>Source</span>
          <select name="importSource">
            <option value="new" ${current.source === 'new' ? 'selected' : ''}>new</option>
            <option value="secondhand" ${current.source === 'secondhand' ? 'selected' : ''}>secondhand</option>
            <option value="gifted" ${current.source === 'gifted' ? 'selected' : ''}>gifted</option>
            <option value="swapped" ${current.source === 'swapped' ? 'selected' : ''}>swapped</option>
            <option value="inherited" ${current.source === 'inherited' ? 'selected' : ''}>inherited</option>
          </select>
        </label>

        <label class="field-inline">
          <span>Condition</span>
          <select name="importCondition">
            <option value="good" ${current.condition === 'good' ? 'selected' : ''}>good</option>
            <option value="needs_care" ${current.condition === 'needs_care' ? 'selected' : ''}>needs_care</option>
          </select>
        </label>

        <label class="field-inline">
          <span>Fit feedback</span>
          <select name="importFit">
            <option value="fits_well" ${current.fitFeedback === 'fits_well' ? 'selected' : ''}>fits_well</option>
            <option value="runs_small" ${current.fitFeedback === 'runs_small' ? 'selected' : ''}>runs_small</option>
            <option value="runs_large" ${current.fitFeedback === 'runs_large' ? 'selected' : ''}>runs_large</option>
          </select>
        </label>

        <label class="field-inline full-width">
          <span>Note</span>
          <textarea name="importNote" rows="3" placeholder="Optional">${current.note || ''}</textarea>
        </label>
        <label class="field-inline">
          <span>Season</span>
          <select name="importSeasons" multiple>${['spring', 'summer', 'autumn', 'winter'].map(value => `<option value="${value}" ${(current.seasons || []).includes(value) ? 'selected' : ''}>${value}</option>`).join('')}</select>
        </label>
        <label class="field-inline">
          <span>Activity</span>
          <select name="importActivities" multiple>${['everyday', 'work', 'sport', 'outdoor', 'formal', 'other'].map(value => `<option value="${value}" ${(current.activities || []).includes(value) ? 'selected' : ''}>${value}</option>`).join('')}</select>
        </label>
        </div>
        <div class="import-step-actions">
          <button class="secondary-button" type="button" data-import-index="${Math.max(0, state.importCurrentIndex - 1)}" aria-label="Previous piece">← Previous</button>
          <button class="secondary-button" type="button" data-import-index="${state.importCurrentIndex + 1}" aria-label="Next piece">Next →</button>
        </div>
      </div>
    `;
  }
}

function renderQueueState() {
  const queue = state.photoQueue;
  const current = queue[state.queueIndex];
  const queueTitle = document.getElementById('queueTitle');
  const queueCounter = document.getElementById('queueCounter');
  const progressBar = document.getElementById('queueProgress');
  const previewWrap = document.getElementById('queuedPreviewWrap');
  const preview = document.getElementById('queuedPreviewImage');
  const previewText = document.getElementById('queuedPreviewText');
  const form = document.getElementById('savePieceForm');

  if (!queue.length) {
    queueTitle.textContent = 'Capture all garments';
    queueCounter.textContent = '0 of 0';
    progressBar.style.width = '0%';
    previewWrap.hidden = true;
    form.reset();
    return;
  }

  const currentIndex = state.queueIndex + 1;
  queueTitle.textContent = `Review item ${currentIndex} of ${queue.length}`;
  queueCounter.textContent = `${currentIndex} of ${queue.length}`;
  progressBar.style.width = `${(currentIndex / queue.length) * 100}%`;
  previewWrap.hidden = false;
  preview.src = current.imageData;
  previewText.textContent = current.fileName || `Garment ${currentIndex}`;

  form.querySelector('[name="name"]').value = `Garment ${currentIndex}`;
  form.querySelector('[name="category"]').value = 'tops';
  form.querySelector('[name="fabric"]').value = 'cotton';
  form.querySelector('[name="yearAcquired"]').value = new Date().getFullYear();
}

function renderWornToday() {
  const picker = document.getElementById('wornPickerPanel');
  const overview = document.getElementById('wornOutfitOverview');
  const fitsPanel = document.getElementById('savedFitsPanel');
  const tabs = Array.from(document.querySelectorAll('[data-worn-tab]'));
  tabs.forEach(tab => {
    const active = tab.dataset.wornTab === state.wornTab;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });

  const showingOverview = state.wornStage === 'overview';
  picker.hidden = state.wornTab !== 'picker' || showingOverview;
  overview.hidden = !showingOverview;
  fitsPanel.hidden = state.wornTab !== 'fits' || showingOverview;

  if (state.wornTab === 'picker') renderWornPicker();
  if (showingOverview) renderWornOverview();
  if (state.wornTab === 'fits' && !showingOverview) renderSavedFits();
}

function getLastWornDate(item) {
  const dates = Array.isArray(item.worn_on) ? item.worn_on : [];
  return dates.slice().sort().at(-1) || '';
}

function renderWornPicker() {
  const activeItems = getActiveItems();
  const categorySelect = document.getElementById('wornCategoryFilter');
  const categoryValue = state.wornCategory;
  categorySelect.innerHTML = ['all', ...CATEGORIES].map(category => `<option value="${category}">${category === 'all' ? 'All categories' : category}</option>`).join('');
  categorySelect.value = categoryValue;
  document.getElementById('wornSearch').value = state.wornSearch;

  const colorList = [...new Set(activeItems.map(item => item.colors?.[0] || '#d8f04f'))];
  const colorFilters = document.getElementById('wornColourFilters');
  colorFilters.innerHTML = `<button type="button" class="worn-colour-filter-button ${state.wornColor === 'all' ? 'is-active' : ''}" data-worn-color="all" aria-label="All colours" aria-pressed="${state.wornColor === 'all'}">All</button>` + colorList.map(color => `<button type="button" class="worn-colour-swatch ${state.wornColor === color ? 'is-active' : ''}" data-worn-color="${color}" style="--swatch-color:${color}" aria-label="Filter by ${color}" aria-pressed="${state.wornColor === color}"></button>`).join('');

  const recent = activeItems.filter(item => getLastWornDate(item)).sort((a, b) => getLastWornDate(b).localeCompare(getLastWornDate(a))).slice(0, 6);
  const recentSection = document.getElementById('recentlyWornSection');
  const recentList = document.getElementById('recentlyWornList');
  recentSection.hidden = !recent.length;
  recentList.innerHTML = recent.map(item => renderWornPickerTile(item, true)).join('');

  const visibleItems = activeItems.filter(item => {
    if (state.wornCategory !== 'all' && item.category !== state.wornCategory) return false;
    if (state.wornColor !== 'all' && (item.colors?.[0] || '#d8f04f') !== state.wornColor) return false;
    if (state.wornSearch && !item.name.toLowerCase().includes(state.wornSearch)) return false;
    return true;
  });
  const grid = document.getElementById('wornPieceGrid');
  grid.innerHTML = visibleItems.length ? visibleItems.map(item => renderWornPickerTile(item)).join('') : '<p class="worn-empty-state">No pieces match these filters.</p>';

  const selectedCount = state.selectedItemIds.filter(id => activeItems.some(item => item.id === id)).length;
  document.getElementById('wornSelectionCount').textContent = `${selectedCount} piece${selectedCount === 1 ? '' : 's'} selected`;
  document.getElementById('seeOutfitBtn').disabled = selectedCount === 0;
}

function toggleSelectedItem(itemId) {
  if (state.selectedItemIds.includes(itemId)) {
    state.selectedItemIds = state.selectedItemIds.filter(id => id !== itemId);
  } else {
    state.selectedItemIds.push(itemId);
  }
}

function renderWornPickerTile(item, compact = false) {
  const selected = state.selectedItemIds.includes(item.id);
  const color = item.colors?.[0] || '#d8f04f';
  const photo = item.photo ? `<img src="${item.photo}" alt="">` : `<span class="worn-tile-placeholder" style="--tile-color:${color}">${item.category}</span>`;
  return `<button type="button" class="worn-piece-tile${compact ? ' is-compact' : ''}${selected ? ' is-selected' : ''}" data-select-worn-item="${item.id}" aria-pressed="${selected}" aria-label="${selected ? 'Deselect' : 'Select'} ${item.name}">
    <span class="worn-piece-image">${photo}<span class="worn-selected-mark" aria-hidden="true">${selected ? '✓' : '+'}</span></span>
    <span class="worn-piece-name">${item.name}</span>
    ${compact ? `<span class="worn-piece-date">${getLastWornDate(item)}</span>` : ''}
  </button>`;
}

function getOutfitItems() {
  const order = ['tops', 'dresses', 'bottoms', 'outerwear', 'shoes', 'accessories', 'other'];
  return state.selectedItemIds.map(id => items.find(item => item.id === id && item.status === 'active')).filter(Boolean)
    .sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
}

function renderWornOverview() {
  const fit = state.savedFits.find(savedFit => savedFit.id === state.activeFitId);
  const selected = getOutfitItems();
  document.getElementById('wornOutfitTitle').textContent = fit?.name || 'Today\'s outfit';
  const collage = document.getElementById('wornOutfitCollage');
  collage.innerHTML = selected.map(item => {
    const color = item.colors?.[0] || '#d8f04f';
    const image = item.photo ? `<img src="${item.photo}" alt="${item.name}">` : `<div class="worn-collage-placeholder" style="--tile-color:${color}">${item.category}</div>`;
    return `<article class="worn-collage-piece"><div class="worn-collage-image">${image}</div><div><h3>${item.name}</h3><span>${item.category}</span></div></article>`;
  }).join('');

  const dateInput = document.getElementById('wearDateInput');
  if (!dateInput.value) dateInput.value = getLocalDateString();
  dateInput.closest('label').hidden = Boolean(fit);
  document.getElementById('logWornOutfitBtn').hidden = Boolean(fit);
  document.getElementById('saveFitForm').hidden = Boolean(fit);
  const savedActions = document.getElementById('savedFitActions');
  savedActions.hidden = !fit;
  updateWearActionLabels();
  if (fit) {
    document.getElementById('renameSavedFitBtn').hidden = state.fitRenameOpen;
    document.getElementById('deleteSavedFitBtn').hidden = state.fitRenameOpen;
    let renameForm = document.getElementById('renameFitForm');
    if (state.fitRenameOpen && !renameForm) {
      savedActions.insertAdjacentHTML('beforeend', `<form id="renameFitForm" class="rename-fit-form"><label><span>Fit name</span><input id="renameFitInput" type="text" value="${fit.name || ''}" placeholder="A name for this fit"></label><button class="primary-button" type="submit">Save name</button></form>`);
      renameForm = document.getElementById('renameFitForm');
    } else if (!state.fitRenameOpen && renameForm) {
      renameForm.remove();
    }
  }
}

function updateWearActionLabels() {
  const dateInput = document.getElementById('wearDateInput');
  if (!dateInput) return;
  const label = dateInput.value === getLocalDateString() ? 'Wore this today' : 'Wore this on selected date';
  document.getElementById('logWornOutfitBtn').textContent = label;
  document.getElementById('logSavedFitBtn').textContent = label;
}

function renderSavedFits() {
  const list = document.getElementById('savedFitsList');
  if (!state.savedFits.length) {
    list.innerHTML = '<p class="worn-empty-state">No saved fits yet.</p>';
    return;
  }
  list.innerHTML = state.savedFits.map(fit => {
    const fitItems = fit.itemIds.map(id => items.find(item => item.id === id && item.status === 'active')).filter(Boolean);
    const previews = fitItems.slice(0, 4).map(item => item.photo ? `<img src="${item.photo}" alt="">` : `<span class="saved-fit-swatch" style="--tile-color:${item.colors?.[0] || '#d8f04f'}"></span>`).join('');
    const date = new Date(fit.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    return `<button type="button" class="saved-fit-card" data-open-fit="${fit.id}">
      <span class="saved-fit-collage">${previews}</span>
      <span class="saved-fit-card-copy"><strong>${fit.name || 'Saved fit'}</strong><small>${fitItems.length} pieces · saved ${date}</small></span>
      <span aria-hidden="true">→</span>
    </button>`;
  }).join('');
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function logWornItems(itemIds, date) {
  const wornDate = date || getLocalDateString();
  const changedIds = [];
  itemIds.forEach(id => {
    const item = items.find(piece => piece.id === id && piece.status === 'active');
    if (!item) return;
    item.worn_on = Array.isArray(item.worn_on) ? item.worn_on : [];
    if (!item.worn_on.includes(wornDate)) {
      item.worn_on.push(wornDate);
      item.last_worn_on = wornDate;
      item.usage_level = item.usage_level || 'sometimes';
      changedIds.push(id);
    }
  });
  if (state.pendingWearUndo?.timer) clearTimeout(state.pendingWearUndo.timer);
  state.pendingWearUndo = { date: wornDate, itemIds: changedIds };
  saveItems();
  const toast = document.getElementById('toast');
  const dateLabel = wornDate === getLocalDateString() ? 'today' : wornDate;
  toast.innerHTML = `Wear noted for ${dateLabel} <button id="undoWearLogBtn" class="toast-undo" type="button">Undo</button>`;
  toast.hidden = false;
  state.pendingWearUndo.timer = setTimeout(() => {
    state.pendingWearUndo = null;
    toast.hidden = true;
  }, 6000);
  renderAll();
}

function undoWornLog() {
  if (!state.pendingWearUndo) return;
  clearTimeout(state.pendingWearUndo.timer);
  state.pendingWearUndo.itemIds.forEach(id => {
    const item = items.find(piece => piece.id === id);
    if (!item || !Array.isArray(item.worn_on)) return;
    item.worn_on = item.worn_on.filter(date => date !== state.pendingWearUndo.date);
    if (item.last_worn_on === state.pendingWearUndo.date) item.last_worn_on = item.worn_on.slice().sort().at(-1) || null;
  });
  state.pendingWearUndo = null;
  document.getElementById('toast').hidden = true;
  saveItems();
  renderAll();
}

function renderAll() {
  const navButtons = document.querySelectorAll('[data-view]');
  navButtons.forEach(button => {
    const shouldShow = button.dataset.view === state.view;
    button.classList.toggle('is-active', shouldShow);
  });

  document.querySelectorAll('.view').forEach(view => {
    const isActive = view.id === `${state.view}View`;
    view.hidden = !isActive;
  });

  if (state.view === 'add') {
    renderQueueState();
  }

  renderOverview();
  renderCheckInCard();
  renderCatalog();
  renderPastGarments();
  renderDeservesLove();
  renderWornToday();
  renderFilters();
  renderContinueCard();
  renderImportOverlay();
}

function renderFilters() {
  const category = document.getElementById('categoryFilter');
  const season = document.getElementById('seasonFilter');
  const activity = document.getElementById('activityFilter');
  const fabric = document.getElementById('fabricFilter');

  const active = getActiveItems();
  category.innerHTML = ['all', ...CATEGORIES].map(cat => `<option value="${cat}">${cat === 'all' ? 'All categories' : cat}</option>`).join('');
  season.innerHTML = ['all', 'spring', 'summer', 'autumn', 'winter'].map(value => `<option value="${value}">${value === 'all' ? 'All seasons' : value}</option>`).join('');
  activity.innerHTML = ['all', 'everyday', 'work', 'sport', 'outdoor', 'formal', 'other'].map(value => `<option value="${value}">${value === 'all' ? 'All activities' : value}</option>`).join('');
  fabric.innerHTML = ['all', ...FABRICS].map(value => `<option value="${value}">${value === 'all' ? 'All fabrics' : value}</option>`).join('');

  category.value = state.category;
  season.value = state.season;
  activity.value = state.activity;
  fabric.value = state.fabric;
}

document.addEventListener('thrifi:authenticated', event => initialize(event.detail.user.id));
