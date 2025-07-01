const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const port = 3000;

// All project folders will be located inside this base directory.
const BASE_DATA_DIR = path.resolve(__dirname, 'data');

// Middleware to parse JSON and text bodies
app.use(express.json());
app.use(express.text());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- Security Middleware ---
// Ensures that the requested project path is safely within the BASE_DATA_DIR.
// This prevents directory traversal attacks.
const securePath = async (req, res, next) => {
    const { projectName, filename, imageName } = req.params;

    if (!projectName || projectName.includes('..')) {
        return res.status(400).send('Invalid project name.');
    }

    const projectPath = path.resolve(path.join(BASE_DATA_DIR, projectName));

    if (!projectPath.startsWith(BASE_DATA_DIR)) {
        return res.status(403).send('Forbidden: Access is denied.');
    }

    // Check if the project directory actually exists
    try {
        const stats = await fs.stat(projectPath);
        if (!stats.isDirectory()) {
            return res.status(404).send('Project not found.');
        }
    } catch (err) {
        return res.status(404).send('Project not found.');
    }

    // Also validate filenames to prevent traversal
    const requestedFile = filename || imageName;
    if (requestedFile && requestedFile.includes('..')) {
        return res.status(400).send('Invalid filename.');
    }

    req.projectPath = projectPath; // Add the safe path to the request object
    next();
};


// --- API Endpoints ---

// 1. Get a list of available projects (subdirectories in BASE_DATA_DIR)
app.get('/api/projects', async (req, res) => {
    try {
        const entries = await fs.readdir(BASE_DATA_DIR, { withFileTypes: true });
        const directories = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
        res.json(directories);
    } catch (err) {
        console.error('Error reading projects directory:', err);
        res.status(500).send('Error reading projects directory. Ensure the /data directory exists.');
    }
});

// 2. Get a list of images for a specific project
app.get('/api/projects/:projectName/images', securePath, async (req, res) => {
    try {
        const files = await fs.readdir(req.projectPath);
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|tif|tiff)$/i.test(file));
        res.json(imageFiles.map(name => ({ name })));
    } catch (err) {
        console.error(`Error reading image directory for ${req.params.projectName}:`, err);
        res.status(500).send('Error reading image directory');
    }
});

// 3. Serve a specific image file from a project
app.get('/api/projects/:projectName/images/:filename', securePath, (req, res) => {
    const filePath = path.join(req.projectPath, req.params.filename);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('Image not found.');
        }
    });
});

// 4. Get the content of a label file for a specific image in a project
app.get('/api/projects/:projectName/labels/:imageName', securePath, async (req, res) => {
    const labelFileName = req.params.imageName.replace(/\.[^/.]+$/, "") + ".txt";
    const filePath = path.join(req.projectPath, labelFileName);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        res.send(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.send(''); // If no label file exists, send empty string
        } else {
            console.error(`Error reading label file for ${req.params.imageName}:`, err);
            res.status(500).send('Error reading label file');
        }
    }
});

// 5. Save a label file for a specific image in a project
app.post('/api/projects/:projectName/labels/:imageName', securePath, async (req, res) => {
    const labelFileName = req.params.imageName.replace(/\.[^/.]+$/, "") + ".txt";
    const filePath = path.join(req.projectPath, labelFileName);
    try {
        await fs.writeFile(filePath, req.body);
        res.status(200).send('Labels saved successfully');
    } catch (err) {
        console.error(`Error saving labels for ${req.params.imageName}:`, err);
        res.status(500).send('Error saving labels');
    }
});

// Listen on all network interfaces, making it accessible from other machines
app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}.`);
    console.log(`Access via http://localhost:${port} for local mode.`);
    console.log('Access from other devices via http://<YOUR_IP_ADDRESS>:${port}?mode=server');
});
