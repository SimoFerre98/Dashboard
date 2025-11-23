import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Search, Bell, User, Settings as SettingsIcon } from 'lucide-react';

const Layout = () => {
    const location = useLocation();
    const isScrolled = React.useRef(false);
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            const isTop = window.scrollY < 50;
            if (isTop !== true) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="app-layout">
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} style={{
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 100,
                padding: '0 4%',
                height: '68px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: scrolled ? '#141414' : 'linear-gradient(to bottom, rgba(0,0,0,0.7) 10%, rgba(0,0,0,0))',
                transition: 'background-color 0.3s'
            }}>
                <div className="left" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e50914', textDecoration: 'none' }}>
                        MYFLIX
                    </Link>
                    <div className="links" style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                        <Link to="/">Home</Link>
                        <Link to="/?type=video">Videos</Link>
                        <Link to="/?type=image">Photos</Link>
                    </div>
                </div>

                <div className="right" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <Search size={20} style={{ cursor: 'pointer' }} />
                    <Link to="/settings">
                        <SettingsIcon size={20} style={{ cursor: 'pointer' }} />
                    </Link>
                    <div className="profile">
                        <User size={20} style={{ cursor: 'pointer' }} />
                    </div>
                </div>
            </nav>

            <main style={{ minHeight: '100vh' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
