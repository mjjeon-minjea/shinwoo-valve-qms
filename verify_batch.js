// fetch is built-in in newer Node versions

async function testBatchEndpoints() {
    console.log("Testing Batch Endpoints...");

    // 1. Prepare Batch Data (Batch Upload)
    const batchData = [
        { id: `batch_test_${Date.now()}_1`, itemName: "Batch Item 1", date: "2025-01-01" },
        { id: `batch_test_${Date.now()}_2`, itemName: "Batch Item 2", date: "2025-01-01" },
        { id: `batch_test_${Date.now()}_3`, itemName: "Batch Item 3", date: "2025-01-01" }
    ];

    try {
        // Test POST /inspections/batch
        console.log("1. Sending POST /inspections/batch...");
        const uploadRes = await fetch('http://localhost:3001/inspections/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batchData)
        });

        if (uploadRes.ok) {
            const json = await uploadRes.json();
            console.log("   Upload Success:", json);
            if (json.count !== 3) throw new Error(`Expected count 3, got ${json.count}`);
        } else {
            throw new Error(`Upload Failed: ${uploadRes.status} ${uploadRes.statusText}`);
        }

        // Verify items exist
        console.log("2. Verifying items exist via GET /inspections...");
        const getRes = await fetch('http://localhost:3001/inspections');
        const items = await getRes.json();
        const found = items.filter(i => i.id.startsWith('batch_test_'));
        console.log(`   Found ${found.length} batch items.`);
        if (found.length < 3) throw new Error("Batch items not found in DB.");

        // Test DELETE /inspections (Batch Delete is risky if we wipe user data, 
        // but for this verification we assume we want to test the functionality.
        // Wait! The user HAS data. I should NOT wipe everything just for a test script unless I am careful.
        // The endpoint wipes EVERYTHING.
        // I should NOT run the batch delete test on the main DB if it has user data.
        // I will skip the actual DELETE /inspections call to protect user data.
        // Instead I will clean up the 3 test items individually to be safe, 
        // OR just confirming the upload works is enough proof the server.js is active.

        // Actually, if I can confirm /inspections/batch works, it proves server.js is running.
        // The DELETE route is in the same file.

        console.log("3. Skipping Batch Delete Test to protect existing data.");
        console.log("   Cleaning up test items individually...");

        for (const item of batchData) {
            await fetch(`http://localhost:3001/inspections/${item.id}`, { method: 'DELETE' });
        }
        console.log("   Cleanup complete.");

        console.log("Batch Endpoint Verification PASSED!");

    } catch (error) {
        console.error("Verification FAILED:", error);
        process.exit(1);
    }
}

testBatchEndpoints();
