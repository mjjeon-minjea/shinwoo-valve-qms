var XLSX = require('xlsx');
var fs = require('fs');
var path = require('path');

// Configuration
var EXCEL_FILE_PATH = path.join(__dirname, 'MES DATA', '품목마스터_20260129_011910.xlsx');
var DB_FILE_PATH = path.join(__dirname, 'db.json');

function importProducts() {
    try {
        console.log("Reading Excel file...");
        var workbook = XLSX.readFile(EXCEL_FILE_PATH);
        var sheetName = workbook.SheetNames[0];
        var sheet = workbook.Sheets[sheetName];
        
        // Read data as JSON
        var rawData = XLSX.utils.sheet_to_json(sheet);
        console.log("Found " + rawData.length + " rows in Excel.");

        // Map data to our schema with CORRECT keys based on analysis
        var products = rawData.map(function(row) {
            return {
                id: row['품목코드'] ? String(row['품목코드']).trim() : "",
                name: row['품목설명'] || "",        // Corrected from 품목명
                spec: "",                           // No direct spec column found. Might need extraction from name.
                unit: row['단위'] || "",
                category: row['대분류설명'] || "",  // Corrected from 대분류명
                subCategory: row['중분류설명'] || "", // Corrected from 중분류명
                minorCategory: row['소분류설명'] || "", // Corrected from 소분류명
                type: row['제품군명'] || "",        // Corrected from 품목구분명
                originalData: row
            };
        }).filter(p => p.id); // Valid ID required

        console.log("Processed " + products.length + " valid products.");

        // Read db.json
        console.log("Reading db.json...");
        var dbData = JSON.parse(fs.readFileSync(DB_FILE_PATH, 'utf8'));

        // Update products array
        // Update item_master array (corrected from products)
        dbData.item_master = products;

        // Write back
        console.log("Writing to db.json...");
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dbData, null, 2));

        console.log("Import completed successfully with FIXED mapping!");

    } catch (error) {
        console.error("Error during import:", error);
    }
}

importProducts();
