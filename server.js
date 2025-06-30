const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

const publicDir = path.join(__dirname, 'public');

// Serve static files from the 'public' directory
app.use(express.static(publicDir));

app.listen(port, () => {
    console.log(`Easy Labeling server running at http://localhost:${port}`);
    console.log('Open the address in a modern browser like Chrome or Edge.');
});