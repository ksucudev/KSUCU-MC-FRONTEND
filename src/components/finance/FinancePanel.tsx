import React, { useState, useEffect } from 'react';
import { financeApi } from '../../services/financeApi';
import styles from '../../styles/finance.module.css';

type FinanceTab = 'dashboard' | 'transactions' | 'newTransaction' | 'requisitions' | 'newRequisition' | 'assets' | 'newAsset' | 'reports' | 'auditLogs' | 'mpesa' | 'users';

interface FinancePanelProps {
  isPatron?: boolean;
}

interface Transaction {
  _id: string;
  type: string;
  category: string;
  amount: number;
  source: string;
  phone?: string;
  description?: string;
  recorded_by?: { username?: string; email?: string };
  createdAt: string;
}

interface Requisition {
  _id: string;
  requested_by?: { username?: string; email?: string };
  reason: string;
  amount_requested: number;
  amount_spent?: number;
  status: string;
  approved_by?: { username?: string; email?: string };
  createdAt: string;
}

interface Asset {
  _id: string;
  name: string;
  description?: string;
  valuation: number;
  condition: string;
  createdAt: string;
}

interface AuditLog {
  _id: string;
  user_id?: { username?: string; email?: string };
  action: string;
  entity: string;
  createdAt: string;
}

interface FinanceUser {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

const FinancePanel: React.FC<FinancePanelProps> = ({ isPatron = false }) => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('dashboard');
  const [balance, setBalance] = useState<{ total_in: number; total_out: number; balance: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<FinanceUser[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [txForm, setTxForm] = useState({ type: 'cash_in', category: 'offering', source: 'cash', phone: '', amount: '', description: '' });
  const [reqForm, setReqForm] = useState({ reason: '', amount_requested: '' });
  const [assetForm, setAssetForm] = useState({ name: '', description: '', valuation: '', condition: 'good' });
  const [mpesaForm, setMpesaForm] = useState({ phone: '', amount: '', category: 'offering' });
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'treasurer', phone: '' });

  const tabs: { id: FinanceTab; label: string; hidden?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'requisitions', label: 'Requisitions' },
    { id: 'assets', label: 'Assets', hidden: isPatron },
    { id: 'reports', label: 'Reports' },
    { id: 'auditLogs', label: 'Audit Logs', hidden: isPatron },
    { id: 'mpesa', label: 'M-Pesa', hidden: isPatron },
    { id: 'users', label: 'Finance Users', hidden: isPatron },
  ];

  useEffect(() => { loadTabData(); }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    setError('');
    try {
      switch (activeTab) {
        case 'dashboard':
          const bal = await financeApi.get('/transactions/balance');
          setBalance(bal);
          break;
        case 'transactions':
          setTransactions(await financeApi.get('/transactions'));
          break;
        case 'requisitions':
          setRequisitions(await financeApi.get('/requisitions'));
          break;
        case 'assets':
          setAssets(await financeApi.get('/assets'));
          break;
        case 'reports':
          setReport(await financeApi.get('/reports/statement'));
          break;
        case 'auditLogs':
          setAuditLogs(await financeApi.get('/audit-logs'));
          break;
        case 'users':
          setUsers(await financeApi.get('/users'));
          break;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    }
    setLoading(false);
  };

  const formatAmount = (amount: number) => `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await financeApi.post('/transactions', { ...txForm, amount: Number(txForm.amount) });
      setSuccess('Transaction recorded.');
      setTxForm({ type: 'cash_in', category: 'offering', source: 'cash', phone: '', amount: '', description: '' });
      setActiveTab('transactions');
    } catch (err: any) { setError(err.message); }
  };

  const handleCreateRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await financeApi.post('/requisitions', { ...reqForm, amount_requested: Number(reqForm.amount_requested) });
      setSuccess('Requisition submitted.');
      setReqForm({ reason: '', amount_requested: '' });
      setActiveTab('requisitions');
    } catch (err: any) { setError(err.message); }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await financeApi.post('/assets', { ...assetForm, valuation: Number(assetForm.valuation) });
      setSuccess('Asset recorded.');
      setAssetForm({ name: '', description: '', valuation: '', condition: 'good' });
      setActiveTab('assets');
    } catch (err: any) { setError(err.message); }
  };

  const handleApproveReq = async (id: string) => {
    try {
      await financeApi.put(`/requisitions/${id}/approve`);
      loadTabData();
    } catch (err: any) { setError(err.message); }
  };

  const handleRejectReq = async (id: string) => {
    try {
      await financeApi.put(`/requisitions/${id}/reject`);
      loadTabData();
    } catch (err: any) { setError(err.message); }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Delete this asset?')) return;
    try {
      await financeApi.delete(`/assets/${id}`);
      loadTabData();
    } catch (err: any) { setError(err.message); }
  };

  const handleMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await financeApi.post('/mpesa/stkpush', { ...mpesaForm, amount: Number(mpesaForm.amount) });
      setSuccess('STK push sent. Check the phone.');
      setMpesaForm({ phone: '', amount: '', category: 'offering' });
    } catch (err: any) { setError(err.message); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await financeApi.post('/users', userForm);
      setSuccess('Finance user created.');
      setUserForm({ name: '', email: '', password: '', role: 'treasurer', phone: '' });
      loadTabData();
    } catch (err: any) { setError(err.message); }
  };

  const handleResetPassword = async (id: string, email: string) => {
    const newPassword = prompt(`Enter new password for ${email} (min 6 chars):`);
    if (!newPassword) return;
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setSuccess('');
    try {
      await financeApi.put(`/users/${id}/reset-password`, { password: newPassword });
      setSuccess(`Password reset for ${email}.`);
    } catch (err: any) { setError(err.message); }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setSuccess(`Copied: ${email}`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Delete finance user ${email}?`)) return;
    try {
      await financeApi.delete(`/users/${id}`);
      setSuccess('Finance user deleted.');
      loadTabData();
    } catch (err: any) { setError(err.message); }
  };

  const renderDashboard = () => (
    <div>
      <h3 className={styles.tabTitle}>Financial Overview</h3>
      {balance && (
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.income}`}>
            <h4>Total Income</h4>
            <p>{formatAmount(balance.total_in)}</p>
          </div>
          <div className={`${styles.statCard} ${styles.expense}`}>
            <h4>Total Expenses</h4>
            <p>{formatAmount(balance.total_out)}</p>
          </div>
          <div className={`${styles.statCard} ${styles.net}`}>
            <h4>Net Balance</h4>
            <p>{formatAmount(balance.balance)}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderTransactions = () => (
    <div>
      <div className={styles.tabHeader}>
        <h3 className={styles.tabTitle}>Transactions</h3>
        {!isPatron && <button className={styles.actionBtn} onClick={() => setActiveTab('newTransaction')}>Record Transaction</button>}
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Source</th><th>Recorded By</th></tr></thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx._id}>
                <td>{formatDate(tx.createdAt)}</td>
                <td>{tx.type === 'cash_in' ? 'Cash In' : 'Cash Out'}</td>
                <td>{tx.category || '-'}</td>
                <td>{formatAmount(tx.amount)}</td>
                <td>{tx.source?.toUpperCase()}</td>
                <td>{tx.recorded_by?.username || tx.recorded_by?.email || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNewTransaction = () => (
    <div>
      <div className={styles.tabHeader}>
        <h3 className={styles.tabTitle}>Record Transaction</h3>
        <button className={styles.backBtn} onClick={() => setActiveTab('transactions')}>Back</button>
      </div>
      <form onSubmit={handleCreateTransaction} className={styles.form}>
        <div className={styles.formRow}>
          <label>Type<select value={txForm.type} onChange={e => setTxForm({ ...txForm, type: e.target.value })}><option value="cash_in">Cash In</option><option value="cash_out">Cash Out</option></select></label>
          {txForm.type === 'cash_in' && <label>Category<select value={txForm.category} onChange={e => setTxForm({ ...txForm, category: e.target.value })}><option value="offering">Offering</option><option value="tithe">Tithe</option><option value="thanksgiving">Thanksgiving</option><option value="aob">AOB</option></select></label>}
        </div>
        <div className={styles.formRow}>
          <label>Source<select value={txForm.source} onChange={e => setTxForm({ ...txForm, source: e.target.value })}><option value="cash">Cash</option><option value="mpesa">M-Pesa</option></select></label>
          {txForm.source === 'mpesa' && <label>Phone<input type="text" value={txForm.phone} onChange={e => setTxForm({ ...txForm, phone: e.target.value })} placeholder="0712345678" /></label>}
        </div>
        <label>Amount (KES)<input type="number" value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} required min="1" /></label>
        <label>Description<textarea value={txForm.description} onChange={e => setTxForm({ ...txForm, description: e.target.value })} rows={2} /></label>
        <button type="submit" className={styles.actionBtn}>Record</button>
      </form>
    </div>
  );

  const renderRequisitions = () => (
    <div>
      <div className={styles.tabHeader}>
        <h3 className={styles.tabTitle}>Requisitions</h3>
        {!isPatron && <button className={styles.actionBtn} onClick={() => setActiveTab('newRequisition')}>New Requisition</button>}
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Date</th><th>Reason</th><th>Requested</th><th>Spent</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {requisitions.map(r => (
              <tr key={r._id}>
                <td>{formatDate(r.createdAt)}</td>
                <td>{r.reason}</td>
                <td>{formatAmount(r.amount_requested)}</td>
                <td>{r.amount_spent ? formatAmount(r.amount_spent) : '-'}</td>
                <td><span className={`${styles.badge} ${styles[r.status]}`}>{r.status}</span></td>
                <td>
                  {r.status === 'pending' && (
                    <>
                      <button className={styles.approveBtn} onClick={() => handleApproveReq(r._id)}>Approve</button>
                      <button className={styles.rejectBtn} onClick={() => handleRejectReq(r._id)}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNewRequisition = () => (
    <div>
      <div className={styles.tabHeader}>
        <h3 className={styles.tabTitle}>New Requisition</h3>
        <button className={styles.backBtn} onClick={() => setActiveTab('requisitions')}>Back</button>
      </div>
      <form onSubmit={handleCreateRequisition} className={styles.form}>
        <label>Reason<textarea value={reqForm.reason} onChange={e => setReqForm({ ...reqForm, reason: e.target.value })} required rows={3} /></label>
        <label>Amount (KES)<input type="number" value={reqForm.amount_requested} onChange={e => setReqForm({ ...reqForm, amount_requested: e.target.value })} required min="1" /></label>
        <button type="submit" className={styles.actionBtn}>Submit Requisition</button>
      </form>
    </div>
  );

  const renderAssets = () => (
    <div>
      <div className={styles.tabHeader}>
        <h3 className={styles.tabTitle}>Assets</h3>
        <button className={styles.actionBtn} onClick={() => setActiveTab('newAsset')}>Add Asset</button>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Description</th><th>Valuation</th><th>Condition</th><th>Actions</th></tr></thead>
          <tbody>
            {assets.map(a => (
              <tr key={a._id}>
                <td>{a.name}</td>
                <td>{a.description || '-'}</td>
                <td>{formatAmount(a.valuation)}</td>
                <td><span className={`${styles.badge} ${styles[a.condition]}`}>{a.condition}</span></td>
                <td><button className={styles.rejectBtn} onClick={() => handleDeleteAsset(a._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNewAsset = () => (
    <div>
      <div className={styles.tabHeader}>
        <h3 className={styles.tabTitle}>Add Asset</h3>
        <button className={styles.backBtn} onClick={() => setActiveTab('assets')}>Back</button>
      </div>
      <form onSubmit={handleCreateAsset} className={styles.form}>
        <label>Name<input type="text" value={assetForm.name} onChange={e => setAssetForm({ ...assetForm, name: e.target.value })} required /></label>
        <label>Description<textarea value={assetForm.description} onChange={e => setAssetForm({ ...assetForm, description: e.target.value })} rows={2} /></label>
        <label>Valuation (KES)<input type="number" value={assetForm.valuation} onChange={e => setAssetForm({ ...assetForm, valuation: e.target.value })} required min="0" /></label>
        <label>Condition<select value={assetForm.condition} onChange={e => setAssetForm({ ...assetForm, condition: e.target.value })}><option value="new">New</option><option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option></select></label>
        <button type="submit" className={styles.actionBtn}>Save Asset</button>
      </form>
    </div>
  );

  const renderReports = () => (
    <div>
      <h3 className={styles.tabTitle}>Financial Reports</h3>
      {report && (
        <>
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.income}`}><h4>Total Income</h4><p>{formatAmount(report.summary.total_income)}</p></div>
            <div className={`${styles.statCard} ${styles.expense}`}><h4>Total Expenses</h4><p>{formatAmount(report.summary.total_expenses)}</p></div>
            <div className={`${styles.statCard} ${styles.net}`}><h4>Net Balance</h4><p>{formatAmount(report.summary.net_balance)}</p></div>
          </div>
          <h4 style={{ marginTop: '20px' }}>Breakdown</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Type</th><th>Category</th><th>Total</th><th>Count</th></tr></thead>
              <tbody>
                {report.breakdown.map((b: any, i: number) => (
                  <tr key={i}>
                    <td>{b._id.type === 'cash_in' ? 'Income' : 'Expense'}</td>
                    <td>{b._id.category || '-'}</td>
                    <td>{formatAmount(b.total_amount)}</td>
                    <td>{b.transaction_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  const renderAuditLogs = () => (
    <div>
      <h3 className={styles.tabTitle}>Audit Logs</h3>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Date</th><th>User</th><th>Action</th><th>Entity</th></tr></thead>
          <tbody>
            {auditLogs.map(l => (
              <tr key={l._id}>
                <td>{formatDate(l.createdAt)}</td>
                <td>{l.user_id?.username || l.user_id?.email || '-'}</td>
                <td>{l.action}</td>
                <td>{l.entity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMpesa = () => (
    <div>
      <h3 className={styles.tabTitle}>M-Pesa STK Push</h3>
      <form onSubmit={handleMpesa} className={styles.form}>
        <label>Phone Number<input type="text" value={mpesaForm.phone} onChange={e => setMpesaForm({ ...mpesaForm, phone: e.target.value })} placeholder="0712345678" required /></label>
        <label>Amount (KES)<input type="number" value={mpesaForm.amount} onChange={e => setMpesaForm({ ...mpesaForm, amount: e.target.value })} required min="1" /></label>
        <label>Category<select value={mpesaForm.category} onChange={e => setMpesaForm({ ...mpesaForm, category: e.target.value })}><option value="offering">Offering</option><option value="tithe">Tithe</option><option value="thanksgiving">Thanksgiving</option><option value="aob">AOB</option></select></label>
        <button type="submit" className={styles.actionBtn}>Send STK Push</button>
      </form>
    </div>
  );

  const renderUsers = () => (
    <div>
      <h3 className={styles.tabTitle}>Finance Users</h3>
      <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>
        Manage accounts for the finance subdomain. These users can log in to finance.ksucu-mc.co.ke with their assigned role.
      </p>

      <form onSubmit={handleCreateUser} className={styles.form} style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#333' }}>Create Finance User</h4>
        <div className={styles.formRow}>
          <label>Name<input type="text" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} placeholder="Full name" /></label>
          <label>Email<input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required placeholder="user@example.com" /></label>
        </div>
        <div className={styles.formRow}>
          <label>Password<input type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required minLength={6} placeholder="Min 6 characters" /></label>
          <label>Role
            <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
              <option value="treasurer">Treasurer</option>
              <option value="auditor">Auditor</option>
              <option value="chair_accounts">Chair Accounts</option>
              <option value="chairperson">Chairperson</option>
            </select>
          </label>
        </div>
        <label>Phone (optional)<input type="text" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} placeholder="0712345678" /></label>
        <button type="submit" className={styles.actionBtn}>Create User</button>
      </form>

      <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#333' }}>Existing Finance Users ({users.length})</h4>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No finance users yet. Create one above.</td></tr>
            ) : users.map(u => (
              <tr key={u._id}>
                <td>{u.name || '-'}</td>
                <td style={{ cursor: 'pointer' }} onClick={() => handleCopyEmail(u.email)} title="Click to copy">{u.email}</td>
                <td><span className={`${styles.badge} ${styles.approved}`}>{u.role.replace('_', ' ')}</span></td>
                <td>{u.phone || '-'}</td>
                <td>{formatDate(u.createdAt)}</td>
                <td style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button className={styles.approveBtn} onClick={() => handleCopyEmail(u.email)}>Copy Email</button>
                  <button className={styles.actionBtn} style={{ fontSize: '12px', padding: '4px 10px' }} onClick={() => handleResetPassword(u._id, u.email)}>Reset Password</button>
                  <button className={styles.rejectBtn} onClick={() => handleDeleteUser(u._id, u.email)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return <p>Loading...</p>;
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'transactions': return renderTransactions();
      case 'newTransaction': return renderNewTransaction();
      case 'requisitions': return renderRequisitions();
      case 'newRequisition': return renderNewRequisition();
      case 'assets': return renderAssets();
      case 'newAsset': return renderNewAsset();
      case 'reports': return renderReports();
      case 'auditLogs': return renderAuditLogs();
      case 'mpesa': return renderMpesa();
      case 'users': return renderUsers();
      default: return renderDashboard();
    }
  };

  return (
    <div className={styles.financePanel}>
      <div className={styles.tabBar}>
        {tabs.filter(t => !t.hidden).map(t => (
          <button
            key={t.id}
            className={`${styles.tab} ${activeTab === t.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      <div className={styles.tabContent}>
        {renderContent()}
      </div>
    </div>
  );
};

export default FinancePanel;
