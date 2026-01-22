// Native fetch
const idToDelete = '1767330776175_hm0x751mb';

async function testDelete() {
    console.log(`Attempting to delete ${idToDelete}...`);
    try {
        const res = await fetch(`http://localhost:3001/inspections/${idToDelete}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            console.log('Delete successful.');
        } else {
            console.log('Delete failed:', res.status, res.statusText);
        }
    } catch (e) {
        console.error('Network error:', e);
    }
}

testDelete();
