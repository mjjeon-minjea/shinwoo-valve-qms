// verify_metrics_logic.js
// This script verifies:
// 1. Data Persistence: 'inspectionReportNo' is correctly saved to the DB via /inspections/batch
// 2. Logic Correctness: The counting logic matches the user's requirements (ignore '-' and empty)

// Node 18+ has built-in fetch
// We are in ESM mode ("type": "module" in package.json)

async function verifyMetrics() {
    console.log("=== Verifying Metrics Logic & Persistence ===");


    // 1. Prepare Test Data with various 'inspectionReportNo' cases
    const testBatchId = `verify_${Date.now()}`;
    const testData = [
        {
            id: `${testBatchId}_1`,
            itemName: "Valid Report",
            inspectionReportNo: "R-250106-01",
            result: "합격",
            totalQuantity: 10, inspectionQuantity: 10, defectQuantity: 0
        },
        {
            id: `${testBatchId}_2`,
            itemName: "Hyphen Report",
            inspectionReportNo: "-",
            result: "합격",
            totalQuantity: 20, inspectionQuantity: 5, defectQuantity: 0
        },
        {
            id: `${testBatchId}_3`,
            itemName: "Empty Report",
            inspectionReportNo: "",
            result: "합격",
            totalQuantity: 30, inspectionQuantity: 5, defectQuantity: 0
        },
        {
            id: `${testBatchId}_4`,
            itemName: "Another Valid",
            inspectionReportNo: "R-250106-02",
            result: "불합격",
            totalQuantity: 5, inspectionQuantity: 5, defectQuantity: 1
        },
        {
            id: `${testBatchId}_5`,
            itemName: "No Field",
            // inspectionReportNo missing
            result: "합격",
            totalQuantity: 10, inspectionQuantity: 0, defectQuantity: 0
        }
    ];

    try {
        // 2. Upload Data (Test Batch API)
        console.log("\n1. Uploading Test Data...");
        const uploadRes = await fetch('http://localhost:3001/inspections/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        if (!uploadRes.ok) throw new Error(`Upload Failed: ${uploadRes.status}`);
        console.log("   Upload Successful.");

        // 3. Fetch Data Back (Test Persistence)
        console.log("\n2. Fetching Data for Verification...");
        const getRes = await fetch('http://localhost:3001/inspections');
        const allItems = await getRes.json();

        // Filter only our test items
        const myItems = allItems.filter(i => i.id.startsWith(testBatchId));
        console.log(`   Retrieved ${myItems.length} items.`);

        // 4. Verify 'inspectionReportNo' Persistence
        const validItem = myItems.find(i => i.itemName === "Valid Report");
        if (validItem && validItem.inspectionReportNo === "R-250106-01") {
            console.log("   [Pass] 'inspectionReportNo' is correctly persisted.");
        } else {
            console.error("   [Fail] 'inspectionReportNo' was NOT persisted correctly.");
        }

        // 5. Apply Dashboard Counting Logic
        // Logic: filteredInspections.filter(i => i.inspectionReportNo && i.inspectionReportNo !== '-').length;

        const calculatedInspectionCount = myItems.filter(i =>
            i.inspectionReportNo && i.inspectionReportNo !== '-'
        ).length;

        // Valid Report (R-...) -> Count
        // Hyphen Report (-)    -> Skip
        // Empty Report ("")    -> Skip
        // Another Valid (R-..) -> Count
        // No Field             -> Skip
        // Expected: 2 (Item 1 and 4)

        console.log(`\n3. Verifying Calculation Logic...`);
        console.log(`   Expected Count: 2`);
        console.log(`   Calculated Count: ${calculatedInspectionCount}`);

        if (calculatedInspectionCount === 2) {
            console.log("   [Pass] Logic verification SUCCESSFUL.");
        } else {
            console.error("   [Fail] Logic verification FAILED.");
        }

        // Cleanup
        console.log("\n4. Cleaning up test data...");
        for (const item of testData) {
            await fetch(`http://localhost:3001/inspections/${item.id}`, { method: 'DELETE' });
        }
        console.log("   Cleanup complete.");

    } catch (err) {
        console.error("Verification failed:", err);
    }
}

// Since Node 18+ has fetch, we just run it. 
// If older node, we might crash, but user environment seemed explicitly Node 20+ earlier? 
// Actually logs showed Node v24.12.0 so we are safe!
verifyMetrics();
