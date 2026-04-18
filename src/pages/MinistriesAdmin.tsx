import React, { useState, useEffect } from 'react';
import styles from '../styles/ministriesAdmin.module.css';
import { getApiUrl } from '../config/environment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faLock,
    faUnlock,
    faCheckCircle,
    faTimes,
    faDownload,
    faList,
    faFileSignature,
    faRedo,
    faPlay,
    faStop,
    faCalendarAlt,
    faFilePdf,
    faTrash,
    faArchive,
    faClipboardList,
    faCommentDots,
    faReply
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface CommitmentForm {
    _id: string;
    userId: {
        _id: string;
        username: string;
        email: string;
    };
    fullName: string;
    phoneNumber: string;
    regNo: string;
    yearOfStudy: string;
    ministry: string;
    reasonForJoining: string;
    date: string;
    signature: string;
    croppedImage: string;
    status: 'pending' | 'approved' | 'revoked';
    submittedAt: string;
    reviewedBy?: {
        _id: string;
        username: string;
    };
    reviewedAt?: string;
}

interface AttendanceSession {
    _id: string;
    ministry: string;
    isActive: boolean;
    startTime: string;
    endTime?: string;
}

interface AttendanceRecord {
    _id: string;
    userId: {
        _id: string;
        username: string;
        email: string;
    };
    sessionId: string;
    ministry: string;
    signedAt: string;
}

interface GeneratedForm {
    id: string;
    title: string;
    ministry: string;
    leaderRole: string;
    sessionDate: string;
    createdAt: string;
    type: 'attendance' | 'commitment';
    recordCount: number;
    data: any[];
}

const MinistriesAdmin: React.FC = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [message, setMessage] = useState('');

    // Ministry selection and view mode
    const [selectedMinistry, setSelectedMinistry] = useState<'' | MinistryKey>('');
    const [viewMode, setViewMode] = useState<'attendance' | 'commitments' | 'forms' | 'registrations' | 'messages'>('commitments');
    const [commitmentForms, setCommitmentForms] = useState<CommitmentForm[]>([]);
    const [ministryRegistrations, setMinistryRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLeaderRole, setSelectedLeaderRole] = useState('');
    const [generatedForms, setGeneratedForms] = useState<GeneratedForm[]>([]);

    // Messages state
    const [messages, setMessages] = useState<any[]>([]);
    const [replyText, setReplyText] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
    const [isReplying, setIsReplying] = useState(false);

    // Attendance state
    const [attendanceSession, setAttendanceSession] = useState<AttendanceSession | null>(null);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

    // Leadership roles
    const leadershipRoles = [
        'Chairperson',
        'Vice Chair',
        'Secretary',
        'Treasurer',
        'Publicity Secretary',
        'Worship Coordinator',
        'Bible Study Coordinator',
        'Discipleship Coordinator',
        'Prayer Coordinator',
        'Missions Coordinator',
        'Boards Coordinator'
    ];

    type MinistryKey = 'wananzambe' | 'compassion' | 'pw' | 'intercessory' | 'cs' | 'hs' | 'ushering' | 'creativity' | 'choir';

    const ministries: MinistryKey[] = [
        'wananzambe',
        'compassion',
        'pw',
        'intercessory',
        'cs',
        'hs',
        'ushering',
        'creativity',
        'choir'
    ];

    const ministryNames: Record<MinistryKey, string> = {
        'wananzambe': 'Wananzambe',
        'compassion': 'Compassion',
        'pw': 'Praise and Worship',
        'intercessory': 'Intercessory',
        'cs': 'Church School',
        'hs': 'High School',
        'ushering': 'Ushering',
        'creativity': 'Creativity',
        'choir': 'Choir'
    };

    // Role to Ministry sets (which ministries belong to which role)
    const roleMinistries: Record<string, MinistryKey[]> = {
        'Worship Coordinator': ['wananzambe', 'pw', 'choir'],
        'Vice Chair': ['ushering', 'cs'],
        'Missions Coordinator': ['hs', 'compassion'],
        'Boards Coordinator': ['creativity'],
        'Prayer Coordinator': ['intercessory'],
        'Bible Study Coordinator': ['cs']
    };

    // Primary ministry for each role (used for auto-selection shortcut)
    const rolePrimaryMinistry: Record<string, MinistryKey> = {
        'Vice Chair': 'ushering',
        'Worship Coordinator': 'wananzambe',
        'Missions Coordinator': 'hs',
        'Boards Coordinator': 'creativity',
        'Prayer Coordinator': 'intercessory',
        'Bible Study Coordinator': 'cs'
    };

    // Ministry to Role (one-to-one mapping)
    const ministryToRoleMap: Record<MinistryKey, string> = {
        'wananzambe': 'Worship Coordinator',
        'pw': 'Worship Coordinator',
        'choir': 'Worship Coordinator',
        'cs': 'Vice Chair',
        'ushering': 'Vice Chair',
        'hs': 'Missions Coordinator',
        'compassion': 'Missions Coordinator',
        'creativity': 'Boards Coordinator',
        'intercessory': 'Prayer Coordinator'
    };

    // Sync Role -> Ministry (Shortcut selection)
    useEffect(() => {
        if (selectedLeaderRole && rolePrimaryMinistry[selectedLeaderRole]) {
            // Only switch ministry if current one is NOT handled by this role
            const allowedMinistries = roleMinistries[selectedLeaderRole] || [];
            if (!selectedMinistry || !allowedMinistries.includes(selectedMinistry as MinistryKey)) {
                setSelectedMinistry(rolePrimaryMinistry[selectedLeaderRole]);
            }
        }
    }, [selectedLeaderRole]);

    // Sync Ministry -> Role (Context for messages)
    useEffect(() => {
        if (selectedMinistry && ministryToRoleMap[selectedMinistry]) {
            const mappedRole = ministryToRoleMap[selectedMinistry];
            if (selectedLeaderRole !== mappedRole) {
                setSelectedLeaderRole(mappedRole);
            }
        }
    }, [selectedMinistry]);

    // Authentication
    const handleAuth = async () => {
        if (password === 'ksucu-ministries-admin-2024') {
            setAuthenticated(true);
            setAuthError('');
        } else {
            setAuthError('Incorrect password');
            setTimeout(() => setAuthError(''), 3000);
        }
    };

    // Load commitment forms for selected ministry
    const loadCommitmentForms = async () => {
        if (!selectedMinistry) return;

        setLoading(true);
        try {
            const response = await axios.get(
                `${getApiUrl('commitmentFormMinistry')}/${selectedMinistry}`,
                { withCredentials: true }
            );
            setCommitmentForms(response.data.commitments);
        } catch (error) {
            console.error('Error loading commitment forms:', error);
            setMessage('Error loading commitment forms');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    // Approve commitment form
    const approveCommitment = async (commitmentId: string) => {
        try {
            await axios.put(
                `${getApiUrl('commitmentFormApprove')}/${commitmentId}`,
                {},
                { withCredentials: true }
            );
            setMessage('Commitment form approved successfully');
            setTimeout(() => setMessage(''), 3000);
            await loadCommitmentForms(); // Reload the list
        } catch (error) {
            console.error('Error approving commitment:', error);
            setMessage('Error approving commitment form');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // Revoke commitment form
    const revokeCommitment = async (commitmentId: string) => {
        try {
            await axios.put(
                `${getApiUrl('commitmentFormRevoke')}/${commitmentId}`,
                {},
                { withCredentials: true }
            );
            setMessage('Commitment form revoked');
            setTimeout(() => setMessage(''), 3000);
            await loadCommitmentForms(); // Reload the list
        } catch (error) {
            console.error('Error revoking commitment:', error);
            setMessage('Error revoking commitment form');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // Load ministry registrations
    const loadMinistryRegistrations = async () => {
        if (!selectedMinistry) return;

        setLoading(true);
        try {
            // Use the correct API endpoint with ministry name
            const ministryName = ministryNames[selectedMinistry];
            const response = await axios.get(
                `${getApiUrl('baseUrl')}/api/ministry-registration/${encodeURIComponent(ministryName)}`,
                { withCredentials: true }
            );
            setMinistryRegistrations(response.data);
        } catch (error) {
            console.error('Error loading registrations:', error);
            setMessage('Error loading registrations');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    // Load messages for the selected role
    const loadMessages = async () => {
        if (!selectedLeaderRole) return;

        setLoading(true);
        try {
            const response = await axios.get(
                `${getApiUrl('messages')}/overseer/${encodeURIComponent(selectedLeaderRole)}`,
                { withCredentials: true }
            );
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error loading messages:', error);
            setMessage('Error loading messages');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    // Reply to a message
    const handleReply = async (messageId: string) => {
        if (!replyText.trim()) {
            setMessage('Please enter a reply');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        setIsReplying(true);
        try {
            await axios.put(
                `${getApiUrl('messages')}/${messageId}/reply`,
                { replyText: replyText.trim() },
                { withCredentials: true }
            );
            setMessage('Reply sent successfully');
            setTimeout(() => setMessage(''), 3000);
            setReplyText('');
            setSelectedMessage(null);
            await loadMessages();
        } catch (error) {
            console.error('Error sending reply:', error);
            setMessage('Error sending reply');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setIsReplying(false);
        }
    };

    // Load attendance session and records
    const loadAttendanceData = async () => {
        if (!selectedMinistry) return;

        console.log('Loading attendance data for:', selectedMinistry);
        setLoading(true);
        try {
            // Load session info
            const sessionResponse = await axios.get(
                `${getApiUrl('attendanceSession')}/${selectedMinistry}`,
                { withCredentials: true }
            );
            console.log('Session response:', sessionResponse.data);
            setAttendanceSession(sessionResponse.data.session);

            // Load attendance records if there's an active session
            if (sessionResponse.data.session) {
                const recordsResponse = await axios.get(
                    `${getApiUrl('attendanceRecords')}/${sessionResponse.data.session._id}`,
                    { withCredentials: true }
                );
                console.log('Records response:', recordsResponse.data);
                setAttendanceRecords(recordsResponse.data.records || []);
            } else {
                setAttendanceRecords([]);
            }
        } catch (error: any) {
            console.error('Error loading attendance data:', error);
            // Don't show error message for non-existent sessions, that's normal
            if (error.response?.status !== 404) {
                setMessage('Error loading attendance data');
                setTimeout(() => setMessage(''), 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    // Start attendance session
    const startAttendanceSession = async () => {
        if (!selectedMinistry) return;

        setLoading(true);
        try {
            const response = await axios.post(
                getApiUrl('attendanceStartSession'),
                { ministry: selectedMinistry },
                { withCredentials: true }
            );
            const newSession = response.data.session;
            setAttendanceSession(newSession);
            setAttendanceRecords([]);

            // Store session in localStorage for cross-device access
            localStorage.setItem(`attendanceSession_${selectedMinistry}`, JSON.stringify(newSession));

            // Broadcast session to other tabs/windows on same device
            window.localStorage.setItem('attendanceSessionUpdate', JSON.stringify({
                ministry: selectedMinistry,
                session: newSession,
                timestamp: Date.now()
            }));

            setMessage('Attendance session opened - Users can now sign attendance');
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            console.error('Error starting session:', error);
            setMessage('Error opening attendance session');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    // End attendance session
    const endAttendanceSession = async () => {
        if (!attendanceSession) return;

        if (!confirm('Are you sure you want to close the attendance session? Users will no longer be able to sign attendance.')) {
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                getApiUrl('attendanceEndSession'),
                { sessionId: attendanceSession._id },
                { withCredentials: true }
            );
            // Keep the session but mark as inactive
            const closedSession = { ...attendanceSession, isActive: false, endTime: new Date().toISOString() };
            setAttendanceSession(closedSession);

            // Update localStorage
            localStorage.setItem(`attendanceSession_${selectedMinistry}`, JSON.stringify(closedSession));

            // Broadcast session closure to other tabs/windows
            window.localStorage.setItem('attendanceSessionUpdate', JSON.stringify({
                ministry: selectedMinistry,
                session: closedSession,
                timestamp: Date.now()
            }));

            setMessage('Attendance session closed - Users can no longer sign attendance');
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            console.error('Error ending session:', error);
            setMessage('Error closing attendance session');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    // Reset attendance (clear records and end session)
    const resetAttendance = async () => {
        if (!selectedMinistry) {
            setMessage('Please select a ministry first');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        if (!confirm('Are you sure you want to reset attendance? This will clear all records for the current session and allow users to sign up again.')) {
            return;
        }

        setLoading(true);
        try {
            // First end the current session if it exists and is active
            if (attendanceSession && attendanceSession.isActive) {
                await axios.post(
                    getApiUrl('attendanceEndSession'),
                    { sessionId: attendanceSession._id },
                    { withCredentials: true }
                );
            }

            // Then start a new session
            const response = await axios.post(
                getApiUrl('attendanceStartSession'),
                { ministry: selectedMinistry },
                { withCredentials: true }
            );

            const resetSession = response.data.session;
            setAttendanceSession(resetSession);
            setAttendanceRecords([]);

            // Update localStorage with reset session
            localStorage.setItem(`attendanceSession_${selectedMinistry}`, JSON.stringify(resetSession));

            // Broadcast reset to other tabs/windows
            window.localStorage.setItem('attendanceSessionUpdate', JSON.stringify({
                ministry: selectedMinistry,
                session: resetSession,
                timestamp: Date.now()
            }));

            setMessage('Attendance has been reset - All previous records cleared, users can sign again');
            setTimeout(() => setMessage(''), 5000);
        } catch (error: any) {
            console.error('Error resetting attendance:', error);
            setMessage(`Error resetting attendance: ${error.response?.data?.message || error.message}`);
            setTimeout(() => setMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    // Generate attendance PDF content
    const generateAttendancePDFContent = (formData: GeneratedForm) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>KSUCU-MC - ${formData.title}</title>
                <style>
                    @page { size: A4; margin: 10mm; }
                    body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; font-size: 12px; }
                    .letterhead-img { width: 100%; max-width: 100%; height: auto; margin: 0 auto 15px; display: block; }
                    .header { text-align: center; margin-bottom: 15px; }
                    .header h2 { color: #730051; font-size: 18px; margin: 5px 0; font-weight: bold; }
                    .session-info { 
                        background: linear-gradient(135deg, #730051, #00C6FF); 
                        color: white; 
                        padding: 8px 15px; 
                        border-radius: 5px; 
                        margin: 10px 0;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .session-left { text-align: left; }
                    .session-right { text-align: right; }
                    .attendance-table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 10px 0; 
                        font-size: 11px;
                    }
                    .attendance-table th { 
                        background: linear-gradient(135deg, #730051, #8e1a6b); 
                        color: white; 
                        padding: 8px 4px; 
                        text-align: center; 
                        font-weight: bold; 
                        border: 1px solid #fff;
                        font-size: 10px;
                    }
                    .attendance-table td { 
                        padding: 4px; 
                        text-align: center; 
                        border: 1px solid #ddd; 
                        vertical-align: middle;
                    }
                    .signature-cell img {
                        max-width: 100%;
                        max-height: 26px;
                        object-fit: contain;
                        border: none;
                    }
                    .attendance-table tr:nth-child(even) { background: #f0f8ff; }
                    .attendance-table tr:nth-child(odd) { background: #fff; }
                    .attendance-table tr:hover { background: #e6f3ff; }
                    .name-col { text-align: left !important; font-weight: bold; color: #730051; }
                    .number-col { background: #00C6FF !important; color: white; font-weight: bold; }
                    .footer { 
                        margin-top: 15px; 
                        text-align: center; 
                        font-size: 9px; 
                        color: #666; 
                        border-top: 2px solid #730051; 
                        padding-top: 10px; 
                    }
                    .signature-section {
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                    }
                    .signature-box {
                        width: 45%;
                        text-align: center;
                        border: 2px solid #730051;
                        padding: 15px;
                        border-radius: 5px;
                    }
                    .signature-line { 
                        border-bottom: 2px solid #730051; 
                        margin: 10px 0; 
                        height: 30px;
                    }
                </style>
            </head>
            <body>
                <img src="${window.location.origin}/img/letterhead.png" class="letterhead-img" alt="KSUCU-MC Letterhead" />
                
                <div class="header">
                    <h2>${formData.title}</h2>
                </div>
                
                <div class="session-info">
                    <div class="session-left">
                        <strong>${formData.ministry} Ministry</strong><br>
                        <strong>Leader:</strong> ${formData.leaderRole}
                    </div>
                    <div class="session-right">
                        <strong>${formData.recordCount} Attendees</strong><br>
                        <strong>Date:</strong> ${formData.sessionDate}
                    </div>
                </div>

                <table class="attendance-table">
                    <thead>
                        <tr>
                            <th style="width: 6%;">#</th>
                            <th style="width: 28%;">NAME</th>
                            <th style="width: 22%;">REGISTRATION NO.</th>
                            <th style="width: 8%;">YEAR</th>
                            <th style="width: 15%;">PHONE</th>
                            <th style="width: 15%;">SIGN TIME</th>
                            <th style="width: 6%;">SIGNATURE</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${formData.data.map((record: any, index: number) => `
                            <tr>
                                <td class="number-col">${index + 1}</td>
                                <td class="name-col">${record.userId?.username || record.name || record.fullName || 'N/A'}</td>
                                <td>${record.regNo || record.registrationNumber || 'N/A'}</td>
                                <td>${record.year || record.yearOfStudy || 'N/A'}</td>
                                <td>${record.phoneNumber || record.phone || 'N/A'}</td>
                                <td>${new Date(record.signedAt || record.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</td>
                                <td style="height: 30px; border: 1px solid #ccc; padding: 2px; text-align: center;">
                                    ${(record.signature && record.signature.startsWith('data:image')) ?
                `<img src="${record.signature}" style="max-width: 100%; max-height: 26px; object-fit: contain;" alt="Signature" />` :
                '<span style="font-size: 10px; color: #999;">No signature</span>'
            }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="signature-section">
                    <div class="signature-box">
                        <strong style="color: #730051;">LEADER SIGNATURE</strong>
                        <div class="signature-line"></div>
                        <p>Name: _______________________</p>
                        <p>Date: _______________________</p>
                    </div>
                    <div class="signature-box">
                        <strong style="color: #730051;">MINISTRY COORDINATOR</strong>
                        <div class="signature-line"></div>
                        <p>Name: _______________________</p>
                        <p>Date: _______________________</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p style="color: #730051; font-weight: bold;">KSUCU-MC | P.O BOX 408-40200, KISII, KENYA</p>
                    <p>www.ksucumc.org | ksuchristianunion@gmail.com</p>
                </div>
            </body>
            </html>
        `;
    };

    // Generate commitment PDF content
    const generateCommitmentPDFContent = (formData: GeneratedForm) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>KSUCU-MC - ${formData.title}</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; line-height: 1.4; }
                    .letterhead-img { width: 100%; max-width: 800px; height: auto; margin: 0 auto 20px; display: block; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { color: #730051; font-size: 24px; margin: 10px 0; text-transform: uppercase; }
                    .header h2 { color: #00C6FF; font-size: 18px; margin: 5px 0; }
                    .report-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .report-info h3 { color: #730051; margin: 0 0 10px 0; }
                    .commitments-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .commitments-table th, .commitments-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                    .commitments-table th { background: #730051; color: white; font-weight: bold; }
                    .commitments-table tr:nth-child(even) { background: #f9f9f9; }
                    .status-badge { padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
                    .status-approved { background: #e8f5e8; color: #2d5a2d; }
                    .status-pending { background: #fff3cd; color: #856404; }
                    .status-revoked { background: #f8d7da; color: #721c24; }
                    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 20px; }
                </style>
            </head>
            <body>
                <img src="/img/letterhead.png" class="letterhead-img" alt="KSUCU-MC Letterhead" />
                
                <div class="header">
                    <h1>Kisii University Christian Union - Main Campus</h1>
                    <h2>${formData.title}</h2>
                </div>
                
                <div class="report-info">
                    <h3>Report Information</h3>
                    <p><strong>Ministry:</strong> ${formData.ministry}</p>
                    <p><strong>Leader Role:</strong> ${formData.leaderRole}</p>
                    <p><strong>Report Date:</strong> ${formData.sessionDate}</p>
                    <p><strong>Total Forms:</strong> ${formData.recordCount}</p>
                    <p><strong>Generated Date:</strong> ${new Date(formData.createdAt).toLocaleString()}</p>
                </div>

                <table class="commitments-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Full Name</th>
                            <th>Reg No.</th>
                            <th>Year</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Submitted</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${formData.data.map((commitment: any, index: number) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${commitment.fullName}</td>
                                <td>${commitment.regNo}</td>
                                <td>${commitment.yearOfStudy}</td>
                                <td>${commitment.phoneNumber}</td>
                                <td><span class="status-badge status-${commitment.status}">${commitment.status.toUpperCase()}</span></td>
                                <td>${new Date(commitment.submittedAt).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <hr />
                    <p><strong>KSUCU-MC | P.O BOX 408-40200, KISII, KENYA</strong></p>
                    <p>www.ksucumc.org | ksuchristianunion@gmail.com</p>
                    <p style="font-style: italic;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                </div>
            </body>
            </html>
        `;
    };

    // Download commitment form as PDF
    const downloadCommitmentPDF = (commitment: CommitmentForm) => {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>KSUCU - ${selectedMinistry ? ministryNames[selectedMinistry] : ''} - Commitment Form</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; }
                    .letterhead-img { width: 100%; max-width: 800px; height: auto; margin: 0 auto 20px; display: block; }
                    .document-title { text-align: center; margin: 20px 0; }
                    .document-title h2 { color: #730051; font-size: 20px; margin: 0; text-transform: uppercase; }
                    .form-section { margin: 20px 0; }
                    .form-row { display: flex; justify-content: space-between; margin: 10px 0; }
                    .form-field { flex: 1; margin-right: 20px; }
                    .form-field:last-child { margin-right: 0; }
                    label { font-weight: bold; display: block; margin-bottom: 5px; }
                    .value { border-bottom: 1px solid #333; padding-bottom: 2px; min-height: 20px; }
                    .signature-img { max-width: 200px; max-height: 100px; border: 1px solid #ccc; }
                    .status { padding: 10px; text-align: center; font-weight: bold; margin: 20px 0; }
                    .status.approved { background-color: #dcfce7; color: #166534; }
                    .status.pending { background-color: #fef3c7; color: #92400e; }
                    .status.revoked { background-color: #fef2f2; color: #dc2626; }
                    @media print {
                        .letterhead-img { max-height: 150px; }
                    }
                </style>
            </head>
            <body>
                <img src="/img/letterhead.png" class="letterhead-img" alt="KSUCU-MC Letterhead" />
                
                <div class="document-title">
                    <h2>${selectedMinistry ? ministryNames[selectedMinistry] : ''} - Commitment Form</h2>
                </div>
                
                <div class="status ${commitment.status}">
                    Status: ${commitment.status.toUpperCase()}
                </div>

                <div class="form-section">
                    <div class="form-row">
                        <div class="form-field">
                            <label>Full Name:</label>
                            <div class="value">${commitment.fullName}</div>
                        </div>
                        <div class="form-field">
                            <label>Registration Number:</label>
                            <div class="value">${commitment.regNo}</div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-field">
                            <label>Phone Number:</label>
                            <div class="value">${commitment.phoneNumber}</div>
                        </div>
                        <div class="form-field">
                            <label>Year of Study:</label>
                            <div class="value">${commitment.yearOfStudy}</div>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-field">
                            <label>Ministry:</label>
                            <div class="value">${ministryNames[commitment.ministry as MinistryKey] || commitment.ministry}</div>
                        </div>
                        <div class="form-field">
                            <label>Date Submitted:</label>
                            <div class="value">${new Date(commitment.submittedAt).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div style="margin: 20px 0;">
                        <label>Reason for Joining:</label>
                        <div class="value" style="min-height: 100px; padding: 10px; border: 1px solid #333;">
                            ${commitment.reasonForJoining}
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-field">
                            <label>Signature:</label>
                            <img src="${commitment.signature}" class="signature-img" alt="Signature" />
                        </div>
                        ${commitment.croppedImage ? `
                        <div class="form-field">
                            <label>Photo:</label>
                            <img src="${commitment.croppedImage}" style="max-width: 150px; max-height: 150px; border: 1px solid #ccc;" alt="Photo" />
                        </div>` : ''}
                    </div>
                    
                    ${commitment.reviewedBy ? `
                    <div style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 15px;">
                        <div class="form-row">
                            <div class="form-field">
                                <label>Reviewed By:</label>
                                <div class="value">${commitment.reviewedBy.username}</div>
                            </div>
                            <div class="form-field">
                                <label>Review Date:</label>
                                <div class="value">${new Date(commitment.reviewedAt || '').toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
                    <hr style="border: none; border-top: 1px solid #ccc; margin-bottom: 10px;" />
                    <p style="margin: 5px 0;">KSUCU-MC | P.O BOX 408-40200, KISII, KENYA</p>
                    <p style="margin: 5px 0;">www.ksucumc.org | ksuchristianunion@gmail.com</p>
                    <p style="margin: 5px 0; font-style: italic;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => printWindow.print(), 100);
        }
    };

    // Load generated forms from localStorage
    const loadGeneratedForms = () => {
        try {
            const storedForms = localStorage.getItem('generatedForms');
            if (storedForms) {
                const forms = JSON.parse(storedForms);
                // Filter forms by selected role or ministry if specified
                let filteredForms = forms;
                if (selectedLeaderRole) {
                    filteredForms = forms.filter((form: GeneratedForm) => form.leaderRole === selectedLeaderRole);
                } else if (selectedMinistry) {
                    filteredForms = forms.filter((form: GeneratedForm) => form.ministry === selectedMinistry);
                }
                // Sort by creation date, newest first
                filteredForms.sort((a: GeneratedForm, b: GeneratedForm) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setGeneratedForms(filteredForms);
            } else {
                setGeneratedForms([]);
            }
        } catch (error) {
            console.error('Error loading generated forms:', error);
            setGeneratedForms([]);
        }
    };

    // Generate attendance form PDF
    const generateAttendanceForm = () => {
        if (!attendanceRecords.length && selectedMinistry) {
            setMessage('No attendance records to generate form');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        const ministry = selectedMinistry ? ministryNames[selectedMinistry] : 'All Ministries';
        const leaderRole = selectedLeaderRole || 'Ministry Leader';
        const sessionDate = attendanceSession?.startTime ?
            new Date(attendanceSession.startTime).toLocaleDateString() :
            new Date().toLocaleDateString();

        const formData: GeneratedForm = {
            id: Date.now().toString(),
            title: `${ministry} - Attendance Form`,
            ministry: ministry,
            leaderRole: leaderRole,
            sessionDate: sessionDate,
            createdAt: new Date().toISOString(),
            type: 'attendance',
            recordCount: attendanceRecords.length,
            data: attendanceRecords
        };

        // Save to localStorage
        const existingForms = JSON.parse(localStorage.getItem('generatedForms') || '[]');
        existingForms.push(formData);
        localStorage.setItem('generatedForms', JSON.stringify(existingForms));

        // Generate PDF
        downloadFormPDF(formData);

        setMessage('Attendance form generated successfully!');
        setTimeout(() => setMessage(''), 3000);
        loadGeneratedForms();
    };

    // Generate commitment form PDF
    const generateCommitmentForm = () => {
        if (!commitmentForms.length && selectedMinistry) {
            setMessage('No commitment forms to generate PDF');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        const ministry = selectedMinistry ? ministryNames[selectedMinistry] : 'All Ministries';
        const leaderRole = selectedLeaderRole || 'Ministry Leader';

        const formData: GeneratedForm = {
            id: Date.now().toString(),
            title: `${ministry} - Commitment Forms Report`,
            ministry: ministry,
            leaderRole: leaderRole,
            sessionDate: new Date().toLocaleDateString(),
            createdAt: new Date().toISOString(),
            type: 'commitment',
            recordCount: commitmentForms.length,
            data: commitmentForms
        };

        // Save to localStorage
        const existingForms = JSON.parse(localStorage.getItem('generatedForms') || '[]');
        existingForms.push(formData);
        localStorage.setItem('generatedForms', JSON.stringify(existingForms));

        // Generate PDF
        downloadFormPDF(formData);

        setMessage('Commitment forms report generated successfully!');
        setTimeout(() => setMessage(''), 3000);
        loadGeneratedForms();
    };

    // Download form PDF
    const downloadFormPDF = (formData: GeneratedForm) => {
        let htmlContent = '';

        if (formData.type === 'attendance') {
            htmlContent = generateAttendancePDFContent(formData);
        } else {
            htmlContent = generateCommitmentPDFContent(formData);
        }

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => printWindow.print(), 100);
        }
    };

    // Delete form
    const deleteForm = (formId: string) => {
        if (confirm('Are you sure you want to delete this form?')) {
            const existingForms = JSON.parse(localStorage.getItem('generatedForms') || '[]');
            const updatedForms = existingForms.filter((form: GeneratedForm) => form.id !== formId);
            localStorage.setItem('generatedForms', JSON.stringify(updatedForms));
            loadGeneratedForms();
            setMessage('Form deleted successfully!');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    useEffect(() => {
        if (authenticated && selectedMinistry) {
            if (viewMode === 'commitments') {
                loadCommitmentForms();
            } else if (viewMode === 'attendance') {
                loadAttendanceData();
            } else if (viewMode === 'forms') {
                loadGeneratedForms();
            } else if (viewMode === 'registrations') {
                loadMinistryRegistrations();
            } else if (viewMode === 'messages') {
                loadMessages();
            }
        }
    }, [authenticated, selectedMinistry, viewMode, selectedLeaderRole]);

    useEffect(() => {
        if (authenticated && viewMode === 'forms') {
            loadGeneratedForms();
        }
    }, [authenticated, viewMode, selectedLeaderRole]);

    if (!authenticated) {
        return (
            <div className={styles.container}>
                <div className={styles.authContainer}>
                    <div className={styles.authCard}>
                        <FontAwesomeIcon icon={faLock} className={styles.lockIcon} />
                        <h2 className={styles.authTitle}>Ministries Administration</h2>
                        <p className={styles.authSubtitle}>Enter password to access admin panel</p>

                        <div className={styles.inputGroup}>
                            <input
                                type="password"
                                className={styles.passwordInput}
                                placeholder="Enter admin password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                            />
                        </div>

                        {authError && <div className={styles.errorMessage}>{authError}</div>}

                        <button
                            className={styles.authButton}
                            onClick={handleAuth}
                        >
                            <FontAwesomeIcon icon={faUnlock} /> Access Admin Panel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.adminContainer}>
                <div className={styles.adminHeader}>
                    <h1 className={styles.adminTitle}>
                        <FontAwesomeIcon icon={faUsers} /> Ministries Administration
                    </h1>
                    {message && (
                        <div className={`${styles.message} ${message.includes('Error') ? styles.error : styles.success}`}>
                            {message}
                        </div>
                    )}
                </div>

                <div className={styles.controlPanel}>
                    {/* Leadership Role Selection Section */}
                    <div className={styles.leadershipSelection}>
                        <h3 className={styles.leadershipTitle}>
                            <FontAwesomeIcon icon={faUsers} /> Leadership Role Selection
                        </h3>
                        <p className={styles.leadershipDescription}>
                            Select your leadership role to open centralized attendance for all members
                        </p>
                        <div className={styles.leadershipRoleGrid}>
                            {[
                                'Chairperson',
                                'Vice Chair',
                                'Secretary',
                                'Treasurer',
                                'Publicity Secretary',
                                'Worship Coordinator',
                                'Bible Study Coordinator',
                                'Discipleship Coordinator',
                                'Prayer Coordinator',
                                'Missions Coordinator',
                                'Boards Coordinator'
                            ].map((role) => (
                                <button
                                    key={role}
                                    className={styles.leadershipRoleButton}
                                    onClick={() => {
                                        setSelectedMinistry(''); // Clear ministry selection for centralized mode
                                        setViewMode('attendance');
                                        setMessage(`Selected role: ${role} - Managing centralized attendance`);
                                        setTimeout(() => setMessage(''), 3000);
                                    }}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.sectionDivider}>
                        <span className={styles.dividerText}>OR</span>
                    </div>

                    <div className={styles.ministrySelector}>
                        <label htmlFor="ministry-select" className={styles.selectorLabel}>
                            <FontAwesomeIcon icon={faList} /> Select Specific Ministry:
                        </label>
                        <select
                            id="ministry-select"
                            className={styles.select}
                            value={selectedMinistry}
                            onChange={(e) => setSelectedMinistry(e.target.value as '' | MinistryKey)}
                        >
                            <option value="">Choose a ministry...</option>
                            {ministries.map(ministry => (
                                <option key={ministry} value={ministry}>
                                    {ministryNames[ministry]}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedMinistry && (
                        <div className={styles.viewModeSelector}>
                            <label className={styles.selectorLabel}>View:</label>
                            <div className={styles.tabButtons}>
                                <button
                                    className={`${styles.tabButton} ${viewMode === 'commitments' ? styles.active : ''}`}
                                    onClick={() => setViewMode('commitments')}
                                >
                                    <FontAwesomeIcon icon={faFileSignature} /> Commitment Forms
                                </button>
                                <button
                                    className={`${styles.tabButton} ${viewMode === 'attendance' ? styles.active : ''}`}
                                    onClick={() => setViewMode('attendance')}
                                >
                                    <FontAwesomeIcon icon={faUsers} /> Attendance
                                </button>
                                <button
                                    className={`${styles.tabButton} ${viewMode === 'forms' ? styles.active : ''}`}
                                    onClick={() => setViewMode('forms')}
                                >
                                    <FontAwesomeIcon icon={faArchive} /> Forms Management
                                </button>
                                <button
                                    className={`${styles.tabButton} ${viewMode === 'registrations' ? styles.active : ''}`}
                                    onClick={() => setViewMode('registrations')}
                                >
                                    <FontAwesomeIcon icon={faClipboardList} /> Ministry Registrations
                                </button>
                                <button
                                    className={`${styles.tabButton} ${viewMode === 'messages' ? styles.active : ''}`}
                                    onClick={() => setViewMode('messages')}
                                >
                                    <FontAwesomeIcon icon={faCommentDots} /> Messages
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {selectedMinistry && viewMode === 'commitments' && (
                    <div className={styles.contentArea}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                {selectedMinistry && ministryNames[selectedMinistry]} - Commitment Forms
                            </h2>
                        </div>

                        {loading ? (
                            <div className={styles.loading}>Loading commitment forms...</div>
                        ) : (
                            <div className={styles.commitmentsList}>
                                {commitmentForms.length === 0 ? (
                                    <div className={styles.noData}>
                                        No commitment forms found for this ministry.
                                    </div>
                                ) : (
                                    commitmentForms.map((commitment, index) => (
                                        <div key={commitment._id} className={styles.commitmentCard}>
                                            <div className={styles.commitmentHeader}>
                                                <div className={styles.commitmentInfo}>
                                                    <h3 className={styles.commitmentName}>
                                                        {index + 1}. {commitment.fullName}
                                                    </h3>
                                                    <p className={styles.commitmentDetails}>
                                                        Reg: {commitment.regNo} | Year: {commitment.yearOfStudy}
                                                    </p>
                                                </div>
                                                <div className={styles.commitmentActions}>
                                                    <span className={`${styles.statusBadge} ${styles[commitment.status]}`}>
                                                        {commitment.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={styles.commitmentMeta}>
                                                <p><strong>Phone:</strong> {commitment.phoneNumber}</p>
                                                <p><strong>Submitted:</strong> {new Date(commitment.submittedAt).toLocaleDateString()}</p>
                                                {commitment.reviewedAt && (
                                                    <p><strong>Reviewed:</strong> {new Date(commitment.reviewedAt).toLocaleDateString()}</p>
                                                )}
                                            </div>

                                            <div className={styles.commitmentActions}>
                                                {commitment.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className={`${styles.actionButton} ${styles.approve}`}
                                                            onClick={() => approveCommitment(commitment._id)}
                                                        >
                                                            <FontAwesomeIcon icon={faCheckCircle} /> Approve
                                                        </button>
                                                        <button
                                                            className={`${styles.actionButton} ${styles.revoke}`}
                                                            onClick={() => revokeCommitment(commitment._id)}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} /> Revoke
                                                        </button>
                                                    </>
                                                )}

                                                {commitment.status === 'approved' && (
                                                    <button
                                                        className={`${styles.actionButton} ${styles.revoke}`}
                                                        onClick={() => revokeCommitment(commitment._id)}
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} /> Revoke
                                                    </button>
                                                )}

                                                {commitment.status === 'revoked' && (
                                                    <button
                                                        className={`${styles.actionButton} ${styles.approve}`}
                                                        onClick={() => approveCommitment(commitment._id)}
                                                    >
                                                        <FontAwesomeIcon icon={faCheckCircle} /> Approve
                                                    </button>
                                                )}

                                                <button
                                                    className={`${styles.actionButton} ${styles.download}`}
                                                    onClick={() => downloadCommitmentPDF(commitment)}
                                                >
                                                    <FontAwesomeIcon icon={faDownload} /> Download PDF
                                                </button>

                                                <button
                                                    className={`${styles.actionButton} ${styles.generate}`}
                                                    onClick={generateCommitmentForm}
                                                    title="Generate forms report with KSUCU header"
                                                >
                                                    <FontAwesomeIcon icon={faFilePdf} /> Generate Report
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {viewMode === 'attendance' && (
                    <div className={styles.contentArea}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                {selectedMinistry ?
                                    `${ministryNames[selectedMinistry]} - Attendance Management` :
                                    'Centralized Attendance Management'
                                }
                            </h2>

                            <div className={styles.sessionControls}>
                                {/* ALWAYS VISIBLE BUTTONS FOR TESTING */}
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                                    <button
                                        className={`${styles.actionButton} ${styles.startSession}`}
                                        onClick={startAttendanceSession}
                                        disabled={loading}
                                        style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 24px', fontSize: '16px' }}
                                    >
                                        <FontAwesomeIcon icon={faPlay} /> Open Session
                                    </button>
                                    <button
                                        className={`${styles.actionButton} ${styles.resetSession}`}
                                        onClick={resetAttendance}
                                        disabled={loading}
                                        style={{ backgroundColor: '#f59e0b', color: 'white', padding: '12px 24px', fontSize: '16px' }}
                                    >
                                        <FontAwesomeIcon icon={faRedo} /> Reset Attendance
                                    </button>
                                    <button
                                        className={`${styles.actionButton} ${styles.endSession}`}
                                        onClick={endAttendanceSession}
                                        disabled={loading}
                                        style={{ backgroundColor: '#ef4444', color: 'white', padding: '12px 24px', fontSize: '16px' }}
                                    >
                                        <FontAwesomeIcon icon={faStop} /> Close Session
                                    </button>
                                </div>

                                {/* Show open button when no active session */}
                                {(!attendanceSession || !attendanceSession.isActive) && (
                                    <div style={{ padding: '10px', background: '#f0f0f0', margin: '10px 0', borderRadius: '8px' }}>
                                        <p><strong>Status:</strong> No active session - Click button above to open session</p>
                                    </div>
                                )}

                                {/* Show session controls when active */}
                                {attendanceSession && attendanceSession.isActive && (
                                    <>
                                        <div className={styles.sessionInfo}>
                                            <span className={`${styles.sessionStatus} ${styles.active}`}>
                                                Session Open - Users can sign attendance
                                            </span>
                                            <span className={styles.sessionTime}>
                                                Opened: {new Date(attendanceSession.startTime).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className={styles.sessionActions}>
                                            <button
                                                className={`${styles.actionButton} ${styles.resetSession}`}
                                                onClick={resetAttendance}
                                                disabled={loading}
                                                title="Reset attendance - clears all records and restarts session"
                                            >
                                                <FontAwesomeIcon icon={faRedo} /> Reset Attendance
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.endSession}`}
                                                onClick={endAttendanceSession}
                                                disabled={loading}
                                            >
                                                <FontAwesomeIcon icon={faStop} /> Close Session
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className={styles.loading}>Loading attendance data...</div>
                        ) : (
                            <div className={styles.attendanceContent}>
                                {attendanceSession && attendanceRecords.length > 0 ? (
                                    <>
                                        <div className={styles.attendanceStats}>
                                            <div className={styles.statCard}>
                                                <FontAwesomeIcon icon={faUsers} className={styles.statIcon} />
                                                <div className={styles.statNumber}>{attendanceRecords.length}</div>
                                                <div className={styles.statLabel}>Total Attendees</div>
                                            </div>
                                        </div>

                                        <div className={styles.attendanceList}>
                                            <h3 className={styles.listTitle}>
                                                <FontAwesomeIcon icon={faCalendarAlt} /> Attendance List
                                            </h3>
                                            <div className={styles.attendeeGrid}>
                                                {attendanceRecords.map((record, index) => (
                                                    <div key={record._id} className={styles.attendeeCard}>
                                                        <div className={styles.attendeeNumber}>{index + 1}</div>
                                                        <div className={styles.attendeeInfo}>
                                                            <div className={styles.attendeeName}>
                                                                {record.userId.username}
                                                            </div>
                                                            <div className={styles.attendeeEmail}>
                                                                {record.userId.email}
                                                            </div>
                                                            <div className={styles.attendeeTime}>
                                                                Signed: {new Date(record.signedAt).toLocaleTimeString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Generate attendance form button */}
                                        {attendanceRecords.length > 0 && (
                                            <div className={styles.generateFormSection}>
                                                <button
                                                    className={`${styles.actionButton} ${styles.generate}`}
                                                    onClick={generateAttendanceForm}
                                                    title="Generate attendance form with KSUCU header"
                                                >
                                                    <FontAwesomeIcon icon={faFilePdf} /> Generate Attendance Form
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : attendanceSession ? (
                                    <div className={styles.noData}>
                                        <FontAwesomeIcon icon={faUsers} className={styles.noDataIcon} />
                                        {attendanceSession.isActive ? (
                                            <>
                                                <p>No attendance records yet.</p>
                                                <p className={styles.noDataSubtext}>
                                                    Session is open - waiting for users to sign attendance...
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p>Session closed - Final attendance count: {attendanceRecords.length}</p>
                                                <p className={styles.noDataSubtext}>
                                                    Session was closed at {attendanceSession.endTime ? new Date(attendanceSession.endTime).toLocaleString() : 'unknown time'}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className={styles.noData}>
                                        <FontAwesomeIcon icon={faCalendarAlt} className={styles.noDataIcon} />
                                        <p>No attendance session started.</p>
                                        <p className={styles.noDataSubtext}>
                                            Click "Open Attendance Session" to allow users to sign attendance.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Forms Management View */}
                {viewMode === 'forms' && (
                    <div className={styles.contentArea}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <FontAwesomeIcon icon={faArchive} /> Forms Management
                            </h2>
                            <p className={styles.sectionDescription}>
                                View, download, and manage all generated forms with KSUCU headers
                            </p>
                        </div>

                        {/* Leader Role Selector */}
                        <div className={styles.leaderRoleSelector}>
                            <label className={styles.selectorLabel}>
                                <FontAwesomeIcon icon={faUsers} /> Filter by Leader Role:
                            </label>
                            <select
                                className={styles.select}
                                value={selectedLeaderRole}
                                onChange={(e) => setSelectedLeaderRole(e.target.value)}
                            >
                                <option value="">All Leader Roles</option>
                                {leadershipRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>

                        {loading ? (
                            <div className={styles.loading}>Loading forms...</div>
                        ) : (
                            <div className={styles.formsList}>
                                {generatedForms.length === 0 ? (
                                    <div className={styles.noData}>
                                        <FontAwesomeIcon icon={faFilePdf} className={styles.noDataIcon} />
                                        <p>No forms have been generated yet.</p>
                                        <p className={styles.noDataSubtext}>
                                            Generate forms from the Attendance or Commitment Forms sections.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.formsHeader}>
                                            <h3>Generated Forms ({generatedForms.length})</h3>
                                            <p>Latest forms appear first</p>
                                        </div>

                                        <div className={styles.formsGrid}>
                                            {generatedForms.map((form, index) => (
                                                <div key={form.id} className={styles.formCard}>
                                                    <div className={styles.formHeader}>
                                                        <div className={styles.formNumber}>{index + 1}.</div>
                                                        <div className={styles.formInfo}>
                                                            <h4 className={styles.formTitle}>{form.title}</h4>
                                                            <div className={styles.formMeta}>
                                                                <span className={styles.formType}>
                                                                    <FontAwesomeIcon icon={form.type === 'attendance' ? faUsers : faFileSignature} />
                                                                    {form.type === 'attendance' ? 'Attendance' : 'Commitment'}
                                                                </span>
                                                                <span className={styles.formCount}>
                                                                    {form.recordCount} records
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={styles.formDetails}>
                                                        <p><strong>Ministry:</strong> {form.ministry}</p>
                                                        <p><strong>Leader Role:</strong> {form.leaderRole}</p>
                                                        <p><strong>Session Date:</strong> {form.sessionDate}</p>
                                                        <p><strong>Generated:</strong> {new Date(form.createdAt).toLocaleString()}</p>
                                                    </div>

                                                    <div className={styles.formActions}>
                                                        <button
                                                            className={`${styles.actionButton} ${styles.download}`}
                                                            onClick={() => downloadFormPDF(form)}
                                                            title="Download PDF"
                                                        >
                                                            <FontAwesomeIcon icon={faDownload} /> Download
                                                        </button>
                                                        <button
                                                            className={`${styles.actionButton} ${styles.delete}`}
                                                            onClick={() => deleteForm(form.id)}
                                                            title="Delete form"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Ministry Registrations View */}
                {viewMode === 'registrations' && (
                    <div className={styles.contentArea}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <FontAwesomeIcon icon={faClipboardList} />
                                {selectedMinistry ? `${ministryNames[selectedMinistry]} - Registrations` : 'Ministry Registrations'}
                            </h2>
                            <p className={styles.sectionDescription}>
                                View new members who have registered to join via the online form
                            </p>
                        </div>

                        {loading ? (
                            <div className={styles.loading}>Loading registrations...</div>
                        ) : (
                            <div className={styles.registrationsList}>
                                {ministryRegistrations.length === 0 ? (
                                    <div className={styles.noData}>
                                        <FontAwesomeIcon icon={faClipboardList} className={styles.noDataIcon} />
                                        <p>No new registrations found for this ministry.</p>
                                    </div>
                                ) : (
                                    <div className={styles.tableResponsive}>
                                        <table className={styles.dataTable} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#730051', color: 'white', textAlign: 'left' }}>
                                                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>#</th>
                                                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Name</th>
                                                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Reg Number</th>
                                                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Phone</th>
                                                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Gender</th>
                                                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Year</th>
                                                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Course</th>
                                                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Reason</th>
                                                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ministryRegistrations.map((reg, index) => (
                                                    <tr key={reg._id} style={{ borderBottom: '1px solid #ddd', backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                                                        <td style={{ padding: '10px' }}>{index + 1}</td>
                                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{reg.fullName}</td>
                                                        <td style={{ padding: '10px' }}>{reg.registrationNumber}</td>
                                                        <td style={{ padding: '10px' }}>{reg.phoneNumber}</td>
                                                        <td style={{ padding: '10px' }}>{reg.gender}</td>
                                                        <td style={{ padding: '10px' }}>{reg.yearOfStudy}</td>
                                                        <td style={{ padding: '10px' }}>{reg.course}</td>
                                                        <td style={{ padding: '10px', maxWidth: '200px' }}>
                                                            <div style={{ maxHeight: '60px', overflowY: 'auto', fontSize: '12px' }}>
                                                                {reg.reasonForJoining}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '10px', fontSize: '12px' }}>
                                                            {new Date(reg.createdAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {/* Messages View */}
                {viewMode === 'messages' && (
                    <div className={styles.contentArea}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <FontAwesomeIcon icon={faCommentDots} />
                                {selectedMinistry ? `${ministryNames[selectedMinistry]} - Messages` : 'Ministry Messages'}
                            </h2>
                            <p className={styles.sectionDescription}>
                                Read and respond to messages from members
                            </p>
                        </div>

                        {loading ? (
                            <div className={styles.loading}>Loading messages...</div>
                        ) : (
                            <div className={styles.messagesList}>
                                {messages.length === 0 ? (
                                    <div className={styles.noData}>
                                        <FontAwesomeIcon icon={faCommentDots} className={styles.noDataIcon} />
                                        <p>No messages found for your role.</p>
                                    </div>
                                ) : (
                                    <div className={styles.messageGrid}>
                                        {messages.map((msg) => (
                                            <div key={msg._id} className={`${styles.messageCard} ${msg.status === 'new' ? styles.newMessage : ''}`}>
                                                <div className={styles.messageHeader}>
                                                    <div className={styles.messageSenderInfo}>
                                                        <h4 className={styles.messageSubject}>{msg.subject}</h4>
                                                        <p className={styles.sender}>
                                                            From: {msg.isAnonymous ? 'Anonymous' : msg.senderInfo?.username || 'Guest'}
                                                            {!msg.isAnonymous && msg.senderInfo?.phone && ` (${msg.senderInfo.phone})`}
                                                        </p>
                                                    </div>
                                                    <div className={styles.messageMeta}>
                                                        <span className={`${styles.statusBadge} ${styles[msg.status]}`}>
                                                            {msg.status.toUpperCase()}
                                                        </span>
                                                        <span className={styles.date}>
                                                            {new Date(msg.timestamp).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={styles.messageBody}>
                                                    <p>{msg.message}</p>
                                                </div>

                                                {msg.replyText && (
                                                    <div className={styles.overseerReply}>
                                                        <div className={styles.replyHeader}>
                                                            <FontAwesomeIcon icon={faReply} /> Your Reply:
                                                        </div>
                                                        <p>{msg.replyText}</p>
                                                        <span className={styles.replyDate}>
                                                            {new Date(msg.repliedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className={styles.messageActions}>
                                                    <button
                                                        className={`${styles.actionButton} ${styles.replyButton}`}
                                                        onClick={() => setSelectedMessage(msg)}
                                                    >
                                                        <FontAwesomeIcon icon={faReply} /> {msg.replyText ? 'View/Edit Reply' : 'Reply'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Reply Modal */}
                {selectedMessage && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <div className={styles.modalHeader}>
                                <h3>Reply to: {selectedMessage.subject}</h3>
                                <button className={styles.closeModal} onClick={() => setSelectedMessage(null)}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                <div className={styles.originalMessage}>
                                    <strong>Original Message:</strong>
                                    <p>{selectedMessage.message}</p>
                                </div>
                                <div className={styles.replyForm}>
                                    <label>Your Response:</label>
                                    <textarea
                                        value={replyText || selectedMessage.replyText || ''}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your response here..."
                                        rows={6}
                                        className={styles.textarea}
                                    />
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    className={styles.cancelButton}
                                    onClick={() => setSelectedMessage(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={styles.confirmButton}
                                    onClick={() => handleReply(selectedMessage._id)}
                                    disabled={isReplying}
                                >
                                    {isReplying ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MinistriesAdmin;
