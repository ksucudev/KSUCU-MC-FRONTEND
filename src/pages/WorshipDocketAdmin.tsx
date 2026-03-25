import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ModernNewsDisplay from '../components/ModernNewsDisplay';
import styles from '../styles/worshipDocketAdmin.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faCheckCircle,
    faArrowRight,
    faNewspaper,
    faBox,
    faBookOpen,
    faHeart,
    faSignOutAlt,
    faComments,
    faSearch
} from '@fortawesome/free-solid-svg-icons';
import { useOverseerAuth } from '../hooks/useOverseerAuth';

const WorshipDocketAdmin: React.FC = () => {
    const navigate = useNavigate();
    const { authenticated, loading: authLoading, login, logout } = useOverseerAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [message, setMessage] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [search, setSearch] = useState('');

    const handleLogin = async () => {
        setLoginLoading(true);
        const result = await login(email, password);
        if (result.success) {
            setAuthError('');
            setMessage('Successfully logged in to Leadership Admin');
            setTimeout(() => setMessage(''), 3000);
        } else {
            setAuthError(result.message || 'Invalid password');
            setTimeout(() => setAuthError(''), 3000);
        }
        setPassword('');
        setEmail('');
        setLoginLoading(false);
    };

    const handleLogout = async () => {
        await logout();
        setMessage('Logged out successfully');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleRoleSelection = () => {
        const role = 'Executive Admin';
        setSelectedRole(role);
        setMessage(`Redirecting to attendance management...`);
        setTimeout(() => {
            sessionStorage.setItem('leadershipRole', role);
            navigate(`/attendance-session-management?role=${encodeURIComponent(role)}`);
        }, 800);
    };

    const adminModules = useMemo(() => [
        { title: 'Attendance', desc: 'Multi-session attendance manager', icon: faUsers, keywords: ['session', 'sign', 'register', 'leadership'], action: handleRoleSelection },
        { title: 'News', desc: 'Manage news, events & photos', icon: faNewspaper, keywords: ['events', 'updates', 'photos', 'countdown'], action: () => navigate('/news-admin') },
        { title: 'Media Gallery', desc: 'Photos & media management', icon: faUsers, keywords: ['gallery', 'images', 'upload'], action: () => navigate('/media-admin') },
        { title: 'Requisitions', desc: 'Equipment requests & approvals', icon: faBox, keywords: ['equipment', 'approve', 'request', 'supplies'], action: () => navigate('/requisitions-admin') },
        { title: 'Bible Study', desc: 'Registrations & group management', icon: faBookOpen, keywords: ['groups', 'residence', 'bs', 'study'], action: () => navigate('/adminBs') },
        { title: 'Compassion', desc: 'Help requests & donations', icon: faHeart, keywords: ['counseling', 'donate', 'support', 'help'], action: () => navigate('/compassion-counseling-admin') },
        { title: 'Chat', desc: 'Community chat moderation', icon: faComments, keywords: ['moderate', 'messages', 'ban', 'community'], action: () => navigate('/chat-admin') },
    ], [navigate]);

    if (authLoading) {
        return (
            <div className={styles.container}>
                <p style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>Verifying session...</p>
            </div>
        );
    }

    if (!authenticated) {
        return (
            <>
                <div className={styles.container}>
                    <div className={styles.loginCard}>
                        <h2>Overseer Login</h2>
                        <p>Sign in with your overseer credentials</p>

                        {authError && (
                            <div className={styles.error}>
                                {authError}
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <input
                                type="email"
                                className={styles.passwordInput}
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loginLoading}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <input
                                type="password"
                                className={styles.passwordInput}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                disabled={loginLoading}
                            />
                        </div>

                        <button
                            className={styles.loginButton}
                            onClick={handleLogin}
                            disabled={loginLoading || !email || !password}
                        >
                            {loginLoading ? 'Logging in...' : 'Log In'}
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.adminHeader}>
                    <h1>
                        <FontAwesomeIcon icon={faUsers} />
                        Overseer Dashboard
                    </h1>
                    <button
                        onClick={handleLogout}
                        className={styles.logoutBtn}
                        title="Sign out"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        Log Out
                    </button>
                </div>

                {message && (
                    <div className={styles.message}>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        {message}
                    </div>
                )}

                {/* Search */}
                <div className={styles.searchBar}>
                    <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search modules... e.g. attendance, news, chat"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Main Admin Functions Grid */}
                <div className={styles.adminFunctionsGrid}>
                    {adminModules
                        .filter(m => {
                            if (!search.trim()) return true;
                            const q = search.toLowerCase();
                            return m.title.toLowerCase().includes(q) ||
                                   m.desc.toLowerCase().includes(q) ||
                                   m.keywords.some(k => k.includes(q));
                        })
                        .map((m, i) => (
                            <div className={styles.functionCard} key={m.title}>
                                <div className={styles.functionNumber}>{i + 1}</div>
                                <div className={styles.functionContent}>
                                    <h3><FontAwesomeIcon icon={m.icon} /> {m.title}</h3>
                                    <p>{m.desc}</p>
                                    <button
                                        className={styles.functionButton}
                                        onClick={m.action}
                                        disabled={m.title === 'Attendance' && selectedRole !== ''}
                                    >
                                        Open <FontAwesomeIcon icon={faArrowRight} className={styles.arrowIcon} />
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </div>

                {/* News Display Section - Moved to bottom */}
                <div className={styles.newsDisplaySection}>
                    <div className={styles.newsDisplayCard}>
                        <h2>
                            <FontAwesomeIcon icon={faNewspaper} />
                            Latest News & Events
                        </h2>
                        <div className={styles.newsDisplayContainer}>
                            <ModernNewsDisplay />
                        </div>
                    </div>
                </div>

                {selectedRole && (
                    <div className={styles.loadingSection}>
                        <div className={styles.loadingMessage}>
                            <FontAwesomeIcon icon={faUsers} className={styles.loadingIcon} />
                            <h3>Loading attendance management for {selectedRole}...</h3>
                            <p>Preparing session controls and attendance records...</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default WorshipDocketAdmin;
