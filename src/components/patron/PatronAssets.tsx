import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Box } from 'lucide-react';
import { financeApi } from '../../services/financeApi';

interface Asset {
    _id: string;
    name: string;
    description?: string;
    purchase_amount: number;
    purchase_date: string;
    valuation: number;
    condition: string;
    updatedAt: string;
}

const PatronAssets: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDocket, setFilterDocket] = useState('All');

    const P = '#730051';

    const dockets = [
        'All', 'Chairperson', 'Vice Chairperson', 'Secretary', 'Publicity secretary', 
        'Treasurer', 'Worship Coordinator', 'Boards Coordinator', 'Missions Coordinator', 
        'Bible study Coordinator', 'Discipleship Coordinator', 'Other'
    ];

    const fetchAssets = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await financeApi.get('/assets');
            setAssets(data);
        } catch (err) {
            console.error('Error fetching assets:', err);
            setError('Failed to load assets. Please ensure you have network connectivity.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const filteredAssets = assets.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesDocket = filterDocket === 'All' || a.docket === filterDocket;
        return matchesSearch && matchesDocket;
    });

    const formatCurrency = (amount: number) => {
        if (amount === undefined || amount === null || isNaN(amount)) return '-';
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount);
    };

    const getTrend = (current: number, purchase: number) => {
        if (!current || !purchase) return { text: '-', color: 'inherit' };
        const diff = current - purchase;
        const percent = ((diff / purchase) * 100).toFixed(1);
        const sign = diff > 0 ? '▲' : diff < 0 ? '▼' : '▬';
        const color = diff > 0 ? '#28a745' : diff < 0 ? '#dc3545' : '#718096';
        return { text: `${sign} ${percent}%`, color };
    };

    const getConditionBadge = (condition: string) => {
        switch (condition) {
            case 'new': return <span style={{ background: '#d1e7dd', color: '#0f5132', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>New</span>;
            case 'good': return <span style={{ background: '#cfe2ff', color: '#084298', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Good</span>;
            case 'fair': return <span style={{ background: '#fff3cd', color: '#664d03', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Fair</span>;
            case 'poor': return <span style={{ background: '#f8d7da', color: '#842029', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Poor</span>;
            default: return <span style={{ background: '#e2e3e5', color: '#41464b', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>{condition}</span>;
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px', background: '#fff', border: '1px solid #ddd',
        borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s',
    };

    return (
        <div style={{ padding: '16px', background: '#fff', border: '1px solid #e8e8e8', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ fontSize: '16px', margin: 0, padding: 0, borderBottom: `2px solid ${P}`, color: '#222', paddingBottom: '10px' }}>
                    KSUCU-MC Fixed Assets & Trends
                </h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', minWidth: '180px' }}>
                        <select 
                            value={filterDocket} 
                            onChange={e => setFilterDocket(e.target.value)}
                            style={{ ...inputStyle, paddingLeft: '14px', cursor: 'pointer', appearance: 'auto' }}
                        >
                            {dockets.map(d => (
                                <option key={d} value={d}>{d === 'All' ? 'All Dockets' : d}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ position: 'relative', minWidth: '220px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ ...inputStyle, paddingLeft: '38px' }}
                            onFocus={e => (e.target.style.borderColor = P)}
                            onBlur={e => (e.target.style.borderColor = '#ddd')}
                        />
                    </div>
                    <button
                        onClick={fetchAssets}
                        disabled={loading}
                        style={{
                            padding: '10px 14px', border: 'none', borderRadius: '6px',
                            background: loading ? '#aaa' : '#007bff', color: 'white',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600,
                        }}
                    >
                        <RefreshCw size={15} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
                        <span style={{ display: 'none' }} className="refresh-text">Refresh</span>
                        Refresh
                    </button>
                    <style>{`@media (min-width: 600px) { .refresh-text { display: inline !important; } }`}</style>
                </div>
            </div>

            {error && (
                <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>
                    {error}
                </div>
            )}

            <div style={{ 
                fontSize: '13px', color: '#666', padding: '10px 14px', 
                background: '#f8fdfa', border: '1px solid #d1e7dd', borderRadius: '6px', 
                marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
                <Box size={16} color="#0f5132" />
                <span>
                    <strong>Total Current Assets Value:</strong> {formatCurrency(assets.reduce((sum, a) => sum + (a.valuation || 0), 0))}
                </span>
            </div>

            {loading && assets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#999', fontSize: '14px' }}>Loading inventory...</div>
            ) : filteredAssets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#999', fontSize: '14px' }}>
                    {searchQuery ? 'No assets match your search.' : 'No assets recorded yet.'}
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textLeft: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#555' }}>Docket</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#555' }}>Asset Name</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#555' }}>Pur. Date</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#555' }}>Pur. Price</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#555' }}>Current Val</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#555' }}>Net Trend</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#555' }}>Condition</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssets.map(asset => {
                                const trend = getTrend(asset.valuation, asset.purchase_amount);
                                return (
                                    <tr key={asset._id} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s', ...({ '&:hover': { background: '#fafafa' } } as any) }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#666', fontSize: '11px' }}>{asset.docket || '-'}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ fontWeight: 600, color: '#333' }}>{asset.name}</div>
                                            <div style={{ fontSize: '11px', color: '#888' }}>{asset.description || '-'}</div>
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#666' }}>{asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : '-'}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#666' }}>{formatCurrency(asset.purchase_amount)}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <div style={{ fontWeight: 600, color: P }}>{formatCurrency(asset.valuation)}</div>
                                            <div style={{ fontSize: '10px', color: '#999' }}>Valuated: {new Date(asset.updatedAt).toLocaleDateString()}</div>
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold', color: trend.color }}>{trend.text}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{getConditionBadge(asset.condition)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PatronAssets;
