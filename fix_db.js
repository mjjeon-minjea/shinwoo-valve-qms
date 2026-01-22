import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'db.json');

try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);

    let fixedCount = 0;

    if (db.inspections && Array.isArray(db.inspections)) {
        db.inspections = db.inspections.map(item => {
            if (typeof item.id === 'number' && !Number.isInteger(item.id)) {
                // It's a float, convert to string replacing . with _
                const newId = String(item.id).replace('.', '_');
                fixedCount++;
                return { ...item, id: newId };
            }
            // Ensure all IDs are strings to be safe/consistent
            return { ...item, id: String(item.id) };
        });
    }

    // Inquiries
    if (db.inquiries && Array.isArray(db.inquiries)) {
        db.inquiries = db.inquiries.map(item => ({ ...item, id: String(item.id) }));
    }

    // Users
    if (db.users && Array.isArray(db.users)) {
        db.users = db.users.map(item => ({ ...item, id: String(item.id) }));
    }

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    console.log(`Successfully fixed ${fixedCount} inspection IDs.`);
    console.log('Converted all other IDs to strings for consistency.');

} catch (error) {
    console.error('Error fixing db.json:', error);
}
