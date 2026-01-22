import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'db.json');

try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);

    if (!db.settings) {
        db.settings = [
            {
                "id": "global",
                "popupEnabled": true
            }
        ];
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
        console.log('Successfully initialized settings in db.json');
    } else {
        console.log('Settings already exist in db.json');
    }

} catch (error) {
    console.error('Error initializing settings:', error);
}
