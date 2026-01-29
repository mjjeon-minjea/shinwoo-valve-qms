import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/settings/global';
const HEADERS = { 'Content-Type': 'application/json' };

async function verifySettingsApi() {
    console.log('🔍 [Verification] Starting Settings API Check...');
    let originalSettings = null;

    try {
        // Step 1: Check Current Settings (GET)
        console.log('➡️  Step 1: Fetching current settings...');
        const getRes = await fetch(API_URL);
        if (!getRes.ok) throw new Error(`GET failed with status ${getRes.status}`);
        
        originalSettings = await getRes.json();
        console.log(`   ✅ GET Success. Current popupEnabled: ${originalSettings.popupEnabled}`);

        // Step 2: Toggle Setting (PUT)
        const newPopupValue = !originalSettings.popupEnabled;
        console.log(`➡️  Step 2: Toggling popupEnabled to ${newPopupValue}...`);
        
        const putRes = await fetch(API_URL, {
            method: 'PUT',
            headers: HEADERS,
            body: JSON.stringify({ ...originalSettings, popupEnabled: newPopupValue })
        });
        
        if (!putRes.ok) throw new Error(`PUT failed with status ${putRes.status}`);
        const putData = await putRes.json();
        
        if (putData.popupEnabled !== newPopupValue) {
            throw new Error(`PUT mismatch. Expected ${newPopupValue}, got ${putData.popupEnabled}`);
        }
        console.log('   ✅ PUT Success. Value updated.');

        // Step 3: Verify Persistence (GET)
        console.log('➡️  Step 3: Verifying persistence...');
        const verifyRes = await fetch(API_URL);
        const verifyData = await verifyRes.json();
        
        if (verifyData.popupEnabled !== newPopupValue) {
            throw new Error(`Persistence failed. Expected ${newPopupValue}, got ${verifyData.popupEnabled}`);
        }
        console.log('   ✅ Persistence Verification Success.');

        // Step 4: Restore Original State (PUT)
        console.log('➡️  Step 4: Restoring original state...');
        const restoreRes = await fetch(API_URL, {
            method: 'PUT',
            headers: HEADERS,
            body: JSON.stringify(originalSettings)
        });
        
        if (!restoreRes.ok) throw new Error(`Restore failed with status ${restoreRes.status}`);
        console.log('   ✅ Restore Success.');

        console.log('\n🎉 [PASS] All Settings API checks passed!');

    } catch (error) {
        console.error('\n❌ [FAIL] Verification failed:', error.message);
        process.exit(1);
    }
}

verifySettingsApi();
