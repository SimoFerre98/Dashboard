import React, { useState, useEffect } from 'react';
import ChatList from '../components/Chat/ChatList';
import ChatView from '../components/Chat/ChatView';

const Chats = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatContent, setChatContent] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3001/api/chats')
            .then(res => res.json())
            .then(data => setChats(data))
            .catch(err => console.error('Failed to load chats:', err));
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetch(`http://localhost:3001/api/chats/${selectedChat.id}/content`)
                .then(res => {
                    if (selectedChat.type === 'telegram') return res.json();
                    return res.text();
                })
                .then(data => setChatContent(data))
                .catch(err => console.error('Failed to load chat content:', err));
        } else {
            setChatContent(null);
        }
    }, [selectedChat]);

    const handleBookmark = async (messageId) => {
        if (!selectedChat) return;

        const currentBookmarks = selectedChat.bookmarks || [];
        const isBookmarked = currentBookmarks.includes(messageId);

        let newBookmarks;
        if (isBookmarked) {
            newBookmarks = currentBookmarks.filter(id => id !== messageId);
        } else {
            newBookmarks = [...currentBookmarks, messageId];
        }

        // Optimistic update
        const updatedChat = { ...selectedChat, bookmarks: newBookmarks };
        setSelectedChat(updatedChat);
        setChats(prev => prev.map(c => c.id === updatedChat.id ? updatedChat : c));

        try {
            await fetch(`http://localhost:3001/api/files/${selectedChat.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookmarks: newBookmarks })
            });
        } catch (err) {
            console.error('Failed to save bookmark:', err);
            // Revert on error would be ideal here
        }
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 68px)', marginTop: '68px' }}>
            <ChatList chats={chats} selectedChat={selectedChat} onSelectChat={setSelectedChat} />
            <ChatView chat={selectedChat} content={chatContent} onBookmark={handleBookmark} />
        </div>
    );
};

export default Chats;
