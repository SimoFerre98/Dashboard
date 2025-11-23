import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Play, Info, Star, Heart } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const Home = () => {
    const [media, setMedia] = useState([]);
    const [featured, setFeatured] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const [folders, setFolders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [editData, setEditData] = useState({ title: '', description: '', tags: '', rating: 0, favorite: false, folder: '' });

    useEffect(() => {
        fetch(`${API_URL}/files`)
            .then(res => res.json())
            .then(data => {
                setMedia(data);
                if (data.length > 0) {
                    // Pick a random featured item
                    setFeatured(data[Math.floor(Math.random() * data.length)]);
                }
                setLoading(false);
            })
            .catch(err => console.error(err));
        fetch(`${API_URL}/folders`).then(r => r.json()).then(d => setFolders(d.folders || [])).catch(() => {});
    }, []);

    if (loading) return <div style={{ padding: '100px' }}>Loading...</div>;

    const params = new URLSearchParams(location.search);
    const typeFilter = params.get('type');
    const videos = media.filter(m => m.type === 'video');
    const images = media.filter(m => m.type === 'image');
    const rows = [];
    if (!typeFilter || typeFilter === 'video') rows.push({ title: 'My Videos', items: videos });
    if (!typeFilter || typeFilter === 'image') rows.push({ title: 'My Photos', items: images });

    const openModal = (item) => {
        setSelected(item);
        setEditData({
            title: item.title || '',
            description: item.description || '',
            tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
            rating: item.rating || 0,
            favorite: !!item.favorite,
            folder: item.folder || ''
        });
        setShowModal(true);
    };

    const saveMeta = () => {
        const body = {
            title: editData.title,
            description: editData.description,
            tags: editData.tags,
            rating: Number(editData.rating),
            favorite: !!editData.favorite,
            folder: editData.folder
        };
        fetch(`${API_URL}/files/${encodeURIComponent(selected.id)}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        }).then(r => r.json()).then(() => {
            setMedia(prev => prev.map(m => m.id === selected.id ? { ...m, ...body, tags: (typeof body.tags === 'string' ? body.tags.split(',').map(t => t.trim()).filter(Boolean) : body.tags) } : m));
            setShowModal(false);
        });
    };

    const createFolder = async () => {
        const name = prompt('Nome nuova cartella');
        if (!name) return;
        const res = await fetch(`${API_URL}/folders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
        const data = await res.json();
        setFolders(data.folders || folders);
    };

    return (
        <div className="home-page">
            {featured && (
                <div className="hero" style={{
                    height: '80vh',
                    position: 'relative',
                    backgroundImage: featured.type === 'image' ? `url(/media/${featured.path})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {featured.type === 'video' && (
                        <video
                            src={`/media/${featured.path}`}
                            autoPlay
                            muted
                            loop
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                zIndex: -1
                            }}
                        />
                    )}
                    <div className="hero-overlay" style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(to top, #141414 10%, transparent 90%)'
                    }} />

                    <div className="hero-content" style={{
                        position: 'relative',
                        zIndex: 10,
                        paddingLeft: '4%',
                        maxWidth: '50%'
                    }}>
                        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{featured.title || featured.name}</h1>
                        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textShadow: '1px 1px 2px black' }}>
                            {featured.description || 'No description available.'}
                        </p>
                        <div className="actions" style={{ display: 'flex', gap: '1rem' }}>
                            <Link to={`/watch/${encodeURIComponent(featured.id)}`} className="btn btn-primary">
                                <Play size={24} fill="currentColor" /> Play
                            </Link>
                            <button className="btn btn-secondary">
                                <Info size={24} /> More Info
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="content-rows" style={{ marginTop: '-100px', position: 'relative', zIndex: 20, paddingBottom: '50px' }}>
                <div style={{ padding: '0 4%', marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '0.5rem' }}>Cartelle</h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button className="btn btn-secondary" onClick={createFolder}>Crea cartella</button>
                        {folders.map(f => (
                            <Link key={f} to={`/?folder=${encodeURIComponent(f)}`} className="btn btn-secondary">{f}</Link>
                        ))}
                    </div>
                </div>
                {rows.map(r => (
                    <Row key={r.title} title={r.title} items={r.items} onOpen={openModal} />
                ))}
            </div>

            {showModal && selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
                    <div style={{ background: 'var(--surface-color)', color: 'var(--text-color)', padding: '20px', borderRadius: '8px', width: '800px', maxWidth: '95vw' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                {selected.type === 'video' ? (
                                    <video src={`/media/${selected.path}`} controls style={{ width: '100%', borderRadius: '4px' }} />
                                ) : (
                                    <img src={`/media/${selected.path}`} alt={selected.name} style={{ width: '100%', borderRadius: '4px', objectFit: 'cover' }} />
                                )}
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <input value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} placeholder="Titolo" style={{ padding: '8px', background: 'var(--bg-color)', border: 'none', color: 'var(--text-color)' }} />
                                <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} placeholder="Descrizione" style={{ padding: '8px', background: 'var(--bg-color)', border: 'none', color: 'var(--text-color)', minHeight: '80px' }} />
                                <input value={editData.tags} onChange={e => setEditData({ ...editData, tags: e.target.value })} placeholder="Tag (separati da virgola)" style={{ padding: '8px', background: 'var(--bg-color)', border: 'none', color: 'var(--text-color)' }} />
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={16} /> Voto</label>
                                    <input type="number" min="0" max="5" value={editData.rating} onChange={e => setEditData({ ...editData, rating: e.target.value })} style={{ width: '60px', padding: '6px' }} />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '10px' }}><Heart size={16} /> Preferito</label>
                                    <input type="checkbox" checked={editData.favorite} onChange={e => setEditData({ ...editData, favorite: e.target.checked })} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <label>Cartella</label>
                                    <select value={editData.folder} onChange={e => setEditData({ ...editData, folder: e.target.value })} style={{ padding: '6px' }}>
                                        <option value="">Nessuna</option>
                                        {folders.map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button className="btn btn-primary" onClick={saveMeta}>Salva</button>
                                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Chiudi</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Row = ({ title, items }) => {
    if (items.length === 0) return null;

    return (
        <div className="row" style={{ marginBottom: '3rem', padding: '0 4%' }}>
            <h2 style={{ marginBottom: '1rem' }}>{title}</h2>
            <div className="row-posters" style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                padding: '20px 0'
            }}>
                {items.map(item => (
                    <Link key={item.id} to={`/watch/${encodeURIComponent(item.id)}`} style={{ flex: '0 0 auto' }}>
                        <div className="poster" style={{
                            width: '200px',
                            height: '112px', // 16:9 aspect ratio roughly
                            backgroundColor: '#333',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            position: 'relative',
                            transition: 'transform 0.3s'
                        }}>
                            {item.type === 'image' ? (
                                <img src={`/media/${item.path}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <video src={`/media/${item.path}#t=1`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                            <div className="poster-info" style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '5px',
                                background: 'rgba(0,0,0,0.7)',
                                fontSize: '0.8rem'
                            }}>
                                {item.title || item.name}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Home;
