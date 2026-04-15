import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, AreaChart, Area
} from 'recharts';

interface AnalyticsChartsProps {
  users: any[];
  byMinistry: { [key: string]: number };
  byEt: { [key: string]: number };
  transactions: any[];
}

const EMPTY_MSG: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  height: '100%', color: '#bbb', fontSize: '12px', fontStyle: 'italic',
};

const EmptyState = ({ label }: { label: string }) => (
  <div style={EMPTY_MSG}>No {label} data yet</div>
);

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ users, byMinistry, byEt, transactions }) => {
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

  const chartH = isMobile ? 180 : 220;

  // 1. Member Growth (Cumulative)
  const getMemberGrowthData = () => {
    const dates: { [key: string]: number } = {};
    users.forEach(u => {
      const date = u.createdAt
        ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        : 'Initial';
      dates[date] = (dates[date] || 0) + 1;
    });
    const sorted = Object.entries(dates).sort((a, b) => {
      if (a[0] === 'Initial') return -1;
      if (b[0] === 'Initial') return 1;
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });
    let cum = 0;
    return sorted.map(([date, count]) => { cum += count; return { name: date, Members: cum }; });
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

  const memberData = getMemberGrowthData();
  const financeData = getFinanceDetailData();
  const cashData = getCashFlowData();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: isMobile ? '14px' : '20px',
      marginTop: '16px',
    }}>

      {/* 1. Member Growth */}
      <div style={card}>
        <h4 style={title}>Member Growth Trend</h4>
        <div style={{ height: chartH }}>
          {memberData.length === 0 ? <EmptyState label="member growth" /> :
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={memberData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tip} />
              <Line type="monotone" dataKey="Members" stroke={P} strokeWidth={2.5}
                dot={{ r: 3, fill: P }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>}
        </div>
      </div>

      {/* 2. Income Categories */}
      <div style={card}>
        <h4 style={title}>Income Categories vs Time</h4>
        <div style={{ height: chartH }}>
          {financeData.length === 0 ? <EmptyState label="income category" /> :
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={financeData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gTithe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={P} stopOpacity={0.15}/><stop offset="95%" stopColor={P} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gOff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={G} stopOpacity={0.15}/><stop offset="95%" stopColor={G} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gThank" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={AMBER} stopOpacity={0.15}/><stop offset="95%" stopColor={AMBER} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
              <YAxis fontSize={9} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tip} formatter={(v: any) => `KES ${Number(v).toLocaleString()}`} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              <Area type="monotone" dataKey="Tithe" stroke={P} fill="url(#gTithe)" strokeWidth={2} />
              <Area type="monotone" dataKey="Offering" stroke={G} fill="url(#gOff)" strokeWidth={2} />
              <Area type="monotone" dataKey="Thanksgiving" stroke={AMBER} fill="url(#gThank)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>}
        </div>
      </div>

      {/* 3. Cash Flow */}
      <div style={card}>
        <h4 style={title}>General Cash Flow (In vs Out)</h4>
        <div style={{ height: chartH }}>
          {cashData.length === 0 ? <EmptyState label="cash flow" /> :
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cashData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
              <YAxis fontSize={9} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tip} formatter={(v: any) => `KES ${Number(v).toLocaleString()}`} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              <Line type="monotone" dataKey="In" name="Income" stroke={G} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Out" name="Expenses" stroke={R} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>}
        </div>
      </div>

      {/* 4. ET Distribution */}
      <div style={card}>
        <h4 style={title}>Evangelistic Teams Distribution</h4>
        <div style={{ height: Math.max(chartH, etData.length * 36 + 20) }}>
          {etData.length === 0 ? <EmptyState label="ET" /> :
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={etData} layout="vertical" margin={{ top: 4, right: 30, left: 0, bottom: 0 }}>
              <XAxis type="number" fontSize={9} hide />
              <YAxis dataKey="name" type="category" fontSize={10} width={isMobile ? 65 : 80}
                axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(115,0,81,0.05)' }} contentStyle={tip} />
              <Bar dataKey="value" name="Members" radius={[0, 5, 5, 0]} barSize={isMobile ? 14 : 18}
                label={{ position: 'right', fontSize: 10, fill: '#555' }}>
                {etData.map((_, i) => <Cell key={i} fill={ET_COLORS[i % ET_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>}
        </div>
      </div>

      {/* 5. Ministry Distribution — FULL WIDTH */}
      <div style={{ ...card, gridColumn: isMobile ? '1' : '1 / -1' }}>
        <h4 style={title}>Members per Ministry</h4>
        <div style={{ height: Math.max(chartH, minData.length * 32 + 20) }}>
          {minData.length === 0 ? <EmptyState label="ministry" /> :
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={minData} layout="vertical" margin={{ top: 4, right: 50, left: 0, bottom: 0 }}>
              <XAxis type="number" fontSize={9} hide />
              <YAxis dataKey="name" type="category" fontSize={isMobile ? 9 : 10}
                width={isMobile ? 100 : 140} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(115,0,81,0.05)' }} contentStyle={tip}
                formatter={(v: any) => [`${v} member${v !== 1 ? 's' : ''}`, 'Count']} />
              <Bar dataKey="value" name="Members" radius={[0, 5, 5, 0]} barSize={isMobile ? 12 : 18}
                label={{ position: 'right', fontSize: 10, fill: '#555' }}>
                {minData.map((_, i) => <Cell key={i} fill={MIN_COLORS[i % MIN_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>}
        </div>
      </div>

    </div>
  );
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
