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
    const { description, tags, title, rating, favorite, folder, bookmarks, linkedMedia } = req.body;

    if (!metadata[id]) metadata[id] = {};
    if (description !== undefined) metadata[id].description = description;
    if (tags !== undefined) metadata[id].tags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    if (title !== undefined) metadata[id].title = title;
    if (rating !== undefined) metadata[id].rating = Number(rating);
    if (favorite !== undefined) metadata[id].favorite = Boolean(favorite);
    if (folder !== undefined) metadata[id].folder = folder || null;
    if (bookmarks !== undefined) metadata[id].bookmarks = Array.isArray(bookmarks) ? bookmarks : [];
    if (linkedMedia !== undefined) metadata[id].linkedMedia = Array.isArray(linkedMedia) ? linkedMedia : [];

    saveMetadata();
    res.json({ success: true, data: metadata[id] });
});

// API: Folders - list all folders created
app.get('/api/folders', (req, res) => {
    const set = new Set();
    for (const key of Object.keys(metadata)) {
        const entry = metadata[key];
        if (entry && entry.folder) set.add(entry.folder);
    }
    const stored = Array.isArray(metadata._folders) ? metadata._folders : [];
    const result = Array.from(new Set([...stored, ...set]));
    res.json({ folders: result });
});

// API: Create/add a folder name to catalog
app.post('/api/folders', (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Invalid folder name' });
    }
    const clean = name.trim();
    const current = Array.isArray(metadata._folders) ? metadata._folders : [];
    if (!current.includes(clean)) current.push(clean);
    metadata._folders = current;
    saveMetadata();
    res.json({ success: true, folders: current });
});

// Serve media files
app.use('/media', express.static(MEDIA_ROOT));

// CHATS HANDLING
const CHATS_ROOT = path.join(__dirname, '../chats');
if (!fs.existsSync(CHATS_ROOT)) {
    fs.mkdirSync(CHATS_ROOT);
}

// API: List available chats
app.get('/api/chats', (req, res) => {
    try {
        const files = fs.readdirSync(CHATS_ROOT).filter(f => f.endsWith('.txt') || f.endsWith('.json'));
        const chatList = files.map(filename => {
            const stats = fs.statSync(path.join(CHATS_ROOT, filename));
            return {
                id: filename,
                name: filename,
                type: filename.endsWith('.json') ? 'telegram' : 'whatsapp',
                size: stats.size,
                mtime: stats.mtime,
                ...metadata[filename] // Merge with stored metadata for bookmarks/media
            };
        });
        res.json(chatList);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// API: Get chat content
app.get('/api/chats/:id/content', (req, res) => {
    const { id } = req.params;
    const filePath = path.join(CHATS_ROOT, id);

    // Security check to prevent directory traversal
    if (!filePath.startsWith(CHATS_ROOT)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Chat not found' });
    }

    if (id.endsWith('.json')) {
        // For Telegram JSON exports
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            res.json(JSON.parse(content));
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse JSON chat' });
        }
    } else {
        // For WhatsApp TXT exports
        const content = fs.readFileSync(filePath, 'utf8');
        res.send(content); // Send raw text, frontend will parse
    }
});

// API: Search text in all chats
app.get('/api/search', (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 3) {
        return res.json({ results: [] });
    }

    const query = q.toLowerCase();
    const results = [];

    try {
        const files = fs.readdirSync(CHATS_ROOT).filter(f => f.endsWith('.txt') || f.endsWith('.json'));

        for (const file of files) {
            const filePath = path.join(CHATS_ROOT, file);
            const content = fs.readFileSync(filePath, 'utf8');

            if (file.endsWith('.json')) {
                // Telegram
                try {
                    const json = JSON.parse(content);
                    const messages = json.messages || [];
                    messages.forEach(m => {
                        const text = typeof m.text === 'string' ? m.text : (Array.isArray(m.text) ? m.text.map(t => typeof t === 'string' ? t : t.text).join('') : '');
                        if (text && text.toLowerCase().includes(query)) {
                            results.push({
                                chatId: file,
                                chatName: file, // Simplified
                                messageId: m.id,
                                sender: m.from,
                                text: text.slice(0, 100) + '...', // Snippet
                                date: m.date
                            });
                        }
                    });
                } catch (e) { }
            } else {
                // WhatsApp
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (line.toLowerCase().includes(query)) {
                        // Extract sender/text vaguely
                        const parts = line.split(' - ');
                        const mainPart = parts.length > 1 ? parts[1] : line;
                        results.push({
                            chatId: file,
                            chatName: file,
                            messageId: index,
                            text: mainPart.slice(0, 100) + '...',
                            date: null // extraction hard without regex reuse
                        });
                    }
                });
            }
        }
        res.json({ results: results.slice(0, 100) }); // Limit results
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
