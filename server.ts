import express, { Express } from 'express';
import path from 'path';

const app: Express = express();
const port: number = 3000;

const publicDir: string = path.join(__dirname, 'public');

// Serve static files from the 'public' directory
app.use(express.static(publicDir));

app.listen(port, () => {
    console.log(`Easy Labeling server running at http://localhost:${port}`);
    console.log('Open the address in a modern browser like Chrome or Edge.');
});
