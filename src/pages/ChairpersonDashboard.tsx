import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styles from '../styles/superAdmin.module.css';
import { X, Search, RefreshCw, User, Mail, Phone, BookOpen, Wallet, Gem, ShieldCheck, Layers, Users, MessageSquare, Bell } from 'lucide-react';
import { getApiUrl, getImageUrl } from '../config/environment';
import letterhead from '../assets/letterhead.png';
import ChairpersonSidebar, { ChairpersonSection } from '../components/ChairpersonSidebar';
import { financeApi } from '../services/financeApi';
import FinancePanel from '../components/finance/FinancePanel';
import AnalyticsCharts from '../components/patron/AnalyticsCharts';
import ChairpersonAssets from '../components/patron/PatronAssets';
import { parseEts, parseMinistries } from '../utils/constants';
import cuLogo from '../assets/cuLogoUAR.png';

interface User {
    _id: string;
    username: string;
    email: string;
    phone: string;
    reg: string;
    course: string;
    yos: string;
    ministry: string;
    et: string;
    profilePhoto?: string;
    createdAt?: string;
}

interface FinanceTransaction {
    _id: string;
    type: string;
    category: string;
    amount: number;
    source: string;
    createdAt: string;
}

interface Message {
    _id: string;
    subject: string;
    message: string;
    category: string;
    isAnonymous: boolean;
    senderInfo?: {
        username?: string;
        email?: string;
        ministry?: string;
        yos?: number;
    };
    timestamp: string;
    isRead: boolean;
    status: string;
}

interface MediaItem {
    _id?: string;
    event: string;
    date: string;
    link: string;
    imageUrl?: string;
}

interface Notification {
    id: string;
    title: string;
    description: string;
    type: 'asset' | 'finance' | 'feedback' | 'user';
    timestamp: Date;
    read: boolean;
    targetSection: ChairpersonSection;
}

const ChairpersonDashboard: React.FC = () => {
    const navigate = useNavigate();

    // Data state
    const [users, setUsers] = useState<User[]>([]);
    const [userCount, setUserCount] = useState<number>(0);
    const [usersByYos, setUsersByYos] = useState<{ [key: string]: number }>({});
    const [usersByMinistry, setUsersByMinistry] = useState<{ [key: string]: number }>({});
    const [usersByEt, setUsersByEt] = useState<{ [key: string]: number }>({});
    const [messages, setMessages] = useState<Message[]>([]);
    const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>([]);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [financeLoading, setFinanceLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalAssetValue, setTotalAssetValue] = useState<number>(0);
    const [accountBalance, setAccountBalance] = useState<number>(0);
    const [studentsInMinistries, setStudentsInMinistries] = useState<number>(0);
    const [studentsInEts, setStudentsInEts] = useState<number>(0);
    const [assets, setAssets] = useState<any[]>([]);

    // UI state
    const [activeSection, setActiveSection] = useState<ChairpersonSection>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedYos, setSelectedYos] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showFullSize, setShowFullSize] = useState<string | null>(null);
    const [membersLoading, setMembersLoading] = useState<boolean>(false);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // New Enhancement states
    const [showWelcome, setShowWelcome] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const lastCounts = React.useRef({
        users: 0,
        messages: 0,
        assets: 0,
        transactions: 0
    });

    useEffect(() => {
        verifyAndFetchData();
        
        const handleToggleSidebar = () => setSidebarOpen(prev => !prev);
        window.addEventListener('toggleChairpersonSidebar', handleToggleSidebar);
        return () => window.removeEventListener('toggleChairpersonSidebar', handleToggleSidebar);
    }, []);

    const addNotification = (title: string, description: string, type: Notification['type'], target: ChairpersonSection) => {
        const newNotif: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            description,
            type,
            timestamp: new Date(),
            read: false,
            targetSection: target
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const verifyAndFetchData = async () => {
        try {
            await axios.get(getApiUrl('superAdmin').replace('/login', '/verify'), { withCredentials: true });
            
            // Check for welcome session
            if (!sessionStorage.getItem('Chairperson_welcomed')) {
                setShowWelcome(true);
                sessionStorage.setItem('Chairperson_welcomed', 'true');
                setTimeout(() => setShowWelcome(false), 3000);
            }

            await Promise.all([fetchUsers(), fetchMessages(), fetchMedia(), fetchFinanceData()]);
            
            // Set initial counts after first full fetch to avoid "new login" spam notifications
            // However, the user wants to see "what has changed", so if we want to show things 
            // since last login, we should keep track in localStorage instead of just session.
        } catch (err: any) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/signIn');
            } else {
                setError('Failed to load data. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (showLoader = false) => {
        if (showLoader) setMembersLoading(true);
        const response = await axios.get(getApiUrl('superAdmin').replace('/login', '/users'), { withCredentials: true });
        const userData = response.data;

        setUsers(userData);
        setUserCount(userData.length);

        const groupedByYos: { [key: string]: number } = {};
        const groupedByMinistry: { [key: string]: number } = {};
        const groupedByEt: { [key: string]: number } = {};

        userData.forEach((user: User) => {
            if (user.yos) groupedByYos[user.yos] = (groupedByYos[user.yos] || 0) + 1;
            
            const userMinistries = parseMinistries(user.ministry);
            userMinistries.forEach(m => {
                groupedByMinistry[m] = (groupedByMinistry[m] || 0) + 1;
            });

            const userEts = parseEts(user.et);
            userEts.forEach(et => {
                groupedByEt[et] = (groupedByEt[et] || 0) + 1;
            });
        });

        setUsersByYos(groupedByYos);
        setUsersByMinistry(groupedByMinistry);
        setUsersByEt(groupedByEt);

        // Calculate participation
        const inMin = userData.filter((u: User) => parseMinistries(u.ministry).length > 0).length;
        const inEt = userData.filter((u: User) => parseEts(u.et).length > 0).length;
        setStudentsInMinistries(inMin);
        setStudentsInEts(inEt);

        // Track new students
        if (lastCounts.current.users > 0 && userData.length > lastCounts.current.users) {
            const newCount = userData.length - lastCounts.current.users;
            const latest = [...userData].sort((a, b) => 
                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            )[0];
            addNotification(
                'New Student Registration',
                `${newCount} new Student(s) joined. Latest: ${latest.username} (${latest.yos})`,
                'user',
                'members'
            );
        }
        lastCounts.current.users = userData.length;

        if (showLoader) setMembersLoading(false);
    };

    const fetchMessages = async () => {
        const response = await axios.get(getApiUrl('superAdmin').replace('/login', '/messages'), { withCredentials: true });
        const msgs = response.data;
        
        // Track new feedback
        if (lastCounts.current.messages > 0 && msgs.length > lastCounts.current.messages) {
            const newCount = msgs.length - lastCounts.current.messages;
            const latest = [...msgs].sort((a, b) => 
                new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
            )[0];
            addNotification(
                'New Member Feedback',
                `${newCount} new feedback message(s). Latest: "${latest.subject}"`,
                'feedback',
                'feedback'
            );
        }
        lastCounts.current.messages = msgs.length;
        setMessages(msgs);
    };

    const defaultMediaEvents: MediaItem[] = [
        { event: "Subcomm photos", date: "2025-01-20", link: "https://photos.app.goo.gl/PrxWoMuyRNEet22b7" },
        { event: "Sunday service", date: "2025-02-13", link: "https://photos.app.goo.gl/Vt6HDo1xEtgA3Nmn9" },
        { event: "Worship Weekend", date: "2025-02-10", link: "https://photos.app.goo.gl/wbNV3coJREGEUSZX7" },
        { event: "Bible Study weekend", date: "2025-01-26", link: "https://photos.app.goo.gl/otVcso25sG6fkxjR8" },
        { event: "Evangelism photos", date: "2025-02-02", link: "https://photos.app.goo.gl/JvqV19BaGGZwrVFS7" },
        { event: "Weekend Photos", date: "2025-02-09", link: "https://photos.app.goo.gl/HkBvW67gyDSvLqgS7" },
        { event: "KSUCU-MC MEGA HIKE", date: "2025-02-15", link: "https://photos.app.goo.gl/RaNP4ikjEjXLHBmbA" },
        { event: "Creative Night photos", date: "2025-02-11", link: "https://photos.app.goo.gl/qYjukQAuWAdzBpaA7" },
        { event: "Valentine's concert", date: "2025-02-17", link: "https://photos.app.goo.gl/BvYon9KCNPL1uMu87" },
        { event: "Worship Weekend", date: "14th - 16th march", link: "https://photos.app.goo.gl/t2uVjvUSepDBcx3LA" },
        { event: "Prayer Week", date: "7th - 9th March", link: "https://photos.app.goo.gl/24sm1zdBxdUege3Y6" },
        { event: "Elders Day", date: "22nd March", link: "https://photos.app.goo.gl/L9Hkr8BxnVP1MSsD6" },
        { event: "Hymn Sunday", date: "23rd March", link: "https://photos.app.goo.gl/RWWRM2zp9LkmVgtU6" },
        { event: "Sunday service", date: "24th March", link: "https://photos.app.goo.gl/UnA7f6Aqp3kHtsxaA" },
    ];

    const fetchFinanceData = async () => {
        setFinanceLoading(true);
        try {
            // Fetch Transactions & Assets in parallel
            const [txs, assets] = await Promise.all([
                financeApi.get('/transactions'),
                financeApi.get('/assets')
            ]);

            setFinanceTransactions(txs || []);
            setAssets(assets || []);
            
            // Calculate Balance
            const income = (txs || []).filter((t: any) => t.type === 'cash_in').reduce((acc: number, t: any) => acc + t.amount, 0);
            const expense = (txs || []).filter((t: any) => t.type === 'cash_out').reduce((acc: number, t: any) => acc + t.amount, 0);
            setAccountBalance(income - expense);

            // Calculate Asset Total
            const assetTotal = (assets || []).reduce((acc: number, a: any) => acc + (a.valuation || 0), 0);
            setTotalAssetValue(assetTotal);

            // Track new assets
            if (lastCounts.current.assets > 0 && (assets || []).length > lastCounts.current.assets) {
                const newCount = (assets || []).length - lastCounts.current.assets;
                const latest = [...(assets || [])].sort((a, b) => 
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                )[0];
                addNotification(
                    'New Asset Recorded',
                    `${newCount} new asset(s) added. Latest: ${latest.name} (${formatCurrencyShort(latest.valuation || 0)})`,
                    'asset',
                    'assets'
                );
            }
            lastCounts.current.assets = (assets || []).length;

            // Track new transactions
            if (lastCounts.current.transactions > 0 && (txs || []).length > lastCounts.current.transactions) {
                const newCount = (txs || []).length - lastCounts.current.transactions;
                const latest = [...(txs || [])].sort((a, b) => 
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                )[0];
                addNotification(
                    'New Financial Entry',
                    `${newCount} new transaction(s) recorded. Latest: ${latest.type.replace('_', ' ')} of ${formatCurrencyShort(latest.amount)}`,
                    'finance',
                    'finance-transactions'
                );
            }
            lastCounts.current.transactions = (txs || []).length;

        } catch (err) {
            console.error('Error fetching finance data for analytics:', err);
        } finally {
            setFinanceLoading(false);
        }
    };

    const fetchMedia = async () => {
        try {
            const response = await axios.get(getApiUrl('patronMedia'), { withCredentials: true });
            const apiItems = response.data || [];
            // Merge API items with defaults
            const merged = [...apiItems];
            defaultMediaEvents.forEach(def => {
                if (!apiItems.some((a: MediaItem) => a.event === def.event && a.link === def.link)) {
                    merged.push(def);
                }
            });
            setMediaItems(merged);
        } catch {
            setMediaItems(defaultMediaEvents);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(getApiUrl('superAdmin').replace('/login', '/logout'), {
                method: 'POST',
                credentials: 'include'
            });
            sessionStorage.removeItem('Chairperson_welcomed');
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        setChangingPassword(true);
        try {
            await axios.post(getApiUrl('superAdmin').replace('/login', '/change-password'), {
                currentPassword,
                newPassword
            }, { withCredentials: true });

            setPasswordSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setPasswordError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };


    // PDF export grouped by year of study
    const handleExportPdf = () => {
        try {
            const studentsByYos: { [key: string]: User[] } = {};
            users.forEach(user => {
                const yos = user.yos || 'Unknown';
                if (!studentsByYos[yos]) studentsByYos[yos] = [];
                studentsByYos[yos].push(user);
            });

            const sortedYosKeys = Object.keys(studentsByYos).sort((a, b) => {
                if (a === 'Unknown') return 1;
                if (b === 'Unknown') return -1;
                return parseInt(a) - parseInt(b);
            });

            sortedYosKeys.forEach(yos => {
                const studentsInYos = studentsByYos[yos];
                const sortedStudents = [...studentsInYos].sort((a, b) =>
                    (a.username || '').localeCompare(b.username || '')
                );

                const doc = new jsPDF('landscape');
                let yOffset = 45;

                doc.addImage(letterhead, 'PNG', 10, 10, 270, 35);
                yOffset += 5;

                const title = `KSUCU Members List - Year ${yos}`;
                const dateText = `Generated: ${new Date().toLocaleDateString('en-GB', {
                    year: 'numeric', month: 'long', day: 'numeric'
                })}`;
                const timeText = `Time: ${new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit', minute: '2-digit'
                })}`;

                doc.setTextColor(128, 0, 128);
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text(title, doc.internal.pageSize.width / 2, yOffset, { align: 'center' });

                yOffset += 10;
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                doc.text(`Total Members: ${sortedStudents.length}`, doc.internal.pageSize.width / 2, yOffset, { align: 'center' });

                yOffset += 8;
                doc.setFontSize(10);
                doc.text(dateText, 15, yOffset);
                doc.text(timeText, doc.internal.pageSize.width - 15, yOffset, { align: 'right' });
                yOffset += 15;

                const tableData = sortedStudents.map((student, index) => [
                    (index + 1).toString(),
                    student.username || 'N/A',
                    student.reg || 'N/A',
                    student.course || 'N/A',
                    student.yos || 'N/A',
                    student.email || 'N/A',
                    student.phone || 'N/A'
                ]);

                (doc as any).autoTable({
                    head: [['#', 'Name', 'Registration No.', 'Course', 'Year of Study', 'Email', 'Phone']],
                    body: tableData,
                    startY: yOffset,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [128, 0, 128],
                        textColor: [255, 255, 255],
                        fontSize: 9,
                        fontStyle: 'bold',
                        cellPadding: 2
                    },
                    styles: {
                        fontSize: 8,
                        cellPadding: 1.5,
                        lineWidth: 0.1,
                        lineColor: [200, 200, 200]
                    },
                    alternateRowStyles: { fillColor: [248, 249, 250] },
                    columnStyles: {
                        0: { cellWidth: 12, halign: 'center' },
                        1: { cellWidth: 45 },
                        2: { cellWidth: 35 },
                        3: { cellWidth: 75 },
                        4: { cellWidth: 18, halign: 'center' },
                        5: { cellWidth: 55 },
                        6: { cellWidth: 30 }
                    },
                    margin: { left: 10, right: 10 },
                    didDrawPage: function (data: any) {
                        if (data.pageNumber > 1) {
                            doc.addImage(letterhead, 'PNG', 10, 10, 270, 35);
                        }
                    }
                });

                const pageCount = doc.getNumberOfPages();
                const pageHeight = doc.internal.pageSize.height;
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Generated by KSUCU-MC Chairperson Dashboard', 15, pageHeight - 10);
                    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 15, pageHeight - 10, { align: 'right' });
                }

                doc.save(`KSUCU_Members_Year_${yos}_${new Date().toISOString().split('T')[0]}.pdf`);
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    // ── Purple-accented light theme ──
    const P = '#730051';       // primary purple
    const PL = '#8a0062';      // lighter purple
    const R = '#ef4444';       // red for feedback/alerts

    const dk = {
        card: '#ffffff',
        cardBorder: '#e8e8e8',
        text: '#333',
        textMuted: '#888',
        accent: P,
        divider: '#eee',
        input: { bg: '#fff', border: '#ddd', focusBorder: P, text: '#333' },
    };
    const formatCurrencyShort = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const sectionStyle: React.CSSProperties = { padding: '16px', background: '#fff', border: `1px solid ${dk.cardBorder}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
    const titleStyle: React.CSSProperties = { borderBottomColor: P, fontSize: '16px', marginBottom: '14px', paddingBottom: '10px', color: '#222' };
    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px', background: dk.input.bg, border: `1px solid ${dk.input.border}`,
        borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', color: dk.input.text, outline: 'none', transition: 'border-color 0.2s',
    };

    // ── Section Renderers ──

    // ── Helper UI Components ──
    const WelcomeSplash = () => (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            zIndex: 1000000, background: 'linear-gradient(135deg, #730051 0%, #4a0034 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: '#fff', textAlign: 'center', animation: 'fadeIn 0.5s ease'
        }}>
            <div style={{ padding: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ marginBottom: '20px' }}>
                    <img src={cuLogo} alt="Logo" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} />
                </div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>Welcome KSUCU-MC Chairperson</h1>
                <h2 style={{ fontSize: '24px', fontWeight: '400', opacity: 0.9 }}>Stanley Otieno</h2>
                <div style={{ marginTop: '24px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%', animation: `pulse 1.5s infinite ${i * 0.2}s` }} />
                    ))}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
            `}</style>
        </div>
    );

    const NotificationMenu = () => (
        <div style={{
            position: 'absolute', top: '100%', right: 0, width: '320px', 
            maxHeight: '400px', background: '#fff', borderRadius: '12px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid #eee', 
            zIndex: 1000, overflowY: 'auto', marginTop: '10px',
            animation: 'ChairpersonFadeIn 0.2s ease'
        }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '13px', color: '#333' }}>Notifications ({notifications.filter(n => !n.read).length})</span>
                <button 
                    onClick={() => setNotifications([])} 
                    style={{ fontSize: '10px', color: P, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                >
                    Clear All
                </button>
            </div>
            <div style={{ padding: '8px' }}>
                {notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '12px' }}>No new updates</div>
                ) : (
                    notifications.map(n => (
                        <div 
                            key={n.id} 
                            onClick={() => {
                                setActiveSection(n.targetSection);
                                setShowNotifDropdown(false);
                                setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                            }}
                            style={{ 
                                padding: '12px', borderRadius: '8px', marginBottom: '4px',
                                background: n.read ? 'transparent' : '#faf5f8',
                                cursor: 'pointer', border: '1px solid transparent',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = P}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '700', fontSize: '12px', color: P }}>{n.title}</span>
                                <span style={{ fontSize: '9px', color: '#999' }}>{n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '11px', color: '#555', lineHeight: '1.4' }}>{n.description}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const DashboardControls = () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            <button 
                onClick={() => verifyAndFetchData()} 
                style={{ 
                    background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', 
                    padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    color: '#555', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eee'; e.currentTarget.style.color = P; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.color = '#555'; }}
                title="Refresh All Data"
            >
                <RefreshCw size={16} className={financeLoading ? 'animate-spin' : ''} />
            </button>
            
            <div style={{ position: 'relative' }}>
                <button 
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    style={{ 
                        background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', 
                        padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        color: showNotifDropdown ? P : '#555', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#eee'; e.currentTarget.style.color = P; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.color = showNotifDropdown ? P : '#555'; }}
                    title="Notifications"
                >
                    <Bell size={16} />
                    {notifications.filter(n => !n.read).length > 0 && (
                        <span style={{ 
                            position: 'absolute', top: '-4px', right: '-4px', 
                            background: R, color: '#fff', fontSize: '8px', 
                            padding: '2px 5px', borderRadius: '10px', 
                            fontWeight: '800', border: '2px solid #fff' 
                        }}>
                            {notifications.filter(n => !n.read).length}
                        </span>
                    )}
                </button>
                {showNotifDropdown && <NotificationMenu />}
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className={styles.section} style={{ ...sectionStyle, padding: '0 24px 24px' }}>
            <div style={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 100, 
                background: '#fff', 
                padding: '24px 0 16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
                borderBottom: '1px solid #f0f0f0' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 className={styles.sectionTitle} style={{ ...titleStyle, marginBottom: 0, border: 'none' }}>Overview & Analytics</h2>
                    {financeLoading && <div style={{ fontSize: '11px', color: P, display: 'flex', alignItems: 'center', gap: '6px' }}><RefreshCw size={12} className="animate-spin" /> Syncing data...</div>}
                </div>
                
                <DashboardControls />
            </div>

            {/* 7-Column Stat Cards Row */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                gap: '10px', 
                marginBottom: '30px' 
            }}>
                {[
                    { val: userCount, label: 'KSUCU Members', icon: <Users size={16} />, bg: `linear-gradient(135deg, ${P}, ${PL})` },
                    { val: studentsInMinistries, label: 'In Ministries', sub: `${Object.keys(usersByMinistry).length} Types`, icon: <ShieldCheck size={16} />, bg: `linear-gradient(135deg, #0066cc, #004499)` },
                    { val: studentsInEts, label: 'In ET Groups', sub: `${Object.keys(usersByEt).length} Teams`, icon: <Layers size={16} />, bg: `linear-gradient(135deg, #10b981, #059669)` },
                    { val: formatCurrencyShort(totalAssetValue), label: 'Total Assets', icon: <Gem size={16} />, bg: `linear-gradient(135deg, #f59e0b, #d97706)` },
                    { val: formatCurrencyShort(accountBalance), label: 'In Account', icon: <Wallet size={16} />, bg: `linear-gradient(135deg, #4f46e5, #3730a3)` },
                    { val: formatCurrencyShort(totalAssetValue + accountBalance), label: 'Net Worth', icon: <RefreshCw size={16} />, bg: `linear-gradient(135deg, #7c3aed, #5b21b6)` },
                    { val: messages.length, label: 'Feedback', icon: <MessageSquare size={16} />, bg: R },
                ].map((s, i) => (
                    <div key={i} style={{ 
                        background: s.bg, 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                        borderRadius: '10px', 
                        padding: '14px',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                        cursor: 'default',
                        minHeight: '100px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', opacity: 0.9 }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '5px', borderRadius: '6px' }}>
                                {s.icon}
                            </div>
                        </div>
                        <h3 style={{ fontSize: '18px', margin: '0 0 2px', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.val}</h3>
                        <p style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0, opacity: 0.9 }}>{s.label}</p>
                        {('sub' in s) && <p style={{ fontSize: '8px', margin: '1px 0 0', opacity: 0.7 }}>{s.sub}</p>}
                    </div>
                ))}
            </div>

            {/* Professional Analytics Graphs */}
            <div style={{ padding: '0 0 40px', borderBottom: '1px solid #f0f0f0' }}>
                <AnalyticsCharts 
                    users={users} 
                    byMinistry={usersByMinistry} 
                    byEt={usersByEt} 
                    transactions={financeTransactions} 
                    assets={assets}
                />
            </div>

            <div style={{ marginTop: '30px' }}>
                <h3 className={styles.subSectionTitle} style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '15px' }}>Member Distribution Breakdown</h3>
                <div className={styles.categoryStatsGrid} style={{ gap: '15px' }}>
                    {[
                        { title: 'By Year of Study', data: Object.entries(usersByYos).sort(([a], [b]) => parseInt(a) - parseInt(b)), fmt: (k: string) => `Year ${k}` },
                        { title: 'By Ministry', data: Object.entries(usersByMinistry).sort(([, a], [, b]) => b - a), fmt: (k: string) => k || 'Unassigned' },
                        { title: 'By Evangelistic Team', data: Object.entries(usersByEt).sort(([, a], [, b]) => b - a), fmt: (k: string) => k || 'Unassigned' },
                    ].map((cat, i) => (
                        <div key={i} className={styles.categoryCard} style={{ padding: '16px', background: '#fff', border: '1px solid #eee', borderRadius: '12px' }}>
                            <h4 style={{ fontSize: '11px', fontWeight: '800', marginBottom: '12px', color: P, textTransform: 'uppercase' }}>{cat.title}</h4>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                {cat.data.map(([k, count]) => (
                                    <li key={k} style={{ fontSize: '13px', color: '#444', display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f9f9f9' }}>
                                        <span>{cat.fmt(k)}</span>
                                        <strong style={{ color: P }}>{count}</strong>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderMembers = () => {
        // Combined filter: year + search + section
        const displayUsers = users.filter(user => {
            const matchesYos = selectedYos === 'all' || user.yos === selectedYos;
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q ||
                user.username?.toLowerCase().includes(q) ||
                user.email?.toLowerCase().includes(q) ||
                user.phone?.includes(searchQuery) ||
                user.reg?.toLowerCase().includes(q) ||
                user.course?.toLowerCase().includes(q);
                
            const isEtView = activeSection.startsWith('et-');
            const isMinView = activeSection.startsWith('min-');
            
            const activeFilterText = activeSection.slice(activeSection.indexOf('-') + 1);

            const matchEt = isEtView ? parseEts(user.et).includes(activeFilterText) : true;
            const matchMin = isMinView ? parseMinistries(user.ministry).includes(activeFilterText) : true;

            return matchesYos && matchesSearch && matchEt && matchMin;
        });

        const sectionHeading = activeSection.startsWith('et-') ? `${activeSection.replace('et-', '')} Team Members` : 
                             activeSection.startsWith('min-') ? `${activeSection.replace('min-', '')} Ministry Members` : 'All Members';

        return (
            <>
                {/* ── Full-size photo lightbox ── */}
                {showFullSize && (
                    <div
                        onClick={() => setShowFullSize(null)}
                        style={{
                            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                            zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)',
                            padding: '20px', cursor: 'zoom-out', animation: 'ChairpersonFadeIn 0.3s ease-out',
                        }}
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            style={{
                                position: 'relative', maxWidth: '95vw', maxHeight: '90vh',
                                animation: 'ChairpersonZoomIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                            }}
                        >
                            <button
                                onClick={() => setShowFullSize(null)}
                                style={{
                                    position: 'fixed', top: '20px', right: '20px', color: 'white',
                                    background: P, border: '2px solid white', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: '44px', height: '44px', borderRadius: '50%',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 100001,
                                }}
                            >
                                <X size={24} />
                            </button>
                            <img
                                src={showFullSize}
                                alt="Full view"
                                style={{
                                    maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain',
                                    borderRadius: '12px', boxShadow: '0 0 60px rgba(0,0,0,0.9)',
                                    border: '4px solid white',
                                }}
                            />
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes ChairpersonFadeIn { from { opacity:0 } to { opacity:1 } }
                    @keyframes ChairpersonZoomIn { from { transform:scale(0.95);opacity:0 } to { transform:scale(1);opacity:1 } }
                    .Chairperson-photo-wrap:hover { transform:scale(1.06) !important; box-shadow:0 6px 20px rgba(115,0,81,0.35) !important; }
                    .Chairperson-photo-wrap:active { transform:scale(0.95) !important; }
                    .Chairperson-member-card:hover { box-shadow:0 4px 18px rgba(0,0,0,0.10) !important; }
                `}</style>

                <div className={styles.section} style={{ ...sectionStyle, padding: '0 16px 16px' }}>
                    {/* Sticky Header row */}
                    <div style={{ 
                        position: 'sticky', 
                        top: 0, 
                        zIndex: 100, 
                        background: '#fff', 
                        padding: '16px 0 12px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '14px', 
                        flexWrap: 'wrap', 
                        gap: '10px',
                        borderBottom: '1px solid #f0f0f0'
                    }}>
                        <h2 className={styles.sectionTitle} style={{ ...titleStyle, margin: 0, padding: 0, border: 'none' }}>{sectionHeading}</h2>
                        
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <DashboardControls />
                            <button
                                className={styles.primaryButton}
                                onClick={() => handleExportPdf()}
                                disabled={membersLoading}
                                style={{ 
                                    background: P, color: '#fff', border: 'none', borderRadius: '6px', 
                                    padding: '8px 16px', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                <Users size={14} /> Export List (PDF)
                            </button>
                        </div>
                    </div>

                    {/* Search + Year filter + Refresh */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                placeholder="Search by name, email, phone, reg, or course..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ ...inputStyle, paddingLeft: '38px' }}
                                onFocus={e => (e.target.style.borderColor = P)}
                                onBlur={e => (e.target.style.borderColor = '#ddd')}
                            />
                        </div>
                        <select
                            value={selectedYos}
                            onChange={e => setSelectedYos(e.target.value)}
                            style={{ ...inputStyle, minWidth: '130px', cursor: 'pointer' }}
                        >
                            <option value="all">All Years</option>
                            {Object.keys(usersByYos).sort((a, b) => parseInt(a) - parseInt(b)).map(yos => (
                                <option key={yos} value={yos}>Year {yos} ({usersByYos[yos]})</option>
                            ))}
                        </select>
                        <button
                            onClick={() => fetchUsers(true)}
                            disabled={membersLoading}
                            style={{
                                padding: '10px 14px', border: 'none', borderRadius: '6px',
                                background: membersLoading ? '#aaa' : '#007bff', color: 'white',
                                cursor: membersLoading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600,
                            }}
                        >
                            <RefreshCw size={15} style={{ animation: membersLoading ? 'spin 0.8s linear infinite' : 'none' }} />
                            Refresh
                        </button>
                    </div>

                    {/* Count badge */}
                    <div style={{
                        fontSize: '13px', color: '#666', padding: '10px 14px',
                        background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '6px',
                        marginBottom: '16px',
                    }}>
                        📋 <strong>Total Members:</strong> {displayUsers.length}
                        {(searchQuery || selectedYos !== 'all') && ` (filtered from ${users.length})`}
                    </div>

                    {/* Card list */}
                    {membersLoading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999', fontSize: '14px' }}>
                            Loading members...
                        </div>
                    ) : displayUsers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999', fontSize: '14px' }}>
                            {searchQuery || selectedYos !== 'all' ? 'No members match your search.' : 'No members found.'}
                        </div>
                    ) : (
                        <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '4px' }}>
                            {displayUsers.map(user => (
                                <div
                                    key={user._id || user.reg}
                                    className="Chairperson-member-card"
                                    style={{
                                        border: '1px solid #dee2e6', borderRadius: '10px',
                                        padding: '16px', marginBottom: '16px',
                                        backgroundColor: '#f8f9fa',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                                        transition: 'box-shadow 0.2s ease',
                                    }}
                                >
                                    {/* Top row: photo + details */}
                                    <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', alignItems: 'flex-start' }}>

                                        {/* Profile photo */}
                                        <div
                                            className="Chairperson-photo-wrap"
                                            onClick={() => user.profilePhoto && setShowFullSize(getImageUrl(user.profilePhoto))}
                                            title={user.profilePhoto ? 'Click to view full size' : ''}
                                            style={{
                                                width: '80px', height: '80px', borderRadius: '50%',
                                                overflow: 'hidden', border: `3px solid ${P}`,
                                                flexShrink: 0, backgroundColor: '#f0f0f0',
                                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                cursor: user.profilePhoto ? 'pointer' : 'default',
                                                boxShadow: '0 4px 12px rgba(115,0,81,0.2)',
                                                transition: 'transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.2s',
                                            }}
                                        >
                                            {user.profilePhoto ? (
                                                <img
                                                    src={getImageUrl(user.profilePhoto)}
                                                    alt={user.username}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            ) : (
                                                <User size={36} color={P} />
                                            )}
                                        </div>

                                        {/* Name / email / phone / course */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                            gap: '10px', flex: 1, fontSize: '14px',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <User size={15} color={P} />
                                                <span><strong>Name:</strong> {user.username || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Mail size={15} color={P} />
                                                <span><strong>Email:</strong> {user.email || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Phone size={15} color={P} />
                                                <span><strong>Phone:</strong> {user.phone || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <BookOpen size={15} color={P} />
                                                <span><strong>Course:</strong> {user.course || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom row: REG / Year / ET / Ministry */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                        gap: '8px', fontSize: '13px', color: '#555',
                                        paddingTop: '12px', borderTop: '1px solid #dee2e6',
                                    }}>
                                        <div><strong>REG:</strong> {user.reg || 'N/A'}</div>
                                        <div><strong>Year:</strong> {user.yos || 'N/A'}</div>
                                        <div><strong>ET:</strong> {user.et || 'N/A'}</div>
                                        <div><strong>Ministry:</strong> {user.ministry || 'N/A'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </>
        );
    };

    const renderFeedback = () => (
        <div className={styles.section} style={{ ...sectionStyle, padding: '0 16px 16px' }}>
            <div style={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 100, 
                background: '#fff', 
                padding: '16px 0 12px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '14px',
                borderBottom: '1px solid #f0f0f0' 
            }}>
                <h2 className={styles.sectionTitle} style={{ ...titleStyle, marginBottom: 0, border: 'none' }}>Member Feedback ({messages.length})</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                        style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: '11px' }}
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        <option value="Spiritual">Spiritual</option>
                        <option value="Academic">Academic</option>
                        <option value="Social">Social</option>
                        <option value="Finance">Finance</option>
                        <option value="Leadership">Leadership</option>
                        <option value="Other">Other</option>
                    </select>
                    <DashboardControls />
                </div>
            </div>

            {messages.length === 0 ? (
                <p style={{ color: dk.textMuted, textAlign: 'center', padding: '30px 0', fontSize: '14px' }}>No messages yet.</p>
            ) : (
                <div className={styles.messagesGrid}>
                    {messages
                        .filter(msg => selectedCategory === 'all' || msg.category === selectedCategory)
                        .map((msg) => (
                            <div key={msg._id} style={{
                                background: '#fff', borderRadius: '8px', padding: '14px',
                                border: '1px solid #e8e8e8', borderLeft: `3px solid ${P}`,
                                transition: 'box-shadow 0.15s',
                            }}
                                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ background: P, color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase' }}>{msg.category}</span>
                                    <span style={{ fontSize: '11px', color: '#999' }}>{new Date(msg.timestamp).toLocaleDateString()}</span>
                                </div>
                                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111', margin: '0 0 6px' }}>{msg.subject}</h4>
                                <p style={{ color: '#555', lineHeight: '1.5', marginBottom: '10px', fontSize: '13px' }}>{msg.message}</p>
                                <div style={{ paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
                                    {msg.isAnonymous
                                        ? <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>Anonymous</span>
                                        : <span style={{ fontSize: '12px', color: '#888' }}>From: {msg.senderInfo?.username || 'Unknown'}{msg.senderInfo?.email && ` (${msg.senderInfo.email})`}</span>
                                    }
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );

    const [gallerySearch, setGallerySearch] = useState('');
    const filteredGallery = mediaItems.filter(item =>
        item.event.toLowerCase().includes(gallerySearch.toLowerCase()) ||
        item.date.toLowerCase().includes(gallerySearch.toLowerCase())
    );

    const renderGallery = () => (
        <div className={styles.section} style={{ ...sectionStyle, padding: '0 16px 16px' }}>
            <div style={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 100, 
                background: '#fff', 
                padding: '16px 0 12px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '14px',
                borderBottom: '1px solid #f0f0f0' 
            }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', minWidth: '200px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                        <input type="text" placeholder="Search events..." value={gallerySearch}
                            onChange={(e) => setGallerySearch(e.target.value)}
                            style={{ ...inputStyle, paddingLeft: '32px', fontSize: '11px', height: '32px' }}
                            onFocus={(e) => (e.target.style.borderColor = dk.input.focusBorder)}
                            onBlur={(e) => (e.target.style.borderColor = dk.input.border)} />
                    </div>
                    <DashboardControls />
                </div>
            </div>

            {filteredGallery.length === 0 ? (
                <p style={{ color: '#aaa', textAlign: 'center', padding: '40px 0', fontSize: '14px' }}>No media items found.</p>
            ) : (
                <>
                    <style>{`
                        .Chairperson-gallery-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
                        @media (min-width: 480px) { .Chairperson-gallery-grid { grid-template-columns: repeat(2, 1fr); } }
                        @media (min-width: 768px) { .Chairperson-gallery-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
                        @media (min-width: 1200px) { .Chairperson-gallery-grid { grid-template-columns: repeat(4, 1fr); } }
                        .Chairperson-gallery-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1) !important; transform: translateY(-2px); }
                        .Chairperson-gallery-btn:hover { background: #730051 !important; color: #fff !important; border-color: #730051 !important; }
                    `}</style>
                    <div className="Chairperson-gallery-grid">
                        {filteredGallery.map((item, index) => (
                            <div key={index} className="Chairperson-gallery-card" style={{
                                background: '#fff',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                border: '1px solid #eee',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                            }}>
                                <div style={{
                                    height: '130px',
                                    minHeight: '130px',
                                    overflow: 'hidden',
                                    backgroundColor: '#f0eef2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    {item.imageUrl ? (
                                        <img
                                            src={getImageUrl(item.imageUrl)}
                                            alt={item.event}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const parent = e.currentTarget.parentElement;
                                                if (parent && !parent.querySelector('.fb')) {
                                                    const fb = document.createElement('div');
                                                    fb.className = 'fb';
                                                    fb.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;color:#ccc;font-size:2.5rem;';
                                                    fb.textContent = '\uD83D\uDCF7';
                                                    parent.appendChild(fb);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '2.5rem', color: '#ccc' }}>&#128247;</span>
                                    )}
                                </div>
                                <div style={{
                                    padding: '10px 12px 12px',
                                    background: '#fff',
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}>
                                    <h4 style={{
                                        fontSize: '0.88rem', margin: '0 0 3px', color: '#2d3436',
                                        fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}>{item.event}</h4>
                                    <p style={{ fontSize: '0.7rem', margin: '0 0 8px', color: '#999' }}>{item.date}</p>
                                    <a href={item.link} target="_blank" rel="noopener noreferrer"
                                        className="Chairperson-gallery-btn"
                                        style={{
                                            fontSize: '0.78rem', padding: '6px 0', borderRadius: '8px',
                                            border: `1.5px solid ${P}`, color: P, fontWeight: 600,
                                            textDecoration: 'none', textAlign: 'center', display: 'block',
                                            marginTop: 'auto', transition: 'all 0.2s ease',
                                        }}>
                                        View Photos
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );

    const renderSettings = () => (
        <div className={styles.section} style={{ ...sectionStyle, padding: '0 16px 16px' }}>
            <div style={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 100, 
                background: '#fff', 
                padding: '16px 0 12px', 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <h2 className={styles.sectionTitle} style={{ ...titleStyle, marginBottom: 0, border: 'none' }}>Account Settings</h2>
                <DashboardControls />
            </div>
            <div style={{ maxWidth: '420px' }}>
                <h3 style={{ color: dk.text, marginBottom: '14px', fontSize: '14px' }}>Change Password</h3>

                {passwordSuccess && (
                    <div style={{ background: '#d4edda', color: '#155724', padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', border: '1px solid #c3e6cb', fontSize: '13px' }}>
                        {passwordSuccess}
                    </div>
                )}
                {passwordError && (
                    <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', border: '1px solid #f5c6cb', fontSize: '13px' }}>
                        {passwordError}
                    </div>
                )}

                {['Current Password', 'New Password', 'Confirm New Password'].map((label, i) => {
                    const vals = [currentPassword, newPassword, confirmPassword];
                    const setters = [setCurrentPassword, setNewPassword, setConfirmPassword];
                    return (
                        <div key={i} style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: dk.textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                            <input type="password" value={vals[i]} onChange={(e) => setters[i](e.target.value)}
                                placeholder={i === 1 ? 'Min 8 characters' : ''}
                                style={inputStyle}
                                onFocus={(e) => (e.target.style.borderColor = dk.input.focusBorder)}
                                onBlur={(e) => (e.target.style.borderColor = dk.input.border)} />
                        </div>
                    );
                })}

                <button onClick={handleChangePassword} disabled={changingPassword}
                    style={{ width: '100%', padding: '10px', background: P, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: changingPassword ? 'not-allowed' : 'pointer', opacity: changingPassword ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                    {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
            </div>
        </div>
    );



    const renderActiveSection = () => {
        if (loading) {
            return (
                <div className={styles.loadingContainer}>
                    <p>Loading dashboard...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className={styles.errorContainer}>
                    <p>{error}</p>
                </div>
            );
        }

        if (activeSection.startsWith('et-') || activeSection.startsWith('min-') || activeSection === 'members') {
            return renderMembers();
        }

        switch (activeSection) {
            case 'dashboard': return renderDashboard();
            case 'feedback': return renderFeedback();
            case 'gallery': return renderGallery();
            case 'assets': return <ChairpersonAssets />;
            case 'settings': return renderSettings();
            case 'finance': 
            case 'finance-dashboard': return <FinancePanel isPatron initialTab="dashboard" />;
            case 'finance-transactions': return <FinancePanel isPatron initialTab="transactions" />;
            case 'finance-requisitions': return <FinancePanel isPatron initialTab="requisitions" />;
            case 'finance-reports': return <FinancePanel isPatron initialTab="reports" />;
            default: return renderDashboard();
        }
    };

    return (
        <div className={styles.pageWrapper} style={{
            background: '#f5f5f5',
            minHeight: 'calc(100vh - 144px)'
        }}>
            {showWelcome && <WelcomeSplash />}

            <div className={styles.adminLayout} style={{ background: '#f5f5f5' }}>
                <ChairpersonSidebar
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    onLogout={handleLogout}
                />
                <main className={styles.mainContent} style={{ padding: '16px' }}>
                    {renderActiveSection()}
                </main>
            </div>

            <footer style={{
                textAlign: 'center', padding: '12px 16px', fontSize: '11px', color: '#888',
                borderTop: '1px solid #e0e0e0', background: '#fafafa'
            }}>
                &copy; {new Date().getFullYear()} KSUCU-MC Chairperson Portal
            </footer>
        </div>
    );
};

export default ChairpersonDashboard;
