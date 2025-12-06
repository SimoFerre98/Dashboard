// Web Worker for chat parsing

self.onmessage = (e) => {
    const { content, type, bookmarks } = e.data;

    if (!content) {
        self.postMessage({ success: true, messages: [] });
        return;
    }

    try {
        let messages = [];

        if (type === 'telegram') {
            // Telegram JSON
            if (typeof content !== 'object') {
                throw new Error("Invalid content type for Telegram (expected object)");
            }
            const list = content.messages || [];
            messages = list.map(m => ({
                id: m.id,
                text: typeof m.text === 'string' ? m.text : (Array.isArray(m.text) ? m.text.map(t => typeof t === 'string' ? t : t.text).join('') : ''),
                sender: m.from,
                time: m.date ? new Date(m.date).toLocaleString() : 'Unknown',
                timestamp: m.date_unixtime,
                isMe: m.from === 'Me' || m.from_id === 'user456', // Basic check
                isBookmarked: bookmarks.includes(m.id)
            }));
        } else {
            // WhatsApp TXT
            const textContent = typeof content === 'string' ? content : JSON.stringify(content);
            const lines = textContent.split('\n');

            // Regexes
            const regex1 = /^(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}),\s+(\d{1,2}:\d{2})\s+-\s+([^:]+):\s+(.+)$/;
            const regex2 = /^\[(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}),\s+(\d{1,2}:\d{2}:\d{2})\]\s+([^:]+):\s+(.+)$/;
            const regex3 = /^(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}),\s+(\d{1,2}:\d{2}\s?[AP]M)\s+-\s+([^:]+):\s+(.+)$/;

            lines.forEach((line, index) => {
                let match = line.match(regex1) || line.match(regex2) || line.match(regex3);

                if (match) {
                    messages.push({
                        id: index,
                        date: match[1],
                        time: match[2],
                        sender: match[3],
                        text: match[4],
                        isMe: ["tu", "you", "me", "io"].includes(match[3].toLowerCase()),
                        isBookmarked: bookmarks.includes(index)
                    });
                } else if (messages.length > 0) {
                    messages[messages.length - 1].text += '\n' + line;
                }
            });
        }

        self.postMessage({ success: true, messages });

    } catch (err) {
        self.postMessage({ success: false, error: err.message });
    }
};
