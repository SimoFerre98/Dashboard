import React from 'react';
import MessageBubble from './MessageBubble';

const ChatView = ({ chat, content, onBookmark }) => {
    const messages = React.useMemo(() => {
        if (!content) return [];

        const bookmarks = chat?.bookmarks || [];

        if (chat.type === 'telegram') {
            // Telegram JSON parser
            const list = content.messages || [];
            return list.map(m => ({
                id: m.id,
                text: typeof m.text === 'string' ? m.text : (Array.isArray(m.text) ? m.text.map(t => typeof t === 'string' ? t : t.text).join('') : ''),
                sender: m.from,
                time: new Date(m.date).toLocaleString(),
                timestamp: m.date_unixtime,
                isMe: m.from === 'Me' || m.from_id === 'user456', // Logic to detect 'me' needs refinement based on user input
                isBookmarked: bookmarks.includes(m.id)
            }));
        } else {
            console.log('Parsing WhatsApp content:', content ? content.slice(0, 100) : 'Empty');
            // WhatsApp TXT parser
            const lines = content.split('\n');
            const msgs = [];

            // Allow for a bit of flexibility in the regex
            // Supports: "dd/mm/yyyy, hh:mm - Sender: Message"
            const regex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2})\s+-\s+([^:]+):\s+(.+)$/;

            lines.forEach((line, index) => {
                const match = line.match(regex);
                if (match) {
                    msgs.push({
                        id: index,
                        date: match[1],
                        time: match[2],
                        sender: match[3],
                        text: match[4],
                        isMe: match[3].toLowerCase() === 'tu' || match[3].toLowerCase() === 'you',
                        isBookmarked: bookmarks.includes(index)
                    });
                } else if (msgs.length > 0) {
                    // Append continuation lines to last message
                    msgs[msgs.length - 1].text += '\n' + line;
                }
            });
            console.log('Parsed messages:', msgs.length);
            return msgs;
    );
};

export default ChatView;
