import React from 'react';
import MessageBubble from './MessageBubble';

const ChatView = ({ chat, content, onBookmark, initialJumpToMessageId }) => {
    // ... useMemo remains same ...
    const messages = React.useMemo(() => {
        if (!content) return [];

        const bookmarks = chat?.bookmarks || [];

        try {
            if (chat.type === 'telegram') {
                // Telegram expects JSON object
                if (typeof content !== 'object') {
                    console.error('Invalid content type for Telegram:', typeof content);
                    return [];
                }
                const list = content.messages || [];
                return list.map(m => ({
                    id: m.id,
                    text: typeof m.text === 'string' ? m.text : (Array.isArray(m.text) ? m.text.map(t => typeof t === 'string' ? t : t.text).join('') : ''),
                    sender: m.from,
                    time: m.date ? new Date(m.date).toLocaleString() : 'Unknown',
                    timestamp: m.date_unixtime,
                    isMe: m.from === 'Me' || m.from_id === 'user456',
                    isBookmarked: bookmarks.includes(m.id)
                }));
            } else {
                // WhatsApp expects text content
                if (typeof content !== 'string') {
                    console.error('Invalid content type for WhatsApp:', typeof content);
                    // Fallback: try to stringify if it's an object (maybe error json)
                    if (typeof content === 'object') return [{ id: 0, text: "Error: Received Object instead of Text. " + JSON.stringify(content), sender: "System", isMe: false }];
                    return [];
                }

                console.log('Parsing WhatsApp content length:', content.length);
                const lines = content.split('\n');
                const msgs = [];

                // Regex 1: "dd/mm/yyyy, hh:mm - Sender: Message" (standard iOS/Android)
                const regex1 = /^(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}),\s+(\d{1,2}:\d{2})\s+-\s+([^:]+):\s+(.+)$/;
                // Regex 2: "[dd/mm/yyyy, hh:mm:ss] Sender: Message" (bracketed)
                const regex2 = /^\[(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}),\s+(\d{1,2}:\d{2}:\d{2})\]\s+([^:]+):\s+(.+)$/;
                // Regex 3: "mm/dd/yy, hh:mm PM - Sender: Message" (US style)
                const regex3 = /^(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}),\s+(\d{1,2}:\d{2}\s?[AP]M)\s+-\s+([^:]+):\s+(.+)$/;

                lines.forEach((line, index) => {
                    // Try patterns
                    let match = line.match(regex1) || line.match(regex2) || line.match(regex3);

                    if (match) {
                        msgs.push({
                            id: index,
                            date: match[1],
                            time: match[2],
                            sender: match[3],
                            text: match[4],
                            isMe: ["tu", "you", "me", "io"].includes(match[3].toLowerCase()),
                            isBookmarked: bookmarks.includes(index)
                        });
                    } else if (msgs.length > 0) {
                        // Append continuation lines to last message
                        msgs[msgs.length - 1].text += '\n' + line;
                    }
                });
                return msgs;
            }
        } catch (err) {
            console.error('Error parsing chat:', err);
            return [{ id: 0, text: "Critical Parsing Error: " + err.message, sender: "System", isMe: false }];
        }
    }, [chat, content]);

    const [visibleCount, setVisibleCount] = React.useState(50);
    const [searchTerm, setSearchTerm] = React.useState('');
    const scrollRef = React.useRef(null);

    // Reset pagination and search when chat changes
    // Check for initial jump
    React.useEffect(() => {
        setVisibleCount(50);
        setSearchTerm('');

        if (initialJumpToMessageId !== null && initialJumpToMessageId !== undefined) {
            // Delay slightly to ensure render, then jump
            console.log('Jumping to', initialJumpToMessageId);
            jumpToMessage(initialJumpToMessageId);
        }
    }, [chat, initialJumpToMessageId]);

    const isSearching = searchTerm.length > 0;

    const filteredMessages = React.useMemo(() => {
        if (!searchTerm) return messages;
        const lower = searchTerm.toLowerCase();
        return messages.filter(m =>
            (m.text && m.text.toLowerCase().includes(lower)) ||
            (m.sender && m.sender.toLowerCase().includes(lower))
        );
    }, [messages, searchTerm]);

    const displayMessages = isSearching ? filteredMessages : messages.slice(0, visibleCount);

    const handleScroll = (e) => {
        if (isSearching) return;
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight < 100) {
            // Reached bottom, load more
            if (visibleCount < messages.length) {
                setVisibleCount(prev => Math.min(prev + 50, messages.length));
            }
        }
    };

    const jumpToMessage = (messageId) => {
        setSearchTerm(''); // Clear search to go to normal view
        // Find index in full list
        const index = messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
            // Ensure message is loaded
            setVisibleCount(Math.max(visibleCount, index + 50));
            // Wait for render then scroll
            setTimeout(() => {
                const el = document.getElementById(`msg-${messageId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.style.animation = 'highlight 2s';
                }
            }, 100);
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

    // Helper to check if date header is needed
    const showDateHeader = (current, previous) => {
        if (!previous) return true;
        return current.date !== previous.date;
    };

    return (
        <div className="chat-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <style>{`
                @keyframes highlight {
                    0% { background-color: rgba(229, 9, 20, 0.3); }
                    100% { background-color: transparent; }
                }
            `}</style>
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
                {displayMessages.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                        <p>No messages found/parsed.</p>
                        <button
                            onClick={() => alert(`Type: ${chat.type}\nLength: ${content?.length}\nRaw Start: ${content?.slice(0, 200)}`)}
                            style={{ marginTop: '10px', padding: '5px 10px', background: '#333', border: 'none', color: '#fff', cursor: 'pointer' }}
                        >
                            Show Debug Info
                        </button>
                    </div>
                )}

                {displayMessages.map((msg, i) => {
                    const prevMsg = i > 0 ? displayMessages[i - 1] : null;
                    const showHeader = !isSearching && showDateHeader(msg, prevMsg || {});

                    return (
                        <React.Fragment key={i}>
                            {showHeader && msg.date && (
                                <div style={{
                                    alignSelf: 'center',
                                    backgroundColor: 'var(--surface-color)',
                                    padding: '4px 12px',
                                    borderRadius: '10px',
                                    fontSize: '0.8em',
                                    margin: '10px 0',
                                    color: 'var(--text-secondary)'
                                }}>
                                    {msg.date}
                                </div>
                            )}
                            <div
                                id={`msg-${msg.id}`}
                                onClick={() => isSearching ? jumpToMessage(msg.id) : null}
                                style={{
                                    cursor: isSearching ? 'pointer' : 'default',
                                    opacity: isSearching ? 0.9 : 1
                                }}
                            >
                                <MessageBubble
                                    message={msg}
                                    isMe={msg.isMe}
                                    isBookmarked={msg.isBookmarked}
                                    onBookmark={() => onBookmark && onBookmark(msg.id)}
                                    onLinkMedia={() => console.log('Link Media', msg.id)}
                                />
                            </div>
                        </React.Fragment>
                    );
                })}

                {!isSearching && visibleCount < messages.length && (
                    <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-secondary)' }}>
                        Loading more...
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatView;
