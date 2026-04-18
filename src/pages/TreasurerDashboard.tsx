import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/superAdmin.module.css';
import { Wallet, DollarSign, ShieldCheck, Search, User } from 'lucide-react';
import { getApiUrl } from '../config/environment';
import TreasurerSidebar, { TreasurerSection } from '../components/TreasurerSidebar';
import FinancePanel from '../components/finance/FinancePanel';

const TreasurerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<TreasurerSection>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(true);
    const [balance, setBalance] = useState({ total_in: 0, total_out: 0, balance: 0 });

    useEffect(() => {
        // Authenticate and fetch initial data
        const checkAuth = async () => {
            try {
                const response = await axios.get(getApiUrl('superAdminVerify'), { withCredentials: true });
                if (!response.data.valid) {
                    navigate('/signIn');
                }
                
                // Fetch balance for overview
                const balRes = await axios.get('/api/finance/transactions/balance', { withCredentials: true });
                setBalance(balRes.data);
                
                setLoading(false);
                setTimeout(() => setShowWelcome(false), 3000);
            } catch (err) {
                navigate('/signIn');
            }
        };
        checkAuth();
        
        // Listen for sidebar toggle from Header
        const handleToggle = () => setSidebarOpen(prev => !prev);
        window.addEventListener('toggleTreasurerSidebar', handleToggle);
        return () => window.removeEventListener('toggleTreasurerSidebar', handleToggle);
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await axios.post(getApiUrl('superAdminLogout'), {}, { withCredentials: true });
            navigate('/signIn');
        } catch (err) {
            console.error('Logout failed');
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingOverlay}>
                <div className={styles.loader}></div>
                <p>Securing Financial Portal...</p>
            </div>
        );
    }

    const renderOverview = () => (
        <div className={styles.dashboardGrid}>
            <div className={styles.statCard} style={{ 
                background: 'linear-gradient(135deg, #730051 0%, #a21caf 100%)',
                color: '#fff',
                boxShadow: '0 10px 30px rgba(115, 0, 81, 0.2)'
            }}>
                <div className={styles.statIcon}><DollarSign size={24} /></div>
                <div className={styles.statInfo}>
                    <h3>Total Income</h3>
                    <p className={styles.statValue}>KES {balance.total_in.toLocaleString()}</p>
                    <span className={styles.statTrend}>↑ 12% from last month</span>
                </div>
            </div>
            
            <div className={styles.statCard} style={{ 
                background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
                color: '#fff'
            }}>
                <div className={styles.statIcon}><Wallet size={24} /></div>
                <div className={styles.statInfo}>
                    <h3>Total Expenses</h3>
                    <p className={styles.statValue}>KES {balance.total_out.toLocaleString()}</p>
                    <span className={styles.statTrend}>↓ 5% saved this week</span>
                </div>
            </div>

            <div className={styles.statCard} style={{ 
                background: 'linear-gradient(135deg, #c9a227 0%, #854d0e 100%)',
                color: '#fff'
            }}>
                <div className={styles.statIcon}><ShieldCheck size={24} /></div>
                <div className={styles.statInfo}>
                    <h3>Net Balance</h3>
                    <p className={styles.statValue}>KES {balance.balance.toLocaleString()}</p>
                    <span className={styles.statTrend}>Secured & Audited</span>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {renderOverview()}
                        <div style={{ marginTop: '2rem' }}>
                            <FinancePanel initialTab="dashboard" />
                        </div>
                    </div>
                );
            case 'transactions':
                return <FinancePanel initialTab="transactions" />;
            case 'requisitions':
                return <FinancePanel initialTab="requisitions" />;
            case 'assets':
                return <FinancePanel initialTab="assets" />;
            case 'reports':
                return <FinancePanel initialTab="reports" />;
            case 'mpesa':
                return <FinancePanel initialTab="mpesa" />;
            case 'audit':
                return <FinancePanel initialTab="auditLogs" />;
            case 'settings':
                return <div className={styles.panelCard}><h3>Account Settings</h3><p>Manage your Treasurer profile and notification preferences.</p></div>;
            default:
                return renderOverview();
        }
    };

    return (
        <div className={styles.container}>
            {showWelcome && (
                <div className={styles.welcomeSplash}>
                    <div className={styles.splashContent}>
                        <div className={styles.splashIcon}><ShieldCheck size={48} color="#c9a227" /></div>
                        <h1>Welcome, Treasurer</h1>
                        <p>KSUCU-MC Financial Portal</p>
                    </div>
                </div>
            )}

            <TreasurerSidebar 
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onLogout={handleLogout}
            />

            <main className={styles.mainContent}>
                <header className={styles.contentHeader} style={{ position: 'sticky', top: '70px', zIndex: 10, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', padding: '1rem 2rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className={styles.headerTitle}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.025em' }}>
                            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace('-', ' ')}
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
                            Managing KSUCU-MC Finance & Assets
                        </p>
                    </div>
                    
                    <div className={styles.headerActions} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                placeholder="Search financial records..." 
                                style={{ padding: '0.625rem 1rem 0.625rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', width: '240px', fontSize: '0.875rem', outline: 'none' }}
                            />
                        </div>
                        <div className={styles.userBadge} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#730051', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                <User size={16} />
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>Treasurer</span>
                        </div>
                    </div>
                </header>

                <div className={styles.scrollArea}>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default TreasurerDashboard;
