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
        }
    }, [chat, content]);

    const [visibleCount, setVisibleCount] = React.useState(50);
    const [searchTerm, setSearchTerm] = React.useState('');
    const scrollRef = React.useRef(null);

    // Reset pagination and search when chat changes
    React.useEffect(() => {
        setVisibleCount(50);
        setSearchTerm('');
    }, [chat]);

    const filteredMessages = React.useMemo(() => {
        if (!searchTerm) return messages;
        const lower = searchTerm.toLowerCase();
        return messages.filter(m =>
            (m.text && m.text.toLowerCase().includes(lower)) ||
            (m.sender && m.sender.toLowerCase().includes(lower))
        );
    }, [messages, searchTerm]);

    const visibleMessages = filteredMessages.slice(0, visibleCount);

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight < 100) {
            // Reached bottom, load more
            if (visibleCount < filteredMessages.length) {
                setVisibleCount(prev => Math.min(prev + 50, filteredMessages.length));
            }
        }
    };

    if (!chat) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Select a chat to view</div>;

    // Debug view if no messages parsed but content exists
    if (chat.type === 'whatsapp' && messages.length === 0 && content) {
        return (
            <div className="chat-view" style={{ padding: '20px', color: 'var(--text-color)', flex: 1, overflowY: 'auto' }}>
                <h3>Parsing Error or Empty Chat</h3>
                <p>Could not parse messages. Raw content preview (first 500 chars):</p>
                <pre style={{ background: '#333', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
                    {content.slice(0, 500)}
                </pre>
                <p>Please check the console (F12) for more details.</p>
            </div>
        );
    }

    return (
        <div className="chat-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="chat-header" style={{
                padding: '15px 20px',
                borderBottom: '1px solid var(--surface-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '15px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h3 style={{ margin: 0 }}>{chat.name}</h3>
                    <span style={{ fontSize: '0.8em', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--surface-color)' }}>{chat.type}</span>
                </div>
                <input
                    type="text"
                    placeholder="Search in chat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        background: 'var(--bg-color)',
                        border: '1px solid var(--surface-color)',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        color: 'var(--text-color)',
                        minWidth: '200px'
                    }}
                />
            </div>

            <div
                className="messages"
                onScroll={handleScroll}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}
            >
                {visibleMessages.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                        No messages found.
                    </div>
                )}
                {visibleMessages.map((msg, i) => (
                    <MessageBubble
                        key={i}
                        message={msg}
                        isMe={msg.isMe}
                        isBookmarked={msg.isBookmarked}
                        onBookmark={() => onBookmark && onBookmark(msg.id)}
                        onLinkMedia={() => console.log('Link Media', msg.id)}
                    />
                ))}
                {visibleCount < filteredMessages.length && (
                    <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-secondary)' }}>
                        Loading more...
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatView;
