import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (login(username, password)) {
            navigate(from, { replace: true });
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="login-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)'
        }}>
            <div className="login-box" style={{
                backgroundColor: 'var(--surface-color)',
                padding: '60px 68px 40px',
                borderRadius: '4px',
                width: '100%',
                maxWidth: '450px',
                minHeight: '500px'
            }}>
                <h1 style={{ marginBottom: '28px', fontSize: '32px', fontWeight: 'bold' }}>Sign In</h1>

                {error && (
                    <div style={{
                        backgroundColor: '#e87c03',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        marginBottom: '16px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '16px 20px',
                                backgroundColor: 'var(--surface-color)',
                                border: 'none',
                                borderRadius: '4px',
                                color: 'var(--text-color)',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '16px 20px',
                                backgroundColor: 'var(--surface-color)',
                                border: 'none',
                                borderRadius: '4px',
                                color: 'var(--text-color)',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            marginTop: '24px',
                            padding: '16px',
                            backgroundColor: 'var(--primary-color)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#f40612'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary-color)'}
                    >
                        Sign In
                    </button>
                </form>

                <div style={{ marginTop: '16px', color: '#737373', fontSize: '13px' }}>
                    <p>Use <b>root</b> / <b>password</b> to login.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
