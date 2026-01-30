const fs = require('fs');
const path = 'db.json';
try {
    const content = fs.readFileSync(path, 'utf-8');
    // Check if item_master already exists to be safe
    if (content.includes('"item_master"')) {
        console.log("item_master already exists");
    } else {
        const lastBraceIndex = content.lastIndexOf('}');
        if (lastBraceIndex !== -1) {
            const newContent = content.substring(0, lastBraceIndex) + ',\n  "item_master": []\n}';
            fs.writeFileSync(path, newContent);
            console.log("Patched db.json successfully");
        } else {
            console.log("Could not find closing brace");
        }
    }
} catch (e) {
    console.error(e);
}
