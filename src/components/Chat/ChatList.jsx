import React from 'react';

const ChatList = ({ onSelectChat, selectedChat }) => {
    const [chats, setChats] = React.useState([]);
    const [globalSearch, setGlobalSearch] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [isSearching, setIsSearching] = React.useState(false);

    React.useEffect(() => {
        fetch('http://localhost:3001/api/chats')
            .then(res => res.json())
            .then(data => setChats(data))
            .catch(err => console.error('Failed to load chats:', err));
    }, []);

    React.useEffect(() => {
        if (globalSearch.length < 3) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            setIsSearching(true);
            fetch(`http://localhost:3001/api/search?q=${globalSearch}`)
                .then(res => res.json())
                .then(data => {
                    setSearchResults(data.results || []);
                    setIsSearching(false);
                })
                .catch(err => {
                    console.error(err);
                    setIsSearching(false);
                });
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [globalSearch]);

    return (
        <div className="chat-list" style={{
            width: '300px',
            flexShrink: 0,
            borderRight: '1px solid var(--surface-color)',
            height: '100%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h2 style={{ padding: '20px 20px 10px', fontSize: '1.2em' }}>Chats</h2>

            <div style={{ padding: '0 20px 20px' }}>
                <input
                    type="text"
                    placeholder="Search all chats..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--surface-color)',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'var(--text-color)',
                        outline: 'none'
                    }}
                />
            </div>

            {globalSearch.length >= 3 && (
                <div style={{ borderBottom: '1px solid var(--surface-color)', paddingBottom: '10px' }}>
                    <div style={{ padding: '0 20px', fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        Search Results {isSearching ? '(Searching...)' : `(${searchResults.length})`}
                    </div>
                    {searchResults.map((result, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                // Find full chat object
                                const chatObj = chats.find(c => c.id === result.chatId);
                                if (chatObj) {
                                    onSelectChat(chatObj, result.messageId);
                                    setGlobalSearch(''); // Clear search after selection
                                }
                            }}
                            style={{
                                padding: '10px 20px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #1a1a1a',
                                fontSize: '0.9em'
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#262626'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{result.chatName}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>{result.sender}: {result.text}</div>
                        </div>
                    ))}
                    {searchResults.length === 0 && !isSearching && (
                        <div style={{ padding: '0 20px', color: '#666' }}>No matches found</div>
                    )}
                </div>
            )}

            {globalSearch.length < 3 && chats.map(chat => (
                <div
                    key={chat.id}
                    onClick={() => onSelectChat(chat)}
                    style={{
                        padding: '15px 20px',
                        cursor: 'pointer',
                        backgroundColor: selectedChat?.id === chat.id ? 'var(--surface-color)' : 'transparent',
                        borderBottom: '1px solid #1a1a1a',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={e => { if (selectedChat?.id !== chat.id) e.currentTarget.style.backgroundColor = '#262626'; }}
                    onMouseOut={e => { if (selectedChat?.id !== chat.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{chat.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                        <span style={{
                            textTransform: 'uppercase',
                            fontSize: '0.7em',
                            padding: '2px 4px',
                            borderRadius: '3px',
                            backgroundColor: chat.type === 'whatsapp' ? '#25D36633' : '#0088cc33',
                            color: chat.type === 'whatsapp' ? '#25D366' : '#0088cc'
                        }}>
                            {chat.type}
                        </span>
                        <span>{new Date(chat.mtime).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChatList;
