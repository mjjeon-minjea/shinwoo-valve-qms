import fs from 'fs';

const DB_PATH = './db.json';

try {
    const rawData = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(rawData);

    if (db.inspections && Array.isArray(db.inspections)) {
        let updatedCount = 0;
        db.inspections = db.inspections.map(item => {
            // If inspectionQuantity > 0 and no report number, assign one
            if (Number(item.inspectionQuantity) > 0 && (!item.inspectionReportNo || item.inspectionReportNo === '-')) {
                // Generate a dummy report number like 'IRC-20250101-001'
                // For simplicity, just use a random ID or based on date
                const datePart = (item.date || '20250101').replace(/-/g, '');
                item.inspectionReportNo = `IRC-${datePart}-${Math.floor(Math.random() * 1000)}`;
                updatedCount++;
            }
            return item;
        });

        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
        console.log(`Successfully updated ${updatedCount} records with mock inspectionReportNo.`);
    } else {
        console.error('No inspections found in db.json');
    }
} catch (error) {
    console.error('Error updating db.json:', error);
}
