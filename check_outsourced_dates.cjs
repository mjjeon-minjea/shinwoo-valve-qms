const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    const outsourced = data.inspections.filter(i => i.itemType === '외주도장');
    
    console.log(`Total '외주도장' items: ${outsourced.length}`);
    
    const dates = [...new Set(outsourced.map(i => i.date))].sort();
    console.log("Unique Dates:", dates);

} catch (err) {
    console.error(err);
}
