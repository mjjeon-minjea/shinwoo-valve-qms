var XLSX = require('xlsx');
var path = require('path');

// File path
var filePath = path.join(__dirname, 'MES DATA', '품목마스터_20260129_011910.xlsx');

try {
    console.log("Reading file from:", filePath);
    var workbook = XLSX.readFile(filePath);
    var sheetName = workbook.SheetNames[0]; // Assume data is in the first sheet
    console.log("Sheet Name:", sheetName);

    var sheet = workbook.Sheets[sheetName];
    // Read first 5 rows to understand structure
    var data = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0, raw: false });
    
    console.log("\n--- First 5 rows ---");
    data.slice(0, 5).forEach((row, index) => {
        console.log(`Row ${index}:`, JSON.stringify(row));
    });

} catch (error) {
    console.error("Error reading Excel file:", error);
}
