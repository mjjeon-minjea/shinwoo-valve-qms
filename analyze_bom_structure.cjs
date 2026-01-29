var fs = require('fs');
var path = require('path');

var DB_PATH = path.join(__dirname, 'db.json');

try {
    var db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    var products = db.products || [];

    console.log("Total Items:", products.length);

    // 1. Inspect Raw Keys (using first item)
    if (products.length > 0) {
        console.log("\n[Raw Data Fields Example]");
        console.log(Object.keys(products[0].originalData).join(", "));
    }

    // 2. Statistics
    var typeCounts = {};
    var categoryCounts = {};
    var duplicateNames = {};
    var itemsWithoutSpec = 0;

    products.forEach(function(p) {
        // Count Types
        var type = p.type || "Unknown";
        typeCounts[type] = (typeCounts[type] || 0) + 1;

        // Count Categories
        var cat = p.category || "Unknown";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

        // Check Duplicates
        if (p.name) {
             duplicateNames[p.name] = (duplicateNames[p.name] || 0) + 1;
        }

        // Check Missing Specs
        if (!p.spec || p.spec.trim() === "") {
            itemsWithoutSpec++;
        }
    });

    console.log("\n[Item Types Distribution]");
    Object.keys(typeCounts).forEach(k => console.log(`  ${k}: ${typeCounts[k]}`));

    console.log("\n[Top 5 Categories]");
    Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([k, v]) => console.log(`  ${k}: ${v}`));

    console.log("\n[Data Quality]");
    console.log("  Items without Spec:", itemsWithoutSpec);
    
    var dupCount = Object.values(duplicateNames).filter(c => c > 1).length;
    console.log("  Duplicate Item Names:", dupCount);

    // Check for potential BOM Hierarchy
    // Looking for keys like 'Parent', 'Level', 'Assembly' within originalData
    var potentialParents = products.filter(p => {
        var keys = Object.keys(p.originalData);
        return keys.some(k => k.includes("모품목") || k.includes("상위") || k.includes("Level") || k.includes("레벨"));
    }).length;

    console.log("  Items with potential Parent/Level info:", potentialParents);

} catch (e) {
    console.error(e);
}
