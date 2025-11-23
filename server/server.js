import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mime from 'mime-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const MEDIA_ROOT = path.join(__dirname, '../media');
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Ensure media directory exists
if (!fs.existsSync(MEDIA_ROOT)) {
    fs.mkdirSync(MEDIA_ROOT);
}

// Load or initialize metadata
let metadata = {};
if (fs.existsSync(DATA_FILE)) {
    try {
        metadata = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
        console.error('Error reading metadata:', e);
    }
}

function saveMetadata() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(metadata, null, 2));
}

// Helper to get file info
function getFileInfo(filePath) {
    const relativePath = path.relative(MEDIA_ROOT, filePath);
    const stat = fs.statSync(filePath);
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    const type = mimeType.startsWith('video') ? 'video' : mimeType.startsWith('image') ? 'image' : 'other';
    
    return {
        id: relativePath.replace(/\\/g, '/'), // Use forward slashes for IDs
        name: path.basename(filePath),
        path: relativePath,
        type,
        size: stat.size,
        mtime: stat.mtime,
        ...metadata[relativePath.replace(/\\/g, '/')] // Merge with stored metadata
    };
}

// API: List files
app.get('/api/files', (req, res) => {
    const files = [];
    
    function scanDir(dir) {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                scanDir(fullPath);
            } else {
                const info = getFileInfo(fullPath);
                if (info.type !== 'other') {
                    files.push(info);
                }
            }
        }
    }

    try {
        scanDir(MEDIA_ROOT);
        res.json(files);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// API: Update metadata
app.post('/api/files/:id', (req, res) => {
    const { id } = req.params;
    const { description, tags, title } = req.body;
    
    if (!metadata[id]) metadata[id] = {};
    if (description !== undefined) metadata[id].description = description;
    if (tags !== undefined) metadata[id].tags = tags;
    if (title !== undefined) metadata[id].title = title;
    
    saveMetadata();
    res.json({ success: true, data: metadata[id] });
});

// Serve media files
app.use('/media', express.static(MEDIA_ROOT));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
