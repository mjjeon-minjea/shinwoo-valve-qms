// Native fetch used
// Actually Node 18 has native fetch. I'll delete the import line if it fails, or just use global fetch.
// Node 20+ has global fetch.

async function verify() {
    const baseUrl = 'http://localhost:3001';
    const testId = 'test_verify_' + Date.now();
    const item = {
        id: testId,
        date: '2025-01-01',
        itemName: 'Verification Item',
        totalQuantity: 1,
        inspectionQuantity: 1,
        defectQuantity: 0,
        result: '합격'
    };

    console.log('Creating item:', testId);
    try {
        const createRes = await fetch(`${baseUrl}/inspections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });

        if (!createRes.ok) throw new Error(`Create failed: ${createRes.status}`);
        console.log('Create success.');

        console.log('Deleting item:', testId);
        const deleteRes = await fetch(`${baseUrl}/inspections/${testId}`, {
            method: 'DELETE'
        });

        if (!deleteRes.ok) throw new Error(`Delete failed: ${deleteRes.status}`);
        console.log('Delete success. Verification Passed.');
    } catch (e) {
        console.error('Verification failed:', e);
    }
}

verify();
