'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryData {
  category: string;
  label: string;
  icon: string;
  co2_kg: number;
  amount_usd: number;
  pct: number;
  color: string;
}

interface Props {
  data: CategoryData[];
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategoryData }> }) => {
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
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {d.icon} {d.label}
        </div>
        <div style={{ color: 'var(--accent-primary)', fontSize: '13px' }}>
          {d.co2_kg.toFixed(2)} kg CO₂
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          {d.pct}% of total
        </div>
      </div>
    );
  }
  return null;
};

export default function EmissionsBreakdownChart({ data }: Props) {
  return (
    <div className="card">
      <h3 style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '16px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '20px',
      }}>
        Emissions by Category
      </h3>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 180px', height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="co2_kg"
                strokeWidth={2}
                stroke="var(--bg-surface)"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, minWidth: '140px' }}>
          {data.map((item) => (
            <div key={item.category} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: item.color,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'Space Grotesk, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.icon} {item.label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {item.co2_kg.toFixed(2)} kg · {item.pct}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
