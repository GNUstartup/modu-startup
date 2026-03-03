const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) env[key.trim()] = val.join('=').trim().replace(/"/g, '');
});

const baseId = env.VITE_AIRTABLE_BASE_ID;
const apiKey = env.VITE_AIRTABLE_API_KEY;

fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
})
    .then(res => res.json())
    .then(data => {
        if (data.tables) console.log('Success, found ' + data.tables.length + ' tables');
        else console.error('Error fetching tables:', JSON.stringify(data, null, 2));
    })
    .catch(console.error);
