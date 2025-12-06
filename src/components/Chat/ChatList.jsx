import React from 'react';
import { MessageSquare } from 'lucide-react';

const ChatList = ({ chats, selectedChat, onSelectChat }) => {
    return (
        <div className="chat-list" style={{
            width: '300px',
            flexShrink: 0,
            borderRight: '1px solid var(--surface-color)',
            height: '100%',
            overflowY: 'auto'
        }}>
            <h2 style={{ padding: '20px', margin: 0 }}>Chats</h2>
            <div className="list">
                {chats.map(chat => (
                    <div
                        key={chat.id}
                        onClick={() => onSelectChat(chat)}
                        style={{
                            padding: '15px 20px',
                            cursor: 'pointer',
                            backgroundColor: selectedChat?.id === chat.id ? 'var(--surface-color)' : 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: chat.type === 'whatsapp' ? '#25D366' : '#0088cc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <MessageSquare size={20} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {chat.name}
                            </div>
                            <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                                {new Date(chat.mtime).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatList;
