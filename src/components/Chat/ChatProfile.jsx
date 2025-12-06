import React from 'react';
import { X, Bookmark, Image, User } from 'lucide-react';

const ChatProfile = ({ chat, messages, onClose, onJumpToMessage }) => {
    const [activeTab, setActiveTab] = React.useState('bookmarks'); // bookmarks, media, person

    const bookmarkedMessages = React.useMemo(() => {
        if (!chat || !messages) return [];
        const ids = chat.bookmarks || [];
        return messages.filter(m => ids.includes(m.id));
    }, [chat, messages]);

    return (
        <div className="chat-profile" style={{
            width: '300px',
            borderLeft: '1px solid var(--surface-color)',
            height: '100%',
            backgroundColor: 'var(--bg-color)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
        }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--surface-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Chat Info</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-color)' }}>
                <button
                    onClick={() => setActiveTab('bookmarks')}
                    style={{ flex: 1, padding: '10px', background: activeTab === 'bookmarks' ? 'var(--surface-color)' : 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}
                >
                    <Bookmark size={16} />
                </button>
                <button
                    onClick={() => setActiveTab('media')}
                    style={{ flex: 1, padding: '10px', background: activeTab === 'media' ? 'var(--surface-color)' : 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}
                >
                    <Image size={16} />
                </button>
                <button
                    onClick={() => setActiveTab('person')}
                    style={{ flex: 1, padding: '10px', background: activeTab === 'person' ? 'var(--surface-color)' : 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}
                >
                    <User size={16} />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {activeTab === 'bookmarks' && (
                    <div className="bookmarks-list">
                        <h4 style={{ marginTop: 0 }}>Saved Messages ({bookmarkedMessages.length})</h4>
                        {bookmarkedMessages.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No saved messages.</p>}
                        {bookmarkedMessages.map(msg => (
                            <div
                                key={msg.id}
                                onClick={() => onJumpToMessage(msg.id)}
                                style={{
                                    padding: '10px',
                                    backgroundColor: 'var(--surface-color)',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    cursor: 'pointer',
                                    fontSize: '0.9em'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginBottom: '4px', color: 'var(--primary-color)' }}>{msg.sender}</div>
                                <div style={{ maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.text}</div>
                                <div style={{ fontSize: '0.7em', color: 'var(--text-secondary)', marginTop: '4px' }}>{msg.date || msg.time}</div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'media' && (
                    <div className="media-list">
                        <h4 style={{ marginTop: 0 }}>Linked Media</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>Select media to link to this chat.</p>
                        <button style={{
                            width: '100%',
                            padding: '8px',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>Add Media</button>
                        {/* TODO: Implement media gallery */}
                    </div>
                )}

                {activeTab === 'person' && (
                    <div className="person-info">
                        <h4 style={{ marginTop: 0 }}>Person Identity</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>Link this chat to a person profile.</p>
                        <select style={{ width: '100%', padding: '8px', backgroundColor: 'var(--surface-color)', color: 'var(--text-color)', border: 'none', borderRadius: '4px' }}>
                            <option value="">Select Person...</option>
                            <option value="new">+ Create New Person</option>
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatProfile;
