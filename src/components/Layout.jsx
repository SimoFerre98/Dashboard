import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const location = useLocation();
    const isScrolled = React.useRef(false);
    const [scrolled, setScrolled] = React.useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

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
                background: 'var(--bg-color)',
                transition: 'background-color 0.3s'
            }}>
                <div className="left" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)', textDecoration: 'none' }}>
                        MYFLIX
                    </Link>
                    <div className="links" style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                        <Link to="/">Home</Link>
                        <Link to="/?type=video">Videos</Link>
                        <Link to="/?type=image">Photos</Link>
                        <Link to="/chats">Chats</Link>
                    </div>
                </div>

                <div className="right" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <Search size={20} style={{ cursor: 'pointer' }} />
                    <Link to="/settings">
                        <SettingsIcon size={20} style={{ cursor: 'pointer' }} />
                    </Link>
                    <div className="profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <User size={20} style={{ cursor: 'pointer' }} />
                        <button
                            className="btn btn-secondary"
                            onClick={() => { logout(); navigate('/login'); }}
                        >Logout</button>
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
