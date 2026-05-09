/**
 * Authentication Module
 */
import { supabase } from './supabaseClient.js';
import { state, resetState } from './state.js';
import { showToast } from './ui.js';

export async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    resetState();
}

export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
}

export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        state.user = session?.user ?? null;
        callback(event, session);
    });
}
