/**
 * Transactions Module
 */
import { state, getMonthTransactions } from './state.js';
import {
    createTransaction, updateTransaction as apiUpdateTransaction,
    deleteTransaction as apiDeleteTransaction, fetchTransactions
} from './api.js';
import { renderDashboard, renderTransactionList, showModal, hideModal, showToast, renderCategoryDropdown } from './ui.js';

let editingId = null;

export function initTransactions() {
    const form = document.getElementById('transaction-form');
    if (form) form.addEventListener('submit', handleSubmit);

    const typeToggleBtns = document.querySelectorAll('#transaction-modal .type-toggle__btn');
    typeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeToggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const type = btn.dataset.type;
            renderCategoryDropdown('txn-category', type);
        });
    });

    // Title auto-suggest
    const titleInput = document.getElementById('txn-title');
    if (titleInput) {
        titleInput.addEventListener('input', handleTitleSuggest);
        titleInput.addEventListener('blur', () => {
            setTimeout(() => hideSuggestions(), 200);
        });
    }

    // Expose global handlers
    window.editTransaction = openEditTransaction;
    window.deleteTransaction = handleDelete;
    window.openTransactionModal = openTransactionModal;
}

export function openTransactionModal(id = null) {
    editingId = id;
    const form = document.getElementById('transaction-form');
    const modalTitle = document.getElementById('transaction-modal-title');
    const deleteBtn = document.getElementById('txn-delete-btn');

    if (id) {
        const txn = state.transactions.find(t => t.id === id);
        if (!txn) return;

        modalTitle.textContent = 'Edit Transaction';
        if (deleteBtn) deleteBtn.style.display = 'inline-flex';

        // Set type toggle
        document.querySelectorAll('#transaction-modal .type-toggle__btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === txn.type);
        });

        renderCategoryDropdown('txn-category', txn.type);

        document.getElementById('txn-title').value = txn.title;
        document.getElementById('txn-amount').value = txn.amount;
        document.getElementById('txn-category').value = txn.category_id || '';
        document.getElementById('txn-date').value = txn.date;
    } else {
        modalTitle.textContent = 'Add Transaction';
        if (deleteBtn) deleteBtn.style.display = 'none';
        form.reset();

        document.querySelectorAll('#transaction-modal .type-toggle__btn').forEach((btn, i) => {
            btn.classList.toggle('active', i === 1); // default to expense
        });

        renderCategoryDropdown('txn-category', 'expense');
        document.getElementById('txn-date').value = new Date().toISOString().split('T')[0];
    }

    showModal('transaction-modal');
}

function openEditTransaction(id) {
    openTransactionModal(id);
}

async function handleSubmit(e) {
    e.preventDefault();

    const activeType = document.querySelector('#transaction-modal .type-toggle__btn.active');
    const type = activeType?.dataset.type || 'expense';
    const title = document.getElementById('txn-title').value.trim();
    const amount = parseFloat(document.getElementById('txn-amount').value);
    const categoryId = document.getElementById('txn-category').value || null;
    const date = document.getElementById('txn-date').value;

    if (!title || isNaN(amount) || amount <= 0 || !date) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    try {
        if (editingId) {
            const updated = await apiUpdateTransaction(editingId, {
                title, amount, type, category_id: categoryId, date
            });
            const idx = state.transactions.findIndex(t => t.id === editingId);
            if (idx >= 0) state.transactions[idx] = updated;
            showToast('Transaction updated', 'success');
        } else {
            const created = await createTransaction({
                title, amount, type, category_id: categoryId, date
            });
            state.transactions.unshift(created);
            showToast('Transaction added', 'success');
        }

        hideModal('transaction-modal');
        editingId = null;
        renderDashboard();
        renderTransactionList();
    } catch (err) {
        showToast(err.message || 'Failed to save transaction', 'error');
    }
}

async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return;

    try {
        await apiDeleteTransaction(id);
        state.transactions = state.transactions.filter(t => t.id !== id);
        hideModal('transaction-modal');
        editingId = null;
        showToast('Transaction deleted', 'success');
        renderDashboard();
        renderTransactionList();
    } catch (err) {
        showToast(err.message || 'Failed to delete', 'error');
    }
}

// Auto-suggest from existing transactions
function handleTitleSuggest(e) {
    const val = e.target.value.trim().toLowerCase();
    if (val.length < 2) {
        hideSuggestions();
        return;
    }

    const seen = new Set();
    const matches = state.transactions
        .filter(t => {
            const title = t.title.toLowerCase();
            if (seen.has(title) || !title.includes(val)) return false;
            seen.add(title);
            return true;
        })
        .slice(0, 5);

    if (matches.length === 0) {
        hideSuggestions();
        return;
    }

    const container = document.getElementById('title-suggestions');
    if (!container) return;

    container.innerHTML = matches.map(m => `
        <div class="suggestions__item" data-title="${m.title}" data-type="${m.type}" data-category="${m.category_id || ''}">${m.title}</div>
    `).join('');
    container.classList.add('visible');

    container.querySelectorAll('.suggestions__item').forEach(item => {
        item.addEventListener('mousedown', () => {
            document.getElementById('txn-title').value = item.dataset.title;
            const type = item.dataset.type;
            document.querySelectorAll('#transaction-modal .type-toggle__btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.type === type);
            });
            renderCategoryDropdown('txn-category', type);
            if (item.dataset.category) {
                document.getElementById('txn-category').value = item.dataset.category;
            }
            hideSuggestions();
        });
    });
}

function hideSuggestions() {
    const container = document.getElementById('title-suggestions');
    if (container) container.classList.remove('visible');
}

export async function loadTransactions() {
    try {
        state.transactions = await fetchTransactions();
    } catch (err) {
        showToast('Failed to load transactions', 'error');
    }
}
