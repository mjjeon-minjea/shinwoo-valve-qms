var fs = require('fs');

try {
    var db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    console.log("Keys in db.json:", Object.keys(db));
    if (db.settings) {
        console.log("Type of settings:", Array.isArray(db.settings) ? "Array" : typeof db.settings);
        console.log("Settings content:", JSON.stringify(db.settings, null, 2).substring(0, 200));
    } else {
        console.log("No 'settings' key found.");
    }
} catch (e) {
    console.error(e);
}
