import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { financeApi } from '../services/financeApi';

// ─── Types ────────────────────────────────────────────────────────────────────

type FinancialRecord = {
  _id: string;
  type: string;
  category: string;
  amount: number;
  source: string;
  phone?: string;
  description?: string;
  createdAt: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatAmount = (amount: number) =>
  `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const getCategoryStyle = (category: string): { background: string; color: string } => {
  switch (category) {
    case 'tithe':
      return { background: '#f0e6ff', color: '#730051' };
    case 'thanksgiving':
      return { background: '#e6f7ed', color: '#166534' };
    default: // offering + others
      return { background: '#fef3e6', color: '#92400e' };
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

const FinanceMemberPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [allRecords, setAllRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Auth guard ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/signIn');
      return;
    }
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      // Uses existing financeApi service → GET /api/finance/my-contributions
      const data: FinancialRecord[] = await financeApi.get('/my-contributions');
      setAllRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load your records.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Frontend filter: match phone if present, else show all returned ─────────
  const memberRecords: FinancialRecord[] = user?.phone
    ? allRecords.filter(
        (record) => !record.phone || record.phone === user.phone
      )
    : allRecords;

  // Summary
  const totalGiven = memberRecords.reduce((sum, r) => sum + r.amount, 0);

  // ── Auth loading state ──────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
        <p style={{ color: '#888' }}>Checking authentication…</p>
      </main>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px 60px' }}>

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div style={{ padding: '28px 0 20px', borderBottom: '1px solid #f0f0f0', marginBottom: '28px' }}>
        <button
          id="finance-member-back-btn"
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', color: '#730051',
            cursor: 'pointer', fontSize: '14px', fontWeight: 600,
            padding: '0', marginBottom: '16px', display: 'flex',
            alignItems: 'center', gap: '6px',
          }}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px', color: '#1a1a1a' }}>
              My Financial Records
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>
              Transactions linked to your account
            </p>
          </div>

          {/* User badge */}
          {user && (
            <div style={{
              background: '#faf0f6', border: '1px solid #e8c8dd',
              borderRadius: '10px', padding: '10px 16px', textAlign: 'right',
            }}>
              <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Logged in as
              </p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#730051' }}>
                {user.username}
              </p>
              {user.phone && (
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>
                  {user.phone}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Error State ────────────────────────────────────────────────────── */}
      {error && (
        <div
          id="finance-member-error"
          style={{
            padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '10px', marginBottom: '24px', color: '#991b1b',
            fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px' }}>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Loading State ──────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#888' }}>
          <div style={{
            width: '32px', height: '32px', border: '3px solid #e8c8dd',
            borderTopColor: '#730051', borderRadius: '50%',
            animation: 'spin 0.9s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ margin: 0, fontSize: '14px' }}>Loading your records…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

      ) : memberRecords.length === 0 ? (

        /* ── Empty State ──────────────────────────────────────────────────── */
        <div style={{
          textAlign: 'center', padding: '64px 24px',
          background: '#faf8f5', borderRadius: '16px',
          border: '1px solid #f0e8e0',
        }}>
          <div style={{ fontSize: '44px', marginBottom: '14px', opacity: 0.3 }}>♡</div>
          <h2 style={{ margin: '0 0 8px', fontSize: '18px', color: '#555', fontWeight: 600 }}>
            No financial records found
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#999' }}>
            No financial records found for your account.
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#bbb' }}>
            Your giving history will appear here once transactions are recorded.
          </p>
        </div>

      ) : (

        /* ── Records Section ──────────────────────────────────────────────── */
        <>
          {/* Summary card */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px', marginBottom: '28px',
          }}>
            <div style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
              padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Given
              </p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#730051' }}>
                {formatAmount(totalGiven)}
              </p>
            </div>
            <div style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
              padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Transactions
              </p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#1a1a1a' }}>
                {memberRecords.length}
              </p>
            </div>
            <div style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
              padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Latest Gift
              </p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#1a1a1a' }}>
                {formatDate(memberRecords[0].createdAt)}
              </p>
            </div>
          </div>

          {/* Table */}
          <div style={{
            background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
            overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}>
            {/* Table header bar */}
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#1a1a1a', fontWeight: 600 }}>
                Transaction History
              </h2>
              <span style={{ fontSize: '13px', color: '#730051', fontWeight: 600 }}>
                {formatAmount(totalGiven)} total
              </span>
            </div>

            {/* Scrollable table */}
            <div style={{ overflowX: 'auto' }} id="finance-member-table">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#faf8f6' }}>
                    {['#', 'Date', 'Category', 'Amount', 'Source', 'Status'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '12px 16px', textAlign: 'left', fontWeight: 600,
                          color: '#555', borderBottom: '1px solid #eee',
                          fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {memberRecords.map((record, i) => {
                    const catStyle = getCategoryStyle(record.category);
                    return (
                      <tr
                        key={record._id}
                        style={{
                          borderBottom: '1px solid #f5f5f5',
                          background: i % 2 === 0 ? '#fff' : '#fdfcfb',
                        }}
                      >
                        {/* # */}
                        <td style={{ padding: '13px 16px', color: '#aaa', fontWeight: 700, fontSize: '12px' }}>
                          {i + 1}
                        </td>

                        {/* Date */}
                        <td style={{ padding: '13px 16px', color: '#666', whiteSpace: 'nowrap' }}>
                          {formatDate(record.createdAt)}
                        </td>

                        {/* Category */}
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{
                            display: 'inline-block', padding: '3px 10px',
                            borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                            textTransform: 'capitalize',
                            background: catStyle.background, color: catStyle.color,
                          }}>
                            {record.category || 'offering'}
                          </span>
                        </td>

                        {/* Amount */}
                        <td style={{ padding: '13px 16px', fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                          {formatAmount(record.amount)}
                        </td>

                        {/* Source */}
                        <td style={{
                          padding: '13px 16px', color: '#888',
                          textTransform: 'uppercase', fontSize: '11px', fontWeight: 500,
                        }}>
                          {record.source || '–'}
                        </td>

                        {/* Status — all contributions fetched are confirmed */}
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{
                            display: 'inline-block', padding: '3px 10px',
                            borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                            background: '#dcfce7', color: '#166534',
                          }}>
                            Confirmed
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom encouragement */}
          <p style={{
            textAlign: 'center', fontSize: '12px', color: '#bbb',
            marginTop: '32px', fontStyle: 'italic', lineHeight: 1.6,
          }}>
            "Give, and it will be given to you… For with the measure you use it will be measured back to you." — Luke 6:38
          </p>
        </>
      )}
    </main>
  );
};

export default FinanceMemberPage;
