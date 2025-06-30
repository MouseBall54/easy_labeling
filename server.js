const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const dataDir = path.join(__dirname, 'data');
const publicDir = path.join(__dirname, 'public');

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

app.use(express.json());
app.use(express.static(publicDir));
app.use('/data', express.static(dataDir)); // Serve images from data directory

// API to get list of images
app.get('/api/images', (req, res) => {
    fs.readdir(dataDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        }
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        res.json(imageFiles);
    });
});

// API to get labels for an image
app.get('/api/labels/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const labelFileName = path.parse(imageName).name + '.txt';
    const labelFilePath = path.join(dataDir, labelFileName);

    fs.readFile(labelFilePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.send(''); // Return empty string if no file
            }
            return res.status(500).send('Error reading label file: ' + err);
        }
        res.send(data);
    });
});

// API to save labels for an image
app.post('/api/labels/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const labelFileName = path.parse(imageName).name + '.txt';
    const labelFilePath = path.join(dataDir, labelFileName);
    const { labels } = req.body;

    fs.writeFile(labelFilePath, labels, 'utf8', (err) => {
        if (err) {
            return res.status(500).send('Error saving label file: ' + err);
        }
        res.status(200).send('Labels saved successfully.');
    });
});

app.listen(port, () => {
    console.log(`Easy Labeling server running at http://localhost:${port}`);
    console.log(`Place your images in the 'data' directory.`);
});
