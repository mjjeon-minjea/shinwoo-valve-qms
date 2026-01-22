
import fetch from 'node-fetch';

async function testSettings() {
    console.log('Testing GET /settings/global...');
    try {
        const getRes = await fetch('http://localhost:3001/settings/global');
        console.log('GET Status:', getRes.status);
        if (getRes.ok) {
            console.log('GET Body:', await getRes.json());
        } else {
            console.log('GET Failed:', await getRes.text());
        }

        console.log('\nTesting PUT /settings/global...');
        const putRes = await fetch('http://localhost:3001/settings/global', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'global', popupEnabled: false }) // Toggling to false
        });
        console.log('PUT Status:', putRes.status);
        if (putRes.ok) {
            console.log('PUT Body:', await putRes.json());
        } else {
            console.log('PUT Failed:', await putRes.text());
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testSettings();
