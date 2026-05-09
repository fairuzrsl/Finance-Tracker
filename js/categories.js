/**
 * Categories Module
 */
import { state } from './state.js';
import {
    createCategory, updateCategory as apiUpdateCategory,
    deleteCategory as apiDeleteCategory, fetchCategories
} from './api.js';
import { renderCategoryList, renderCategoryDropdown, showToast, showModal, hideModal } from './ui.js';

export function initCategories() {
    const form = document.getElementById('category-form');
    if (form) form.addEventListener('submit', handleAddCategory);

    const typeToggleBtns = document.querySelectorAll('#category-modal .type-toggle__btn');
    typeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeToggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    window.deleteCategory = handleDeleteCategory;
    window.openCategoryModal = openCategoryModal;
}

export function openCategoryModal() {
    const form = document.getElementById('category-form');
    if (form) form.reset();

    document.querySelectorAll('#category-modal .type-toggle__btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === 1); // default expense
    });

    showModal('category-modal');
}

async function handleAddCategory(e) {
    e.preventDefault();

    const name = document.getElementById('cat-name').value.trim();
    const activeType = document.querySelector('#category-modal .type-toggle__btn.active');
    const type = activeType?.dataset.type || 'expense';

    if (!name) {
        showToast('Please enter a category name', 'error');
        return;
    }

    const exists = state.categories.some(
        c => c.name.toLowerCase() === name.toLowerCase() && c.type === type
    );
    if (exists) {
        showToast('Category already exists', 'error');
        return;
    }

    try {
        const created = await createCategory({ name, type });
        state.categories.push(created);
        state.categories.sort((a, b) => a.name.localeCompare(b.name));
        showToast('Category added', 'success');
        hideModal('category-modal');
        renderCategoryList();
    } catch (err) {
        showToast(err.message || 'Failed to add category', 'error');
    }
}

async function handleDeleteCategory(id) {
    if (!confirm('Delete this category? Transactions using it will become uncategorized.')) return;

    try {
        await apiDeleteCategory(id);
        state.categories = state.categories.filter(c => c.id !== id);
        showToast('Category deleted', 'success');
        renderCategoryList();
    } catch (err) {
        showToast(err.message || 'Failed to delete category', 'error');
    }
}

export async function loadCategories() {
    try {
        state.categories = await fetchCategories();
    } catch (err) {
        showToast('Failed to load categories', 'error');
    }
}
