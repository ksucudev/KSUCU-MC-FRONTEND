import React, { useState, useEffect } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';

interface AnalyticsChartsProps {
  users: any[];
  byMinistry: { [key: string]: number };
  byEt: { [key: string]: number };
  transactions: any[];
  assets: any[];
}




const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ users, byMinistry, byEt, transactions, assets }) => {
  const P = '#730051';
  const PL = '#a0006e';
  const P2 = '#c0006e';
  const P3 = '#e0007e';
  const G = '#22c55e';
  const R = '#ef4444';
  const AMBER = '#f59e0b';

  // Detect mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const chartH = isMobile ? 180 : 180;

  // 1. Member Distribution by Year of Study
  const getMemberYosData = () => {
    const yosMap: { [key: string]: number } = {
      '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0,
      '5th Year': 0, '6th Year': 0, 'Associates': 0
    };
    
    users.forEach(u => {
      const y = String(u.yos).toLowerCase();
      if (y === '1') yosMap['1st Year']++;
      else if (y === '2') yosMap['2nd Year']++;
      else if (y === '3') yosMap['3rd Year']++;
      else if (y === '4') yosMap['4th Year']++;
      else if (y === '5') yosMap['5th Year']++;
      else if (y === '6') yosMap['6th Year']++;
      else if (y.includes('associate') || y === 'alumni') yosMap['Associates']++;
    });

    return Object.entries(yosMap).map(([name, count]) => ({ name, Members: count }));
  };

  // 2. Finance Categories (Tithe, Offering, Thanksgiving)
  const getFinanceDetailData = () => {
    const trend: { [key: string]: any } = {};
    transactions.filter(t => t.type === 'cash_in' || t.type === 'income').forEach(t => {
      const date = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!trend[date]) trend[date] = { name: date, Tithe: 0, Offering: 0, Thanksgiving: 0 };
      if (t.category === 'tithe') trend[date].Tithe += t.amount;
      if (t.category === 'offering') trend[date].Offering += t.amount;
      if (t.category === 'thanksgiving') trend[date].Thanksgiving += t.amount;
    });
    return Object.values(trend).slice(-10);
  };

  // 3. Cash Flow (In vs Out)
  const getCashFlowData = () => {
    const flow: { [key: string]: any } = {};
    transactions.forEach(t => {
      const day = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!flow[day]) flow[day] = { name: day, In: 0, Out: 0 };
      if (t.type === 'cash_in' || t.type === 'income') flow[day].In += t.amount;
      else flow[day].Out += t.amount;
    });
    return Object.values(flow).slice(-7);
  };

  // 4. ET bar data — sorted descending
  const etData = Object.entries(byEt)
    .map(([name, value]) => ({ name: name.length > 12 ? name.slice(0, 12) + '…' : name, value }))
    .sort((a, b) => b.value - a.value);

  // 5. Ministry bar data — sorted descending
  const minData = Object.entries(byMinistry)
    .map(([name, value]) => ({ name: name.length > 14 ? name.slice(0, 14) + '…' : name, value }))
    .sort((a, b) => b.value - a.value);

  const ET_COLORS = [P, PL, P2, P3, '#5a0040'];
  const MIN_COLORS = ['#730051','#8a0062','#a0006e','#b5007a','#c90086','#de0092','#f2009e'];

  const memberData = getMemberYosData();
  const financeData = getFinanceDetailData();
  const cashData = getCashFlowData();

  // 6. Asset Worth by Docket
  const getAssetDocketData = () => {
    const dockets: { [key: string]: number } = {};
    (assets || []).forEach(a => {
      const d = a.docket || 'Other';
      dockets[d] = (dockets[d] || 0) + (a.valuation || 0);
    });
    return Object.entries(dockets)
      .map(([name, value]) => ({ name: name.length > 10 ? name.slice(0, 10) + '…' : name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const assetDocketData = getAssetDocketData();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: isMobile ? '14px' : '16px',
      marginTop: '16px',
    }}>

      {/* 1. Member Distribution by Year */}
      <div style={card}>
        <h4 style={title}>Member Distribution</h4>
        <div style={{ height: chartH, position: 'relative' }}>
          {users.length === 0 && <div style={emptyOverlay}>No data yet</div>}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={memberData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={7} tickLine={{ stroke: '#ccc' }} axisLine={{ stroke: '#ccc' }} angle={-20} textAnchor="end" interval={0} label={{ value: 'Year of Study', position: 'insideBottom', offset: -15, fontSize: 9, fontWeight: 600 }} />
              <YAxis fontSize={8} tickLine={{ stroke: '#ccc' }} axisLine={{ stroke: '#ccc' }} allowDecimals={false} label={{ value: 'No. of People', angle: -90, position: 'insideLeft', offset: 25, fontSize: 9, fontWeight: 600 }} />
              <Tooltip cursor={{ fill: 'rgba(115,0,81,0.05)' }} contentStyle={tip} />
              <Bar dataKey="Members" radius={[4, 4, 0, 0]} barSize={16}>
                {memberData.map((_, i) => <Cell key={i} fill={MIN_COLORS[i % MIN_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Income Categories */}
      <div style={card}>
        <h4 style={title}>Income Categories</h4>
        <div style={{ height: chartH, position: 'relative' }}>
          {financeData.length === 0 && <div style={emptyOverlay}>No data yet</div>}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financeData.length > 0 ? financeData : [{name:'', Tithe:0, Offering:0, Thanksgiving:0}]} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={8} axisLine={{ stroke: '#ccc' }} tickLine={{ stroke: '#ccc' }} label={{ value: 'Timeline', position: 'insideBottom', offset: -12, fontSize: 9, fontWeight: 600 }} />
              <YAxis fontSize={8} axisLine={{ stroke: '#ccc' }} tickLine={{ stroke: '#ccc' }} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} label={{ value: 'Amount (KES)', angle: -90, position: 'insideLeft', offset: 12, fontSize: 9, fontWeight: 600 }} />
              <Tooltip contentStyle={tip} formatter={(v: any) => `KES ${Number(v).toLocaleString()}`} />
              <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '8px', paddingTop: '10px' }} />
              <Bar dataKey="Tithe" fill={P} radius={[2, 2, 0, 0]} barSize={8} />
              <Bar dataKey="Offering" fill={G} radius={[2, 2, 0, 0]} barSize={8} />
              <Bar dataKey="Thanksgiving" fill={AMBER} radius={[2, 2, 0, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Financial Flow */}
      <div style={card}>
        <h4 style={title}>Financial Flow</h4>
        <div style={{ height: chartH, position: 'relative' }}>
          {cashData.length === 0 && <div style={emptyOverlay}>No data yet</div>}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashData.length > 0 ? cashData : [{name:'', In:0, Out:0}]} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={8} axisLine={{ stroke: '#ccc' }} tickLine={{ stroke: '#ccc' }} label={{ value: 'Timeline', position: 'insideBottom', offset: -12, fontSize: 9, fontWeight: 600 }} />
              <YAxis fontSize={8} axisLine={{ stroke: '#ccc' }} tickLine={{ stroke: '#ccc' }} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} label={{ value: 'Value (KES)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 9, fontWeight: 600 }} />
              <Tooltip contentStyle={tip} formatter={(v: any) => `KES ${Number(v).toLocaleString()}`} />
              <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '8px', paddingTop: '10px' }} />
              <Bar dataKey="In" name="Total Income" fill={G} radius={[2, 2, 0, 0]} barSize={10} />
              <Bar dataKey="Out" name="Total Expenses" fill={R} radius={[2, 2, 0, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. ET Distribution */}
      <div style={card}>
        <h4 style={title}>ET Membership</h4>
        <div style={{ height: chartH, position: 'relative' }}>
          {etData.length === 0 && <div style={emptyOverlay}>No data yet</div>}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={etData.length > 0 ? etData : [{name:'', value:0}]} margin={{ top: 10, right: 5, left: -20, bottom: 35 }}>
              <XAxis dataKey="name" fontSize={7} tickLine={{ stroke: '#ccc' }} axisLine={{ stroke: '#ccc' }} interval={0} angle={-15} textAnchor="end" label={{ value: 'Evangelistic Teams', position: 'insideBottom', offset: -20, fontSize: 9, fontWeight: 600 }} />
              <YAxis fontSize={8} tickLine={{ stroke: '#ccc' }} axisLine={{ stroke: '#ccc' }} allowDecimals={false} label={{ value: 'People Count', angle: -90, position: 'insideLeft', offset: 25, fontSize: 9, fontWeight: 600 }} />
              <Tooltip cursor={{ fill: 'rgba(115,0,81,0.05)' }} contentStyle={tip} />
              <Bar dataKey="value" name="Members" radius={[4, 4, 0, 0]} barSize={14}>
                {etData.map((_, i) => <Cell key={i} fill={ET_COLORS[i % ET_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Ministry Distribution */}
      <div style={card}>
        <h4 style={title}>Ministry Enrollment</h4>
        <div style={{ height: chartH, position: 'relative' }}>
          {minData.length === 0 && <div style={emptyOverlay}>No data yet</div>}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={minData.length > 0 ? minData : [{name:'', value:0}]} margin={{ top: 10, right: 5, left: -20, bottom: 35 }}>
              <XAxis dataKey="name" fontSize={7} tickLine={{ stroke: '#ccc' }} axisLine={{ stroke: '#ccc' }} interval={0} angle={-25} textAnchor="end" label={{ value: 'Ministries', position: 'insideBottom', offset: -20, fontSize: 9, fontWeight: 600 }} />
              <YAxis fontSize={8} tickLine={{ stroke: '#ccc' }} axisLine={{ stroke: '#ccc' }} allowDecimals={false} label={{ value: 'Student Count', angle: -90, position: 'insideLeft', offset: 25, fontSize: 9, fontWeight: 600 }} />
              <Tooltip cursor={{ fill: 'rgba(115,0,81,0.05)' }} contentStyle={tip}
                formatter={(v: any) => [`${v} student${v !== 1 ? 's' : ''}`, 'Total Registered']} />
              <Bar dataKey="value" name="Students" radius={[4, 4, 0, 0]} barSize={12}>
                {minData.map((_, i) => <Cell key={i} fill={MIN_COLORS[i % MIN_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. Asset Worth by Docket */}
      <div style={card}>
        <h4 style={title}>Asset Valuation</h4>
        <div style={{ height: chartH, position: 'relative' }}>
          {assetDocketData.length === 0 && <div style={emptyOverlay}>No data yet</div>}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={assetDocketData.length > 0 ? assetDocketData : [{name:'', value:0}]} margin={{ top: 10, right: 5, left: -15, bottom: 40 }}>
              <XAxis dataKey="name" fontSize={7} tickLine={{ stroke: '#ccc' }} axisLine={{ stroke: '#ccc' }} interval={0} angle={-25} textAnchor="end" label={{ value: 'Leadership Dockets', position: 'insideBottom', offset: -25, fontSize: 9, fontWeight: 600 }} />
              <YAxis fontSize={8} axisLine={{ stroke: '#ccc' }} tickLine={{ stroke: '#ccc' }} tickFormatter={(v) => v >= 1000 ? `KES ${v/1000}k` : v} label={{ value: 'Asset Worth', angle: -90, position: 'insideLeft', offset: 15, fontSize: 9, fontWeight: 600 }} />
              <Tooltip cursor={{ fill: 'rgba(115,0,81,0.05)' }} contentStyle={tip}
                formatter={(v: any) => [`KES ${Number(v).toLocaleString()}`, 'Total Worth']} />
              <Bar dataKey="value" name="Worth" radius={[4, 4, 0, 0]} barSize={14}>
                {assetDocketData.map((_, i) => <Cell key={i} fill={MIN_COLORS[i % MIN_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

const emptyOverlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.7)',
  color: '#999',
  fontSize: '11px',
  fontStyle: 'italic',
};

const card: React.CSSProperties = {
  background: '#fff',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #f0f0f0',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

const title: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '800',
  color: '#444',
  marginBottom: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
};

const tip: React.CSSProperties = {
  borderRadius: '8px',
  border: 'none',
  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
  fontSize: '11px',
};

export default AnalyticsCharts;
