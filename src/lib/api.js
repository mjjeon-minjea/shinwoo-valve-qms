import db from '../../db.json';
// const db = { inspections: [], users: [], notices: [], resources: [], inquiries: [] }; // Mock empty db for build test

const IS_PROD = import.meta.env.PROD;

// Helper to simulate network delay in mock mode
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    fetch: async (url, options = {}) => {
        if (!IS_PROD) {
            // Development: Use real backend
            return window.fetch(url, options);
        }

        // Production: Use Mock Data
        console.log(`[Mock API] Request to ${url}`, options);
        await delay(300); // Simulate latency

        const endpoint = url.split('?')[0]; // Simple parsing
        const method = options.method || 'GET';

        // 1. GET Requests
        if (method === 'GET') {
            // Handle /inspections
            if (endpoint.startsWith('/inspections')) {
                // If ID is provided: /inspections/123
                const id = endpoint.split('/').pop();
                if (id && id !== 'inspections') {
                    // Not implemented for list view, but if needed
                    // return new Response(JSON.stringify(db.inspections.find(i => i.id === id) || {}));
                }
                return new Response(JSON.stringify(db.inspections || []));
            }
            if (endpoint.startsWith('/users')) return new Response(JSON.stringify(db.users || []));
            if (endpoint.startsWith('/notices')) return new Response(JSON.stringify(db.notices || []));
            if (endpoint.startsWith('/resources')) return new Response(JSON.stringify(db.resources || []));
            if (endpoint.startsWith('/inquiries')) return new Response(JSON.stringify(db.inquiries || []));
            if (endpoint.startsWith('/settings/global')) {
                return new Response(JSON.stringify({ id: 'global', popupEnabled: true }));
            }
        }

        // 2. Non-GET Requests (Write operations)
        // In static demo, these cannot permanently save data.
        // We will return success to "fake" the interaction.
        if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
            console.log('[Mock API] Write operation simulation success');
            // For batch upload simulation
            if (endpoint.includes('batch')) {
                return new Response(JSON.stringify({ success: true, count: JSON.parse(options.body).length }));
            }
            return new Response(JSON.stringify({ success: true, id: Date.now() }));
        }

        return new Response(JSON.stringify([]));
    }
};
