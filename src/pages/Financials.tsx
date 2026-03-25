import React, { useState, useEffect } from 'react';
import styles from '../styles/financials.module.css';

interface Contribution {
  _id: string;
  type: string;
  category: string;
  amount: number;
  source: string;
  description?: string;
  createdAt: string;
}

const FinancialsPage: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payForm, setPayForm] = useState({ phone: '', amount: '', category: 'offering' });
  const [payLoading, setPayLoading] = useState(false);
  const [payMsg, setPayMsg] = useState('');
  const [payError, setPayError] = useState('');

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      const res = await fetch('/api/finance/my-contributions', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setContributions(data);
      } else if (res.status === 401) {
        setError('Please log in to view your contributions.');
      } else {
        setError('Unable to load contributions.');
      }
    } catch {
      setError('Unable to connect to server.');
    }
    setLoading(false);
  };

  const formatAmount = (amount: number) =>
    `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayLoading(true);
    setPayMsg('');
    setPayError('');
    try {
      const res = await fetch('/api/finance/member-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone: payForm.phone,
          amount: Number(payForm.amount),
          category: payForm.category,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPayMsg(data.message);
        setPayForm({ phone: '', amount: '', category: 'offering' });
      } else {
        setPayError(data.message || 'Payment failed.');
      }
    } catch {
      setPayError('Unable to connect to server.');
    }
    setPayLoading(false);
  };

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <main className={styles.main}>
      <h2 className={styles['main-financial--title---text']}>My Contributions</h2>

      {/* M-Pesa Payment Form */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
        padding: '24px', marginBottom: '24px', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', background: '#4caf50',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '16px'
          }}>M</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#1a1a1a' }}>M-Pesa Payment</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Pay via Lipa Na M-Pesa</p>
          </div>
        </div>

        {payMsg && <div style={{ padding: '10px 14px', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>{payMsg}</div>}
        {payError && <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#991b1b', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>{payError}</div>}

        <form onSubmit={handlePay}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>Phone Number</label>
            <input
              type="tel"
              value={payForm.phone}
              onChange={e => setPayForm({ ...payForm, phone: e.target.value })}
              placeholder="0712345678"
              required
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px',
                fontSize: '14px', boxSizing: 'border-box', outline: 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>Amount (KES)</label>
              <input
                type="number"
                value={payForm.amount}
                onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
                placeholder="100"
                min="1"
                max="150000"
                required
                style={{
                  width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px',
                  fontSize: '14px', boxSizing: 'border-box', outline: 'none'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#333', marginBottom: '4px', fontWeight: 500 }}>Category</label>
              <select
                value={payForm.category}
                onChange={e => setPayForm({ ...payForm, category: e.target.value })}
                style={{
                  width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px',
                  fontSize: '14px', boxSizing: 'border-box', outline: 'none', background: '#fff'
                }}
              >
                <option value="offering">Offering</option>
                <option value="tithe">Tithe</option>
                <option value="thanksgiving">Thanksgiving</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={payLoading}
            style={{
              width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
              background: payLoading ? '#9ca3af' : '#4caf50', color: '#fff',
              fontSize: '14px', fontWeight: 600, cursor: payLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {payLoading ? 'Sending...' : 'Pay with M-Pesa'}
          </button>
        </form>
      </div>

      {/* Contributions History */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading...</p>
      ) : error ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#991b1b' }}>{error}</p>
      ) : contributions.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No contributions recorded yet.</p>
      ) : (
        <>
          <div style={{ textAlign: 'center', padding: '16px', background: '#730051', color: '#fff', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', margin: '0 0 4px', opacity: 0.8 }}>Total Contributions</p>
            <p style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{formatAmount(totalContributions)}</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f7f7f7', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0' }}>Date</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0' }}>Category</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0' }}>Amount</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0' }}>Source</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 12px' }}>{formatDate(c.createdAt)}</td>
                    <td style={{ padding: '10px 12px', textTransform: 'capitalize' }}>{c.category || '-'}</td>
                    <td style={{ padding: '10px 12px' }}>{formatAmount(c.amount)}</td>
                    <td style={{ padding: '10px 12px', textTransform: 'uppercase' }}>{c.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
};

export default FinancialsPage;
