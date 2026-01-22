// Native fetch in Node 18+

const createItem = (i) => ({
    id: `${Date.now()}_${i}`,
    date: '2025-01-02',
    supplier: 'Test Supplier',
    itemName: `Test Item ${i}`,
    totalQuantity: 100,
    inspectionQuantity: 10,
    defectQuantity: 0,
    result: '합격',
    defectType: ''
});

async function run() {
    console.log('Creating 50 dummy items...');
    for (let i = 0; i < 50; i++) {
        await fetch('http://localhost:3001/inspections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createItem(i))
        });
        if (i % 10 === 0) process.stdout.write('.');
    }
    console.log('\nDone.');
}

run();
