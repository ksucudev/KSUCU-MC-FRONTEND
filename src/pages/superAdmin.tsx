import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styles from '../styles/superAdmin.module.css';
import { Menu, X } from 'lucide-react';
import { getApiUrl } from '../config/environment';
import letterhead from '../assets/letterhead.png';
import DocumentUploader from '../components/DocumentUploader';
import MinutesManager from '../components/MinutesManager';
import AdminSidebar, { AdminSection } from '../components/AdminSidebar';
import PinEntry from '../components/PinEntry';
import CommitteeManager from '../components/CommitteeManager';

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

interface PollingStats {
    totalUsers: number;
    totalVoted: number;
    totalNotVoted: number;
    percentageVoted: string;
}

interface PollingOfficer {
    _id: string;
    fullName: string;
    email: string;
    status: string;
    votedCount?: number;
    registeredCount?: number;
}

const SuperAdmin: React.FC = () => {
    const navigate = useNavigate();
    const [userCount, setUserCount] = useState<number>(0);
    const [usersByYos, setUsersByYos] = useState<{ [key: string]: number }>({});
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(true);
    const [usersByMinistry, setUsersByMinistry] = useState<{ [key: string]: number }>({});
    const [usersByEt, setUsersByEt] = useState<{ [key: string]: number }>({});
    const [users, setUsers] = useState<{ username: string; reg: string; course: string; yos: string }[]>([]);
    const [pollingStats, setPollingStats] = useState<PollingStats | null>(null);
    const [pollingOfficers, setPollingOfficers] = useState<PollingOfficer[]>([]);
    const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
    const [isResetting, setIsResetting] = useState<boolean>(false);
    const [showAdvanceConfirm, setShowAdvanceConfirm] = useState<boolean>(false);
    const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
    const [advanceResult, setAdvanceResult] = useState<{ advanced: number; promoted: number; skipped: number } | null>(null);
    const [selectedUserForDocUpload, setSelectedUserForDocUpload] = useState<{ _id: string; username: string } | null>(null);
    const [showDocUploadModal, setShowDocUploadModal] = useState<boolean>(false);
    const [showMinutesManager, setShowMinutesManager] = useState<boolean>(false);

    // PIN protection state
    const [minutesPinVerified, setMinutesPinVerified] = useState<boolean>(false);
    const [showPinEntry, setShowPinEntry] = useState<boolean>(false);
    const [pinNeedsSetup, setPinNeedsSetup] = useState<boolean>(false);
    const [pinError, setPinError] = useState<string>('');
    const [pinLoading, setPinLoading] = useState<boolean>(false);

    // Sidebar state
    const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    const backEndURL = getApiUrl('superAdmin').replace('/login', '');

    // Hide main site's left sidebar and footer when admin page is active
    useEffect(() => {
        document.body.classList.add('super-admin-active');

        // Remove left margin from parent (main site sidebar offset)
        const parentWrapper = document.querySelector('[class*="min-h-screen"]') as HTMLElement;
        if (parentWrapper) {
            parentWrapper.style.marginLeft = '0';
        }

        const style = document.createElement('style');
        style.id = 'super-admin-overrides';
        style.textContent = `
            /* Hide the main site left purple sidebar */
            body.super-admin-active [style*="z-index: 99999"],
            body.super-admin-active [style*="z-index:99999"],
            body.super-admin-active [style*="z-index: 99997"],
            body.super-admin-active [style*="z-index:99997"] {
                display: none !important;
            }
            /* Hide footer, chat, notifications */
            body.super-admin-active > div > div > footer,
            body.super-admin-active [class*="CommunityChat"],
            body.super-admin-active [class*="NotificationBubble"] {
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.body.classList.remove('super-admin-active');
            style.remove();
            if (parentWrapper) {
                parentWrapper.style.marginLeft = '';
            }
        };
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch(`${backEndURL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                navigate('/');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            await Promise.allSettled([
                fetchUserData(),
                fetchMessages(),
                fetchPollingStats(),
                fetchPollingOfficers()
            ]);
            setLoading(false);
        };
        loadAllData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`${backEndURL}/users`, { withCredentials: true });
            const users = response.data;

            setUserCount(users.length);
            setUsers(users);

            const groupedByYos: { [key: string]: number } = {};
            const groupedByMinistry: { [key: string]: number } = {};
            const groupedByEt: { [key: string]: number } = {};

            users.forEach((user: { yos: string, ministry: string, et: string }) => {
                groupedByYos[user.yos] = (groupedByYos[user.yos] || 0) + 1;
                groupedByMinistry[user.ministry] = (groupedByMinistry[user.ministry] || 0) + 1;
                groupedByEt[user.et] = (groupedByEt[user.et] || 0) + 1;
            });

            setUsersByYos(groupedByYos);
            setUsersByMinistry(groupedByMinistry);
            setUsersByEt(groupedByEt);
        } catch (err) {
            console.error('Error fetching user data:', err);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${backEndURL}/messages`, { withCredentials: true });
            setMessages(response.data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    const fetchPollingStats = async () => {
        try {
            const pollingURL = backEndURL.replace('/sadmin', '/polling-officer');
            const response = await axios.get(`${pollingURL}/stats`, { withCredentials: true });
            setPollingStats(response.data);
        } catch (err) {
            console.error('Error fetching polling stats:', err);
        }
    };

    const fetchPollingOfficers = async () => {
        try {
            const pollingURL = backEndURL.replace('/sadmin', '/polling-officer');
            const response = await axios.get(`${pollingURL}/list`, { withCredentials: true });
            setPollingOfficers(response.data);
        } catch (err) {
            console.error('Error fetching polling officers:', err);
        }
    };

    const checkMinutesPinStatus = async () => {
        try {
            const response = await axios.get(getApiUrl('minutesPinStatus'), { withCredentials: true });
            setPinNeedsSetup(response.data.needsSetup);
            return response.data;
        } catch (err) {
            console.error('Error checking PIN status:', err);
            return { needsSetup: false, hasPin: false };
        }
    };

    const handleMinutesAccess = async () => {
        if (minutesPinVerified) {
            setShowMinutesManager(true);
            return;
        }

        const status = await checkMinutesPinStatus();
        setPinNeedsSetup(status.needsSetup);
        setShowPinEntry(true);
        setPinError('');
    };

    const handlePinSubmit = async (pin: string) => {
        setPinLoading(true);
        setPinError('');

        try {
            if (pinNeedsSetup) {
                // Setup new PIN
                await axios.post(getApiUrl('minutesPinSetup'), { pin }, { withCredentials: true });
                setMinutesPinVerified(true);
                setShowPinEntry(false);
                setShowMinutesManager(true);
            } else {
                // Verify existing PIN
                const response = await axios.post(getApiUrl('minutesPinVerify'), { pin }, { withCredentials: true });
                if (response.data.valid) {
                    setMinutesPinVerified(true);
                    setShowPinEntry(false);
                    setShowMinutesManager(true);
                }
            }
        } catch (err: any) {
            setPinError(err.response?.data?.error || 'Invalid PIN');
        } finally {
            setPinLoading(false);
        }
    };

    const handlePinCancel = () => {
        setShowPinEntry(false);
        setPinError('');
    };

    const handleResetPolling = async () => {
        setIsResetting(true);
        try {
            const response = await axios.post(`${backEndURL}/reset-polling`, {}, { withCredentials: true });
            alert(`Success! ${response.data.message}\n${response.data.usersAffected} users' voting status has been reset.`);
            await fetchPollingStats();
            setShowResetConfirm(false);
        } catch (err: any) {
            console.error('Error resetting polling data:', err);
            alert(`Error resetting polling data: ${err.response?.data?.message || 'Unknown error'}`);
        } finally {
            setIsResetting(false);
        }
    };

    const handleAdvanceYears = async () => {
        setIsAdvancing(true);
        setAdvanceResult(null);
        try {
            const response = await axios.post(getApiUrl('usersAdvanceYears'), {}, { withCredentials: true });
            setAdvanceResult({
                advanced: response.data.advanced,
                promoted: response.data.promoted,
                skipped: response.data.skipped
            });
            await fetchUserData();
        } catch (err: any) {
            console.error('Error advancing years:', err);
            alert(`Error advancing years: ${err.response?.data?.message || 'Unknown error'}`);
            setShowAdvanceConfirm(false);
        } finally {
            setIsAdvancing(false);
        }
    };

    const handleExportPdfByYos = () => {
        try {
            const studentsByYos: { [key: string]: any[] } = {};

            users.forEach(user => {
                const yos = user.yos || 'Unknown';
                if (!studentsByYos[yos]) {
                    studentsByYos[yos] = [];
                }
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

                const title = `KSUCU Student List - Year ${yos}`;
                const dateText = `Generated: ${new Date().toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}`;
                const timeText = `Time: ${new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}`;

                doc.setTextColor(128, 0, 128);
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text(title, doc.internal.pageSize.width / 2, yOffset, { align: "center" });

                yOffset += 10;
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                const stats = `Total Students: ${sortedStudents.length}`;
                doc.text(stats, doc.internal.pageSize.width / 2, yOffset, { align: "center" });

                yOffset += 8;
                doc.setFontSize(10);
                doc.text(dateText, 15, yOffset);
                doc.text(timeText, doc.internal.pageSize.width - 15, yOffset, { align: "right" });
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

                const tableOptions = {
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
                    alternateRowStyles: {
                        fillColor: [248, 249, 250]
                    },
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
                };

                doc.autoTable(tableOptions);

                const pageCount = doc.getNumberOfPages();
                const pageHeight = doc.internal.pageSize.height;
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Generated by KSUCU-MC Administration System', 15, pageHeight - 10);
                    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 15, pageHeight - 10, { align: 'right' });
                }

                const fileName = `KSUCU_Students_Year_${yos}_${new Date().toISOString().split('T')[0]}.pdf`;
                doc.save(fileName);
            });

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    // Section render functions
    const renderDashboard = () => (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Dashboard Overview</h2>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3>{userCount}</h3>
                    <p>Total Students</p>
                </div>
                {pollingStats && (
                    <>
                        <div className={styles.statCard}>
                            <h3>{pollingStats.totalVoted}</h3>
                            <p>Voted</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>{pollingStats.totalNotVoted}</h3>
                            <p>Not Voted</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>{pollingStats.percentageVoted}%</h3>
                            <p>Completion</p>
                        </div>
                    </>
                )}
            </div>

            <h3 className={styles.subSectionTitle}>Quick Stats by Category</h3>
            <div className={styles.categoryStatsGrid}>
                <div className={styles.categoryCard}>
                    <h4>By Year of Study</h4>
                    <ul>
                        {Object.entries(usersByYos).map(([yos, count]) => (
                            <li key={yos}>YOS {yos}: <strong>{count}</strong></li>
                        ))}
                    </ul>
                </div>
                <div className={styles.categoryCard}>
                    <h4>By Ministry</h4>
                    <ul>
                        {Object.entries(usersByMinistry).map(([ministry, count]) => (
                            <li key={ministry}>{ministry}: <strong>{count}</strong></li>
                        ))}
                    </ul>
                </div>
                <div className={styles.categoryCard}>
                    <h4>By Evangelistic Team</h4>
                    <ul>
                        {Object.entries(usersByEt).map(([et, count]) => (
                            <li key={et}>{et}: <strong>{count}</strong></li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Academic Year Advancement */}
            <div style={{
                marginTop: '20px',
                padding: '16px',
                background: '#faf0f6',
                borderRadius: '8px',
                border: '1px solid #f0e0ec'
            }}>
                <h3 style={{ color: '#730051', marginBottom: '6px', fontSize: '15px', fontWeight: 700 }}>Academic Year Advancement</h3>
                <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px', lineHeight: '1.5' }}>
                    Advance all students by one year. Students at year 4 (or year 6 for medical) will be
                    promoted to Associate status automatically.
                </p>
                <button
                    className={styles.primaryButton}
                    onClick={() => setShowAdvanceConfirm(true)}
                >
                    Start Year Advancement
                </button>
            </div>
        </div>
    );

    const renderStudents = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Student List</h2>
                <button className={styles.primaryButton} onClick={handleExportPdfByYos}>
                    Download as PDF
                </button>
            </div>
            <table className={styles.dataTable}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Reg</th>
                        <th>Course</th>
                        <th>YOS</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={index}>
                            <td>{user.username}</td>
                            <td>{user.reg}</td>
                            <td>{user.course}</td>
                            <td>{user.yos}</td>
                            <td>
                                <button
                                    className={styles.actionButton}
                                    onClick={() => {
                                        setSelectedUserForDocUpload({
                                            _id: user.reg,
                                            username: user.username
                                        });
                                        setShowDocUploadModal(true);
                                    }}
                                >
                                    Upload Document
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderPolling = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Polling & Elections</h2>
                <button
                    className={styles.dangerButton}
                    onClick={() => setShowResetConfirm(true)}
                >
                    Reset Polling Data
                </button>
            </div>

            {pollingStats && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>{pollingStats.totalVoted}</h3>
                        <p>Voted</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>{pollingStats.totalNotVoted}</h3>
                        <p>Not Voted</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>{pollingStats.percentageVoted}%</h3>
                        <p>Completion</p>
                    </div>
                </div>
            )}

            <div className={styles.subSection}>
                <div className={styles.subSectionHeader}>
                    <h3 className={styles.subSectionTitle}>Polling Officers</h3>
                    <a href="/polling-officer-management" className={styles.linkButton}>
                        Manage Officers
                    </a>
                </div>

                {pollingOfficers.length > 0 ? (
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Registered</th>
                                <th>Voted</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pollingOfficers.map(officer => (
                                <tr key={officer._id}>
                                    <td>{officer.fullName}</td>
                                    <td>{officer.email}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[officer.status]}`}>
                                            {officer.status}
                                        </span>
                                    </td>
                                    <td>{officer.registeredCount || 0}</td>
                                    <td>{officer.votedCount || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className={styles.emptyState}>No polling officers yet. <a href="/polling-officer-management">Create one</a></p>
                )}
            </div>
        </div>
    );

    const renderMessages = () => (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Messages & Feedback</h2>

            <div className={styles.filterBar}>
                <label htmlFor="categorySelect">Filter by Category:</label>
                <select
                    id="categorySelect"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={styles.selectInput}
                >
                    <option value="all">All Categories</option>
                    <option value="feedback">Feedback</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="complaint">Complaint</option>
                    <option value="praise">Praise</option>
                    <option value="prayer">Prayer</option>
                    <option value="technical">Technical</option>
                    <option value="other">Other</option>
                </select>
            </div>

            {messages.length === 0 ? (
                <p className={styles.emptyState}>No messages yet.</p>
            ) : (
                <div className={styles.messagesGrid}>
                    {messages
                        .filter(msg => selectedCategory === 'all' || msg.category === selectedCategory)
                        .map((msg) => (
                            <div key={msg._id} className={styles.messageCard}>
                                <div className={styles.messageHeader}>
                                    <span className={styles.categoryBadge}>{msg.category}</span>
                                    <span className={styles.timestamp}>
                                        {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <h4 className={styles.messageSubject}>{msg.subject}</h4>
                                <p className={styles.messageContent}>{msg.message}</p>
                                <div className={styles.messageFooter}>
                                    {msg.isAnonymous ? (
                                        <span className={styles.anonymousBadge}>Anonymous</span>
                                    ) : (
                                        <span className={styles.senderInfo}>
                                            From: {msg.senderInfo?.username || 'Unknown'}
                                            {msg.senderInfo?.email && ` (${msg.senderInfo.email})`}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );

    const renderMinutes = () => (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Meeting Minutes</h2>
            <p className={styles.sectionDescription}>
                Manage and upload meeting minutes for record keeping.
                {minutesPinVerified && <span style={{ color: '#28a745', marginLeft: '8px' }}>(Unlocked)</span>}
            </p>
            <button
                className={styles.primaryButton}
                onClick={handleMinutesAccess}
            >
                {minutesPinVerified ? 'Open Minutes Manager' : 'Unlock Minutes'}
            </button>
        </div>
    );

    const renderDocuments = () => (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Document Management</h2>
            <p className={styles.sectionDescription}>
                Access the document dashboard to manage all uploaded documents.
            </p>
            <a href="/admin/documents" className={styles.primaryButton}>
                Go to Document Dashboard
            </a>
        </div>
    );

    const renderActiveSection = () => {
        // Committee section is offline/local-only, so it should render regardless of backend status
        if (activeSection === 'committee') {
            return <CommitteeManager />;
        }

        // Show loading only during initial fetch
        if (loading) {
            return (
                <div className={styles.loadingContainer}>
                    <p>Loading...</p>
                </div>
            );
        }

        switch (activeSection) {
            case 'dashboard':
                return renderDashboard();
            case 'students':
                return renderStudents();
            case 'polling':
                return renderPolling();
            case 'messages':
                return renderMessages();
            case 'minutes':
                return renderMinutes();
            case 'documents':
                return renderDocuments();
            default:
                return renderDashboard();
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.adminHeader}>
                <h1 className={styles.adminHeaderTitle}>
                    Super Admin Dashboard
                </h1>
                <button className={styles.logoutButton} onClick={handleLogout}>
                    Log Out
                </button>
                <button className={styles.menuButton} onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </header>
            <div className={styles.adminLayout}>
                <AdminSidebar
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    onLogout={handleLogout}
                />
                <main className={styles.mainContent}>
                    {renderActiveSection()}
                </main>
            </div>
            <footer className={styles.footerWrapper}>
            </footer>

            {/* Confirmation Dialog */}
            {showResetConfirm && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Reset Polling Data?</h3>
                        <p>
                            This will reset all voting records back to zero. All users will be marked as "not voted".
                            This action is meant for starting a new election period.
                        </p>
                        <p className={styles.warningText}>
                            <strong>Warning:</strong> This action cannot be undone!
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.secondaryButton}
                                onClick={() => setShowResetConfirm(false)}
                                disabled={isResetting}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.dangerButton}
                                onClick={handleResetPolling}
                                disabled={isResetting}
                            >
                                {isResetting ? 'Resetting...' : 'Yes, Reset'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Year Advancement Confirmation Dialog */}
            {showAdvanceConfirm && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        {advanceResult ? (
                            <>
                                <h3 style={{ color: '#166534' }}>Year Advancement Complete</h3>
                                <div style={{
                                    background: '#dcfce7',
                                    border: '1px solid #16a34a',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    margin: '15px 0'
                                }}>
                                    <p><strong>{advanceResult.advanced}</strong> students advanced to the next year</p>
                                    <p><strong>{advanceResult.promoted}</strong> students promoted to Associate</p>
                                    {advanceResult.skipped > 0 && (
                                        <p><strong>{advanceResult.skipped}</strong> students skipped (no valid year)</p>
                                    )}
                                </div>
                                <div className={styles.modalActions}>
                                    <button
                                        className={styles.primaryButton}
                                        onClick={() => { setShowAdvanceConfirm(false); setAdvanceResult(null); }}
                                    >
                                        Done
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>Advance Academic Year?</h3>
                                <p>
                                    This will advance ALL students by one year (1→2, 2→3, 3→4).
                                    Students at year 4 (or year 6 for medical students) will be promoted to Associate status.
                                </p>
                                <p className={styles.warningText}>
                                    <strong>Warning:</strong> This action cannot be undone! Make sure this is the right time to advance.
                                </p>
                                <div className={styles.modalActions}>
                                    <button
                                        className={styles.secondaryButton}
                                        onClick={() => setShowAdvanceConfirm(false)}
                                        disabled={isAdvancing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={styles.dangerButton}
                                        onClick={handleAdvanceYears}
                                        disabled={isAdvancing}
                                        style={{ background: '#730051' }}
                                    >
                                        {isAdvancing ? 'Advancing...' : 'Yes, Advance All'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Document Upload Modal */}
            {showDocUploadModal && selectedUserForDocUpload && (
                <div className={styles.modalOverlay}>
                    <DocumentUploader
                        userId={selectedUserForDocUpload._id}
                        userName={selectedUserForDocUpload.username}
                        onClose={() => {
                            setShowDocUploadModal(false);
                            setSelectedUserForDocUpload(null);
                        }}
                        onUploadSuccess={() => {
                            setShowDocUploadModal(false);
                            setSelectedUserForDocUpload(null);
                        }}
                    />
                </div>
            )}

            {/* Minutes Manager Modal */}
            {showMinutesManager && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalWrapper}>
                        <MinutesManager
                            onClose={() => setShowMinutesManager(false)}
                        />
                    </div>
                </div>
            )}

            {/* PIN Entry Modal */}
            {showPinEntry && (
                <PinEntry
                    onSubmit={handlePinSubmit}
                    onCancel={handlePinCancel}
                    isSetup={pinNeedsSetup}
                    error={pinError}
                    loading={pinLoading}
                />
            )}
        </div>
    );
};

export default SuperAdmin;
