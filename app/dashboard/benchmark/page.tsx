'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';
import { getCarbonGrade } from '@/lib/carbonGrade';
import { INDUSTRY_BENCHMARKS } from '@/lib/carbonCoefficients';
import { DEMO_TRANSACTIONS, DEMO_USER } from '@/lib/demoMode';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

export default function BenchmarkPage() {
  const { user, isDemoUser } = useAuth();
  const [userIntensity, setUserIntensity] = useState<number | null>(null);
  const [userIndustry, setUserIndustry] = useState<string>('');
  const [grade, setGrade] = useState<{ grade: string; colour: string; label: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    // If demo mode, use demo data
    if (isDemoUser) {
      const totalCO2 = DEMO_TRANSACTIONS.reduce((s, t) => s + (t.co2_kg || 0), 0);
      const totalSpend = DEMO_TRANSACTIONS.reduce((s, t) => s + (t.amount_usd || 0), 0);
      if (totalSpend > 0) {
        const intensity = (totalCO2 / totalSpend) * 1000;
        setUserIntensity(parseFloat(intensity.toFixed(1)));
        setGrade(getCarbonGrade(totalCO2, totalSpend));
      }
      setUserIndustry(DEMO_USER.industry);
      setLoading(false);
      return;
    }

    // Otherwise fetch from Supabase
    try {
      const { data: txData } = await supabase
        .from('transactions')
        .select('co2_kg, amount_usd')
        .eq('user_id', user.id);

      if (txData && txData.length > 0) {
        const totalCO2 = txData.reduce((s: number, t: { co2_kg: number }) => s + (t.co2_kg || 0), 0);
        const totalSpend = txData.reduce((s: number, t: { amount_usd: number }) => s + (t.amount_usd || 0), 0);
        if (totalSpend > 0) {
          const intensity = (totalCO2 / totalSpend) * 1000;
          setUserIntensity(parseFloat(intensity.toFixed(1)));
          setGrade(getCarbonGrade(totalCO2, totalSpend));
        }
      }

      // Fetch user profile for industry
      const { data: profileData } = await supabase
        .from('profiles')
        .select('industry')
        .eq('id', user.id)
        .single();

      if (profileData?.industry) {
        setUserIndustry(profileData.industry);
      }
    } catch (err) {
      console.error('Failed to fetch benchmark data:', err);
    }
    setLoading(false);
  }, [user, isDemoUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontFamily: 'Space Grotesk, sans-serif',
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{label}</div>
          {payload.map((p, i) => (
            <div key={i} style={{ fontSize: '12px', color: p.color, marginBottom: '2px' }}>
              {p.name}: {p.value} kg CO₂/$1k
            </div>
          ))}
          {userIntensity && (
            <div style={{ fontSize: '12px', color: '#2ECC71', marginTop: '4px', borderTop: '1px solid var(--border)', paddingTop: '4px' }}>
              Your intensity: {userIntensity} kg CO₂/$1k
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Green-Line Benchmark
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
          See how your carbon intensity compares to your industry&apos;s average and best-in-class targets.
          {userIndustry && ` Your industry: ${userIndustry}`}
          {isDemoUser && ' (Demo Mode)'}
        </p>
      </div>

      {/* User's current intensity card */}
      {!loading && userIntensity !== null && grade && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }} className="bench-stats">
          <div className="card" style={{ background: `${grade.colour}15`, borderColor: `${grade.colour}40` }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Your Carbon Grade
            </div>
            <div style={{ fontSize: '40px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: grade.colour, lineHeight: 1 }}>
              {grade.grade}
            </div>
            <div style={{ fontSize: '12px', color: grade.colour, marginTop: '4px', fontFamily: 'Space Grotesk, sans-serif' }}>
              {grade.label}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Your Carbon Intensity
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--accent-primary)' }}>
              {userIntensity}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
              kg CO₂ per $1,000 spent
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Best-in-Class Target
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--accent-primary)' }}>
              &lt;50
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
              kg CO₂ per $1,000 (Grade A)
            </div>
          </div>
        </div>
      )}

      {/* Benchmark Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
          Industry Carbon Intensity Benchmarks
          <span style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
            kg CO₂ per $1,000 spent
          </span>
        </h3>

        <div style={{ height: '380px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={INDUSTRY_BENCHMARKS}
              layout="vertical"
              margin={{ top: 5, right: 60, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="sector"
                tick={{ fill: 'var(--text-secondary)', fontFamily: 'Space Grotesk, sans-serif', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={130}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  paddingTop: '16px',
                }}
              />
              <Bar dataKey="average" name="Industry Average" fill="rgba(231, 76, 60, 0.5)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="ideal" name="Best-in-Class Target" fill="rgba(46, 204, 113, 0.5)" radius={[0, 4, 4, 0]} />
              {userIntensity !== null && (
                <ReferenceLine
                  x={userIntensity}
                  stroke="#2ECC71"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  label={{
                    value: `You: ${userIntensity}`,
                    position: 'insideTopRight',
                    fill: '#2ECC71',
                    fontSize: 11,
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 700,
                  }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Inclusion Callout */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(26, 122, 66, 0.2), rgba(11, 61, 32, 0.3))',
        border: '1px solid var(--accent-soft)',
        borderRadius: '12px',
        padding: '24px 28px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '28px', flexShrink: 0 }}>🏦</span>
          <div>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--accent-primary)', margin: '0 0 8px 0' }}>
              Green Financing Opportunity
            </h3>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Businesses that achieve Grade B or above may qualify for green financing from <strong style={{ color: 'var(--text-primary)' }}>DBS</strong>, <strong style={{ color: 'var(--text-primary)' }}>OCBC</strong>, and <strong style={{ color: 'var(--text-primary)' }}>UOB</strong>&apos;s sustainability-linked loan programmes. Reduce your carbon intensity to unlock preferential rates.
            </p>
          </div>
        </div>
      </div>

      {/* Legend explanation */}
      <div className="card">
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
          How to Read This Chart
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="legend-grid">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '16px', height: '16px', background: 'rgba(231, 76, 60, 0.5)', borderRadius: '3px', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Industry Average</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>Typical carbon intensity for this sector</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '16px', height: '16px', background: 'rgba(46, 204, 113, 0.5)', borderRadius: '3px', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Best-in-Class Target</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>Ideal intensity for top performers</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '16px', height: '2px', background: '#2ECC71', flexShrink: 0, marginTop: '8px', borderTop: '2px dashed #2ECC71' }} />
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '2px' }}>Your Position</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>Your current carbon intensity</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .bench-stats { grid-template-columns: 1fr !important; }
          .legend-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
