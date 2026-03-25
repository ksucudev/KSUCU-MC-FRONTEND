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

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <main className={styles.main}>
      <h2 className={styles['main-financial--title---text']}>My Contributions</h2>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading...</p>
      ) : error ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#991b1b' }}>{error}</p>
      ) : contributions.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No contributions recorded yet.</p>
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
