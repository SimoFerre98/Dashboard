import React from 'react';
import ChatList from '../components/Chat/ChatList';
import ChatView from '../components/Chat/ChatView';

const Chats = () => {
    const [selectedChat, setSelectedChat] = React.useState(null);
    const [chatContent, setChatContent] = React.useState(null);
    const [jumpToMessageId, setJumpToMessageId] = React.useState(null);

    React.useEffect(() => {
        if (selectedChat) {
            fetch(`http://localhost:3001/api/chats/${selectedChat.id}/content`)
                .then(res => res.text()) // Read as text first
                .then(text => {
                    try {
                        return JSON.parse(text); // Try to parse as JSON (Telegram)
                    } catch {
                        return text; // Fallback to raw text (WhatsApp)
                    }
                })
                .then(data => setChatContent(data))
                .catch(err => {
                    console.error('Failed to load content:', err);
                    setChatContent(null);
                });
        } else {
            setChatContent(null);
        }
    }, [selectedChat]);

    const handleSelectChat = (chat, messageId = null) => {
        setSelectedChat(chat);
        setJumpToMessageId(messageId);
    };

    const handleBookmark = (messageId) => {
        if (!selectedChat) return;

        const currentBookmarks = selectedChat.bookmarks || [];
        // Ensure we compare numbers/strings consistently
        const newBookmarks = currentBookmarks.some(id => String(id) === String(messageId))
            ? currentBookmarks.filter(id => String(id) !== String(messageId))
            : [...currentBookmarks, messageId];

        // Optimistic UI update
        setSelectedChat(prev => ({ ...prev, bookmarks: newBookmarks }));

        // API call
        fetch(`http://localhost:3001/api/files/${selectedChat.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookmarks: newBookmarks })
        }).catch(err => {
            console.error('Failed to save bookmark:', err);
            // Revert on error would go here
        });
    };

    return (
        <div className="chats-page" style={{
            height: 'calc(100vh - 68px)', // Subtract navbar height
            marginTop: '68px',
            display: 'flex',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            overflow: 'hidden'
        }}>
            <ChatList
                onSelectChat={handleSelectChat}
                selectedChat={selectedChat}
            />
            <ChatView
                chat={selectedChat}
                content={chatContent}
                onBookmark={handleBookmark}
                initialJumpToMessageId={jumpToMessageId}
            />
        </div>
    );
};

export default Chats;
