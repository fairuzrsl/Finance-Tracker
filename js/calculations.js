/**
 * Financial Calculations Module
 */
import { state, getMonthTransactions } from './state.js';
import { CONFIG } from './config.js';

export function totalIncome(transactions) {
    const txns = transactions || getMonthTransactions();
    return txns
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
}

export function totalExpenses(transactions) {
    const txns = transactions || getMonthTransactions();
    return txns
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
}

export function currentBalance() {
    const opening = parseFloat(state.settings.opening_balance) || 0;
    const allIncome = state.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const allExpenses = state.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return opening + allIncome - allExpenses;
}

export function budgetAmount() {
    const income = totalIncome();
    const pct = parseFloat(state.settings.budget_percentage) || 0;
    return (income * pct) / 100;
}

export function budgetRemaining() {
    return budgetAmount() - totalExpenses();
}

export function budgetUsedPercentage() {
    const budget = budgetAmount();
    if (budget <= 0) return 0;
    return Math.min((totalExpenses() / budget) * 100, 100);
}

export function monthlyCarryForward(year, month) {
    const opening = parseFloat(state.settings.opening_balance) || 0;
    const txnsBefore = state.transactions.filter(t => {
        const d = new Date(t.date);
        return d < new Date(year, month, 1);
    });
    const incomeBefore = txnsBefore
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expensesBefore = txnsBefore
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return opening + incomeBefore - expensesBefore;
}

export function expenseBreakdown() {
    const txns = getMonthTransactions().filter(t => t.type === 'expense');
    const total = totalExpenses();
    const byCategory = {};

    txns.forEach(t => {
        const catName = t.categories?.name || 'Uncategorized';
        if (!byCategory[catName]) {
            byCategory[catName] = 0;
        }
        byCategory[catName] += parseFloat(t.amount);
    });

    return Object.entries(byCategory)
        .map(([name, amount]) => ({
            name,
            amount,
            percentage: total > 0 ? (amount / total) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);
}

export function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return `${CONFIG.CURRENCY} ${num.toFixed(2)}`;
}
