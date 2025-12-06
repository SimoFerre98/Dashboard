import React from 'react';
import { Bookmark } from 'lucide-react';

const MessageBubble = React.memo(({ message, isMe, isBookmarked, onBookmark }) => {
    return (
        <div className="message-bubble" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isMe ? 'flex-end' : 'flex-start',
            maxWidth: '70%',
            alignSelf: isMe ? 'flex-end' : 'flex-start',
            position: 'relative'
        }}>
            {/* Sender Name */}
            {!isMe && (
                <span style={{
                    fontSize: '0.75em',
                    color: '#e50914',
                    marginBottom: '4px',
                    marginLeft: '4px',
                    fontWeight: 'bold'
                }}>
                    {message.sender}
                </span>
            )}

            {/* Bubble */}
            <div style={{
                backgroundColor: isMe ? '#e50914' : 'var(--surface-color)',
                color: isMe ? '#fff' : 'var(--text-color)',
                padding: '10px 15px',
                borderRadius: '12px',
                borderTopRightRadius: isMe ? '2px' : '12px',
                borderTopLeftRadius: isMe ? '12px' : '2px',
                position: 'relative',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}>
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.95em' }}>
                    {message.text}
                </div>

                {/* Meta & Actions */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '15px',
                    marginTop: '6px',
                    paddingTop: '4px',
                }}>
                    <span style={{ fontSize: '0.7em', opacity: 0.7, minWidth: 'fit-content' }}>
                        {message.time || message.date}
                    </span>

                    <button
                        onClick={(e) => { e.stopPropagation(); onBookmark(); }}
                        title="Bookmark Message"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            color: isBookmarked ? '#ffd700' : 'rgba(255,255,255,0.4)',
                            opacity: isBookmarked ? 1 : 0.6,
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'color 0.2s, opacity 0.2s'
                        }}
                    >
                        <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                </div>
            </div>
        </div>
    );
});

export default MessageBubble;
