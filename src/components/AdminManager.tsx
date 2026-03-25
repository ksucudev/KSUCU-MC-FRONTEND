import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/environment';
import styles from '../styles/finance.module.css';

type AdminType = 'patron' | 'chairperson' | 'superadmin' | 'admission' | 'bs' | 'mission' | 'news' | 'overseer';

interface AdminUser {
  _id: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

const adminTabs: { id: AdminType; label: string; hasPhone: boolean; singleOnly?: boolean }[] = [
  { id: 'patron', label: 'Patron', hasPhone: false, singleOnly: true },
  { id: 'chairperson', label: 'Chairperson', hasPhone: true },
  { id: 'superadmin', label: 'Super Admin', hasPhone: true },
  { id: 'admission', label: 'Admission', hasPhone: true },
  { id: 'bs', label: 'Bible Study', hasPhone: true },
  { id: 'mission', label: 'Mission', hasPhone: true },
  { id: 'news', label: 'News', hasPhone: true },
  { id: 'overseer', label: 'Overseer', hasPhone: false },
];

const AdminManager: React.FC = () => {
  const [activeType, setActiveType] = useState<AdminType>('patron');
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ email: '', password: '', phone: '' });
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  const [resetModal, setResetModal] = useState<{ id: string; email: string } | null>(null);
  const [resetPw, setResetPw] = useState('');
  const [showResetPw, setShowResetPw] = useState(false);

  const baseURL = getApiUrl('superAdmin').replace('/login', '');

  const currentTab = adminTabs.find(t => t.id === activeType)!;

  useEffect(() => { loadAdmins(); }, [activeType]);

  const loadAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${baseURL}/admins/${activeType}`, { withCredentials: true });
      setAdmins(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load.');
    }
    setLoading(false);
  };

  const passwordChecks = (pw: string) => ({
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
  });

  const isPasswordValid = (pw: string) => {
    const c = passwordChecks(pw);
    return c.length && c.upper && c.lower && c.number && c.special;
  };

  const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
    const c = passwordChecks(password);
    if (!password) return null;
    const items = [
      { ok: c.length, label: '8+ characters' },
      { ok: c.upper, label: 'Uppercase' },
      { ok: c.lower, label: 'Lowercase' },
      { ok: c.number, label: 'Number' },
      { ok: c.special, label: 'Special char' },
    ];
    return (
      <div style={{ fontSize: '11px', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
        {items.map(i => (
          <span key={i.label} style={{ color: i.ok ? '#16a34a' : '#999' }}>
            {i.ok ? '\u2713' : '\u2022'} {i.label}
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid(form.password)) { setError('Password does not meet requirements.'); return; }
    setError(''); setSuccess('');
    try {
      const body: any = { email: form.email, password: form.password };
      if (currentTab.hasPhone && form.phone) body.phone = form.phone;
      await axios.post(`${baseURL}/admins/${activeType}`, body, { withCredentials: true });
      setSuccess(`${currentTab.label} admin created.`);
      setForm({ email: '', password: '', phone: '' });
      loadAdmins();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to create.'); }
  };

  const handleResetPassword = async () => {
    if (!resetModal) return;
    if (!isPasswordValid(resetPw)) { setError('Password does not meet requirements.'); return; }
    setError(''); setSuccess('');
    try {
      await axios.put(`${baseURL}/admins/${activeType}/${resetModal.id}/reset-password`, { password: resetPw }, { withCredentials: true });
      setSuccess(`Password reset for ${resetModal.email}.`);
      setResetModal(null);
      setResetPw('');
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to reset.'); }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setSuccess(`Copied: ${email}`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete ${currentTab.label} admin ${email}?`)) return;
    setError(''); setSuccess('');
    try {
      await axios.delete(`${baseURL}/admins/${activeType}/${id}`, { withCredentials: true });
      setSuccess(`${email} deleted.`);
      loadAdmins();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to delete.'); }
  };

  const showCreateForm = !(currentTab.singleOnly && admins.length > 0);

  return (
    <div className={styles.financePanel}>
      <div className={styles.tabBar}>
        {adminTabs.map(t => (
          <button
            key={t.id}
            className={`${styles.tab} ${activeType === t.id ? styles.activeTab : ''}`}
            onClick={() => { setActiveType(t.id); setError(''); setSuccess(''); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.tabContent}>
        <h3 className={styles.tabTitle}>{currentTab.label} Management</h3>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>
          {currentTab.singleOnly
            ? `Only one ${currentTab.label.toLowerCase()} account can exist.`
            : `Create and manage ${currentTab.label.toLowerCase()} accounts.`
          }
        </p>

        {showCreateForm && (
          <form onSubmit={handleCreate} className={styles.form} style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#333' }}>Create {currentTab.label}</h4>
            <div className={styles.formRow}>
              <label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="user@example.com" /></label>
              {currentTab.hasPhone && (
                <label>Phone (optional)<input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0712345678" /></label>
              )}
            </div>
            <label>Password
              <div style={{ position: 'relative' }}>
                <input type={showCreatePassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Strong password" style={{ paddingRight: '50px' }} />
                <button type="button" onClick={() => setShowCreatePassword(!showCreatePassword)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#730051' }}>{showCreatePassword ? 'Hide' : 'Show'}</button>
              </div>
              <PasswordStrength password={form.password} />
            </label>
            <button type="submit" className={styles.actionBtn}>Create {currentTab.label}</button>
          </form>
        )}

        <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#333' }}>
          {loading ? 'Loading...' : `Existing ${currentTab.label} Accounts (${admins.length})`}
        </h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Email</th>{currentTab.hasPhone && <th>Phone</th>}<th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {admins.length === 0 ? (
                <tr><td colSpan={currentTab.hasPhone ? 4 : 3} style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No {currentTab.label.toLowerCase()} accounts yet.</td></tr>
              ) : admins.map(u => (
                <tr key={u._id}>
                  <td style={{ cursor: 'pointer' }} onClick={() => handleCopyEmail(u.email)} title="Click to copy">{u.email}</td>
                  {currentTab.hasPhone && <td>{u.phone || '-'}</td>}
                  <td>{formatDate(u.createdAt)}</td>
                  <td style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button className={styles.approveBtn} onClick={() => handleCopyEmail(u.email)}>Copy Email</button>
                    <button className={styles.actionBtn} style={{ fontSize: '12px', padding: '4px 10px' }} onClick={() => { setResetModal({ id: u._id, email: u.email }); setResetPw(''); setShowResetPw(false); }}>Reset Password</button>
                    <button className={styles.rejectBtn} onClick={() => handleDelete(u._id, u.email)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '28px', width: '420px', maxWidth: '90vw',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#1a1a1a' }}>Reset Password</h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#666' }}>
              Set a new password for <strong>{resetModal.email}</strong>
            </p>
            <div style={{ position: 'relative', marginBottom: '4px' }}>
              <input
                type={showResetPw ? 'text' : 'password'}
                value={resetPw}
                onChange={e => setResetPw(e.target.value)}
                placeholder="Enter new password"
                autoFocus
                style={{
                  width: '100%', padding: '10px 40px 10px 12px', fontSize: '14px',
                  border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box', outline: 'none'
                }}
                onKeyDown={e => { if (e.key === 'Enter' && isPasswordValid(resetPw)) handleResetPassword(); }}
              />
              <button
                type="button"
                onClick={() => setShowResetPw(!showResetPw)}
                style={{
                  position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#730051'
                }}
              >{showResetPw ? 'Hide' : 'Show'}</button>
            </div>
            <PasswordStrength password={resetPw} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => { setResetModal(null); setResetPw(''); }}
                style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '13px', color: '#333' }}
              >Cancel</button>
              <button
                onClick={handleResetPassword}
                disabled={!isPasswordValid(resetPw)}
                style={{
                  padding: '8px 20px', borderRadius: '8px', border: 'none',
                  background: isPasswordValid(resetPw) ? '#730051' : '#ccc',
                  color: '#fff', cursor: isPasswordValid(resetPw) ? 'pointer' : 'not-allowed',
                  fontSize: '13px', fontWeight: 600
                }}
              >Reset Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManager;
