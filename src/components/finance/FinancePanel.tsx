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
  username: string;
  email: string;
  phone?: string;
  role: string;
  financeRole?: string | null;
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

  const handleAssignRole = async (userId: string, financeRole: string | null) => {
    try {
      await financeApi.put(`/users/${userId}/role`, { financeRole });
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
      <h3 className={styles.tabTitle}>Finance Role Management</h3>
      <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>Assign finance roles to existing members. Only users with a finance role can access the finance subdomain.</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Email</th><th>Site Role</th><th>Finance Role</th><th>Action</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.username || '-'}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.financeRole ? <span className={`${styles.badge} ${styles.approved}`}>{u.financeRole.replace('_', ' ')}</span> : <span style={{ color: '#999' }}>None</span>}</td>
                <td>
                  <select
                    value={u.financeRole || ''}
                    onChange={e => handleAssignRole(u._id, e.target.value || null)}
                    className={styles.roleSelect}
                  >
                    <option value="">None</option>
                    <option value="treasurer">Treasurer</option>
                    <option value="auditor">Auditor</option>
                    <option value="chair_accounts">Chair Accounts</option>
                    <option value="chairperson">Chairperson</option>
                  </select>
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
