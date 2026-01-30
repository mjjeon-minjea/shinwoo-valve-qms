import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const api = {
    fetch: async (url, options = {}) => {
        // Use local JSON Server (Proxy handled by Vite)
        // Bypass Supabase for now to use db.json
        console.log(`[Local API] ${options.method || 'GET'} ${url}`);
        return fetch(url, options);
    }
};

/* 
// Legacy Supabase Implementation (Preserved)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export const api = {
    fetch: async (url, options = {}) => {
        // ... (Original Code) ...
    }
};
*/
