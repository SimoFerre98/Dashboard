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
                .then(res => res.json())
                .catch(err => {
                    // Start of rudimentary error handling for text files which might not parse as JSON if generic endpoint was used incorrectly?
                    // Actually endpoint discriminates. Text comes as separate response.
                    // Let's refine fetch logic in effect.
                    return res.text().then(text => {
                        // Attempt JSON parse in case backend sent JSON (telegram)
                        try {
                            return JSON.parse(text);
                        } catch {
                            return text;
                        }
                    });
                })
                .then(data => setChatContent(data))
                .catch(err => console.error('Failed to load content:', err));
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
        const newBookmarks = currentBookmarks.includes(messageId)
            ? currentBookmarks.filter(id => id !== messageId)
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
