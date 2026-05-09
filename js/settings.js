/**
 * Settings Module
 */
import { state } from './state.js';
import { fetchSettings, upsertSettings } from './api.js';
import { showToast, hideModal, renderDashboard } from './ui.js';

export function initSettings() {
    const form = document.getElementById('settings-form');
    if (form) form.addEventListener('submit', handleSaveSettings);
}

export async function loadSettings() {
    try {
        const data = await fetchSettings();
        if (data) {
            state.settings.opening_balance = parseFloat(data.opening_balance) || 0;
            state.settings.budget_percentage = parseFloat(data.budget_percentage) || 50;
        }
        populateSettingsForm();
    } catch (err) {
        showToast('Failed to load settings', 'error');
    }
}

function populateSettingsForm() {
    const obInput = document.getElementById('setting-opening-balance');
    const bpInput = document.getElementById('setting-budget-pct');
    if (obInput) obInput.value = state.settings.opening_balance;
    if (bpInput) bpInput.value = state.settings.budget_percentage;
}

async function handleSaveSettings(e) {
    e.preventDefault();

    const openingBalance = parseFloat(document.getElementById('setting-opening-balance').value) || 0;
    const budgetPct = parseFloat(document.getElementById('setting-budget-pct').value);

    if (isNaN(budgetPct) || budgetPct < 0 || budgetPct > 100) {
        showToast('Budget percentage must be 0-100', 'error');
        return;
    }

    try {
        await upsertSettings({
            opening_balance: openingBalance,
            budget_percentage: budgetPct
        });
        state.settings.opening_balance = openingBalance;
        state.settings.budget_percentage = budgetPct;
        showToast('Settings saved', 'success');
        hideModal('settings-modal');
        renderDashboard();
    } catch (err) {
        showToast(err.message || 'Failed to save settings', 'error');
    }
}
