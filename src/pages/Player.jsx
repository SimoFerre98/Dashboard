import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const Player = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [showControls, setShowControls] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [metadata, setMetadata] = useState({ title: '', description: '' });

    useEffect(() => {
        // Fetch all files to find the one (not efficient but works for prototype)
        fetch(`${API_URL}/files`)
            .then(res => res.json())
            .then(data => {
                const found = data.find(f => f.id === decodeURIComponent(id));
                if (found) {
                    setItem(found);
                    setMetadata({ title: found.title || '', description: found.description || '' });
                }
            });
    }, [id]);

    const handleSave = () => {
        fetch(`${API_URL}/files/${encodeURIComponent(id)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metadata)
        })
            .then(res => res.json())
            .then(() => {
                setIsEditing(false);
                // Refresh item
                setItem(prev => ({ ...prev, ...metadata }));
            });
    };

    if (!item) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;

    return (
        <div className="player-page" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'black',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div className="back-btn" style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 210,
                cursor: 'pointer',
                background: 'rgba(0,0,0,0.5)',
                padding: '10px',
                borderRadius: '50%'
            }} onClick={() => navigate(-1)}>
                <ArrowLeft color="white" />
            </div>

            {item.type === 'video' ? (
                <video
                    src={`/media/${item.path}`}
                    controls
                    autoPlay
                    style={{ width: '100%', height: '100%', maxHeight: '100vh' }}
                />
            ) : (
                <img
                    src={`/media/${item.path}`}
                    alt={item.name}
                    style={{ maxWidth: '100%', maxHeight: '100vh', objectFit: 'contain' }}
                />
            )}

            <div className="info-panel" style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                background: 'rgba(0,0,0,0.7)',
                padding: '20px',
                borderRadius: '8px',
                maxWidth: '500px',
                zIndex: 210
            }}>
                {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            value={metadata.title}
                            onChange={e => setMetadata({ ...metadata, title: e.target.value })}
                            placeholder="Title"
                            style={{ padding: '5px', background: '#333', border: 'none', color: 'white' }}
                        />
                        <textarea
                            value={metadata.description}
                            onChange={e => setMetadata({ ...metadata, description: e.target.value })}
                            placeholder="Description"
                            style={{ padding: '5px', background: '#333', border: 'none', color: 'white', minHeight: '60px' }}
                        />
                        <button onClick={handleSave} className="btn btn-primary">Save</button>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h2 style={{ margin: 0 }}>{item.title || item.name}</h2>
                            <Edit size={16} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setIsEditing(true)} />
                        </div>
                        <p>{item.description || 'No description'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Player;
