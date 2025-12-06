import React from 'react';
import { Bookmark, Paperclip } from 'lucide-react';

const MessageBubble = ({ message, isMe, onBookmark, onLinkMedia, isBookmarked }) => {
    return (
        <div className={`message-bubble ${isMe ? 'me' : 'them'}`} style={{
            alignSelf: isMe ? 'flex-end' : 'flex-start',
            maxWidth: '70%',
            marginBottom: '10px',
            position: 'relative'
        }}>
            <div className="bubble-content" style={{
                backgroundColor: isMe ? 'var(--primary-color)' : 'var(--surface-color)',
                color: isMe ? 'white' : 'var(--text-color)',
                padding: '10px 15px',
                borderRadius: '15px',
                borderBottomRightRadius: isMe ? '0' : '15px',
                borderBottomLeftRadius: isMe ? '15px' : '0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
                {!isMe && <div className="sender-name" style={{
                    fontSize: '0.8em',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    color: 'var(--primary-color)'
                }}>{message.sender}</div>}

                <div className="message-text">{message.text}</div>

                <div className="message-meta" style={{
                    fontSize: '0.7em',
                    opacity: 0.7,
                    marginTop: '4px',
                    textAlign: 'right',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px'
                }}>
                    <span>{message.time}</span>
                </div>
            </div>

            <div className="message-actions" style={{
                position: 'absolute',
                top: '50%',
                [isMe ? 'left' : 'right']: '-40px',
                transform: 'translateY(-50%)',
                display: 'flex',
                gap: '5px',
                opacity: 0,
                transition: 'opacity 0.2s'
            }}>
                <button onClick={onBookmark} style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isBookmarked ? '#FFD700' : 'var(--text-secondary)'
                }}>
                    <Bookmark size={16} fill={isBookmarked ? '#FFD700' : 'none'} />
                </button>
                <button onClick={onLinkMedia} style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)'
                }}>
                    <Paperclip size={16} />
                </button>
            </div>

            <style>{`
                .message-bubble:hover .message-actions {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default MessageBubble;
