/**
 * Budgetin – Pastel Web Budget Tracker
 * Modern, Minimalist, Pastel Aesthetic Financial Manager
 * Author: Budgetin Team (2026)
 */

(function () {
  'use strict';

  // --- Constant Default State & Categories ---
  const DEFAULT_CATEGORIES = [
    { id: 'Makan', name: 'Makan', emoji: '🍔', limit: 0, class: 'cat-makan', badgeClass: 'badge-cat-makan', color: '#FFD6A5' },
    { id: 'Transport', name: 'Transport', emoji: '🚗', limit: 0, class: 'cat-transport', badgeClass: 'badge-cat-transport', color: '#BDE0FE' },
    { id: 'Belanja', name: 'Belanja', emoji: '🛍️', limit: 0, class: 'cat-belanja', badgeClass: 'badge-cat-belanja', color: '#CDB4DB' },
    { id: 'Hiburan', name: 'Hiburan', emoji: '🎮', limit: 0, class: 'cat-hiburan', badgeClass: 'badge-cat-hiburan', color: '#FFC6FF' },
    { id: 'Pendidikan', name: 'Pendidikan', emoji: '📚', limit: 0, class: 'cat-pendidikan', badgeClass: 'badge-cat-pendidikan', color: '#B8F2E6' },
    { id: 'Tagihan', name: 'Tagihan', emoji: '💡', limit: 0, class: 'cat-tagihan', badgeClass: 'badge-cat-tagihan', color: '#FFF3B0' },
    { id: 'Lainnya', name: 'Lainnya', emoji: '➕', limit: 0, class: 'cat-lainnya', badgeClass: 'badge-cat-lainnya', color: '#A8D5BA' }
  ];

  const DEFAULT_INCOME_CATEGORIES = [
    { id: 'Gaji', name: 'Gaji Pokok', emoji: '💼', color: '#A8D5BA', badgeClass: 'badge-cat-income-gaji' },
    { id: 'Freelance', name: 'Freelance / Bisnis', emoji: '💻', color: '#BDE0FE', badgeClass: 'badge-cat-income-freelance' },
    { id: 'Bonus', name: 'Bonus & THR', emoji: '🎁', color: '#FFD6A5', badgeClass: 'badge-cat-income-bonus' },
    { id: 'Investasi', name: 'Investasi', emoji: '📈', color: '#CDB4DB', badgeClass: 'badge-cat-income-investasi' },
    { id: 'Lainnya_Masuk', name: 'Pemasukan Lainnya', emoji: '💵', color: '#B8F2E6', badgeClass: 'badge-cat-income-lainnya' }
  ];

  // Default empty transactions - starts from 0 for user input
  const DEFAULT_TRANSACTIONS = [];

  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 96; // ~603.185px

  // --- State Store ---
  const state = {
    budget: 0,
    savingsTarget: 0,
    categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
    transactions: [],
    theme: 'light',
    activeChartTab: 'category',
    searchQuery: '',
    categoryFilter: 'all',
    sortFilter: 'date-desc',
    typeFilter: 'all',
    selectedAnnualYear: new Date().getFullYear(),
    annualChartMode: 'bar'
  };

  // --- Chart Instances ---
  let categoryChartInstance = null;
  let weeklyChartInstance = null;
  let annualChartInstance = null;

  // --- DOM Elements ---
  const dom = {
    // Theme
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    headerThemeBtn: document.getElementById('headerThemeBtn'),

    // Circular Progress
    circleProgress: document.getElementById('circleProgress'),
    circleRemainingText: document.getElementById('circleRemainingText'),
    circlePercentText: document.getElementById('circlePercentText'),
    circlePercentBadge: document.getElementById('circlePercentBadge'),
    budgetStatusMessage: document.getElementById('budgetStatusMessage'),
    statusEmoji: document.getElementById('statusEmoji'),
    statusTitle: document.getElementById('statusTitle'),
    statusDesc: document.getElementById('statusDesc'),

    // Hero Pills
    heroTotalBudget: document.getElementById('heroTotalBudget'),
    heroTotalSpent: document.getElementById('heroTotalSpent'),
    heroRemaining: document.getElementById('heroRemaining'),
    heroSavingTarget: document.getElementById('heroSavingTarget'),

    // Quick Stats
    statTotalBudget: document.getElementById('statTotalBudget'),
    statTotalSpent: document.getElementById('statTotalSpent'),
    statRemaining: document.getElementById('statRemaining'),
    statSavingsTarget: document.getElementById('statSavingsTarget'),
    statSpentPercent: document.getElementById('statSpentPercent'),
    statRemainingPercent: document.getElementById('statRemainingPercent'),
    statBudgetSubtext: document.getElementById('statBudgetSubtext'),
    statSavingsStatus: document.getElementById('statSavingsStatus'),

    // Budget Form
    budgetForm: document.getElementById('budgetForm'),
    budgetInput: document.getElementById('budgetInput'),
    savingsInput: document.getElementById('savingsInput'),

    // Categories
    categoriesContainer: document.getElementById('categoriesContainer'),
    openCategoryLimitModalBtn: document.getElementById('openCategoryLimitModalBtn'),
    categoryLimitModal: document.getElementById('categoryLimitModal'),
    categoryLimitForm: document.getElementById('categoryLimitForm'),
    categoryLimitsInputsContainer: document.getElementById('categoryLimitsInputsContainer'),
    closeCatLimitModalBtn: document.getElementById('closeCatLimitModalBtn'),
    cancelCatLimitModalBtn: document.getElementById('cancelCatLimitModalBtn'),

    // Quick Add / Inline Form
    inlineExpenseForm: document.getElementById('inlineExpenseForm'),
    quickAddIncomeBtn: document.getElementById('quickAddIncomeBtn'),
    quickAddIcon: document.getElementById('quickAddIcon'),
    quickAddTitle: document.getElementById('quickAddTitle'),
    quickAddSubtitle: document.getElementById('quickAddSubtitle'),
    inlineTypeToggle: document.getElementById('inlineTypeToggle'),
    inlineTxType: document.getElementById('inlineTxType'),
    expenseNameLabel: document.getElementById('expenseNameLabel'),
    expenseName: document.getElementById('expenseName'),
    expenseAmount: document.getElementById('expenseAmount'),
    expenseCategory: document.getElementById('expenseCategory'),
    expenseDate: document.getElementById('expenseDate'),
    expenseNote: document.getElementById('expenseNote'),
    inlineSubmitBtn: document.getElementById('inlineSubmitBtn'),

    // Modal Add / Edit Expense
    expenseModal: document.getElementById('expenseModal'),
    modalExpenseForm: document.getElementById('modalExpenseForm'),
    modalExpenseTitle: document.getElementById('modalExpenseTitle'),
    editExpenseId: document.getElementById('editExpenseId'),
    modalTypeToggle: document.getElementById('modalTypeToggle'),
    modalTxType: document.getElementById('modalTxType'),
    modalExpenseNameLabel: document.getElementById('modalExpenseNameLabel'),
    modalExpenseName: document.getElementById('modalExpenseName'),
    modalExpenseAmount: document.getElementById('modalExpenseAmount'),
    modalExpenseCategory: document.getElementById('modalExpenseCategory'),
    modalExpenseDate: document.getElementById('modalExpenseDate'),
    modalExpenseNote: document.getElementById('modalExpenseNote'),
    closeExpenseModalBtn: document.getElementById('closeExpenseModalBtn'),
    cancelExpenseModalBtn: document.getElementById('cancelExpenseModalBtn'),
    saveExpenseModalBtn: document.getElementById('saveExpenseModalBtn'),
    quickAddExpenseBtn: document.getElementById('quickAddExpenseBtn'),
    fabBtn: document.getElementById('fabBtn'),
    emptyAddBtn: document.getElementById('emptyAddBtn'),

    // Annual Analytics Section
    annualYearSelect: document.getElementById('annualYearSelect'),
    prevYearBtn: document.getElementById('prevYearBtn'),
    nextYearBtn: document.getElementById('nextYearBtn'),
    btnChartBar: document.getElementById('btnChartBar'),
    btnChartLine: document.getElementById('btnChartLine'),
    avgMonthlyIncome: document.getElementById('avgMonthlyIncome'),
    avgMonthlyExpense: document.getElementById('avgMonthlyExpense'),
    avgMonthlyNet: document.getElementById('avgMonthlyNet'),
    totalAnnualIncomeText: document.getElementById('totalAnnualIncomeText'),
    totalAnnualExpenseText: document.getElementById('totalAnnualExpenseText'),
    cardAvgNet: document.getElementById('cardAvgNet'),
    avgNetEmoji: document.getElementById('avgNetEmoji'),
    badgeAvgNet: document.getElementById('badgeAvgNet'),
    annualNetStatusText: document.getElementById('annualNetStatusText'),
    annualSavingsRate: document.getElementById('annualSavingsRate'),
    annualSavingsSubtext: document.getElementById('annualSavingsSubtext'),
    annualCanvas: document.getElementById('annualChart'),
    toggleAnnualTableBtn: document.getElementById('toggleAnnualTableBtn'),
    annualTableContainer: document.getElementById('annualTableContainer'),
    annualMonthlyTableBody: document.getElementById('annualMonthlyTableBody'),
    tableYearLabel: document.getElementById('tableYearLabel'),

    // Transactions Table & Cards
    transactionTable: document.getElementById('transactionTable'),
    transactionTableBody: document.getElementById('transactionTableBody'),
    mobileTransactionList: document.getElementById('mobileTransactionList'),
    transactionEmptyState: document.getElementById('transactionEmptyState'),
    transactionSearch: document.getElementById('transactionSearch'),
    typeFilter: document.getElementById('typeFilter'),
    categoryFilter: document.getElementById('categoryFilter'),
    sortFilter: document.getElementById('sortFilter'),

    // Charts
    chartTabs: document.querySelectorAll('[data-chart-tab]'),
    categoryChartPanel: document.getElementById('categoryChartPanel'),
    weeklyChartPanel: document.getElementById('weeklyChartPanel'),
    categoryCanvas: document.getElementById('categoryChart'),
    weeklyCanvas: document.getElementById('weeklyChart'),

    // Settings & Actions
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    openResetModalBtn: document.getElementById('openResetModalBtn'),
    resetAllDataBtn: document.getElementById('resetAllDataBtn'),

    // Confirm Modal
    confirmModal: document.getElementById('confirmModal'),
    confirmModalTitle: document.getElementById('confirmModalTitle'),
    confirmModalMessage: document.getElementById('confirmModalMessage'),
    confirmCancelBtn: document.getElementById('confirmCancelBtn'),
    confirmOkBtn: document.getElementById('confirmOkBtn'),
    closeConfirmModalBtn: document.getElementById('closeConfirmModalBtn'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer'),

    // Cloud Sync Elements
    syncStatusPill: document.getElementById('syncStatusPill'),
    syncStatusDot: document.getElementById('syncStatusDot'),
    syncStatusText: document.getElementById('syncStatusText'),
    headerCloudBadge: document.getElementById('headerCloudBadge'),
    headerSyncDot: document.getElementById('headerSyncDot'),
    headerSyncText: document.getElementById('headerSyncText'),
    cloudSettingsBadge: document.getElementById('cloudSettingsBadge'),
    cloudBadgeDot: document.getElementById('cloudBadgeDot'),
    cloudBadgeLabel: document.getElementById('cloudBadgeLabel'),
    cloudDetailStatus: document.getElementById('cloudDetailStatus'),
    cloudLastSyncTime: document.getElementById('cloudLastSyncTime'),
    cloudSyncKeyInput: document.getElementById('cloudSyncKeyInput'),
    btnUpdateSyncKey: document.getElementById('btnUpdateSyncKey'),
    btnManualSync: document.getElementById('btnManualSync'),
    btnUploadLocalToCloud: document.getElementById('btnUploadLocalToCloud'),

    // Auth & User Profile Elements
    authModal: document.getElementById('authModal'),
    closeAuthModalBtn: document.getElementById('closeAuthModalBtn'),
    tabBtnSignIn: document.getElementById('tabBtnSignIn'),
    tabBtnSignUp: document.getElementById('tabBtnSignUp'),
    signInForm: document.getElementById('signInForm'),
    signUpForm: document.getElementById('signUpForm'),
    signInEmail: document.getElementById('signInEmail'),
    signInPassword: document.getElementById('signInPassword'),
    signInSubmitBtn: document.getElementById('signInSubmitBtn'),
    signUpName: document.getElementById('signUpName'),
    signUpEmail: document.getElementById('signUpEmail'),
    signUpPassword: document.getElementById('signUpPassword'),
    signUpPasswordConfirm: document.getElementById('signUpPasswordConfirm'),
    signUpSubmitBtn: document.getElementById('signUpSubmitBtn'),
    btnGoogleSignIn: document.getElementById('btnGoogleSignIn'),
    btnContinueGuest: document.getElementById('btnContinueGuest'),
    forgotPasswordBtn: document.getElementById('forgotPasswordBtn'),
    headerAuthBtn: document.getElementById('headerAuthBtn'),
    headerUserAvatar: document.getElementById('headerUserAvatar'),
    headerUserName: document.getElementById('headerUserName'),
    sidebarUserProfileCard: document.getElementById('sidebarUserProfileCard'),
    sidebarUserAvatar: document.getElementById('sidebarUserAvatar'),
    sidebarUserName: document.getElementById('sidebarUserName'),
    sidebarUserEmail: document.getElementById('sidebarUserEmail'),
    sidebarAuthActionBtn: document.getElementById('sidebarAuthActionBtn'),
    sidebarAuthActionText: document.getElementById('sidebarAuthActionText'),
    userProfileModal: document.getElementById('userProfileModal'),
    closeProfileModalBtn: document.getElementById('closeProfileModalBtn'),
    closeProfileBtn: document.getElementById('closeProfileBtn'),
    signOutBtn: document.getElementById('signOutBtn'),
    modalUserAvatar: document.getElementById('modalUserAvatar'),
    modalUserName: document.getElementById('modalUserName'),
    modalUserEmail: document.getElementById('modalUserEmail'),
    modalUserUid: document.getElementById('modalUserUid'),
    modalUserSyncState: document.getElementById('modalUserSyncState')
  };

  // Callback storage for generic confirmation modal
  let onConfirmCallback = null;

  // ==========================================================================
  // Currency & Parsing Utilities
  // ==========================================================================

  /**
   * Format a numerical value into Rupiah string: "Rp 2.000.000"
   */
  function formatRupiah(value, withPrefix = true) {
    const num = Math.round(Number(value) || 0);
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return withPrefix ? `Rp ${formatted}` : formatted;
  }

  /**
   * Extract number from a string with non-digits
   */
  function parseRupiah(str) {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    const cleanStr = str.toString().replace(/[^0-9]/g, '');
    return parseInt(cleanStr, 10) || 0;
  }

  /**
   * Auto-format numeric inputs with thousands separator dots on input
   */
  function setupRupiahMaskInputs() {
    document.querySelectorAll('.rupiah-mask').forEach(input => {
      input.addEventListener('input', function (e) {
        const val = parseRupiah(this.value);
        if (val === 0 && this.value === '') {
          this.value = '';
          return;
        }
        this.value = formatRupiah(val, false);
      });
    });
  }

  // ==========================================================================
  // LocalStorage Persistence
  // ==========================================================================

  const STORAGE_KEY = 'budgetin_user_data_v2';

  function saveStateToLocalStorageOnly() {
    try {
      const dataToSave = {
        budget: state.budget,
        savingsTarget: state.savingsTarget,
        categories: state.categories,
        transactions: state.transactions,
        theme: state.theme
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (err) {
      console.warn('Gagal menyimpan ke LocalStorage:', err);
    }
  }

  function saveStateToStorage() {
    saveStateToLocalStorageOnly();
    if (!isApplyingRemoteUpdate) {
      scheduleFirebaseUpload();
    }
  }

  function loadStateFromStorage() {
    try {
      // Clear previous demo storage if exists so user starts completely clean
      if (localStorage.getItem('budgetin_pastel_data_v1')) {
        localStorage.removeItem('budgetin_pastel_data_v1');
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.budget !== undefined) state.budget = Number(parsed.budget);
        if (parsed.savingsTarget !== undefined) state.savingsTarget = Number(parsed.savingsTarget);
        if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
          state.categories = DEFAULT_CATEGORIES.map(defaultCat => {
            const saved = parsed.categories.find(c => c.id === defaultCat.id);
            return saved ? { ...defaultCat, limit: saved.limit } : defaultCat;
          });
        }
        if (Array.isArray(parsed.transactions)) {
          state.transactions = parsed.transactions;
        }
        if (parsed.theme) {
          state.theme = parsed.theme;
        }
      }
    } catch (err) {
      console.warn('Gagal memuat dari LocalStorage, menggunakan data default:', err);
    }
  }

  // ==========================================================================
  // Firebase Realtime Cloud Synchronization & Authentication
  // ==========================================================================

  const firebaseConfig = {
    apiKey: "AIzaSyD7bv61QRolDFwu8sYR9G-qGi1g4YYPF_A",
    authDomain: "budget-tracker-8ec94.firebaseapp.com",
    projectId: "budget-tracker-8ec94",
    storageBucket: "budget-tracker-8ec94.firebasestorage.app",
    messagingSenderId: "63477049953",
    appId: "1:63477049953:web:2237691edad2d5591f5820",
    measurementId: "G-T9K7EP77Q4"
  };

  const SYNC_KEY_STORAGE = 'budgetin_cloud_sync_key_v1';
  let firebaseApp = null;
  let db = null;
  let firestoreUnsubscribe = null;
  let syncDocRef = null;
  let isApplyingRemoteUpdate = false;
  let syncDebounceTimer = null;
  let currentUser = null;

  function getSyncKey() {
    if (currentUser) {
      return 'user_' + currentUser.uid;
    }
    return localStorage.getItem(SYNC_KEY_STORAGE) || 'default_budget';
  }

  function setSyncKey(newKey) {
    const cleanKey = (newKey || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'default_budget';
    localStorage.setItem(SYNC_KEY_STORAGE, cleanKey);
    return cleanKey;
  }

  function updateSyncStatusUI(status, message) {
    // status: 'connected' | 'syncing' | 'offline' | 'error'
    const dotClass = status === 'connected' ? 'connected' : (status === 'syncing' ? 'syncing' : 'offline');

    if (dom.syncStatusDot) dom.syncStatusDot.className = `status-dot ${dotClass}`;
    if (dom.headerSyncDot) dom.headerSyncDot.className = `status-dot ${dotClass}`;
    if (dom.cloudBadgeDot) dom.cloudBadgeDot.className = `status-dot ${dotClass}`;

    if (dom.syncStatusText) {
      dom.syncStatusText.textContent = message || (status === 'connected' ? 'Cloud Terhubung' : 'Offline');
    }
    if (dom.headerSyncText) {
      dom.headerSyncText.textContent = status === 'connected' ? 'Tersinkron' : (status === 'syncing' ? 'Sinkron...' : 'Offline');
    }
    if (dom.cloudBadgeLabel) {
      dom.cloudBadgeLabel.textContent = message || (status === 'connected' ? 'Terhubung Real-time' : 'Offline');
    }
    if (dom.cloudDetailStatus) {
      if (status === 'connected') dom.cloudDetailStatus.innerHTML = '<span style="color: #10b981;">🟢 Aktif &amp; Sinkron (Realtime)</span>';
      else if (status === 'syncing') dom.cloudDetailStatus.innerHTML = '<span style="color: #f59e0b;">🟡 Menyinkronkan...</span>';
      else if (status === 'error') dom.cloudDetailStatus.innerHTML = '<span style="color: #ef4444;">🔴 Akses Ditolak (Cek Rules Firestore)</span>';
      else dom.cloudDetailStatus.innerHTML = '<span style="color: var(--text-muted);">⚪ Mode Lokal / Offline</span>';
    }
  }

  function updateLastSyncDisplay(isoString) {
    if (!dom.cloudLastSyncTime) return;
    if (!isoString) {
      dom.cloudLastSyncTime.textContent = 'Belum pernah';
      return;
    }
    try {
      const d = new Date(isoString);
      const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      dom.cloudLastSyncTime.textContent = `${timeStr} (${dateStr})`;
    } catch (e) {
      dom.cloudLastSyncTime.textContent = 'Baru saja';
    }
  }

  function applyRemoteData(cloudData) {
    if (!cloudData) return;
    isApplyingRemoteUpdate = true;
    try {
      if (typeof cloudData.budget === 'number') {
        state.budget = cloudData.budget;
      }
      if (typeof cloudData.savingsTarget === 'number') {
        state.savingsTarget = cloudData.savingsTarget;
      }
      if (Array.isArray(cloudData.categories) && cloudData.categories.length > 0) {
        state.categories = DEFAULT_CATEGORIES.map(defaultCat => {
          const saved = cloudData.categories.find(c => c.id === defaultCat.id);
          return saved ? { ...defaultCat, limit: Number(saved.limit) || 0 } : defaultCat;
        });
      }
      if (Array.isArray(cloudData.transactions)) {
        state.transactions = cloudData.transactions;
      }

      // Update local storage so offline access matches
      saveStateToLocalStorageOnly();

      // Update input fields if user is not actively typing in them
      if (dom.budgetInput && document.activeElement !== dom.budgetInput) {
        dom.budgetInput.value = state.budget > 0 ? formatRupiah(state.budget, false) : '';
      }
      if (dom.savingsInput && document.activeElement !== dom.savingsInput) {
        dom.savingsInput.value = state.savingsTarget > 0 ? formatRupiah(state.savingsTarget, false) : '';
      }

      // Re-render UI components
      const calc = getCalculations();
      renderCircularIndicator(calc);
      renderQuickStats(calc);
      renderCategoryList(calc);
      renderTransactions();
      initOrUpdateCharts(calc);
      renderAnnualAnalytics();

      if (cloudData.updatedAt) {
        updateLastSyncDisplay(cloudData.updatedAt);
      }
    } catch (err) {
      console.error('Gagal menerapkan data dari cloud:', err);
    } finally {
      setTimeout(() => {
        isApplyingRemoteUpdate = false;
      }, 150);
    }
  }

  function uploadStateToFirebase(isInitial = false) {
    if (!db || !syncDocRef || isApplyingRemoteUpdate) return;

    updateSyncStatusUI('syncing', 'Menyimpan ke Cloud...');

    const payload = {
      budget: Number(state.budget) || 0,
      savingsTarget: Number(state.savingsTarget) || 0,
      categories: state.categories.map(c => ({
        id: c.id,
        name: c.name,
        limit: Number(c.limit) || 0
      })),
      transactions: state.transactions,
      updatedAt: new Date().toISOString(),
      userUid: currentUser ? currentUser.uid : 'guest',
      userEmail: currentUser ? currentUser.email : null
    };

    syncDocRef.set(payload, { merge: true })
      .then(() => {
        updateSyncStatusUI('connected', 'Cloud Terhubung');
        updateLastSyncDisplay(payload.updatedAt);
        if (isInitial) {
          showToast('Data berhasil terhubung ke Firebase Cloud! ☁️', 'success');
        }
      })
      .catch(err => {
        console.warn('Gagal mengunggah data ke Firestore:', err);
        if (err.code === 'permission-denied') {
          updateSyncStatusUI('error', 'Izin Cloud Ditolak');
          showToast('PENTING: Aktifkan Rules di Firebase Console -> Cloud Firestore -> Rules menjadi allow read, write: if true;', 'error');
        } else {
          updateSyncStatusUI('offline', 'Koneksi Cloud Terputus');
        }
      });
  }

  function scheduleFirebaseUpload() {
    if (!db || !syncDocRef || isApplyingRemoteUpdate) return;
    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(() => {
      uploadStateToFirebase(false);
    }, 450);
  }

  function setupFirestoreListener() {
    if (!db) return;
    if (firestoreUnsubscribe) {
      firestoreUnsubscribe();
      firestoreUnsubscribe = null;
    }

    const currentKey = getSyncKey();
    if (dom.cloudSyncKeyInput) {
      dom.cloudSyncKeyInput.value = currentKey;
    }

    syncDocRef = db.collection('budget_spaces').doc(currentKey);
    updateSyncStatusUI('syncing', 'Menghubungkan Cloud...');

    firestoreUnsubscribe = syncDocRef.onSnapshot(
      (docSnap) => {
        if (docSnap.exists) {
          const cloudData = docSnap.data();
          applyRemoteData(cloudData);
          updateSyncStatusUI('connected', 'Cloud Terhubung');
        } else {
          // New doc: initial upload from current local state
          uploadStateToFirebase(true);
        }
      },
      (err) => {
        console.warn('Firestore snapshot error:', err);
        if (err.code === 'permission-denied') {
          updateSyncStatusUI('error', 'Izin Firestore Ditolak');
          showToast('Firestore Rules belum diaktifkan. Buka Firebase Console > Firestore > Rules.', 'error');
        } else {
          updateSyncStatusUI('offline', 'Mode Offline / Lokal');
        }
      }
    );
  }

  // --- Authentication Management ---

  function updateUserAuthUI(user) {
    if (user) {
      const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Pengguna');
      const initial = (displayName.charAt(0) || 'U').toUpperCase();
      const email = user.email || 'Email tidak tersedia';

      // Sidebar
      if (dom.sidebarUserName) dom.sidebarUserName.textContent = displayName;
      if (dom.sidebarUserEmail) dom.sidebarUserEmail.textContent = email;
      if (dom.sidebarUserAvatar) dom.sidebarUserAvatar.textContent = initial;
      if (dom.sidebarAuthActionText) dom.sidebarAuthActionText.textContent = 'Profil';

      // Header
      if (dom.headerUserName) dom.headerUserName.textContent = displayName;
      if (dom.headerUserAvatar) dom.headerUserAvatar.textContent = initial;

      // Profile Modal
      if (dom.modalUserName) dom.modalUserName.textContent = displayName;
      if (dom.modalUserEmail) dom.modalUserEmail.textContent = email;
      if (dom.modalUserAvatar) dom.modalUserAvatar.textContent = initial;
      if (dom.modalUserUid) dom.modalUserUid.textContent = user.uid;
      if (dom.modalUserSyncState) dom.modalUserSyncState.innerHTML = '<span style="color: #10b981;">🟢 Akun Cloud Aktif</span>';
    } else {
      // Sidebar
      if (dom.sidebarUserName) dom.sidebarUserName.textContent = 'Mode Tamu';
      if (dom.sidebarUserEmail) dom.sidebarUserEmail.textContent = 'Klik untuk Masuk';
      if (dom.sidebarUserAvatar) dom.sidebarUserAvatar.textContent = '👤';
      if (dom.sidebarAuthActionText) dom.sidebarAuthActionText.textContent = 'Masuk';

      // Header
      if (dom.headerUserName) dom.headerUserName.textContent = 'Masuk';
      if (dom.headerUserAvatar) dom.headerUserAvatar.textContent = '👤';

      // Profile Modal
      if (dom.modalUserName) dom.modalUserName.textContent = 'Tamu';
      if (dom.modalUserEmail) dom.modalUserEmail.textContent = 'Belum Masuk';
      if (dom.modalUserAvatar) dom.modalUserAvatar.textContent = '👤';
      if (dom.modalUserUid) dom.modalUserUid.textContent = '-';
      if (dom.modalUserSyncState) dom.modalUserSyncState.innerHTML = '<span style="color: var(--text-muted);">⚪ Belum Login</span>';
    }
  }

  function handleAuthStateChange(user) {
    currentUser = user;
    updateUserAuthUI(user);

    if (user) {
      setupFirestoreListener();
    } else {
      setupFirestoreListener();
    }
  }

  function openAuthModal(defaultTab = 'signin') {
    switchAuthTab(defaultTab);
    if (dom.authModal) dom.authModal.classList.add('open');
  }

  function closeAuthModal() {
    if (dom.authModal) dom.authModal.classList.remove('open');
  }

  function openProfileModal() {
    if (!currentUser) {
      openAuthModal('signin');
      return;
    }
    if (dom.userProfileModal) dom.userProfileModal.classList.add('open');
  }

  function closeProfileModal() {
    if (dom.userProfileModal) dom.userProfileModal.classList.remove('open');
  }

  function switchAuthTab(tab) {
    if (tab === 'signin') {
      if (dom.tabBtnSignIn) dom.tabBtnSignIn.classList.add('active');
      if (dom.tabBtnSignUp) dom.tabBtnSignUp.classList.remove('active');
      if (dom.signInForm) dom.signInForm.classList.add('active');
      if (dom.signUpForm) dom.signUpForm.classList.remove('active');
      if (dom.authModalTitle) dom.authModalTitle.textContent = 'Masuk ke Budgetin';
    } else {
      if (dom.tabBtnSignUp) dom.tabBtnSignUp.classList.add('active');
      if (dom.tabBtnSignIn) dom.tabBtnSignIn.classList.remove('active');
      if (dom.signUpForm) dom.signUpForm.classList.add('active');
      if (dom.signInForm) dom.signInForm.classList.remove('active');
      if (dom.authModalTitle) dom.authModalTitle.textContent = 'Daftar Akun Baru';
    }
  }

  function handleSignInSubmit(e) {
    e.preventDefault();
    if (!firebase.auth) {
      showToast('Firebase Auth belum termuat.', 'error');
      return;
    }
    const email = dom.signInEmail.value.trim();
    const password = dom.signInPassword.value;

    if (!email || !password) {
      showToast('Mohon isi email dan password.', 'error');
      return;
    }

    const submitBtn = dom.signInSubmitBtn;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Memverifikasi... ⏳</span>';
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        closeAuthModal();
        dom.signInForm.reset();
        const user = userCredential.user;
        showToast(`Selamat datang kembali, ${user.displayName || user.email}! ✨`, 'success');
      })
      .catch((error) => {
        let msg = 'Gagal masuk: ' + error.message;
        if (error.code === 'auth/invalid-email') msg = 'Format email tidak valid.';
        else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          msg = 'Email atau password salah.';
        } else if (error.code === 'auth/too-many-requests') {
          msg = 'Terlalu banyak percobaan gagal. Silakan coba sesaat lagi.';
        } else if (error.code === 'auth/operation-not-allowed') {
          msg = 'Metode Email/Password belum diaktifkan di Firebase Console -> Authentication -> Sign-in method.';
        }
        showToast(msg, 'error');
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Masuk ke Akun</span>';
        }
      });
  }

  function handleSignUpSubmit(e) {
    e.preventDefault();
    if (!firebase.auth) {
      showToast('Firebase Auth belum termuat.', 'error');
      return;
    }
    const name = dom.signUpName.value.trim();
    const email = dom.signUpEmail.value.trim();
    const password = dom.signUpPassword.value;
    const confirmPassword = dom.signUpPasswordConfirm.value;

    if (!name) {
      showToast('Mohon masukkan nama Anda.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password minimal 6 karakter.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Konfirmasi password tidak cocok.', 'error');
      return;
    }

    const submitBtn = dom.signUpSubmitBtn;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Mendaftarkan akun... ⏳</span>';
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return user.updateProfile({
          displayName: name
        }).then(() => {
          closeAuthModal();
          dom.signUpForm.reset();
          showToast(`Akun berhasil dibuat! Selamat datang, ${name} ✨`, 'success');
        });
      })
      .catch((error) => {
        let msg = 'Gagal mendaftar: ' + error.message;
        if (error.code === 'auth/email-already-in-use') {
          msg = 'Email ini sudah terdaftar. Silakan pilih menu Masuk.';
        } else if (error.code === 'auth/invalid-email') {
          msg = 'Format email tidak valid.';
        } else if (error.code === 'auth/weak-password') {
          msg = 'Password terlalu lemah. Minimal 6 karakter.';
        } else if (error.code === 'auth/operation-not-allowed') {
          msg = 'Metode Email/Password belum diaktifkan di Firebase Console -> Authentication -> Sign-in method.';
        }
        showToast(msg, 'error');
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Daftar Akun Baru ✨</span>';
        }
      });
  }

  function handleSignOut() {
    if (!firebase.auth) return;
    openConfirmModal(
      'Keluar dari Akun',
      'Apakah Anda yakin ingin keluar (Sign Out)? Data Anda tetap aman tersimpan di cloud.',
      () => {
        firebase.auth().signOut().then(() => {
          closeProfileModal();
          showToast('Anda telah keluar dari akun. Berjalan dalam Mode Tamu.', 'info');
        }).catch((err) => {
          showToast('Gagal keluar: ' + err.message, 'error');
        });
      }
    );
  }

  function handleGoogleSignIn() {
    if (!firebase.auth) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then((res) => {
        closeAuthModal();
        const user = res.user;
        showToast(`Selamat datang, ${user.displayName || 'Pengguna'}! ✨`, 'success');
      })
      .catch((error) => {
        if (error.code === 'auth/popup-closed-by-user') return;
        if (error.code === 'auth/operation-not-allowed') {
          showToast('Google Sign-in belum diaktifkan di Firebase Console -> Authentication.', 'error');
        } else {
          showToast('Gagal masuk dengan Google: ' + error.message, 'error');
        }
      });
  }

  function handleForgotPassword() {
    const email = (dom.signInEmail && dom.signInEmail.value.trim()) || prompt('Masukkan alamat email akun Anda:');
    if (!email) return;
    if (!firebase.auth) return;

    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        showToast(`Tautan reset password telah dikirim ke: ${email} 📩`, 'success');
      })
      .catch((error) => {
        let msg = 'Gagal mengirim reset password: ' + error.message;
        if (error.code === 'auth/user-not-found') msg = 'Email tidak ditemukan.';
        showToast(msg, 'error');
      });
  }

  function setupPasswordToggles() {
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input) {
          if (input.type === 'password') {
            input.type = 'text';
            this.textContent = '🙈';
          } else {
            input.type = 'password';
            this.textContent = '👁️';
          }
        }
      });
    });
  }

  function initFirebaseSync() {
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK tidak dimuat.');
      updateSyncStatusUI('offline', 'Firebase SDK Offline');
      return;
    }

    try {
      if (!firebase.apps || !firebase.apps.length) {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        try {
          if (typeof firebase.analytics === 'function') {
            firebase.analytics();
          }
        } catch (analyticsErr) {
          // Analytics can be blocked by ad-blocker or file:// origin, safe to ignore
        }
      } else {
        firebaseApp = firebase.app();
      }

      db = firebase.firestore();

      // Enable offline persistence
      try {
        db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
          // May fail on multi-tab or unsupported browser, safe to ignore
        });
      } catch (persistenceErr) {
        // safe to ignore
      }

      // Initialize Auth Listener
      if (firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
          handleAuthStateChange(user);
        });
      } else {
        setupFirestoreListener();
      }
    } catch (err) {
      console.error('Inisialisasi Firebase gagal:', err);
      updateSyncStatusUI('offline', 'Gagal Sambung Firebase');
    }
  }

  function handleUpdateSyncKey() {
    if (!dom.cloudSyncKeyInput) return;
    const inputVal = dom.cloudSyncKeyInput.value.trim();
    if (!inputVal) {
      showToast('ID Ruang Sync tidak boleh kosong', 'error');
      return;
    }
    const cleanKey = setSyncKey(inputVal);
    dom.cloudSyncKeyInput.value = cleanKey;
    showToast(`Beralih ke ID Ruang: "${cleanKey}"... 🔄`, 'info');
    setupFirestoreListener();
  }

  function handleManualSync() {
    if (!db || !syncDocRef) {
      initFirebaseSync();
      return;
    }
    updateSyncStatusUI('syncing', 'Menyinkronkan...');
    syncDocRef.get()
      .then(docSnap => {
        if (docSnap.exists) {
          applyRemoteData(docSnap.data());
          showToast('Data berhasil dimutakhirkan dari Cloud! ☁️', 'success');
        } else {
          uploadStateToFirebase(true);
        }
      })
      .catch(err => {
        showToast('Gagal sinkron: ' + err.message, 'error');
        updateSyncStatusUI('error', 'Gagal Sinkron');
      });
  }

  function handleUploadLocalToCloud() {
    if (!db || !syncDocRef) {
      initFirebaseSync();
    }
    uploadStateToFirebase(true);
  }

  // ==========================================================================
  // Toast Notifications
  // ==========================================================================

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '✨';
    if (type === 'error') icon = '⚠️';
    if (type === 'info') icon = 'ℹ️';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-text">${message}</span>
    `;

    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }

  // ==========================================================================
  // Calculations
  // ==========================================================================

  function getCalculations() {
    const expenseTransactions = state.transactions.filter(tx => tx.type !== 'income');
    const incomeTransactions = state.transactions.filter(tx => tx.type === 'income');

    const totalSpent = expenseTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const totalIncome = incomeTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const remaining = state.budget - totalSpent;
    const percentSpent = state.budget > 0 ? (totalSpent / state.budget) * 100 : 0;
    const roundedPercent = Math.round(percentSpent);

    // Spent per category (expenses)
    const categorySpentMap = {};
    state.categories.forEach(cat => {
      categorySpentMap[cat.id] = 0;
    });

    expenseTransactions.forEach(tx => {
      if (categorySpentMap[tx.category] !== undefined) {
        categorySpentMap[tx.category] += Number(tx.amount || 0);
      } else {
        categorySpentMap['Lainnya'] = (categorySpentMap['Lainnya'] || 0) + Number(tx.amount || 0);
      }
    });

    return {
      totalBudget: state.budget,
      totalSpent,
      totalIncome,
      remaining,
      percentSpent,
      roundedPercent,
      categorySpentMap
    };
  }

  // ==========================================================================
  // Circular Budget Indicator & UI Render
  // ==========================================================================

  function renderCircularIndicator(calc) {
    // 1. Update text values
    dom.circleRemainingText.textContent = formatRupiah(calc.remaining);
    dom.circlePercentText.textContent = `${calc.roundedPercent}%`;

    // 2. Animate SVG circle stroke dashoffset
    // Constrain offset between 0 and CIRCLE_CIRCUMFERENCE
    const clampedPercent = Math.min(Math.max(calc.percentSpent, 0), 100);
    const targetOffset = CIRCLE_CIRCUMFERENCE - (CIRCLE_CIRCUMFERENCE * clampedPercent) / 100;
    dom.circleProgress.style.strokeDashoffset = targetOffset;

    // 3. Status logic and color transitions
    dom.circleProgress.classList.remove('status-warning', 'status-danger');
    dom.circlePercentBadge.classList.remove('status-warning', 'status-danger');

    if (calc.totalBudget === 0) {
      dom.statusEmoji.textContent = '🌱';
      dom.statusTitle.textContent = 'Mulai Kelola Anggaran';
      dom.statusDesc.textContent = 'Tentukan total budget Anda di form bawah untuk mulai mengelola keuangan.';
    } else if (calc.percentSpent > 100) {
      dom.circleProgress.classList.add('status-danger');
      dom.circlePercentBadge.classList.add('status-danger');
      dom.statusEmoji.textContent = '🚨';
      dom.statusTitle.textContent = 'Melebihi Anggaran';
      dom.statusDesc.textContent = `Pengeluaranmu telah over budget sebesar ${formatRupiah(Math.abs(calc.remaining))}.`;
    } else if (calc.percentSpent >= 80) {
      dom.circleProgress.classList.add('status-warning');
      dom.circlePercentBadge.classList.add('status-warning');
      dom.statusEmoji.textContent = '⚡';
      dom.statusTitle.textContent = 'Mendekati Batas';
      dom.statusDesc.textContent = 'Sisa anggaran menipis, pertimbangkan belanja hemat.';
    } else {
      dom.statusEmoji.textContent = '🌿';
      dom.statusTitle.textContent = 'Anggaran Sehat';
      dom.statusDesc.textContent = 'Pengeluaranmu masih terkendali dengan sangat baik.';
    }

    // 4. Update Hero Pills
    dom.heroTotalBudget.textContent = formatRupiah(calc.totalBudget);
    dom.heroTotalSpent.textContent = formatRupiah(calc.totalSpent);
    dom.heroRemaining.textContent = formatRupiah(calc.remaining);
    dom.heroSavingTarget.textContent = formatRupiah(state.savingsTarget);
  }

  function renderQuickStats(calc) {
    dom.statTotalBudget.textContent = formatRupiah(calc.totalBudget);
    dom.statTotalSpent.textContent = formatRupiah(calc.totalSpent);
    dom.statRemaining.textContent = formatRupiah(calc.remaining);
    dom.statSavingsTarget.textContent = formatRupiah(state.savingsTarget);

    if (calc.totalBudget === 0) {
      dom.statBudgetSubtext.textContent = 'Tentukan di form bawah';
      dom.statSpentPercent.textContent = `${state.transactions.length} pengeluaran tercatat`;
      dom.statRemainingPercent.textContent = 'Siap dialokasikan';
      dom.statSavingsStatus.textContent = state.savingsTarget > 0 ? 'Target tercatat' : 'Opsional';
    } else {
      dom.statBudgetSubtext.textContent = 'Batas pengeluaran bulanan';
      dom.statSpentPercent.textContent = `${calc.roundedPercent}% dari total budget`;

      const remainingPercent = Math.max(0, 100 - calc.roundedPercent);
      if (calc.remaining < 0) {
        dom.statRemainingPercent.textContent = `Defisit ${formatRupiah(Math.abs(calc.remaining))}`;
      } else {
        dom.statRemainingPercent.textContent = `${remainingPercent}% masih tersedia`;
      }
      dom.statSavingsStatus.textContent = state.savingsTarget > 0 ? 'Target tersimpan' : 'Dana impian & darurat';
    }
  }

  function renderCategoryList(calc) {
    dom.categoriesContainer.innerHTML = '';

    state.categories.forEach(cat => {
      const spent = calc.categorySpentMap[cat.id] || 0;
      const limit = cat.limit || 0;
      const percent = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : (spent > 0 ? 100 : 0);
      const isOver = limit > 0 && spent > limit;

      const limitDisplay = limit > 0 ? formatRupiah(limit) : 'Bebas';

      const row = document.createElement('div');
      row.className = `category-row ${cat.class}`;
      row.innerHTML = `
        <div class="cat-header">
          <div class="cat-title-wrap">
            <span class="cat-emoji">${cat.emoji}</span>
            <span class="cat-name">${cat.name}</span>
          </div>
          <div class="cat-right-wrap">
            <div class="cat-amounts">
              <span class="spent-amount">${formatRupiah(spent)}</span> / ${limitDisplay}
            </div>
            <button type="button" class="cat-quick-add-btn" onclick="window.budgetinApp.openAddExpenseModalForCategory('${cat.id}')" title="Catat Pengeluaran di ${cat.name}">＋</button>
          </div>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${isOver ? 'over-limit' : ''}" style="width: ${percent}%;"></div>
        </div>
      `;
      dom.categoriesContainer.appendChild(row);
    });
  }

  // ==========================================================================
  // Transactions Table & Mobile Cards
  // ==========================================================================

  function getFilteredTransactions() {
    let list = [...state.transactions];

    // Type filter
    if (state.typeFilter && state.typeFilter !== 'all') {
      if (state.typeFilter === 'income') {
        list = list.filter(tx => tx.type === 'income');
      } else if (state.typeFilter === 'expense') {
        list = list.filter(tx => tx.type !== 'income');
      }
    }

    // Search filter
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(tx =>
        (tx.name && tx.name.toLowerCase().includes(q)) ||
        (tx.note && tx.note.toLowerCase().includes(q)) ||
        (tx.category && tx.category.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (state.categoryFilter !== 'all') {
      list = list.filter(tx => tx.category === state.categoryFilter);
    }

    // Sorting
    list.sort((a, b) => {
      if (state.sortFilter === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      } else if (state.sortFilter === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      } else if (state.sortFilter === 'amount-desc') {
        return Number(b.amount) - Number(a.amount);
      } else if (state.sortFilter === 'amount-asc') {
        return Number(a.amount) - Number(b.amount);
      }
      return 0;
    });

    return list;
  }

  function getCategoryMeta(catId, type = 'expense') {
    if (type === 'income') {
      const inc = DEFAULT_INCOME_CATEGORIES.find(c => c.id === catId);
      if (inc) return inc;
    }
    const exp = state.categories.find(c => c.id === catId);
    if (exp) return exp;
    const fallbackInc = DEFAULT_INCOME_CATEGORIES.find(c => c.id === catId);
    if (fallbackInc) return fallbackInc;
    return {
      emoji: '🏷️',
      name: catId,
      badgeClass: type === 'income' ? 'badge-cat-income-lainnya' : 'badge-cat-lainnya'
    };
  }

  function populateCategorySelect(selectEl, type = 'expense', selectedValue = null) {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    const list = type === 'income' ? DEFAULT_INCOME_CATEGORIES : state.categories;
    list.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = `${cat.emoji} ${cat.name}`;
      if (selectedValue && cat.id === selectedValue) {
        opt.selected = true;
      }
      selectEl.appendChild(opt);
    });
  }

  function formatDateDisplay(dateString) {
    if (!dateString) return '-';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  }

  function renderTransactions() {
    const list = getFilteredTransactions();

    if (list.length === 0) {
      dom.transactionTableBody.innerHTML = '';
      dom.mobileTransactionList.innerHTML = '';
      dom.transactionTable.style.display = 'none';
      dom.mobileTransactionList.style.display = 'none';
      dom.transactionEmptyState.style.display = 'block';
      return;
    }

    dom.transactionTable.style.display = 'table';
    dom.mobileTransactionList.style.display = 'flex';
    dom.transactionEmptyState.style.display = 'none';

    // 1. Desktop Table
    let tableHtml = '';
    list.forEach(tx => {
      const isIncome = tx.type === 'income';
      const amountClass = isIncome ? 'amount-income' : 'amount-expense';
      const amountSign = isIncome ? '+' : '-';
      const catMeta = getCategoryMeta(tx.category, tx.type);
      tableHtml += `
        <tr data-id="${tx.id}">
          <td>${formatDateDisplay(tx.date)}</td>
          <td><strong>${escapeHtml(tx.name)}</strong></td>
          <td>
            <span class="badge-cat ${catMeta.badgeClass}">
              <span>${catMeta.emoji}</span> ${catMeta.name}
            </span>
          </td>
          <td><small class="text-muted">${escapeHtml(tx.note || '-')}</small></td>
          <td class="text-right ${amountClass}">${amountSign}${formatRupiah(tx.amount)}</td>
          <td class="text-center">
            <div class="table-actions">
              <button class="action-btn-sm edit" onclick="window.budgetinApp.openEditModal('${tx.id}')" title="Edit Transaksi">✏️</button>
              <button class="action-btn-sm delete" onclick="window.budgetinApp.confirmDeleteTx('${tx.id}')" title="Hapus Transaksi">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    });
    dom.transactionTableBody.innerHTML = tableHtml;

    // 2. Mobile Cards
    let mobileHtml = '';
    list.forEach(tx => {
      const isIncome = tx.type === 'income';
      const amountClass = isIncome ? 'amount-income' : 'amount-expense';
      const amountSign = isIncome ? '+' : '-';
      const catMeta = getCategoryMeta(tx.category, tx.type);
      mobileHtml += `
        <div class="mobile-tx-card" data-id="${tx.id}">
          <div class="mobile-tx-top">
            <div>
              <div class="mobile-tx-name">${escapeHtml(tx.name)}</div>
              <span class="mobile-tx-date">${formatDateDisplay(tx.date)}</span>
            </div>
            <span class="badge-cat ${catMeta.badgeClass}">
              <span>${catMeta.emoji}</span> ${catMeta.name}
            </span>
          </div>
          ${tx.note ? `<div class="card-desc" style="margin-bottom:0; font-size: 0.8rem;">${escapeHtml(tx.note)}</div>` : ''}
          <div class="mobile-tx-bottom">
            <span class="${amountClass}">${amountSign}${formatRupiah(tx.amount)}</span>
            <div class="table-actions">
              <button class="action-btn-sm edit" onclick="window.budgetinApp.openEditModal('${tx.id}')" title="Edit">✏️</button>
              <button class="action-btn-sm delete" onclick="window.budgetinApp.confirmDeleteTx('${tx.id}')" title="Hapus">🗑️</button>
            </div>
          </div>
        </div>
      `;
    });
    dom.mobileTransactionList.innerHTML = mobileHtml;
  }

  function escapeHtml(string) {
    if (!string) return '';
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // Chart.js pastel Analytics
  // ==========================================================================

  function initOrUpdateCharts(calc) {
    try {
      if (typeof Chart === 'undefined') return;

      const isDark = state.theme === 'dark';
      const textColor = isDark ? '#E2E8F0' : '#4A5568';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

      // --- 1. Category Doughnut Chart ---
      const categoryLabels = [];
      const categoryData = [];
      const categoryColors = [];

      state.categories.forEach(cat => {
        const spent = calc.categorySpentMap[cat.id] || 0;
        if (spent > 0) {
          categoryLabels.push(`${cat.emoji} ${cat.name}`);
          categoryData.push(spent);
          categoryColors.push(cat.color || '#A8D5BA');
        }
      });

      // Fallback if no transactions
      if (categoryData.length === 0) {
        categoryLabels.push('Belum ada transaksi');
        categoryData.push(1);
        categoryColors.push('#E2E8F0');
      }

      if (categoryChartInstance) {
        categoryChartInstance.data.labels = categoryLabels;
        categoryChartInstance.data.datasets[0].data = categoryData;
        categoryChartInstance.data.datasets[0].backgroundColor = categoryColors;
        if (categoryChartInstance.options && categoryChartInstance.options.plugins && categoryChartInstance.options.plugins.legend && categoryChartInstance.options.plugins.legend.labels) {
          categoryChartInstance.options.plugins.legend.labels.color = textColor;
        }
        categoryChartInstance.update();
      } else if (dom.categoryCanvas) {
        categoryChartInstance = new Chart(dom.categoryCanvas, {
          type: 'doughnut',
          data: {
            labels: categoryLabels,
            datasets: [{
              data: categoryData,
              backgroundColor: categoryColors,
              borderWidth: 2,
              borderColor: isDark ? '#222430' : '#FFFFFF',
              hoverOffset: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: textColor,
                  boxWidth: 14,
                  padding: 12,
                  font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
                }
              },
              tooltip: {
                callbacks: {
                  label: function (ctx) {
                    return ` ${ctx.label}: ${formatRupiah(ctx.raw)}`;
                  }
                }
              }
            },
            cutout: '62%'
          }
        });
      }

      // --- 2. Weekly Bar Chart (Past 7 Days) ---
      const weeklyLabels = [];
      const weeklyData = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const isoDate = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });

        weeklyLabels.push(dayName);

        // Sum transactions for this day
        const daySum = state.transactions
          .filter(t => t.date === isoDate)
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        weeklyData.push(daySum);
      }

      if (weeklyChartInstance) {
        weeklyChartInstance.data.labels = weeklyLabels;
        weeklyChartInstance.data.datasets[0].data = weeklyData;
        if (weeklyChartInstance.options && weeklyChartInstance.options.scales) {
          if (weeklyChartInstance.options.scales.x && weeklyChartInstance.options.scales.x.ticks) {
            weeklyChartInstance.options.scales.x.ticks.color = textColor;
          }
          if (weeklyChartInstance.options.scales.y && weeklyChartInstance.options.scales.y.ticks) {
            weeklyChartInstance.options.scales.y.ticks.color = textColor;
          }
          if (weeklyChartInstance.options.scales.x && weeklyChartInstance.options.scales.x.grid) {
            weeklyChartInstance.options.scales.x.grid.color = gridColor;
          }
          if (weeklyChartInstance.options.scales.y && weeklyChartInstance.options.scales.y.grid) {
            weeklyChartInstance.options.scales.y.grid.color = gridColor;
          }
        }
        weeklyChartInstance.update();
      } else if (dom.weeklyCanvas) {
        weeklyChartInstance = new Chart(dom.weeklyCanvas, {
          type: 'bar',
          data: {
            labels: weeklyLabels,
            datasets: [{
              label: 'Pengeluaran (Rp)',
              data: weeklyData,
              backgroundColor: '#A8D5BA',
              borderRadius: 8,
              hoverBackgroundColor: '#87C59F'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: textColor, font: { size: 11 } }
              },
              y: {
                grid: { color: gridColor },
                ticks: {
                  color: textColor,
                  font: { size: 11 },
                  callback: function (val) {
                    return 'Rp ' + (val / 1000).toLocaleString() + 'k';
                  }
                }
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function (ctx) {
                    return ` Pengeluaran: ${formatRupiah(ctx.raw)}`;
                  }
                }
              }
            }
          }
        });
      }
    } catch (err) {
      console.warn('initOrUpdateCharts handled warning:', err);
    }
  }

  // ==========================================================================
  // Annual Analytics & Charts
  // ==========================================================================

  const MONTH_NAMES_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const SHORT_MONTH_NAMES_ID = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  function getAvailableYears() {
    const currentYear = new Date().getFullYear();
    const yearsSet = new Set([currentYear, currentYear - 1, currentYear + 1]);
    state.transactions.forEach(tx => {
      if (tx.date) {
        const y = parseInt(tx.date.split('-')[0], 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }

  function updateYearSelectDropdown() {
    if (!dom.annualYearSelect) return;
    const years = getAvailableYears();
    const currentSelected = state.selectedAnnualYear;

    dom.annualYearSelect.innerHTML = '';
    years.forEach(yr => {
      const opt = document.createElement('option');
      opt.value = yr;
      opt.textContent = `Tahun ${yr}`;
      if (yr === currentSelected) opt.selected = true;
      dom.annualYearSelect.appendChild(opt);
    });

    if (dom.tableYearLabel) {
      dom.tableYearLabel.textContent = currentSelected;
    }
  }

  function getAnnualData(targetYear) {
    const monthlyIncome = new Array(12).fill(0);
    const monthlyExpense = new Array(12).fill(0);
    const monthlyNet = new Array(12).fill(0);
    const activeMonths = new Set();

    state.transactions.forEach(tx => {
      if (!tx.date) return;
      const parts = tx.date.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1; // 0-indexed

      if (y === targetYear && m >= 0 && m < 12) {
        const amount = Number(tx.amount || 0);
        activeMonths.add(m);
        if (tx.type === 'income') {
          monthlyIncome[m] += amount;
        } else {
          monthlyExpense[m] += amount;
        }
      }
    });

    for (let m = 0; m < 12; m++) {
      monthlyNet[m] = monthlyIncome[m] - monthlyExpense[m];
    }

    const totalIncome = monthlyIncome.reduce((a, b) => a + b, 0);
    const totalExpense = monthlyExpense.reduce((a, b) => a + b, 0);
    const totalNet = totalIncome - totalExpense;

    // Active months calculation (months that have transaction activity, min 1)
    const activeMonthsCount = Math.max(1, activeMonths.size);

    const avgIncome = totalIncome / activeMonthsCount;
    const avgExpense = totalExpense / activeMonthsCount;
    const avgNet = avgIncome - avgExpense;

    const savingsRate = totalIncome > 0 ? Math.round((totalNet / totalIncome) * 100) : 0;

    return {
      targetYear,
      monthlyIncome,
      monthlyExpense,
      monthlyNet,
      totalIncome,
      totalExpense,
      totalNet,
      activeMonthsCount,
      avgIncome,
      avgExpense,
      avgNet,
      savingsRate
    };
  }

  function renderAnnualAnalytics() {
    updateYearSelectDropdown();
    const data = getAnnualData(state.selectedAnnualYear);

    // 1. Metric Cards
    if (dom.avgMonthlyIncome) {
      dom.avgMonthlyIncome.textContent = formatRupiah(data.avgIncome);
    }
    if (dom.totalAnnualIncomeText) {
      dom.totalAnnualIncomeText.textContent = `Total: ${formatRupiah(data.totalIncome)} (${data.activeMonthsCount} bln aktif)`;
    }

    if (dom.avgMonthlyExpense) {
      dom.avgMonthlyExpense.textContent = formatRupiah(data.avgExpense);
    }
    if (dom.totalAnnualExpenseText) {
      dom.totalAnnualExpenseText.textContent = `Total: ${formatRupiah(data.totalExpense)}`;
    }

    if (dom.avgMonthlyNet) {
      const prefix = data.avgNet > 0 ? '+' : (data.avgNet < 0 ? '-' : '');
      dom.avgMonthlyNet.textContent = `${prefix}${formatRupiah(Math.abs(data.avgNet))}`;
    }

    if (dom.cardAvgNet && dom.badgeAvgNet && dom.avgNetEmoji) {
      if (data.avgNet > 0) {
        dom.badgeAvgNet.textContent = 'Surplus';
        dom.badgeAvgNet.className = 'annual-badge-tag tag-income';
        dom.avgNetEmoji.textContent = '🌱';
        if (dom.annualNetStatusText) dom.annualNetStatusText.textContent = 'Rata-rata surplus bulanan aman';
      } else if (data.avgNet < 0) {
        dom.badgeAvgNet.textContent = 'Defisit';
        dom.badgeAvgNet.className = 'annual-badge-tag tag-expense';
        dom.avgNetEmoji.textContent = '🚨';
        if (dom.annualNetStatusText) dom.annualNetStatusText.textContent = 'Pengeluaran melebihi pemasukan';
      } else {
        dom.badgeAvgNet.textContent = 'Seimbang';
        dom.badgeAvgNet.className = 'annual-badge-tag tag-rate';
        dom.avgNetEmoji.textContent = '⚖️';
        if (dom.annualNetStatusText) dom.annualNetStatusText.textContent = 'Pemasukan sama dengan pengeluaran';
      }
    }

    if (dom.annualSavingsRate) {
      dom.annualSavingsRate.textContent = `${data.savingsRate}%`;
    }
    if (dom.annualSavingsSubtext) {
      const netPrefix = data.totalNet >= 0 ? '+' : '-';
      dom.annualSavingsSubtext.textContent = `Total Bersih: ${netPrefix}${formatRupiah(Math.abs(data.totalNet))}`;
    }

    // 2. Render 12-Month Table
    if (dom.annualMonthlyTableBody) {
      let rowsHtml = '';
      for (let m = 0; m < 12; m++) {
        const inc = data.monthlyIncome[m];
        const exp = data.monthlyExpense[m];
        const net = data.monthlyNet[m];
        let statusBadge = `<span class="badge-status badge-even">Rp0</span>`;
        if (net > 0) {
          statusBadge = `<span class="badge-status badge-surplus">+Surplus</span>`;
        } else if (net < 0) {
          statusBadge = `<span class="badge-status badge-deficit">-Defisit</span>`;
        }
        const netColor = net > 0 ? '#2E7D32' : (net < 0 ? '#D9534F' : 'inherit');
        const netSign = net > 0 ? '+' : (net < 0 ? '-' : '');

        rowsHtml += `
          <tr>
            <td><strong>${MONTH_NAMES_ID[m]}</strong></td>
            <td class="text-right amount-income">${inc > 0 ? '+' + formatRupiah(inc) : 'Rp0'}</td>
            <td class="text-right amount-expense">${exp > 0 ? '-' + formatRupiah(exp) : 'Rp0'}</td>
            <td class="text-right" style="font-weight:700; color: ${netColor}">${netSign}${formatRupiah(Math.abs(net))}</td>
            <td class="text-center">${statusBadge}</td>
          </tr>
        `;
      }
      dom.annualMonthlyTableBody.innerHTML = rowsHtml;
    }

    // 3. Render Annual Chart
    renderAnnualChart(data);
  }

  function renderAnnualChart(data) {
    if (typeof Chart === 'undefined' || !dom.annualCanvas) return;

    const isDark = state.theme === 'dark';
    const textColor = isDark ? '#E2E8F0' : '#4A5568';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

    const isLineMode = state.annualChartMode === 'line';

    const datasets = [
      {
        type: isLineMode ? 'line' : 'bar',
        label: 'Pemasukan',
        data: data.monthlyIncome,
        backgroundColor: isLineMode ? 'rgba(168, 213, 186, 0.25)' : '#A8D5BA',
        borderColor: '#52B788',
        borderWidth: isLineMode ? 3 : 0,
        borderRadius: isLineMode ? 0 : 6,
        tension: 0.35,
        fill: isLineMode,
        pointBackgroundColor: '#52B788',
        pointRadius: 4,
        order: 2
      },
      {
        type: isLineMode ? 'line' : 'bar',
        label: 'Pengeluaran',
        data: data.monthlyExpense,
        backgroundColor: isLineMode ? 'rgba(255, 180, 162, 0.25)' : '#FFB4A2',
        borderColor: '#E56B6F',
        borderWidth: isLineMode ? 3 : 0,
        borderRadius: isLineMode ? 0 : 6,
        tension: 0.35,
        fill: isLineMode,
        pointBackgroundColor: '#E56B6F',
        pointRadius: 4,
        order: 2
      },
      {
        type: 'line',
        label: 'Selisih Bersih (Net)',
        data: data.monthlyNet,
        borderColor: '#CDB4DB',
        borderWidth: 2.5,
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        pointBackgroundColor: '#CDB4DB',
        pointBorderColor: isDark ? '#222430' : '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        tension: 0.3,
        order: 1
      }
    ];

    if (annualChartInstance) {
      annualChartInstance.data.labels = SHORT_MONTH_NAMES_ID;
      annualChartInstance.data.datasets = datasets;
      if (annualChartInstance.options && annualChartInstance.options.scales) {
        if (annualChartInstance.options.scales.x && annualChartInstance.options.scales.x.ticks) {
          annualChartInstance.options.scales.x.ticks.color = textColor;
        }
        if (annualChartInstance.options.scales.y) {
          if (annualChartInstance.options.scales.y.ticks) annualChartInstance.options.scales.y.ticks.color = textColor;
          if (annualChartInstance.options.scales.y.grid) annualChartInstance.options.scales.y.grid.color = gridColor;
        }
      }
      annualChartInstance.update();
    } else {
      annualChartInstance = new Chart(dom.annualCanvas, {
        type: 'bar',
        data: {
          labels: SHORT_MONTH_NAMES_ID,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '600' } }
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
                callback: function (val) {
                  return 'Rp ' + (val / 1000).toLocaleString() + 'k';
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                title: function (items) {
                  const idx = items[0].dataIndex;
                  return `${MONTH_NAMES_ID[idx]} ${state.selectedAnnualYear}`;
                },
                label: function (ctx) {
                  const label = ctx.dataset.label || '';
                  const val = ctx.raw || 0;
                  const sign = val > 0 ? '+' : '';
                  return ` ${label}: ${sign}${formatRupiah(val)}`;
                }
              }
            }
          }
        }
      });
    }
  }

  // ==========================================================================
  // Core App Refresh
  // ==========================================================================

  function refreshApp() {
    const calc = getCalculations();
    renderCircularIndicator(calc);
    renderQuickStats(calc);
    renderCategoryList(calc);
    renderTransactions();
    initOrUpdateCharts(calc);
    renderAnnualAnalytics();
    saveStateToStorage();
  }

  // ==========================================================================
  // Theme Toggle
  // ==========================================================================

  function setTheme(theme) {
    state.theme = theme;
    document.body.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';

    // Update theme toggle icons and chart styles
    if (dom.headerThemeBtn) {
      dom.headerThemeBtn.innerHTML = isDark ? '<span>☀️</span>' : '<span>🌙</span>';
    }

    refreshApp();
  }

  function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    showToast(`Beralih ke mode ${newTheme === 'dark' ? 'pastel malam' : 'pastel terang'} ✨`, 'info');
  }

  // ==========================================================================
  // Category Limit Settings Modal
  // ==========================================================================

  function updateModalAllocationSummary() {
    const budget = state.budget || 0;
    const inputs = dom.categoryLimitsInputsContainer.querySelectorAll('input[data-cat-id]');
    let sum = 0;
    inputs.forEach(inp => {
      sum += parseRupiah(inp.value);
    });

    const diff = budget - sum;
    const budgetEl = document.getElementById('modalAllocBudget');
    const sumEl = document.getElementById('modalAllocSum');
    const remEl = document.getElementById('modalAllocRemaining');
    const remWrap = document.getElementById('modalAllocRemainingWrap');

    if (budgetEl) budgetEl.textContent = formatRupiah(budget);
    if (sumEl) sumEl.textContent = formatRupiah(sum);
    if (remEl) {
      remEl.textContent = formatRupiah(Math.abs(diff));
      if (remWrap) {
        if (diff < 0) {
          remWrap.innerHTML = `Kelebihan: <strong style="color: #E53E3E;">-${formatRupiah(Math.abs(diff))}</strong>`;
        } else {
          remWrap.innerHTML = `Sisa Alokasi: <strong style="color: #2E7D32;">${formatRupiah(diff)}</strong>`;
        }
      }
    }
  }

  function openCategoryLimitModal() {
    dom.categoryLimitsInputsContainer.innerHTML = '';
    state.categories.forEach(cat => {
      const item = document.createElement('div');
      item.className = 'cat-limit-item';
      item.innerHTML = `
        <label class="cat-limit-label" for="limit-${cat.id}">
          <span>${cat.emoji}</span> <span>${cat.name}</span>
        </label>
        <div class="input-prefix-wrapper cat-limit-input-wrap">
          <span class="input-prefix">Rp</span>
          <input 
            type="text" 
            id="limit-${cat.id}" 
            data-cat-id="${cat.id}"
            class="form-input rupiah-mask" 
            value="${formatRupiah(cat.limit, false)}"
            required
            autocomplete="off"
          >
        </div>
      `;
      dom.categoryLimitsInputsContainer.appendChild(item);
    });

    setupRupiahMaskInputs();

    // Attach live input listener for allocation summary
    dom.categoryLimitsInputsContainer.querySelectorAll('input[data-cat-id]').forEach(inp => {
      inp.addEventListener('input', updateModalAllocationSummary);
    });

    updateModalAllocationSummary();
    dom.categoryLimitModal.classList.add('open');
  }

  function closeCategoryLimitModal() {
    dom.categoryLimitModal.classList.remove('open');
  }

  function handleSaveCategoryLimits(e) {
    e.preventDefault();
    const inputs = dom.categoryLimitsInputsContainer.querySelectorAll('input[data-cat-id]');
    inputs.forEach(input => {
      const catId = input.getAttribute('data-cat-id');
      const val = parseRupiah(input.value);
      const cat = state.categories.find(c => c.id === catId);
      if (cat) {
        cat.limit = Math.max(0, val);
      }
    });

    closeCategoryLimitModal();
    refreshApp();
    showToast('Alokasi limit kategori berhasil diperbarui! 🏷️', 'success');
  }

  // ==========================================================================
  // Transaction CRUD & Modals
  // ==========================================================================

  // ==========================================================================
  // Transaction CRUD & Modals
  // ==========================================================================

  function setInlineFormType(type) {
    if (!dom.inlineTxType) return;
    dom.inlineTxType.value = type;
    const isIncome = type === 'income';

    if (dom.quickAddTitle) dom.quickAddTitle.textContent = isIncome ? 'Tambah Pemasukan' : 'Tambah Transaksi';
    if (dom.quickAddSubtitle) dom.quickAddSubtitle.textContent = isIncome ? 'Catat penghasilan atau pemasukan baru' : 'Catat keuangan baru dengan cepat';
    if (dom.quickAddIcon) dom.quickAddIcon.textContent = isIncome ? '💰' : '➕';
    if (dom.expenseNameLabel) dom.expenseNameLabel.innerHTML = isIncome ? 'Nama Pemasukan <span class="required">*</span>' : 'Nama Transaksi <span class="required">*</span>';
    if (dom.expenseName) dom.expenseName.placeholder = isIncome ? 'Misal: Gaji Bulanan, Bonus' : 'Misal: Kopi Kenangan';
    if (dom.inlineSubmitBtn) {
      dom.inlineSubmitBtn.innerHTML = isIncome ? '<span>💰</span> Tambah Pemasukan' : '<span>＋</span> Tambah Pengeluaran';
      dom.inlineSubmitBtn.className = isIncome ? 'btn btn-primary btn-block' : 'btn btn-accent btn-block';
    }

    populateCategorySelect(dom.expenseCategory, type);
  }

  function setModalFormType(type) {
    if (!dom.modalTxType) return;
    dom.modalTxType.value = type;
    const isIncome = type === 'income';

    if (dom.modalExpenseTitle) dom.modalExpenseTitle.textContent = isIncome ? 'Catat Pemasukan Baru' : 'Catat Pengeluaran Baru';
    if (dom.modalExpenseNameLabel) dom.modalExpenseNameLabel.innerHTML = isIncome ? 'Nama Pemasukan <span class="required">*</span>' : 'Nama Transaksi <span class="required">*</span>';
    if (dom.modalExpenseName) dom.modalExpenseName.placeholder = isIncome ? 'Misal: Gaji Bulanan, Freelance' : 'Misal: Belanja Bulanan';

    // Update modal pill buttons active class
    const modalTypeBtns = document.querySelectorAll('#modalTypeToggle .type-pill-btn');
    modalTypeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-modal-type') === type);
    });

    populateCategorySelect(dom.modalExpenseCategory, type);
  }

  function openAddExpenseModal(defaultType = 'expense') {
    dom.editExpenseId.value = '';
    dom.modalExpenseName.value = '';
    dom.modalExpenseAmount.value = '';
    dom.modalExpenseDate.value = new Date().toISOString().split('T')[0];
    dom.modalExpenseNote.value = '';

    setModalFormType(defaultType);

    dom.expenseModal.classList.add('open');
    setTimeout(() => dom.modalExpenseName.focus(), 100);
  }

  function openEditExpenseModal(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    const type = tx.type === 'income' ? 'income' : 'expense';
    dom.editExpenseId.value = tx.id;
    setModalFormType(type);
    if (dom.modalExpenseTitle) dom.modalExpenseTitle.textContent = type === 'income' ? 'Edit Pemasukan' : 'Edit Pengeluaran';

    dom.modalExpenseName.value = tx.name;
    dom.modalExpenseAmount.value = formatRupiah(tx.amount, false);
    populateCategorySelect(dom.modalExpenseCategory, type, tx.category);
    dom.modalExpenseDate.value = tx.date;
    dom.modalExpenseNote.value = tx.note || '';

    dom.expenseModal.classList.add('open');
    setTimeout(() => dom.modalExpenseAmount.focus(), 100);
  }

  function closeExpenseModal() {
    dom.expenseModal.classList.remove('open');
  }

  function handleSaveModalExpense(e) {
    e.preventDefault();
    const id = dom.editExpenseId.value;
    const type = (dom.modalTxType && dom.modalTxType.value) || 'expense';
    const name = dom.modalExpenseName.value.trim();
    const amount = parseRupiah(dom.modalExpenseAmount.value);
    const category = dom.modalExpenseCategory.value;
    const date = dom.modalExpenseDate.value;
    const note = dom.modalExpenseNote.value.trim();

    if (!name || amount <= 0 || !date) {
      showToast('Harap lengkapi nama, nominal dan tanggal transaksi!', 'error');
      return;
    }

    if (id) {
      // Edit existing
      const idx = state.transactions.findIndex(t => t.id === id);
      if (idx !== -1) {
        state.transactions[idx] = { id, name, amount, category, date, note, type };
        showToast('Transaksi berhasil diperbarui! ✏️', 'success');
      }
    } else {
      // Add new
      const newTx = {
        id: 'tx-' + Date.now(),
        name,
        amount,
        category,
        date,
        note,
        type
      };
      state.transactions.unshift(newTx);
      showToast(type === 'income' ? 'Pemasukan baru berhasil dicatat! 💰' : 'Pengeluaran baru berhasil dicatat! 💸', 'success');
    }

    closeExpenseModal();
    refreshApp();
  }

  function handleInlineExpenseSubmit(e) {
    e.preventDefault();
    const type = (dom.inlineTxType && dom.inlineTxType.value) || 'expense';
    const name = dom.expenseName.value.trim();
    const amount = parseRupiah(dom.expenseAmount.value);
    const category = dom.expenseCategory.value;
    const date = dom.expenseDate.value;
    const note = dom.expenseNote.value.trim();

    if (!name || amount <= 0 || !date) {
      showToast('Harap masukkan nama dan nominal transaksi yang valid!', 'error');
      return;
    }

    const newTx = {
      id: 'tx-' + Date.now(),
      name,
      amount,
      category,
      date,
      note,
      type
    };

    state.transactions.unshift(newTx);
    dom.inlineExpenseForm.reset();
    dom.expenseDate.value = new Date().toISOString().split('T')[0];
    setInlineFormType('expense'); // reset to default expense

    // reset inline type pills
    const inlineBtns = document.querySelectorAll('#inlineTypeToggle .type-pill-btn');
    inlineBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-type') === 'expense');
    });

    refreshApp();
    const sign = type === 'income' ? '+' : '-';
    showToast(`Berhasil menambah ${name} (${sign}${formatRupiah(amount)}) ✨`, 'success');
  }

  function confirmDeleteTx(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    const isIncome = tx.type === 'income';
    const title = isIncome ? 'Hapus Pemasukan' : 'Hapus Pengeluaran';
    const sign = isIncome ? '+' : '-';

    openConfirmModal(
      title,
      `Apakah Anda yakin ingin menghapus "${tx.name}" sebesar ${sign}${formatRupiah(tx.amount)}?`,
      () => {
        state.transactions = state.transactions.filter(t => t.id !== id);
        refreshApp();
        showToast('Transaksi telah dihapus.', 'info');
      }
    );
  }

  // ==========================================================================
  // Confirmation Modal
  // ==========================================================================

  function openConfirmModal(title, message, callback) {
    dom.confirmModalTitle.textContent = title;
    dom.confirmModalMessage.textContent = message;
    onConfirmCallback = callback;
    dom.confirmModal.classList.add('open');
  }

  function closeConfirmModal() {
    dom.confirmModal.classList.remove('open');
    onConfirmCallback = null;
  }

  // ==========================================================================
  // Export & Reset Data
  // ==========================================================================

  function exportToJson() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `budgetin_backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
    showToast('Data berhasil diekspor ke JSON! 📥', 'success');
  }

  function exportToCsv() {
    if (state.transactions.length === 0) {
      showToast('Belum ada transaksi untuk diekspor.', 'info');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,ID,Tanggal,Tipe,Nama,Kategori,Nominal,Catatan\n';
    state.transactions.forEach(t => {
      const cleanName = `"${(t.name || '').replace(/"/g, '""')}"`;
      const cleanNote = `"${(t.note || '').replace(/"/g, '""')}"`;
      const typeLabel = t.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
      csvContent += `${t.id},${t.date},${typeLabel},${cleanName},${t.category},${t.amount},${cleanNote}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `budgetin_transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    showToast('Riwayat transaksi berhasil diunduh (CSV)! 📊', 'success');
  }

  function resetAllData() {
    openConfirmModal(
      'Reset Seluruh Data',
      'Tindakan ini akan mengosongkan anggaran, target tabungan, dan riwayat transaksi kembali ke 0. Lanjutkan?',
      () => {
        state.budget = 0;
        state.savingsTarget = 0;
        state.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
        state.transactions = [];

        dom.budgetInput.value = '';
        dom.savingsInput.value = '';

        refreshApp();
        showToast('Data aplikasi telah di-reset ke 0 🌱', 'success');
      }
    );
  }

  // ==========================================================================
  // Initialization & Event Listeners
  // ==========================================================================

  function initEventListeners() {
    // 1. Rupiah input auto formatting
    setupRupiahMaskInputs();

    // 2. Budget form submit
    dom.budgetForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const budgetVal = parseRupiah(dom.budgetInput.value);
      const savingsVal = parseRupiah(dom.savingsInput.value);

      if (budgetVal <= 0) {
        showToast('Mohon masukkan jumlah total budget yang valid!', 'error');
        return;
      }

      state.budget = budgetVal;
      state.savingsTarget = savingsVal;
      refreshApp();
      showToast(`Budget berhasil diperbarui: ${formatRupiah(state.budget)} 💰`, 'success');
    });

    // 3. Theme Toggles
    if (dom.themeToggleBtn) {
      dom.themeToggleBtn.addEventListener('click', toggleTheme);
    }
    if (dom.headerThemeBtn) {
      dom.headerThemeBtn.addEventListener('click', toggleTheme);
    }

    // 4. Quick Transaction Forms & Modals
    dom.inlineExpenseForm.addEventListener('submit', handleInlineExpenseSubmit);
    dom.modalExpenseForm.addEventListener('submit', handleSaveModalExpense);

    // Inline Type Toggle buttons
    const inlineTypeButtons = document.querySelectorAll('#inlineTypeToggle .type-pill-btn');
    inlineTypeButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        const type = this.getAttribute('data-type');
        inlineTypeButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        setInlineFormType(type);
      });
    });

    // Modal Type Toggle buttons
    const modalTypeButtons = document.querySelectorAll('#modalTypeToggle .type-pill-btn');
    modalTypeButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        const type = this.getAttribute('data-modal-type');
        modalTypeButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        setModalFormType(type);
      });
    });

    // Modal open buttons
    if (dom.quickAddExpenseBtn) dom.quickAddExpenseBtn.addEventListener('click', () => openAddExpenseModal('expense'));
    if (dom.quickAddIncomeBtn) dom.quickAddIncomeBtn.addEventListener('click', () => openAddExpenseModal('income'));
    if (dom.fabBtn) dom.fabBtn.addEventListener('click', () => openAddExpenseModal('expense'));
    if (dom.emptyAddBtn) dom.emptyAddBtn.addEventListener('click', () => openAddExpenseModal('expense'));
    if (dom.closeExpenseModalBtn) dom.closeExpenseModalBtn.addEventListener('click', closeExpenseModal);
    if (dom.cancelExpenseModalBtn) dom.cancelExpenseModalBtn.addEventListener('click', closeExpenseModal);

    // Category Limit Modal
    if (dom.openCategoryLimitModalBtn) dom.openCategoryLimitModalBtn.addEventListener('click', openCategoryLimitModal);
    if (dom.closeCatLimitModalBtn) dom.closeCatLimitModalBtn.addEventListener('click', closeCategoryLimitModal);
    if (dom.cancelCatLimitModalBtn) dom.cancelCatLimitModalBtn.addEventListener('click', closeCategoryLimitModal);
    if (dom.categoryLimitForm) dom.categoryLimitForm.addEventListener('submit', handleSaveCategoryLimits);

    // Confirm Modal
    if (dom.closeConfirmModalBtn) dom.closeConfirmModalBtn.addEventListener('click', closeConfirmModal);
    if (dom.confirmCancelBtn) dom.confirmCancelBtn.addEventListener('click', closeConfirmModal);
    if (dom.confirmOkBtn) {
      dom.confirmOkBtn.addEventListener('click', () => {
        if (typeof onConfirmCallback === 'function') {
          onConfirmCallback();
        }
        closeConfirmModal();
      });
    }

    // Close modals on backdrop click
    [dom.expenseModal, dom.categoryLimitModal, dom.confirmModal, dom.authModal, dom.userProfileModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', function (e) {
          if (e.target === this) {
            this.classList.remove('open');
          }
        });
      }
    });

    // 5. Search & Filters
    dom.transactionSearch.addEventListener('input', function () {
      state.searchQuery = this.value;
      renderTransactions();
    });

    if (dom.typeFilter) {
      dom.typeFilter.addEventListener('change', function () {
        state.typeFilter = this.value;
        renderTransactions();
      });
    }

    dom.categoryFilter.addEventListener('change', function () {
      state.categoryFilter = this.value;
      renderTransactions();
    });

    dom.sortFilter.addEventListener('change', function () {
      state.sortFilter = this.value;
      renderTransactions();
    });

    // 6. Annual Section Controls
    if (dom.annualYearSelect) {
      dom.annualYearSelect.addEventListener('change', function () {
        state.selectedAnnualYear = parseInt(this.value, 10);
        renderAnnualAnalytics();
      });
    }

    if (dom.prevYearBtn) {
      dom.prevYearBtn.addEventListener('click', function () {
        state.selectedAnnualYear--;
        renderAnnualAnalytics();
      });
    }

    if (dom.nextYearBtn) {
      dom.nextYearBtn.addEventListener('click', function () {
        state.selectedAnnualYear++;
        renderAnnualAnalytics();
      });
    }

    if (dom.btnChartBar) {
      dom.btnChartBar.addEventListener('click', function () {
        state.annualChartMode = 'bar';
        dom.btnChartBar.classList.add('active');
        if (dom.btnChartLine) dom.btnChartLine.classList.remove('active');
        renderAnnualAnalytics();
      });
    }

    if (dom.btnChartLine) {
      dom.btnChartLine.addEventListener('click', function () {
        state.annualChartMode = 'line';
        dom.btnChartLine.classList.add('active');
        if (dom.btnChartBar) dom.btnChartBar.classList.remove('active');
        renderAnnualAnalytics();
      });
    }

    if (dom.toggleAnnualTableBtn && dom.annualTableContainer) {
      dom.toggleAnnualTableBtn.addEventListener('click', function () {
        const isHidden = dom.annualTableContainer.style.display === 'none';
        dom.annualTableContainer.style.display = isHidden ? 'block' : 'none';
        this.textContent = isHidden ? 'Sembunyikan Rincian Bulanan ▴' : 'Lihat Rincian Bulanan ▾';
      });
    }

    // 7. Chart Tabs (Category vs Weekly)
    dom.chartTabs.forEach(tab => {
      tab.addEventListener('click', function () {
        dom.chartTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        const target = this.getAttribute('data-chart-tab');
        if (target === 'category') {
          dom.categoryChartPanel.classList.add('active');
          dom.weeklyChartPanel.classList.remove('active');
        } else {
          dom.weeklyChartPanel.classList.add('active');
          dom.categoryChartPanel.classList.remove('active');
        }
      });
    });

    // 7. Navigation Links Smooth Scroll & Active Highlight
    const allNavLinks = document.querySelectorAll('.sidebar-nav a, .mobile-bottom-nav a');
    allNavLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          e.preventDefault();
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }

          const navType = this.getAttribute('data-nav');
          allNavLinks.forEach(l => {
            if (l.getAttribute('data-nav') === navType) {
              l.classList.add('active');
            } else {
              l.classList.remove('active');
            }
          });
        }
      });
    });

    // 8. Settings & Reset Buttons
    if (dom.exportJsonBtn) dom.exportJsonBtn.addEventListener('click', exportToJson);
    if (dom.exportCsvBtn) dom.exportCsvBtn.addEventListener('click', exportToCsv);
    if (dom.resetAllDataBtn) dom.resetAllDataBtn.addEventListener('click', resetAllData);
    if (dom.openResetModalBtn) dom.openResetModalBtn.addEventListener('click', resetAllData);

    // 9. Quick Amount Chips
    document.querySelectorAll('.quick-amount-chips .chip-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const container = this.closest('.quick-amount-chips');
        if (!container) return;
        const targetId = container.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input) {
          const current = parseRupiah(input.value);
          const add = Number(this.getAttribute('data-add') || 0);
          const updated = current + add;
          input.value = formatRupiah(updated, false);
          input.dispatchEvent(new Event('input'));
        }
      });
    });

    // 10. Category Preset Allocation Buttons
    const preset503020Btn = document.getElementById('preset503020');
    if (preset503020Btn) {
      preset503020Btn.addEventListener('click', function () {
        const total = state.budget || 0;
        const weights = {
          Makan: 0.30,
          Tagihan: 0.20,
          Belanja: 0.15,
          Transport: 0.15,
          Pendidikan: 0.10,
          Hiburan: 0.05,
          Lainnya: 0.05
        };
        const inputs = dom.categoryLimitsInputsContainer.querySelectorAll('input[data-cat-id]');
        inputs.forEach(inp => {
          const cid = inp.getAttribute('data-cat-id');
          const weight = weights[cid] || 0.1;
          const alloc = Math.round((total * weight) / 1000) * 1000;
          inp.value = formatRupiah(alloc, false);
        });
        updateModalAllocationSummary();
      });
    }

    const presetEvenBtn = document.getElementById('presetEven');
    if (presetEvenBtn) {
      presetEvenBtn.addEventListener('click', function () {
        const total = state.budget || 0;
        const alloc = Math.floor(total / 7 / 1000) * 1000;
        const inputs = dom.categoryLimitsInputsContainer.querySelectorAll('input[data-cat-id]');
        inputs.forEach(inp => {
          inp.value = formatRupiah(alloc, false);
        });
        updateModalAllocationSummary();
      });
    }

    const presetZeroBtn = document.getElementById('presetZero');
    if (presetZeroBtn) {
      presetZeroBtn.addEventListener('click', function () {
        const inputs = dom.categoryLimitsInputsContainer.querySelectorAll('input[data-cat-id]');
        inputs.forEach(inp => {
          inp.value = '0';
        });
        updateModalAllocationSummary();
      });
    }

    // Default Date for inline form
    if (dom.expenseDate) {
      dom.expenseDate.value = new Date().toISOString().split('T')[0];
    }

    // 11. Cloud Firebase Sync Listeners
    if (dom.btnUpdateSyncKey) dom.btnUpdateSyncKey.addEventListener('click', handleUpdateSyncKey);
    if (dom.cloudSyncKeyInput) {
      dom.cloudSyncKeyInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleUpdateSyncKey();
        }
      });
    }
    if (dom.btnManualSync) dom.btnManualSync.addEventListener('click', handleManualSync);
    if (dom.btnUploadLocalToCloud) dom.btnUploadLocalToCloud.addEventListener('click', handleUploadLocalToCloud);

    // 12. Authentication & User Profile Listeners
    if (dom.headerAuthBtn) dom.headerAuthBtn.addEventListener('click', openProfileModal);
    if (dom.sidebarUserProfileCard) dom.sidebarUserProfileCard.addEventListener('click', openProfileModal);
    if (dom.sidebarAuthActionBtn) {
      dom.sidebarAuthActionBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openProfileModal();
      });
    }
    if (dom.closeAuthModalBtn) dom.closeAuthModalBtn.addEventListener('click', closeAuthModal);
    if (dom.tabBtnSignIn) dom.tabBtnSignIn.addEventListener('click', () => switchAuthTab('signin'));
    if (dom.tabBtnSignUp) dom.tabBtnSignUp.addEventListener('click', () => switchAuthTab('signup'));
    if (dom.signInForm) dom.signInForm.addEventListener('submit', handleSignInSubmit);
    if (dom.signUpForm) dom.signUpForm.addEventListener('submit', handleSignUpSubmit);
    if (dom.btnGoogleSignIn) dom.btnGoogleSignIn.addEventListener('click', handleGoogleSignIn);
    if (dom.btnContinueGuest) dom.btnContinueGuest.addEventListener('click', closeAuthModal);
    if (dom.forgotPasswordBtn) dom.forgotPasswordBtn.addEventListener('click', handleForgotPassword);
    if (dom.closeProfileModalBtn) dom.closeProfileModalBtn.addEventListener('click', closeProfileModal);
    if (dom.closeProfileBtn) dom.closeProfileBtn.addEventListener('click', closeProfileModal);
    if (dom.signOutBtn) dom.signOutBtn.addEventListener('click', handleSignOut);

    setupPasswordToggles();
  }

  // Expose global methods for inline HTML onclick handlers
  window.budgetinApp = {
    openEditModal: openEditExpenseModal,
    confirmDeleteTx: confirmDeleteTx,
    openAddExpenseModal: () => openAddExpenseModal('expense'),
    openAddIncomeModal: () => openAddExpenseModal('income'),
    openAddExpenseModalForCategory: function (catId) {
      openAddExpenseModal('expense');
      if (dom.modalExpenseCategory) {
        dom.modalExpenseCategory.value = catId;
      }
    },
    syncCloudNow: handleManualSync,
    uploadLocalToCloud: handleUploadLocalToCloud,
    openAuth: openAuthModal,
    openProfile: openProfileModal
  };

  // --- Bootstrap App ---
  function init() {
    try {
      loadStateFromStorage();

      // Setup listeners FIRST so UI is immediately responsive
      initEventListeners();

      // Set initial input values in budget form (only set if > 0 so placeholder is visible)
      if (dom.budgetInput) {
        dom.budgetInput.value = state.budget > 0 ? formatRupiah(state.budget, false) : '';
      }
      if (dom.savingsInput) {
        dom.savingsInput.value = state.savingsTarget > 0 ? formatRupiah(state.savingsTarget, false) : '';
      }

      // Set initial theme
      setTheme(state.theme);

      // Initial render
      refreshApp();

      // Start Firebase Realtime Cloud Synchronization
      initFirebaseSync();
    } catch (err) {
      console.error('Fatal initialization caught safely:', err);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
