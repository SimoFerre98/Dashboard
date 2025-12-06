import React from 'react';
import MessageBubble from './MessageBubble';
import ChatProfile from './ChatProfile';
import { Info } from 'lucide-react';

const ChatView = ({ chat, content, onBookmark, initialJumpToMessageId }) => {
    const [showProfile, setShowProfile] = React.useState(false);
    const [messages, setMessages] = React.useState([]);
    const [isParsing, setIsParsing] = React.useState(false);
    const [parseError, setParseError] = React.useState(null);

    React.useEffect(() => {
        if (!content || !chat) {
            setMessages([]);
            setParseError(null);
            return;
        }

        setIsParsing(true);
        setParseError(null);

        // Initialize Worker
        const worker = new Worker(new URL('../../workers/chatParser.js', import.meta.url));

        worker.onmessage = (e) => {
            const { success, messages, error } = e.data;
            if (success) {
                setMessages(messages);
            } else {
                console.error("Worker parsing error:", error);
                setParseError(error);
                setMessages([{ id: 0, text: "Critical Parsing Error: " + error, sender: "System", isMe: false }]);
            }
            setIsParsing(false);
            worker.terminate();
        };

        worker.onerror = (err) => {
            console.error("Worker error:", err);
            setParseError(err.message);
            setIsParsing(false);
            worker.terminate();
        };

        // Send data to worker
        worker.postMessage({
            content,
            type: chat.type,
            bookmarks: chat.bookmarks || []
        });

        // Cleanup
        return () => {
            worker.terminate();
        };

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

    React.useEffect(() => {
        setVisibleCount(50);
    }, [searchTerm]);

    const isSearching = searchTerm.length > 0;

    const filteredMessages = React.useMemo(() => {
        if (!searchTerm) return messages;
        const lower = searchTerm.toLowerCase();
        return messages.filter(m =>
            (m.text && m.text.toLowerCase().includes(lower)) ||
            (m.sender && m.sender.toLowerCase().includes(lower))
        );
    }, [messages, searchTerm]);

    const displayMessages = isSearching ? filteredMessages.slice(0, visibleCount) : messages.slice(0, visibleCount);

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight < 100) {
            // Reached bottom, load more
            const targetList = isSearching ? filteredMessages : messages;
            if (visibleCount < targetList.length) {
                setVisibleCount(prev => Math.min(prev + 50, targetList.length));
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}
                        title="Chat Info"
                    >
                        <Info size={20} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
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
                    {/* ... messages rendering ... */}
                    {isParsing && (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                            Processing chat file... please wait.
                        </div>
                    )}

                    {!isParsing && displayMessages.length === 0 && (
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

                {showProfile && (
                    <ChatProfile
                        chat={chat}
                        messages={messages}
                        onClose={() => setShowProfile(false)}
                        onJumpToMessage={(id) => jumpToMessage(id)}
                    />
                )}
            </div>
        </div>
    );
};

export default ChatView;
