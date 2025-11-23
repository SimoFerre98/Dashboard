import React from 'react';

const Settings = () => {
    const [theme, setTheme] = React.useState(() => {
        return localStorage.getItem('dashboard_theme') || 'dark';
    });

    const applyTheme = (nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('dashboard_theme', nextTheme);
    };

    const handleToggle = (e) => {
        const nextTheme = e.target.checked ? 'light' : 'dark';
        setTheme(nextTheme);
        applyTheme(nextTheme);
    };

    React.useEffect(() => {
        applyTheme(theme);
    }, []);

    return (
        <div style={{ paddingTop: '100px', paddingLeft: '4%', paddingRight: '4%' }}>
            <h1 style={{ marginBottom: '1rem' }}>Impostazioni</h1>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                backgroundColor: 'var(--surface-color)',
                color: 'var(--text-color)',
                padding: '1rem',
                borderRadius: '8px',
                maxWidth: '480px'
            }}>
                <label htmlFor="theme-toggle" style={{ fontWeight: 'bold' }}>Tema</label>
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>
                    {theme === 'light' ? 'Chiaro' : 'Scuro'}
                </span>
                <input
                    id="theme-toggle"
                    type="checkbox"
                    checked={theme === 'light'}
                    onChange={handleToggle}
                    style={{ width: '40px', height: '20px' }}
                />
            </div>
        </div>
    );
};

export default Settings;
