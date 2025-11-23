import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const Home = () => {
    const [media, setMedia] = useState([]);
    const [featured, setFeatured] = useState(null);
    const [loading, setLoading] = useState(true);

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
    }, []);

    if (loading) return <div style={{ padding: '100px' }}>Loading...</div>;

    const videos = media.filter(m => m.type === 'video');
    const images = media.filter(m => m.type === 'image');

    return (
        <div className="home-page">
            {featured && (
                <div className="hero" style={{
                    height: '80vh',
                    position: 'relative',
                    backgroundImage: featured.type === 'image' ? `url(http://localhost:3001/media/${featured.path})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {featured.type === 'video' && (
                        <video
                            src={`http://localhost:3001/media/${featured.path}`}
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
                <Row title="My Videos" items={videos} />
                <Row title="My Photos" items={images} />
            </div>
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
                                <img src={`http://localhost:3001/media/${item.path}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <video src={`http://localhost:3001/media/${item.path}#t=1`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
