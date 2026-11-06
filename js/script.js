/* ============================================================
   Expense & Budget Visualizer — script.js
   Vanilla JavaScript (ES6+)  |  Chart.js  |  LocalStorage
   ============================================================ */

'use strict';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. CONSTANTS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const LS_KEY_TRANSACTIONS = 'ebv_transactions';
const LS_KEY_THEME        = 'ebv_theme';

/** Ordered list of all categories */
const CATEGORIES = ['Food', 'Transport', 'Fun'];

/** Emoji per category */
const CAT_EMOJI = { Food: '🍔', Transport: '🚗', Fun: '🎮' };

/** Chart colours keyed by theme */
const CAT_COLORS = {
  light: { Food: '#f97316', Transport: '#3b82f6', Fun: '#a855f7' },
  dark:  { Food: '#fb923c', Transport: '#60a5fa', Fun: '#c084fc' },
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   2. APPLICATION STATE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const state = {
  transactions: [],    // {id, name, amount, category, date}[]
  theme:        'light',
  sortOption:   'newest',
  selectedMonth: '',   // 'YYYY-MM'
  chart:        null,  // Chart.js instance — track to avoid duplicates
  toastTimer:   null,
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   3. DOM CACHE
   Populated once after DOMContentLoaded fires (see initializeApp)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const el = {};

function cacheDom() {
  const g = (id) => document.getElementById(id);

  // Header
  el.themeToggle  = g('themeToggle');
  el.currentDate  = g('currentDate');

  // Stat cards
  el.totalExpenses     = g('totalExpenses');
  el.totalTransactions = g('totalTransactions');
  el.highestCategory   = g('highestCategory');

  // Chart
  el.spendingChart = g('spendingChart');
  el.chartEmpty    = g('chartEmpty');
  el.chartLegend   = g('chartLegend');

  // Form
  el.form         = g('transactionForm');
  el.itemName     = g('itemName');
  el.amount       = g('amount');
  el.category     = g('category');
  el.txnDate      = g('txnDate');
  el.itemNameErr  = g('itemNameErr');
  el.amountErr    = g('amountErr');
  el.categoryErr  = g('categoryErr');
  el.dateErr      = g('dateErr');

  // Monthly
  el.monthSelector    = g('monthSelector');
  el.monthTotal       = g('monthTotal');
  el.monthCount       = g('monthCount');
  el.monthlyBreakdown = g('monthlyBreakdown');
  el.monthlyEmpty     = g('monthlyEmpty');

  // History
  el.sortSelect       = g('sortSelect');
  el.transactionList  = g('transactionList');
  el.emptyState       = g('emptyState');

  // Recent transactions (dashboard widget)
  el.recentList       = g('recentList');
  el.recentEmpty      = g('recentEmpty');
  el.recentHint       = g('recentHint');

  // Toast
  el.toast = g('toast');
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   4. UTILITY HELPERS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Format a number as Indonesian Rupiah.
 * 150000  →  "Rp 150.000"
 */
function formatCurrency(amount) {
  const n = Math.round(Number(amount));
  if (!Number.isFinite(n)) return 'Rp 0';
  return 'Rp\u00a0' + n.toLocaleString('id-ID');
}

/**
 * Generate a collision-resistant unique ID string.
 */
function generateId() {
  return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

/**
 * Today's date as YYYY-MM-DD (local time).
 */
function todayISO() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * Current month as YYYY-MM (local time).
 */
function currentMonthISO() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
  ].join('-');
}

/**
 * Human-readable date from YYYY-MM-DD.
 * Parsed as local date to avoid UTC timezone shifts.
 */
function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}

/**
 * Show a toast message for 3 seconds.
 * @param {string} msg
 * @param {'success'|'error'|'info'} type
 */
function showToast(msg, type = 'success') {
  if (state.toastTimer) clearTimeout(state.toastTimer);

  el.toast.classList.remove('show', 'toast--success', 'toast--error', 'toast--info');
  el.toast.textContent = '';
  void el.toast.offsetWidth; // force reflow → restart CSS transition

  el.toast.textContent = msg;
  el.toast.classList.add('show', `toast--${type}`);

  state.toastTimer = setTimeout(() => el.toast.classList.remove('show'), 3000);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   5. LOCAL STORAGE — TRANSACTIONS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/** Load and validate transactions from LocalStorage. */
function loadTransactions() {
  try {
    const raw = localStorage.getItem(LS_KEY_TRANSACTIONS);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // Filter out malformed entries
    return arr.filter(
      (t) =>
        t !== null &&
        typeof t === 'object' &&
        typeof t.id       === 'string' &&
        typeof t.name     === 'string' &&
        typeof t.amount   === 'number' &&
        Number.isFinite(t.amount) &&
        t.amount > 0 &&
        typeof t.category === 'string' &&
        CATEGORIES.includes(t.category) &&
        typeof t.date     === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(t.date)
    );
  } catch {
    return []; // corrupted JSON — start fresh
  }
}

/** Persist current transactions to LocalStorage. */
function saveTransactions() {
  try {
    localStorage.setItem(LS_KEY_TRANSACTIONS, JSON.stringify(state.transactions));
  } catch {
    showToast('Storage quota exceeded — data not saved.', 'error');
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   6. LOCAL STORAGE — THEME
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function loadTheme() {
  try {
    const v = localStorage.getItem(LS_KEY_THEME);
    return v === 'dark' || v === 'light' ? v : 'light';
  } catch {
    return 'light';
  }
}

function saveTheme() {
  try {
    localStorage.setItem(LS_KEY_THEME, state.theme);
  } catch { /* ignore */ }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   7. CALCULATIONS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/** Sum amounts across a transaction array. */
function calculateTotalExpenses(txns) {
  return txns.reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Group amounts by category.
 * @returns {{ Food: number, Transport: number, Fun: number }}
 */
function calculateCategoryTotals(txns) {
  const totals = { Food: 0, Transport: 0, Fun: 0 };
  txns.forEach((t) => {
    if (Object.prototype.hasOwnProperty.call(totals, t.category)) {
      totals[t.category] += t.amount;
    }
  });
  return totals;
}

/** Returns "Emoji Category" for the highest-spending category, or "—". */
function getHighestCategory(txns) {
  if (!txns.length) return '—';
  const totals = calculateCategoryTotals(txns);
  let best = null;
  let bestVal = -1;
  CATEGORIES.forEach((cat) => {
    if (totals[cat] > bestVal) {
      bestVal = totals[cat];
      best = cat;
    }
  });
  return bestVal === 0 ? '—' : `${CAT_EMOJI[best]} ${best}`;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   8. FORM VALIDATION
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Validate raw form data.
 * @returns {{ itemName, amount, category, date }} — each field is "" (ok) or an error string.
 */
function validateForm(data) {
  const e = { itemName: '', amount: '', category: '', date: '' };

  // Name
  if (!data.name || data.name.trim() === '') {
    e.itemName = 'Item name is required.';
  } else if (data.name.trim().length > 100) {
    e.itemName = 'Item name must be 100 characters or fewer.';
  }

  // Amount
  if (data.amount === '' || data.amount === null || data.amount === undefined) {
    e.amount = 'Amount is required.';
  } else {
    const n = Number(data.amount);
    if (isNaN(n) || !Number.isFinite(n)) {
      e.amount = 'Please enter a valid number.';
    } else if (n <= 0) {
      e.amount = 'Amount must be greater than zero.';
    }
  }

  // Category
  if (!data.category || !CATEGORIES.includes(data.category)) {
    e.category = 'Please select a category.';
  }

  // Date
  if (!data.date) {
    e.date = 'Date is required.';
  }

  return e;
}

/** Apply or clear validation feedback on form fields. */
function applyValidationUI(errors) {
  const pairs = [
    { input: el.itemName,  errEl: el.itemNameErr,  key: 'itemName' },
    { input: el.amount,    errEl: el.amountErr,    key: 'amount' },
    { input: el.category,  errEl: el.categoryErr,  key: 'category' },
    { input: el.txnDate,   errEl: el.dateErr,      key: 'date' },
  ];

  pairs.forEach(({ input, errEl, key }) => {
    const msg = errors[key] || '';
    errEl.textContent = msg;
    input.classList.toggle('is-invalid', msg !== '');
  });
}

/** Remove all validation state from the form. */
function clearValidation() {
  applyValidationUI({ itemName: '', amount: '', category: '', date: '' });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   9. ADD / DELETE TRANSACTIONS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/** Handle form submit. */
function addTransaction(e) {
  e.preventDefault();

  const raw = {
    name:     el.itemName.value,
    amount:   el.amount.value,
    category: el.category.value,
    date:     el.txnDate.value,
  };

  const errors = validateForm(raw);
  if (Object.values(errors).some((v) => v !== '')) {
    applyValidationUI(errors);
    // Focus first invalid field
    if (errors.itemName) { el.itemName.focus(); }
    else if (errors.amount) { el.amount.focus(); }
    else if (errors.category) { el.category.focus(); }
    else if (errors.date) { el.txnDate.focus(); }
    return;
  }

  clearValidation();

  /** @type {Transaction} */
  const txn = {
    id:       generateId(),
    name:     raw.name.trim(),
    amount:   Math.round(Number(raw.amount)),
    category: raw.category,
    date:     raw.date,
  };

  state.transactions.unshift(txn); // newest first
  saveTransactions();

  // Reset form, keep today's date
  el.form.reset();
  el.txnDate.value  = todayISO();
  el.category.value = ''; // back to placeholder

  refreshAll();

  showToast(`"${txn.name}" added!`, 'success');
}

/** Delete a transaction by id after confirmation. */
function deleteTransaction(id) {
  const txn = state.transactions.find((t) => t.id === id);
  if (!txn) return;

  const ok = window.confirm(
    `Delete "${txn.name}" (${formatCurrency(txn.amount)})?\n\nThis cannot be undone.`
  );
  if (!ok) return;

  state.transactions = state.transactions.filter((t) => t.id !== id);
  saveTransactions();
  refreshAll();

  showToast(`"${txn.name}" deleted.`, 'info');
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   10. DASHBOARD — STAT CARDS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function updateDashboard() {
  const txns = state.transactions;
  el.totalExpenses.textContent     = formatCurrency(calculateTotalExpenses(txns));
  el.totalTransactions.textContent = String(txns.length);
  el.highestCategory.textContent   = getHighestCategory(txns);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   10b. RECENT TRANSACTIONS (Dashboard Widget — shows latest 5)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const RECENT_LIMIT = 5;

/**
 * Render the last N transactions (newest first) in the dashboard widget.
 */
function renderRecentTransactions() {
  const list  = el.recentList;
  const empty = el.recentEmpty;
  const hint  = el.recentHint;

  // Clear
  while (list.firstChild) list.removeChild(list.firstChild);

  if (state.transactions.length === 0) {
    empty.classList.add('show');
    hint.textContent = '';
    return;
  }

  empty.classList.remove('show');

  // Sort newest-first and take top N
  const recent = [...state.transactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .slice(0, RECENT_LIMIT);

  const total = state.transactions.length;
  hint.textContent = total > RECENT_LIMIT
    ? `Showing ${RECENT_LIMIT} of ${total}`
    : `${total} transaction${total === 1 ? '' : 's'}`;

  recent.forEach((txn) => {
    const item = document.createElement('div');
    item.className = 'recent-item';

    const badge = document.createElement('div');
    badge.className = `recent-badge recent-badge--${txn.category}`;
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = CAT_EMOJI[txn.category] || '💸';

    const info = document.createElement('div');
    info.className = 'recent-info';

    const name = document.createElement('div');
    name.className = 'recent-name';
    name.textContent = txn.name; // textContent — safe

    const sub = document.createElement('div');
    sub.className = 'recent-sub';
    sub.textContent = `${txn.category} · ${formatDate(txn.date)}`;

    info.appendChild(name);
    info.appendChild(sub);

    const amt = document.createElement('div');
    amt.className = 'recent-amount';
    amt.textContent = formatCurrency(txn.amount);

    item.appendChild(badge);
    item.appendChild(info);
    item.appendChild(amt);
    list.appendChild(item);
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   11. TRANSACTION LIST
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Return a sorted COPY of the array — does not mutate state.
 */
function sortTransactions(arr) {
  const copy = [...arr];
  switch (state.sortOption) {
    case 'newest':
      return copy.sort(
        (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
      );
    case 'oldest':
      return copy.sort(
        (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)
      );
    case 'highest':
      return copy.sort((a, b) => b.amount - a.amount);
    case 'lowest':
      return copy.sort((a, b) => a.amount - b.amount);
    case 'category':
      return copy.sort((a, b) => a.category.localeCompare(b.category));
    default:
      return copy;
  }
}

/** Re-render the transaction list (and empty state). */
function renderTransactions() {
  const list   = el.transactionList;
  const empty  = el.emptyState;
  const sorted = sortTransactions(state.transactions);

  // Clear previous rows safely
  while (list.firstChild) list.removeChild(list.firstChild);

  if (sorted.length === 0) {
    empty.classList.add('show');
    return;
  }

  empty.classList.remove('show');
  sorted.forEach((txn) => list.appendChild(buildTxnRow(txn)));
}

/**
 * Build a single transaction row element.
 * Uses only textContent (never innerHTML) for user-provided data.
 */
function buildTxnRow(txn) {
  const row = document.createElement('div');
  row.className = 'txn-item';
  row.setAttribute('role', 'listitem');
  row.dataset.id = txn.id;

  /* ── Badge ── */
  const badge = document.createElement('div');
  badge.className = `txn-badge txn-badge--${txn.category}`;
  badge.setAttribute('aria-hidden', 'true');
  badge.textContent = CAT_EMOJI[txn.category] || '💸';

  /* ── Info block ── */
  const info = document.createElement('div');
  info.className = 'txn-info';

  const name = document.createElement('div');
  name.className = 'txn-name';
  name.textContent = txn.name; // ← textContent, safe

  const meta = document.createElement('div');
  meta.className = 'txn-meta';

  const dateSpan = document.createElement('span');
  dateSpan.className = 'txn-date';
  dateSpan.textContent = formatDate(txn.date);

  const pill = document.createElement('span');
  pill.className = `txn-pill txn-pill--${txn.category}`;
  pill.textContent = txn.category;

  meta.appendChild(dateSpan);
  meta.appendChild(pill);
  info.appendChild(name);
  info.appendChild(meta);

  /* ── Amount ── */
  const amountEl = document.createElement('div');
  amountEl.className = 'txn-amount';
  amountEl.textContent = formatCurrency(txn.amount);

  /* ── Delete button ── */
  const delBtn = document.createElement('button');
  delBtn.className = 'txn-del';
  delBtn.type = 'button';
  delBtn.setAttribute('aria-label', `Delete ${txn.name}`);
  delBtn.setAttribute('title', 'Delete');
  // Static inline trash SVG — no framework dependency
  delBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
    'fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="3 6 5 6 21 6"/>' +
    '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>' +
    '<path d="M10 11v6"/><path d="M14 11v6"/>' +
    '<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>' +
    '</svg>';

  delBtn.addEventListener('click', () => deleteTransaction(txn.id));

  row.appendChild(badge);
  row.appendChild(info);
  row.appendChild(amountEl);
  row.appendChild(delBtn);

  return row;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   12. SPENDING DISTRIBUTION CHART
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function updateChart() {
  const totals   = calculateCategoryTotals(state.transactions);
  const data     = CATEGORIES.map((c) => totals[c]);
  const grandTotal = data.reduce((a, b) => a + b, 0);
  const colors   = CATEGORIES.map((c) => CAT_COLORS[state.theme][c]);

  // Always destroy the old instance first to prevent canvas reuse bugs
  if (state.chart) {
    state.chart.destroy();
    state.chart = null;
  }

  if (grandTotal === 0) {
    el.chartEmpty.classList.add('visible');
    el.spendingChart.style.visibility = 'hidden';
    el.chartLegend.textContent = '';
    return;
  }

  el.chartEmpty.classList.remove('visible');
  el.spendingChart.style.visibility = 'visible';

  const ctx = el.spendingChart.getContext('2d');

  state.chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: CATEGORIES,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor:  state.theme === 'dark' ? '#1e293b' : '#ffffff',
        borderWidth:  3,
        hoverOffset:  10,
        hoverBorderWidth: 3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '65%',
      animation: { animateRotate: true, animateScale: false, duration: 550 },
      plugins: {
        legend: { display: false }, // we use our own custom legend
        tooltip: {
          callbacks: {
            label(ctx) {
              const val = ctx.parsed;
              const pct = grandTotal > 0 ? ((val / grandTotal) * 100).toFixed(1) : '0';
              return `  ${ctx.label}: ${formatCurrency(val)} (${pct}%)`;
            },
          },
          backgroundColor: state.theme === 'dark' ? '#0f172a' : '#1e293b',
          titleColor:  '#f1f5f9',
          bodyColor:   '#94a3b8',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
        },
      },
    },
  });

  // Render custom HTML legend
  el.chartLegend.textContent = '';
  CATEGORIES.forEach((cat, i) => {
    const pct  = grandTotal > 0 ? ((totals[cat] / grandTotal) * 100).toFixed(1) : '0';
    const item = document.createElement('div');
    item.className = 'legend-item';

    const swatch = document.createElement('span');
    swatch.className = 'legend-swatch';
    swatch.style.backgroundColor = colors[i];
    swatch.setAttribute('aria-hidden', 'true');

    const label = document.createElement('span');
    label.textContent = `${cat} ${pct}%`;

    item.appendChild(swatch);
    item.appendChild(label);
    el.chartLegend.appendChild(item);
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   13. MONTHLY SUMMARY
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function renderMonthlySummary() {
  const month    = state.selectedMonth; // 'YYYY-MM'
  const filtered = state.transactions.filter((t) => t.date.startsWith(month));

  const total     = calculateTotalExpenses(filtered);
  const catTotals = calculateCategoryTotals(filtered);
  const catSum    = Object.values(catTotals).reduce((a, b) => a + b, 0);

  el.monthTotal.textContent = formatCurrency(total);
  el.monthCount.textContent = String(filtered.length);

  if (filtered.length === 0) {
    el.monthlyEmpty.classList.add('show');
    el.monthlyBreakdown.textContent = '';
    return;
  }

  el.monthlyEmpty.classList.remove('show');

  // Rebuild breakdown bars
  el.monthlyBreakdown.textContent = '';

  CATEGORIES.forEach((cat) => {
    const amt = catTotals[cat];
    const pct = catSum > 0 ? (amt / catSum) * 100 : 0;

    const row = document.createElement('div');
    row.className = 'breakdown-row';

    const catLabel = document.createElement('span');
    catLabel.className = 'breakdown-cat';
    catLabel.textContent = `${CAT_EMOJI[cat]} ${cat}`;

    const track = document.createElement('div');
    track.className = 'breakdown-track';

    const fill = document.createElement('div');
    fill.className = `breakdown-fill breakdown-fill--${cat.toLowerCase()}`;
    fill.style.width = '0%'; // start at 0 for animation

    // Animate after element is in the DOM
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { fill.style.width = `${pct}%`; });
    });

    const amtLabel = document.createElement('span');
    amtLabel.className = 'breakdown-amt';
    amtLabel.textContent = formatCurrency(amt);

    track.appendChild(fill);
    row.appendChild(catLabel);
    row.appendChild(track);
    row.appendChild(amtLabel);
    el.monthlyBreakdown.appendChild(row);
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   14. THEME TOGGLE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  el.themeToggle.setAttribute(
    'aria-label',
    state.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
  );
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme();
  saveTheme();
  updateChart(); // chart colours depend on theme
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   15. HEADER DATE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function setHeaderDate() {
  el.currentDate.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   16. CENTRALIZED REFRESH
   Call this after any state change to keep UI in sync.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function refreshAll() {
  updateDashboard();
  renderRecentTransactions();
  renderTransactions();
  updateChart();
  renderMonthlySummary();
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   17. EVENT LISTENERS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function attachListeners() {
  // Form
  el.form.addEventListener('submit', addTransaction);

  // Theme toggle
  el.themeToggle.addEventListener('click', toggleTheme);

  // Sort
  el.sortSelect.addEventListener('change', () => {
    state.sortOption = el.sortSelect.value;
    renderTransactions();
  });

  // Month selector
  el.monthSelector.addEventListener('change', () => {
    state.selectedMonth = el.monthSelector.value;
    renderMonthlySummary();
  });

  // Live validation clearing (clears error as soon as user starts correcting)
  el.itemName.addEventListener('input', () => clearFieldError(el.itemName, el.itemNameErr));
  el.amount.addEventListener('input',   () => clearFieldError(el.amount, el.amountErr));
  el.category.addEventListener('change',() => clearFieldError(el.category, el.categoryErr));
  el.txnDate.addEventListener('change', () => clearFieldError(el.txnDate, el.dateErr));
}

/** Remove the invalid state from a single field. */
function clearFieldError(inputEl, errEl) {
  if (inputEl.classList.contains('is-invalid')) {
    inputEl.classList.remove('is-invalid');
    errEl.textContent = '';
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   18. BOOTSTRAP
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function initializeApp() {
  // 1. Cache DOM references (must be first)
  cacheDom();

  // 2. Restore persisted data
  state.transactions = loadTransactions();
  state.theme        = loadTheme();

  // 3. Apply theme (before render, no flash)
  applyTheme();

  // 4. Form defaults
  el.txnDate.value  = todayISO();
  el.category.value = ''; // force placeholder option

  // 5. Month selector default = current month
  state.selectedMonth = currentMonthISO();
  el.monthSelector.value = state.selectedMonth;

  // 6. Header date
  setHeaderDate();

  // 7. Initial full render
  refreshAll();

  // 8. Wire up all event listeners
  attachListeners();
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   19. ENTRY POINT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

document.addEventListener('DOMContentLoaded', initializeApp);
