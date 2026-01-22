import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

// --- CONFIGURATION REQUIRED ---
// You will paste your keys here later or use .env
const SUPABASE_URL = process.env.VITE_SUPABASE_URL; // e.g. 'https://xyz.supabase.co'
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY; // e.g. 'eyJ...'

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: Supabase URL and Key are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or environment.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Read db.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'db.json');
const rawData = fs.readFileSync(dbPath);
const db = JSON.parse(rawData);

async function uploadData() {
    console.log('🚀 Starting Data Migration to Supabase...');

    // 1. Users
    if (db.users && db.users.length > 0) {
        console.log(`📤 Uploading ${db.users.length} users...`);
        const { error } = await supabase.from('users').upsert(db.users);
        if (error) console.error('Error uploading users:', error);
        else console.log('✅ Users uploaded.');
    }

    // 2. Inspections
    if (db.inspections && db.inspections.length > 0) {
        console.log(`📤 Uploading ${db.inspections.length} inspections...`);
        const cleanInspections = db.inspections.map(item => ({
            ...item,
            // Ensure numbers are actually numbers
            totalQuantity: Number(item.totalQuantity),
            inspectionQuantity: Number(item.inspectionQuantity),
            defectQuantity: Number(item.defectQuantity)
        }));
        const { error } = await supabase.from('inspections').upsert(cleanInspections);
        if (error) console.error('Error uploading inspections:', error);
        else console.log('✅ Inspections uploaded.');
    }

    // 3. Notices
    if (db.notices && db.notices.length > 0) {
        console.log(`📤 Uploading ${db.notices.length} notices...`);
        const { error } = await supabase.from('notices').upsert(db.notices);
        if (error) console.error('Error uploading notices:', error);
        else console.log('✅ Notices uploaded.');
    }

    // 4. Resources
    if (db.resources && db.resources.length > 0) {
        console.log(`📤 Uploading ${db.resources.length} resources...`);
        const { error } = await supabase.from('resources').upsert(db.resources);
        if (error) console.error('Error uploading resources:', error);
        else console.log('✅ Resources uploaded.');
    }

    // 5. Inquiries
    if (db.inquiries && db.inquiries.length > 0) {
        console.log(`📤 Uploading ${db.inquiries.length} inquiries...`);
        const { error } = await supabase.from('inquiries').upsert(db.inquiries);
        if (error) console.error('Error uploading inquiries:', error);
        else console.log('✅ Inquiries uploaded.');
    }

    console.log('🎉 Migration Complete!');
}

uploadData();
