/**
 * PWA Module
 */
let deferredPrompt = null;

export function initPWA() {
    registerServiceWorker();
    handleInstallPrompt();
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => {
                    console.log('SW registered:', reg.scope);
                })
                .catch(err => {
                    console.warn('SW registration failed:', err);
                });
        });
    }
}

function handleInstallPrompt() {
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        hideInstallButton();
    });
}

function showInstallButton() {
    const btn = document.getElementById('install-btn');
    if (btn) btn.style.display = 'inline-flex';
}

function hideInstallButton() {
    const btn = document.getElementById('install-btn');
    if (btn) btn.style.display = 'none';
}

export async function promptInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === 'accepted') {
        hideInstallButton();
    }
}
