/**
 * Main Application Entry Point
 */
import { state } from './state.js';
import { getSession, onAuthStateChange, signIn, signUp, signOut } from './auth.js';
import { loadTransactions, initTransactions, openTransactionModal } from './transactions.js';
import { loadCategories, initCategories, openCategoryModal } from './categories.js';
import { loadSettings, initSettings } from './settings.js';
import {
    showAuthScreen, showAppScreen, renderDashboard, renderMonthSelector,
    switchView, showModal, hideModal, hideAllModals, showToast, setLoading
} from './ui.js';
import { initPWA, promptInstall } from './pwa.js';

// ---- Boot ----
async function boot() {
    initPWA();
    initTransactions();
    initCategories();
    initSettings();
    bindGlobalEvents();

    const session = await getSession();
    if (session?.user) {
        state.user = session.user;
        await enterApp();
    } else {
        showAuthScreen();
    }

    onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            state.user = session.user;
            await enterApp();
        } else if (event === 'SIGNED_OUT') {
            showAuthScreen();
        }
    });
}

async function enterApp() {
    showAppScreen();
    setLoading(true);
    renderMonthSelector();

    try {
        await Promise.all([loadTransactions(), loadCategories(), loadSettings()]);
        renderDashboard();
    } catch (err) {
        showToast('Failed to load data', 'error');
    } finally {
        setLoading(false);
    }
}

// ---- Global Event Bindings ----
function bindGlobalEvents() {
    // Auth forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authToggle = document.getElementById('auth-toggle');
    const authToggleBtn = document.getElementById('auth-toggle-btn');

    let isLogin = true;

    if (authToggleBtn) {
        authToggleBtn.addEventListener('click', () => {
            isLogin = !isLogin;
            document.getElementById('login-form').style.display = isLogin ? 'block' : 'none';
            document.getElementById('signup-form').style.display = isLogin ? 'none' : 'block';
            document.getElementById('auth-title').textContent = isLogin ? 'Welcome back' : 'Create account';
            document.getElementById('auth-subtitle').textContent = isLogin
                ? 'Sign in to your account'
                : 'Start tracking your finances';
            authToggleBtn.textContent = isLogin ? 'Create account' : 'Sign in instead';
            if (authToggle) {
                authToggle.textContent = isLogin ? "Don't have an account?" : 'Already have an account?';
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                showToast('Please fill all fields', 'error');
                return;
            }

            try {
                setLoading(true);
                await signIn(email, password);
            } catch (err) {
                showToast(err.message || 'Login failed', 'error');
            } finally {
                setLoading(false);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;

            if (!email || !password) {
                showToast('Please fill all fields', 'error');
                return;
            }
            if (password !== confirm) {
                showToast('Passwords do not match', 'error');
                return;
            }
            if (password.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }

            try {
                setLoading(true);
                await signUp(email, password);
                showToast('Account created. Check email for verification.', 'success');
            } catch (err) {
                showToast(err.message || 'Signup failed', 'error');
            } finally {
                setLoading(false);
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut();
                showToast('Signed out', 'success');
            } catch (err) {
                showToast('Failed to sign out', 'error');
            }
        });
    }

    // Bottom nav
    document.querySelectorAll('.bottom-nav__item').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // FAB
    const fab = document.getElementById('fab-add');
    if (fab) fab.addEventListener('click', () => openTransactionModal());

    // Header add button
    const addBtn = document.getElementById('btn-add-new');
    if (addBtn) addBtn.addEventListener('click', () => openTransactionModal());

    // Month selector
    const monthSel = document.getElementById('month-selector');
    if (monthSel) {
        monthSel.addEventListener('change', (e) => {
            const [year, month] = e.target.value.split('-').map(Number);
            state.selectedYear = year;
            state.selectedMonth = month;
            renderDashboard();
            if (state.currentView === 'transactions') {
                import('./ui.js').then(m => m.renderTransactionList());
            }
        });
    }

    // Modal close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.closeModal;
            hideModal(modalId);
        });
    });

    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) backdrop.classList.remove('visible');
        });
    });

    // Settings button
    const settingsBtn = document.getElementById('nav-settings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => showModal('settings-modal'));
    }

    // Category modal button
    const addCatBtn = document.getElementById('btn-add-category');
    if (addCatBtn) {
        addCatBtn.addEventListener('click', () => openCategoryModal());
    }

    // Install PWA
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.addEventListener('click', promptInstall);
    }

    // Budget edit button
    window.openBudgetModal = () => showModal('settings-modal');

    // Expose switchView globally for inline onclick handlers
    window.switchView = switchView;
}

// ---- Start ----
document.addEventListener('DOMContentLoaded', boot);
