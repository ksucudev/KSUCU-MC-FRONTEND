import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getBaseUrl } from '../config/environment';
import Cookies from 'js-cookie';

interface Contribution {
  _id: string;
  type: string;
  category: string;
  amount: number;
  source: string;
  description?: string;
  createdAt: string;
}

const verses = [
  { text: 'Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.', ref: '2 Corinthians 9:7' },
  { text: 'Honour the LORD with your wealth, with the firstfruits of all your crops.', ref: 'Proverbs 3:9' },
  { text: 'Give, and it will be given to you. A good measure, pressed down, shaken together and running over.', ref: 'Luke 6:38' },
  { text: 'Bring the whole tithe into the storehouse, that there may be food in my house.', ref: 'Malachi 3:10' },
];

const FinancialsPage: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payForm, setPayForm] = useState({ phone: '', amount: '', category: 'offering' });
  const [payLoading, setPayLoading] = useState(false);
  const [payMsg, setPayMsg] = useState('');
  const [payError, setPayError] = useState('');
  const [payStatus, setPayStatus] = useState<'idle' | 'waiting' | 'success' | 'cancelled' | 'timeout' | 'failed'>('idle');
  const [verseIndex] = useState(() => Math.floor(Math.random() * verses.length));
  const socketRef = useRef<Socket | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolvedRef = useRef(false);

  useEffect(() => { fetchContributions(); }, []);

  const fetchContributions = async () => {
    try {
      const res = await fetch('/api/finance/my-contributions', { credentials: 'include' });
      if (res.ok) setContributions(await res.json());
      else if (res.status === 401) setError('Please log in to view your contributions.');
      else setError('Unable to load contributions.');
    } catch { setError('Unable to connect to server.'); }
    setLoading(false);
  };

  const formatAmount = (amount: number) => `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

  const handlePaymentResult = (status: string, message: string) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    // Clean up socket listener
    if (socketRef.current) {
      socketRef.current.off('mpesa-payment-result');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);

    if (status === 'success') {
      setPayStatus('success');
      setPayMsg('Payment completed successfully! Thank you for your generous giving.');
      setPayError('');
      fetchContributions();
    } else {
      setPayStatus(status as any);
      setPayMsg('');
      setPayError(message);
    }
    setPayLoading(false);
  };

  const pollStatus = async (checkoutRequestID: string) => {
    setPayStatus('waiting');
    setPayMsg('');
    resolvedRef.current = false;

    // 1. Connect WebSocket for instant callback notification
    try {
      const token = Cookies.get('user_s') || '';
      const socket = io(getBaseUrl(), { auth: { token }, transports: ['websocket', 'polling'] });
      socketRef.current = socket;
      socket.on('mpesa-payment-result', (data: { checkoutRequestID: string; status: string; message: string }) => {
        if (data.checkoutRequestID === checkoutRequestID) {
          handlePaymentResult(data.status, data.message);
        }
      });
    } catch { /* WebSocket optional — polling is the fallback */ }

    // 2. Poll as fallback (in case WebSocket misses it)
    let attempts = 0;
    const maxAttempts = 15;
    const poll = async () => {
      if (resolvedRef.current) return;
      attempts++;
      try {
        const res = await fetch(`/api/finance/mpesa/status/${checkoutRequestID}`, { credentials: 'include' });
        const data = await res.json();
        if (data.status === 'success' || data.status === 'cancelled' || data.status === 'timeout' || data.status === 'failed') {
          handlePaymentResult(data.status, data.message);
          return;
        }
        // Any other status (pending, unknown) — keep polling
      } catch { /* continue polling */ }
      if (!resolvedRef.current && attempts < maxAttempts) {
        pollTimerRef.current = setTimeout(poll, 5000);
      } else if (!resolvedRef.current) {
        handlePaymentResult('idle', 'Could not confirm payment status. If you completed the payment, it will reflect shortly in your contributions.');
      }
    };
    pollTimerRef.current = setTimeout(poll, 7000);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayLoading(true); setPayMsg(''); setPayError(''); setPayStatus('idle');
    try {
      const res = await fetch('/api/finance/member-pay', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ phone: payForm.phone, amount: Number(payForm.amount), category: payForm.category }),
      });
      const data = await res.json();
      if (res.ok) {
        const checkoutID = data.data?.CheckoutRequestID;
        if (checkoutID) {
          pollStatus(checkoutID);
        } else {
          setPayMsg('STK push sent. Check your phone to complete payment.');
          setPayLoading(false);
        }
      } else {
        setPayError(data.message || 'Payment failed.');
        setPayLoading(false);
      }
    } catch {
      setPayError('Unable to connect to server.');
      setPayLoading(false);
    }
  };

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const verse = verses[verseIndex];

  const categoryCards = [
    { id: 'offering', label: 'Offering', icon: '\u2764', desc: 'Give your offering to support the work of the Lord' },
    { id: 'tithe', label: 'Tithe', icon: '\u2726', desc: 'A tenth of your increase, honouring God with your firstfruits' },
    { id: 'thanksgiving', label: 'Thanksgiving', icon: '\u2606', desc: 'Express gratitude to God for His faithfulness' },
  ];

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px 60px' }}>

      {/* Hero Section */}
      <div style={{
        textAlign: 'center', padding: '32px 24px', marginBottom: '28px'
      }}>
        <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: '8px' }}>
          Kisii University Christian Union
        </p>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 20px', color: '#1a1a1a', lineHeight: 1.3 }}>
          Give Generously, Live Abundantly
        </h1>
        <div style={{
          maxWidth: '500px', margin: '0 auto', padding: '16px 20px',
          background: '#faf8f5', borderRadius: '10px', borderLeft: '3px solid #730051'
        }}>
          <p style={{ fontSize: '14px', lineHeight: 1.6, margin: '0 0 6px', fontStyle: 'italic', color: '#555' }}>
            "{verse.text}"
          </p>
          <p style={{ fontSize: '12px', margin: 0, color: '#999', fontWeight: 600 }}>
            - {verse.ref}
          </p>
        </div>
      </div>

      {/* Giving Category Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {categoryCards.map(c => (
          <button
            key={c.id}
            onClick={() => setPayForm({ ...payForm, category: c.id })}
            style={{
              padding: '20px 12px', borderRadius: '12px', border: payForm.category === c.id ? '2px solid #730051' : '1px solid #e2e8f0',
              background: payForm.category === c.id ? '#faf0f6' : '#fff', cursor: 'pointer',
              textAlign: 'center', transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{c.icon}</div>
            <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: payForm.category === c.id ? '#730051' : '#333', fontWeight: 600 }}>{c.label}</h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#888', lineHeight: 1.4 }}>{c.desc}</p>
          </button>
        ))}
      </div>

      {/* M-Pesa Payment Form */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px',
        padding: '28px', marginBottom: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '18px'
          }}>M</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#1a1a1a', fontWeight: 600 }}>Lipa Na M-Pesa</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
              Giving as <strong style={{ color: '#730051', textTransform: 'capitalize' }}>{payForm.category}</strong>
            </p>
          </div>
        </div>

        {payStatus === 'waiting' && (
          <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '10px', marginBottom: '16px', border: '1px solid #fde68a', textAlign: 'center' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid #f59e0b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontWeight: 600, color: '#92400e', fontSize: '14px' }}>Waiting for payment...</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#b45309' }}>Check your phone and enter your M-Pesa PIN</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        {payStatus === 'success' && payMsg && (
          <div style={{ padding: '16px', background: '#dcfce7', borderRadius: '10px', marginBottom: '16px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{'\u2714'}</div>
            <p style={{ margin: 0, fontWeight: 600, color: '#166534', fontSize: '14px' }}>{payMsg}</p>
          </div>
        )}
        {payError && (
          <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '10px', marginBottom: '16px', border: '1px solid #fecaca', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{'\u2716'}</div>
            <p style={{ margin: 0, color: '#991b1b', fontSize: '13px' }}>{payError}</p>
          </div>
        )}

        <form onSubmit={handlePay}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: 500 }}>Phone Number</label>
            <input type="tel" value={payForm.phone} onChange={e => setPayForm({ ...payForm, phone: e.target.value })} placeholder="0712345678" required
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#730051'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: 500 }}>Amount (KES)</label>
            <input type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} placeholder="Enter amount" min="1" max="150000" required
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#730051'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>
          <button type="submit" disabled={payLoading}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
              background: payLoading ? '#9ca3af' : 'linear-gradient(135deg, #4caf50, #2e7d32)',
              color: '#fff', fontSize: '15px', fontWeight: 600, cursor: payLoading ? 'not-allowed' : 'pointer',
              boxShadow: payLoading ? 'none' : '0 4px 14px rgba(76,175,80,0.3)', transition: 'all 0.2s'
            }}>
            {payLoading && payStatus === 'waiting' ? 'Waiting for payment...' : payLoading ? 'Sending STK Push...' : 'Pay with M-Pesa'}
          </button>
        </form>
      </div>

      {/* Scripture Encouragement */}
      <div style={{
        textAlign: 'center', padding: '20px', marginBottom: '32px',
        background: '#faf8f5', borderRadius: '12px', border: '1px solid #f0e8e0'
      }}>
        <p style={{ fontSize: '13px', color: '#8b7355', margin: '0 0 4px', fontStyle: 'italic', lineHeight: 1.5 }}>
          "Remember this: Whoever sows sparingly will also reap sparingly, and whoever sows generously will also reap generously."
        </p>
        <p style={{ fontSize: '11px', color: '#a89070', margin: 0, fontWeight: 600 }}>- 2 Corinthians 9:6</p>
      </div>

      {/* Contributions History */}
      <div style={{
        background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
        overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', color: '#1a1a1a', fontWeight: 600 }}>My Contributions</h2>
          {contributions.length > 0 && (
            <span style={{ fontSize: '13px', color: '#730051', fontWeight: 600 }}>{formatAmount(totalContributions)}</span>
          )}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading contributions...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#991b1b', fontSize: '14px' }}>{error}</p>
        ) : contributions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.3 }}>{'\u2661'}</div>
            <p style={{ color: '#999', fontSize: '14px', margin: '0 0 4px' }}>No contributions recorded yet</p>
            <p style={{ color: '#bbb', fontSize: '12px', margin: 0 }}>Your giving history will appear here</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#faf8f6' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Source</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c, i) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 0 ? '#fff' : '#fdfcfb' }}>
                    <td style={{ padding: '12px 16px', color: '#666' }}>{formatDate(c.createdAt)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                        background: c.category === 'tithe' ? '#f0e6ff' : c.category === 'thanksgiving' ? '#e6f7ed' : '#fef3e6',
                        color: c.category === 'tithe' ? '#730051' : c.category === 'thanksgiving' ? '#166534' : '#92400e'
                      }}>{c.category || '-'}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1a1a1a' }}>{formatAmount(c.amount)}</td>
                    <td style={{ padding: '12px 16px', color: '#888', textTransform: 'uppercase', fontSize: '11px', fontWeight: 500 }}>{c.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Verse */}
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#bbb', marginTop: '32px', fontStyle: 'italic' }}>
        "The generous will themselves be blessed, for they share their food with the poor." - Proverbs 22:9
      </p>
    </main>
  );
};

export default FinancialsPage;
