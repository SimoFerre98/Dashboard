import React from 'react';
import { Bookmark, Paperclip } from 'lucide-react';

const MessageBubble = ({ message, isMe, isBookmarked, onBookmark, onLinkMedia }) => {
    return (
        <div className="message-bubble" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isMe ? 'flex-end' : 'flex-start',
            maxWidth: '70%',
            alignSelf: isMe ? 'flex-end' : 'flex-start', // Important for flex container
            position: 'relative',
            group: 'bubble'
        }}>
            {/* Sender Name */}
            {!isMe && (
                <span style={{
                    fontSize: '0.75em',
                    color: '#e50914', // Netflix Red
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
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {message.text}
                </div>

                {/* Meta & Actions */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between', // Split elements
                    gap: '10px',
                    marginTop: '5px',
                    minWidth: '100px', // Ensure space for icons
                    paddingTop: '5px',
                    borderTop: '1px solid rgba(255,255,255,0.1)'

export default MessageBubble;
