'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from 'recharts';

interface MonthData {
  month: string;
  co2_kg: number;
  amount_usd: number;
}

interface Props {
  data: MonthData[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: MonthData }>; label?: string }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontFamily: 'Space Grotesk, sans-serif',
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>{label}</div>
        <div style={{ color: 'var(--accent-primary)', fontSize: '13px', marginBottom: '2px' }}>
          {d.co2_kg.toFixed(2)} kg CO₂
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          ${d.amount_usd.toLocaleString()} spend
        </div>
      </div>
    );
  }
  return null;
};

export default function MonthlyTrendChart({ data }: Props) {
  return (
    <div className="card">
      <h3 style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '16px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '20px',
      }}>
        Monthly Carbon Trend
      </h3>
      <div style={{ height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tick={{ fill: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="co2_kg"
              stroke="var(--accent-primary)"
              strokeWidth={2.5}
              dot={<Dot r={4} fill="var(--accent-primary)" stroke="var(--bg-surface)" strokeWidth={2} />}
              activeDot={{ r: 6, fill: 'var(--accent-primary)', stroke: 'var(--bg-surface)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {data.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', marginTop: '20px' }}>
          No monthly data available yet
        </div>
      )}
    </div>
  );
}
