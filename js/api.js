/**
 * Supabase CRUD API Layer
 */
import { supabase } from './supabaseClient.js';
import { state } from './state.js';

// ---- Transactions ----

export async function fetchTransactions() {
    const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(name)')
        .eq('user_id', state.user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function createTransaction(transaction) {
    const { data, error } = await supabase
        .from('transactions')
        .insert({ ...transaction, user_id: state.user.id })
        .select('*, categories(name)')
        .single();
    if (error) throw error;
    return data;
}

export async function updateTransaction(id, updates) {
    const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', state.user.id)
        .select('*, categories(name)')
        .single();
    if (error) throw error;
    return data;
}

export async function deleteTransaction(id) {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', state.user.id);
    if (error) throw error;
}

// ---- Categories ----

export async function fetchCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', state.user.id)
        .order('name');
    if (error) throw error;
    return data || [];
}

export async function createCategory(category) {
    const { data, error } = await supabase
        .from('categories')
        .insert({ ...category, user_id: state.user.id })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateCategory(id, updates) {
    const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', state.user.id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteCategory(id) {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', state.user.id);
    if (error) throw error;
}

// ---- Settings ----

export async function fetchSettings() {
    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', state.user.id)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

export async function upsertSettings(settings) {
    const { data, error } = await supabase
        .from('settings')
        .upsert(
            { ...settings, user_id: state.user.id },
            { onConflict: 'user_id' }
        )
        .select()
        .single();
    if (error) throw error;
    return data;
}
