const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const EXCEL_PATH = 'C:\\Users\\mjjeon\\Desktop\\경영검토\\인수검사 기록서(2025).xlsx';
const DB_PATH = path.join(__dirname, 'db.json');

console.log(`Reading Excel from: ${EXCEL_PATH}`);

try {
    const workbook = XLSX.readFile(EXCEL_PATH);
    let allData = [];

    workbook.SheetNames.forEach(sheetName => {
        const ws = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(ws);
        allData = allData.concat(sheetData);
    });

    console.log(`Total rows read: ${allData.length}`);

    // Helper for date conversion
    const formatDate = (val) => {
        if (!val) return '2025-01-01';
        if (typeof val === 'number') {
            const date = new Date(Math.round((val - 25569) * 86400 * 1000));
            return date.toISOString().split('T')[0];
        }
        if (typeof val === 'string') {
            if (!isNaN(Number(val)) && !val.includes('-')) {
                const date = new Date(Math.round((Number(val) - 25569) * 86400 * 1000));
                return date.toISOString().split('T')[0];
            }
            return val;
        }
        return '2025-01-01';
    };

    // Helper for fuzzy find
    const findVal = (row, targets) => {
        const rowKeys = Object.keys(row);
        const targetArray = Array.isArray(targets) ? targets : [targets];
        for (const t of targetArray) {
            if (row[t] !== undefined) return row[t];
            const cleanTarget = t.replace(/\s+/g, '');
            const fuzzyKey = rowKeys.find(k => k.replace(/\s+/g, '') === cleanTarget);
            if (fuzzyKey) return row[fuzzyKey];
        }
        return undefined;
    };

    const parseNum = (val) => {
        if (val === '-' || val === undefined || val === null || val === '') return 0;
        const num = Number(String(val).replace(/,/g, ''));
        return isNaN(num) ? 0 : num;
    };

    const itemTypeCounts = {};

    const mappedData = allData.map((row) => {
        const defectQty = parseNum(findVal(row, ['불량수량(EA)', '불량수량', '불량']));
        
        // Item Type Processing
        let itemTypeRaw = findVal(row, ['품목유형', '제품유형']) || '';
        
        // DEBUG: Track raw values
        const rawKey = String(itemTypeRaw).trim();
        itemTypeCounts[rawKey] = (itemTypeCounts[rawKey] || 0) + 1;

        let itemType = itemTypeRaw;
        
        if (typeof itemTypeRaw === 'string') {
            const val = itemTypeRaw.trim();
            // FIX: Map 'China Factory' to 'Outsourced Painting'
            if (val === '중국공장' || val.includes('SMART VALVE') || val.includes('DALIAN')) {
                itemType = '외주도장';
            } else {
                itemType = val;
            }
        }
        
        return {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            date: formatDate(findVal(row, ['입고일', '입고일자', '날짜'])),
            supplier: findVal(row, ['입고업체', '업체명', '공급사']) || 'Unknown',
            itemName: findVal(row, ['제품명', '품명', '품목명']) || 'Unknown',
            totalQuantity: parseNum(findVal(row, ['입고수량(EA)', '입고수량', '수량'])),
            inspectionQuantity: parseNum(findVal(row, ['검사수량(EA)', '검사수량'])),
            defectQuantity: defectQty,
            result: defectQty > 0 ? '불합격' : '합격',
            defectType: findVal(row, ['불량유형', '불량내용']) || '',
            itemType: itemType,
            inspectionReportNo: findVal(row, ['인수검사성적서NO', '인수검사성적서', '성적서NO', '성적서번호']) || ''
        };
    });

    console.log("--- RAW Item Types Found ---");
    Object.entries(itemTypeCounts).forEach(([k, v]) => console.log(`'${k}': ${v}`));
    console.log("----------------------------");

    const validData = mappedData.filter(d => {
        return d.date !== null && (d.supplier !== 'Unknown' || d.itemName !== 'Unknown' || d.itemType !== '');
    });

    console.log(`Valid rows to import: ${validData.length}`);
    const outsourced = validData.filter(d => d.itemType === '외주도장');
    console.log(`Mapped 'Outsourced Painting' count: ${outsourced.length}`);

    // Read existing DB
    console.log(`Reading DB from: ${DB_PATH}`);
    const dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    
    // Update inspections
    dbData.inspections = validData;

    // Write back
    fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), 'utf-8');
    fs.writeFileSync('debug_counts.json', JSON.stringify(itemTypeCounts, null, 2), 'utf-8');
    console.log('Database updated successfully.');
    console.log('Debug counts written to debug_counts.json');

} catch (err) {
    console.error('Error processing file:', err);
    process.exit(1);
}
