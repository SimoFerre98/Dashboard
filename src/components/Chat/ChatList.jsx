import React from 'react';

const ChatList = ({ onSelectChat, selectedChat }) => {
    const [chats, setChats] = React.useState([]);

    React.useEffect(() => {
        fetch('http://localhost:3001/api/chats')
            .then(res => res.json())
            .then(data => setChats(data))
            .catch(err => console.error('Failed to load chats:', err));
    }, []);

    return (
        <div className="chat-list" style={{
            width: '300px',
            flexShrink: 0,
            borderRight: '1px solid var(--surface-color)',
            height: '100%',
            overflowY: 'auto'
        }}>
            <h2 style={{ padding: '20px 20px 10px', fontSize: '1.2em' }}>Chats</h2>
            {chats.map(chat => (
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
