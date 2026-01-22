const fetch = require('node-fetch');

const ids = [
    "1767336560226_ds91d37gz",
    "1767336560226_b5py0qi4q",
    "1767336560226_za521zcn8",
    "1767336560226_o8e5j5vrz",
    "1767336560226_goxu1ag7e"
];

const deleteItem = async (id) => {
    try {
        const response = await fetch(`http://localhost:3001/inspections/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            console.log(`Deleted ${id}`);
        } else {
            console.log(`Failed to delete ${id}: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error deleting ${id}:`, error);
    }
};

const run = async () => {
    for (const id of ids) {
        await deleteItem(id);
        // Small delay to be nice to json-server
        await new Promise(resolve => setTimeout(resolve, 50));
    }
};

run();
