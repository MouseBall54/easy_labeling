"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3000;
const publicDir = path_1.default.join(__dirname, 'public');
// Serve static files from the 'public' directory
app.use(express_1.default.static(publicDir));
app.listen(port, () => {
    console.log(`Easy Labeling server running at http://localhost:${port}`);
    console.log('Open the address in a modern browser like Chrome or Edge.');
});
