'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';
import { DEMO_TRANSACTIONS, DEMO_AI_INSIGHT } from '@/lib/demoMode';
import { format } from 'date-fns';

interface InsightAction {
  action: string;
  estimated_reduction_pct: number;
  effort: 'Low' | 'Medium' | 'High';
  local_context: string;
}

interface QuickWin {
  category: string;
  tip: string;
  estimated_co2_saving_kg: number;
}

interface InsightData {
  headline: string;
  top_category_insight: {
    category: string;
    co2_kg: number;
    pct_of_total: number;
    finding: string;
    three_actions: InsightAction[];
  };
  quick_wins: QuickWin[];
  benchmark_note: string;
}

const EFFORT_COLORS: Record<string, string> = {
  Low: '#2ECC71',
  Medium: '#F39C12',
  High: '#E74C3C',
};

export default function InsightsPage() {
  const { user, isDemoUser } = useAuth();
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactionCount, setTransactionCount] = useState(0);
  const [lastGenerateTime, setLastGenerateTime] = useState(0);

  const loadLatestInsight = useCallback(async () => {
    if (!user) return;

    // If demo mode, use demo insight
    if (isDemoUser) {
      setInsight(DEMO_AI_INSIGHT as InsightData);
      setGeneratedAt(new Date().toISOString());
      setTransactionCount(DEMO_TRANSACTIONS.length);
      setInitialLoading(false);
      return;
    }

    // Otherwise fetch from Supabase
    try {
      const { data: txData } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id);
      setTransactionCount(txData?.length || 0);

      const { data } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();

      if (data?.insight_json) {
        setInsight(data.insight_json as InsightData);
        setGeneratedAt(data.generated_at);
      }
    } catch (err) {
      console.error('Failed to load insight:', err);
    }
    setInitialLoading(false);
  }, [user, isDemoUser]);

  useEffect(() => {
    loadLatestInsight();
  }, [loadLatestInsight]);

  const handleGenerate = async () => {
    if (!user) return;

    // Guardrail: Check if we have enough transactions
    if (transactionCount < 20) {
      setError(`Add more transactions for better AI recommendations. You have ${transactionCount}, need at least 20.`);
      return;
    }

    // Guardrail: Cooldown (30 seconds between generations)
    const now = Date.now();
    if (lastGenerateTime && now - lastGenerateTime < 30000) {
      setError('Please wait 30 seconds before generating insights again.');
      return;
    }

    // Demo mode: instant demo insight
    if (isDemoUser) {
      setInsight(DEMO_AI_INSIGHT as InsightData);
      setGeneratedAt(new Date().toISOString());
      setLastGenerateTime(now);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setInsight(data.insight);
        setGeneratedAt(data.generated_at);
        setLastGenerateTime(now);
      } else {
        setError(data.error || 'Failed to generate insights');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            AI Sustainability Coach
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
            Powered by Claude · Hyper-local recommendations for your business {isDemoUser && '(Demo)'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {generatedAt && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Last generated: {format(new Date(generatedAt), 'dd MMM yyyy, HH:mm')}
            </span>
          )}
          <button
            onClick={handleGenerate}
            className="btn-primary"
            disabled={loading || transactionCount < 20}
          >
            {loading ? (
              <><span className="spinner" style={{ width: '16px', height: '16px' }} /> Analysing…</>
            ) : insight ? (
              '🔄 Regenerate Insights'
            ) : (
              '🤖 Generate AI Insights'
            )}
          </button>
        </div>
      </div>

      {/* Guardrail message */}
      {transactionCount < 20 && !insight && (
        <div style={{
          background: 'rgba(243, 156, 18, 0.1)',
          border: '1px solid var(--accent-warn)',
          borderRadius: '10px',
          padding: '16px 20px',
          color: 'var(--accent-warn)',
          fontFamily: 'Space Grotesk, sans-serif',
          marginBottom: '24px',
        }}>
          💡 Add more transactions for better AI recommendations. You have {transactionCount}, need at least 20.
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(231, 76, 60, 0.1)',
          border: '1px solid var(--accent-danger)',
          borderRadius: '10px',
          padding: '16px 20px',
          color: 'var(--accent-danger)',
          fontFamily: 'Space Grotesk, sans-serif',
          marginBottom: '24px',
        }}>
          ⚠ {error}
        </div>
      )}

      {!insight && !loading && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px dashed var(--border)',
          borderRadius: '12px',
          padding: '64px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No insights generated yet
          </h2>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '24px' }}>
            {transactionCount < 20
              ? `Upload at least ${20 - transactionCount} more transactions to generate insights.`
              : 'Click "Generate AI Insights" to get personalised carbon reduction recommendations.'}
          </p>
          <button onClick={handleGenerate} className="btn-primary" disabled={loading || transactionCount < 20}>
            🤖 Generate AI Insights
          </button>
        </div>
      )}

      {insight && (
        <div>
          {/* Headline Card */}
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-soft), #0B3D20)',
            border: '1px solid var(--accent-primary)',
            borderRadius: '12px',
            padding: '28px 32px',
            marginBottom: '24px',
          }}>
            <div style={{ fontSize: '11px', color: 'rgba(232, 245, 233, 0.6)', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              AI Headline Insight
            </div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', fontWeight: 700, color: '#E8F5E9', lineHeight: 1.3 }}>
              {insight.headline}
            </div>
          </div>

          {/* Top Category Deep Dive */}
          {insight.top_category_insight && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Top Emission Source
                  </div>
                  <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {insight.top_category_insight.category}
                  </h2>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--accent-danger)' }}>
                      {insight.top_category_insight.co2_kg?.toFixed(2)} kg
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>CO₂</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--accent-warn)' }}>
                      {insight.top_category_insight.pct_of_total?.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>of total</div>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-elevated)',
                borderRadius: '8px',
                padding: '14px 16px',
                marginBottom: '20px',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                fontFamily: 'Space Grotesk, sans-serif',
                lineHeight: 1.5,
              }}>
                {insight.top_category_insight.finding}
              </div>

              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                Recommended Actions
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }} className="actions-grid">
                {insight.top_category_insight.three_actions?.map((action, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '18px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{
                        background: `${EFFORT_COLORS[action.effort]}20`,
                        color: EFFORT_COLORS[action.effort],
                        padding: '2px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}>
                        {action.effort}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                        -{action.estimated_reduction_pct}%
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.5, marginBottom: '10px' }}>
                      {action.action}
                    </div>
                    {action.local_context && (
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        fontFamily: 'JetBrains Mono, monospace',
                        lineHeight: 1.4,
                        borderTop: '1px solid var(--border)',
                        paddingTop: '8px',
                      }}>
                        💡 {action.local_context}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Wins */}
          {insight.quick_wins && insight.quick_wins.length > 0 && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                ⚡ Quick Wins
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }} className="quick-wins-grid">
                {insight.quick_wins.map((win, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '16px',
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                      {win.category}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.5, marginBottom: '10px' }}>
                      {win.tip}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                      Save ~{win.estimated_co2_saving_kg?.toFixed(1)} kg CO₂
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benchmark Note */}
          {insight.benchmark_note && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '16px 20px',
              color: 'var(--text-muted)',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '13px',
              lineHeight: 1.5,
            }}>
              📊 {insight.benchmark_note}
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .actions-grid { grid-template-columns: 1fr !important; }
          .quick-wins-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
