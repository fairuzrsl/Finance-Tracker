/**
 * Central Application State
 */
const now = new Date();

export const state = {
    user: null,
    transactions: [],
    categories: [],
    settings: {
        opening_balance: 0,
        budget_percentage: 50
    },
    selectedMonth: now.getMonth(),
    selectedYear: now.getFullYear(),
    currentView: 'dashboard',
    isLoading: false
};

export function resetState() {
    state.user = null;
    state.transactions = [];
    state.categories = [];
    state.settings = { opening_balance: 0, budget_percentage: 50 };
    const now = new Date();
    state.selectedMonth = now.getMonth();
    state.selectedYear = now.getFullYear();
    state.currentView = 'dashboard';
    state.isLoading = false;
}

export function getSelectedMonthKey() {
    return `${state.selectedYear}-${String(state.selectedMonth + 1).padStart(2, '0')}`;
}

export function getMonthTransactions() {
    const key = getSelectedMonthKey();
    return state.transactions.filter(t => t.date && t.date.startsWith(key));
}
