/**
 * UI Rendering Module
 */
import { state, getMonthTransactions, getSelectedMonthKey } from './state.js';
import { CONFIG } from './config.js';
import {
    totalIncome, totalExpenses, currentBalance,
    budgetAmount, budgetRemaining, budgetUsedPercentage,
    expenseBreakdown, formatCurrency, monthlyCarryForward
} from './calculations.js';

// ---- SVG Icons ----
const ICONS = {
    wallet: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>',
    plus: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    home: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    list: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    tag: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>',
    settings: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
    trendUp: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
    trendDown: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>',
    arrowDownLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg>',
    arrowUpRight: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    edit: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
    trash: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
    search: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    logOut: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    savings: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2"/><path d="M2 9.1C1.7 10 2 11 2 11"/><circle cx="12.5" cy="11.5" r=".5"/></svg>'
};

export function icon(name, size = 24) {
    return ICONS[name] || '';
}

// ---- Toast ----
export function showToast(message, type = 'default') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast${type !== 'default' ? ` toast--${type}` : ''}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
}

// ---- Modals ----
export function showModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('visible');
}

export function hideModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('visible');
}

export function hideAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('visible'));
}

// ---- Month Selector ----
export function renderMonthSelector() {
    const select = document.getElementById('month-selector');
    if (!select) return;
    select.innerHTML = '';
    const now = new Date();
    for (let i = -6; i <= 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const opt = document.createElement('option');
        opt.value = `${d.getFullYear()}-${d.getMonth()}`;
        opt.textContent = d.toLocaleDateString('en-US', CONFIG.MONTH_FORMAT);
        if (d.getFullYear() === state.selectedYear && d.getMonth() === state.selectedMonth) {
            opt.selected = true;
        }
        select.appendChild(opt);
    }
}

// ---- Dashboard ----
export function renderDashboard() {
    const income = totalIncome();
    const expenses = totalExpenses();
    const balance = currentBalance();
    const budget = budgetAmount();
    const remaining = budgetRemaining();
    const usedPct = budgetUsedPercentage();
    const carryForward = monthlyCarryForward(state.selectedYear, state.selectedMonth);

    // Balance card
    setText('current-balance', formatCurrency(balance));
    setText('total-income-card', formatCurrency(income));
    setText('total-expense-card', formatCurrency(expenses));
    setText('total-savings-card', formatCurrency(income - expenses));

    // Stat cards
    setText('stat-income', formatCurrency(income));
    setText('stat-expense', formatCurrency(expenses));

    // Opening balance for this month
    setText('opening-balance-display', formatCurrency(carryForward));

    // Budget overview
    renderBudgetOverview(budget, expenses, remaining, usedPct);

    // Expense breakdown
    renderExpenseBreakdown();

    // Recent transactions
    renderRecentTransactions();
}

function renderBudgetOverview(budget, expenses, remaining, usedPct) {
    const container = document.getElementById('budget-summary');
    if (!container) return;

    if (budget <= 0) {
        container.innerHTML = '<p class="empty-state__text">No budget set</p>';
        return;
    }

    let fillClass = 'budget-progress__fill--safe';
    if (usedPct >= 90) fillClass = 'budget-progress__fill--danger';
    else if (usedPct >= 70) fillClass = 'budget-progress__fill--warning';

    container.innerHTML = `
        <div class="budget-progress">
            <div class="budget-progress__header">
                <span class="budget-progress__label">Expenses vs Budget</span>
                <span class="budget-progress__value">${formatCurrency(expenses)} / ${formatCurrency(budget)}</span>
            </div>
            <div class="budget-progress__bar">
                <div class="budget-progress__fill ${fillClass}" style="width: ${usedPct}%"></div>
            </div>
            <p style="font-size: var(--font-size-xs); color: ${remaining >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}; margin-top: var(--space-xs);">
                ${remaining >= 0 ? `${formatCurrency(remaining)} remaining` : `${formatCurrency(Math.abs(remaining))} over budget`}
            </p>
        </div>
    `;
}

function renderExpenseBreakdown() {
    const container = document.getElementById('expense-breakdown');
    if (!container) return;

    const breakdown = expenseBreakdown();
    if (breakdown.length === 0) {
        container.innerHTML = '<div class="empty-state"><p class="empty-state__text">No expenses recorded</p></div>';
        return;
    }

    container.innerHTML = breakdown.map(item => `
        <div class="expense-bar">
            <div class="expense-bar__header">
                <span class="expense-bar__name">${escapeHtml(item.name)}</span>
                <span class="expense-bar__amount">${formatCurrency(item.amount)} (${item.percentage.toFixed(0)}%)</span>
            </div>
            <div class="expense-bar__track">
                <div class="expense-bar__fill" style="width: ${item.percentage}%"></div>
            </div>
        </div>
    `).join('');
}

function renderRecentTransactions() {
    const container = document.getElementById('recent-transactions');
    if (!container) return;

    const txns = getMonthTransactions().slice(0, 5);
    if (txns.length === 0) {
        container.innerHTML = '<div class="empty-state"><p class="empty-state__text">No transactions yet</p></div>';
        return;
    }

    container.innerHTML = txns.map(t => renderTransactionItem(t)).join('');
}

// ---- Transaction List ----
export function renderTransactionList() {
    const container = document.getElementById('transactions-list');
    if (!container) return;

    const txns = getMonthTransactions();
    if (txns.length === 0) {
        container.innerHTML = '<div class="empty-state"><p class="empty-state__text">No transactions this month</p></div>';
        return;
    }

    // Group by date
    const grouped = {};
    txns.forEach(t => {
        const dateKey = t.date;
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(t);
    });

    container.innerHTML = Object.entries(grouped).map(([date, items]) => `
        <div class="transaction-group" style="margin-bottom: var(--space-md);">
            <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary); font-weight: var(--font-weight-medium); margin-bottom: var(--space-sm); padding: 0 var(--space-sm);">
                ${new Date(date + 'T00:00:00').toLocaleDateString('en-US', CONFIG.DATE_FORMAT)}
            </p>
            <div class="transaction-list">
                ${items.map(t => renderTransactionItem(t, true)).join('')}
            </div>
        </div>
    `).join('');
}

function renderTransactionItem(t, showActions = false) {
    const isIncome = t.type === 'income';
    const iconName = isIncome ? 'arrowDownLeft' : 'arrowUpRight';
    const amountClass = isIncome ? 'transaction-item__amount--income' : 'transaction-item__amount--expense';
    const iconClass = isIncome ? 'transaction-item__icon--income' : 'transaction-item__icon--expense';
    const sign = isIncome ? '+' : '-';
    const categoryName = t.categories?.name || '';

    return `
        <div class="transaction-item" data-id="${t.id}">
            <div class="transaction-item__icon ${iconClass}">${icon(iconName)}</div>
            <div class="transaction-item__info">
                <div class="transaction-item__title">${escapeHtml(t.title)}</div>
                ${categoryName ? `<div class="transaction-item__category">${escapeHtml(categoryName)}</div>` : ''}
            </div>
            <div style="text-align: right;">
                <div class="transaction-item__amount ${amountClass}">${sign} ${formatCurrency(t.amount)}</div>
                <div class="transaction-item__date">${new Date(t.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
            ${showActions ? `
                <div class="transaction-actions">
                    <button onclick="window.editTransaction('${t.id}')" title="Edit">${icon('edit')}</button>
                    <button onclick="window.deleteTransaction('${t.id}')" title="Delete">${icon('trash')}</button>
                </div>
            ` : ''}
        </div>
    `;
}

// ---- Category Dropdowns ----
export function renderCategoryDropdown(selectId, type) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const cats = state.categories.filter(c => c.type === type);
    select.innerHTML = '<option value="">Select category</option>';
    cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        select.appendChild(opt);
    });
}

// ---- Category List ----
export function renderCategoryList() {
    renderCategorySection('income-categories', 'income');
    renderCategorySection('expense-categories', 'expense');
}

function renderCategorySection(containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const cats = state.categories.filter(c => c.type === type);
    if (cats.length === 0) {
        container.innerHTML = `<div class="empty-state"><p class="empty-state__text">No ${type} categories</p></div>`;
        return;
    }

    container.innerHTML = `
        <div class="category-chips">
            ${cats.map(c => `
                <div class="category-chip" data-id="${c.id}">
                    <span>${escapeHtml(c.name)}</span>
                    <span class="category-chip__delete" onclick="window.deleteCategory('${c.id}')">${icon('x')}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// ---- View Switching ----
export function switchView(viewName) {
    state.currentView = viewName;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.bottom-nav__item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    if (viewName === 'dashboard') renderDashboard();
    if (viewName === 'transactions') renderTransactionList();
    if (viewName === 'categories') renderCategoryList();
}

// ---- Auth UI ----
export function showAuthScreen() {
    const authEl = document.getElementById('auth-screen');
    const appEl = document.getElementById('app-main');
    if (authEl) authEl.style.display = 'flex';
    if (appEl) appEl.style.display = 'none';
}

export function showAppScreen() {
    const authEl = document.getElementById('auth-screen');
    const appEl = document.getElementById('app-main');
    if (authEl) authEl.style.display = 'none';
    if (appEl) appEl.style.display = 'flex';
}

// ---- Helpers ----
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function setLoading(isLoading) {
    state.isLoading = isLoading;
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = isLoading ? 'flex' : 'none';
}
