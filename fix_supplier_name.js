import fs from 'fs';

const DB_PATH = './db.json';
const TARGET_NAME = "SMART VALVE(DALIAN) Co., Ltd";
const NEW_NAME = "중국공장";

try {
    const rawData = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(rawData);

    if (db.inspections && Array.isArray(db.inspections)) {
        let updatedCount = 0;
        db.inspections = db.inspections.map(item => {
            if (item.supplier === TARGET_NAME) {
                item.supplier = NEW_NAME;
                updatedCount++;
            }
            return item;
        });

        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
        console.log(`✅ Successfully updated ${updatedCount} records.`);
        console.log(`   "${TARGET_NAME}" -> "${NEW_NAME}"`);
    } else {
        console.error('No inspections found in db.json');
    }
} catch (error) {
    console.error('Error updating db.json:', error);
}
