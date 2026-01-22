import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const api = {
    fetch: async (url, options = {}) => {
        // Parse endpoint from URL (e.g., '/inspections' from '/inspections/123')
        // url format: /table or /table/id or /table?query...
        const path = url.split('?')[0];
        const segments = path.split('/').filter(Boolean); // ['inspections', '123']
        const table = segments[0]; // 'inspections', 'users', etc.
        const id = segments[1];    // '123' or undefined

        const method = options.method || 'GET';
        let body = options.body ? JSON.parse(options.body) : null;

        console.log(`[Supabase API] ${method} ${url}`, body);

        // Special Case: Settings (Hardcoded for single row 'global')
        if (table === 'settings') {
            if (method === 'GET') {
                const { data, error } = await supabase.from('settings').select('*').eq('id', 'global').single();
                if (error) throw error;
                return new Response(JSON.stringify(data));
            }
            if (method === 'PUT') {
                const { data, error } = await supabase.from('settings').upsert(body).select().single();
                if (error) throw error;
                return new Response(JSON.stringify(data));
            }
        }

        // Special Case: Batch Operations (Dashboard)
        if (table === 'inspections' && id === 'batch') {
            if (method === 'POST') {
                // Bulk Insert
                const { data, error } = await supabase.from('inspections').insert(body).select();
                if (error) throw error;
                return new Response(JSON.stringify({ success: true, count: data.length }));
            }
        }

        // General REST-like handlers
        let query = supabase.from(table);
        let result = { data: null, error: null };

        // 1. GET (Read)
        if (method === 'GET') {
            if (id) {
                // Get One
                result = await query.select('*').eq('id', id).single();
                // If not found, return empty or 404? 
                // Existing app expects empty object or array sometimes, keeping it simple.
            } else {
                // Get All - Recursive fetch to bypass 1000 row limit
                let allData = [];
                let page = 0;
                const pageSize = 1000;
                let hasMore = true;

                while (hasMore) {
                    const { data, error } = await supabase
                        .from(table)
                        .select('*')
                        .order('created_at', { ascending: false })
                        .range(page * pageSize, (page + 1) * pageSize - 1);

                    if (error) throw error;

                    if (data) {
                        allData = allData.concat(data);
                        if (data.length < pageSize) {
                            hasMore = false;
                        } else {
                            page++;
                        }
                    } else {
                        hasMore = false;
                    }
                }
                result = { data: allData, error: null };
            }

            // 2. POST (Create)
        } else if (method === 'POST') {
            result = await query.insert(body).select().single();
            // Transform response to match existing expectations { success: true, ... }
            if (!result.error) {
                return new Response(JSON.stringify({ success: true, ...result.data }));
            }

            // 3. PUT (Update)
        } else if (method === 'PUT') {
            // Note: URL might be /users without ID, but body has ID. Or /users/1.
            // Safe to assume body has ID for updates usually.
            const targetId = id || body.id;
            result = await query.update(body).eq('id', targetId).select().single();

            // 4. DELETE
        } else if (method === 'DELETE') {
            // Special handling for bulk delete?
            // Dashboard.jsx sends DELETE to /inspections (no ID) -> Delete All?
            // Or /inspections/123
            if (id) {
                result = await query.delete().eq('id', id);
            } else {
                // Dangerous! Delete all? check existing logic
                // server.js had 'server.delete('/inspections', ... db.inspections = [])'
                // So yes, delete all.
                result = await query.delete().neq('id', '0'); // Hack to delete all rows
            }
            return new Response(JSON.stringify({ success: true }));
        }

        if (result.error) {
            console.error('Supabase Error:', result.error);
            // existing app might expect empty array on error for lists?
            if (result.error.code === 'PGRST116') return new Response(JSON.stringify({})); // Not found (single)
            throw new Error(result.error.message);
        }

        return new Response(JSON.stringify(result.data));
    }
};
