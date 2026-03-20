'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';
import { getCarbonGrade } from '@/lib/carbonGrade';
import { CARBON_COEFFICIENTS, CATEGORY_COLORS } from '@/lib/carbonCoefficients';
import { DEMO_TRANSACTIONS } from '@/lib/demoMode';
import EmissionsBreakdownChart from '@/components/charts/EmissionsBreakdownChart';
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart';
import TransactionTable from '@/components/TransactionTable';
import Toast from '@/components/Toast';
import Link from 'next/link';
import ExportPDFButton from '@/components/ExportPDFButton';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount_usd: number;
  co2_kg: number;
  source: string;
}

interface CategoryData {
  category: string;
  label: string;
  icon: string;
  co2_kg: number;
  amount_usd: number;
  pct: number;
  color: string;
}

interface MonthData {
  month: string;
  co2_kg: number;
  amount_usd: number;
}

export default function DashboardPage() {
  const { user, isDemoUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [mockStripeLoading, setMockStripeLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // If demo mode, use local demo transactions
    if (isDemoUser) {
      setTransactions(DEMO_TRANSACTIONS as Transaction[]);
      setLoading(false);
      return;
    }

    // Otherwise fetch from Supabase
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (!error && data) {
        setTransactions(data);
      } else {
        console.error('Error fetching transactions:', error);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
    setLoading(false);
  }, [user, isDemoUser]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Computed stats
  const totalCO2 = transactions.reduce((sum, tx) => sum + (tx.co2_kg || 0), 0);
  const totalSpend = transactions.reduce((sum, tx) => sum + (tx.amount_usd || 0), 0);
  const grade = getCarbonGrade(totalCO2, totalSpend);

  // Category breakdown
  const categoryMap: Record<string, { co2: number; spend: number }> = {};
  for (const tx of transactions) {
    if (!categoryMap[tx.category]) categoryMap[tx.category] = { co2: 0, spend: 0 };
    categoryMap[tx.category].co2 += tx.co2_kg || 0;
    categoryMap[tx.category].spend += tx.amount_usd || 0;
  }

  const categoryData: CategoryData[] = Object.entries(categoryMap)
    .map(([cat, data]) => ({
      category: cat,
      label: CARBON_COEFFICIENTS[cat]?.label || cat,
      icon: CARBON_COEFFICIENTS[cat]?.icon || '📊',
      co2_kg: parseFloat(data.co2.toFixed(2)),
      amount_usd: parseFloat(data.spend.toFixed(2)),
      pct: totalCO2 > 0 ? parseFloat(((data.co2 / totalCO2) * 100).toFixed(1)) : 0,
      color: CATEGORY_COLORS[cat] || '#2ECC71',
    }))
    .sort((a, b) => b.co2_kg - a.co2_kg);

  const topCategory = categoryData[0];

  // Monthly trend
  const monthMap: Record<string, { co2: number; spend: number }> = {};
  for (const tx of transactions) {
    const month = tx.date.substring(0, 7);
    if (!monthMap[month]) monthMap[month] = { co2: 0, spend: 0 };
    monthMap[month].co2 += tx.co2_kg || 0;
    monthMap[month].spend += tx.amount_usd || 0;
  }

  const monthlyData: MonthData[] = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => {
      const [year, m] = month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        month: `${monthNames[parseInt(m) - 1]} ${year.slice(2)}`,
        co2_kg: parseFloat(data.co2.toFixed(2)),
        amount_usd: parseFloat(data.spend.toFixed(2)),
      };
    });

  const handleConnectMockStripe = async () => {
    if (!user) return;
    setMockStripeLoading(true);
    try {
      const res = await fetch('/api/mock-stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `${data.inserted} transactions imported from Mock Stripe. ${data.totalCO2Kg.toFixed(2)} kg CO₂ calculated.`, type: 'success' });
        fetchTransactions();
      } else {
        setToast({ message: data.error || 'Failed to connect Mock Stripe', type: 'error' });
      }
    } catch {
      setToast({ message: 'Network error. Please try again.', type: 'error' });
    }
    setMockStripeLoading(false);
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Eco-Pulse Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
            Real-time carbon intelligence for your business {isDemoUser && '(Demo Mode)'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {!isDemoUser && (
            <button
              onClick={handleConnectMockStripe}
              className="btn-secondary"
              disabled={mockStripeLoading}
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              {mockStripeLoading ? <><span className="spinner" style={{ width: '14px', height: '14px' }} /> Connecting...</> : '💳 Connect Mock Stripe'}
            </button>
          )}
          <ExportPDFButton
            transactions={transactions}
            categoryData={categoryData}
            monthlyData={monthlyData}
            totalCO2={totalCO2}
            totalSpend={totalSpend}
            grade={grade}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px', margin: '0 auto 16px' }} />
            <div style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk, sans-serif' }}>Loading your data...</div>
          </div>
        </div>
      ) : (
        <>
          {/* No data state */}
          {transactions.length === 0 && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border)',
              borderRadius: '12px',
              padding: '48px',
              textAlign: 'center',
              marginBottom: '32px',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌱</div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                No transactions yet
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontFamily: 'Space Grotesk, sans-serif' }}>
                Upload your CSV or connect Mock Stripe to start tracking your carbon footprint.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/dashboard/upload" className="btn-primary" style={{ textDecoration: 'none' }}>
                  📤 Upload CSV
                </Link>
                {!isDemoUser && (
                  <button onClick={handleConnectMockStripe} className="btn-secondary" disabled={mockStripeLoading}>
                    💳 Connect Mock Stripe
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2A: Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }} className="summary-grid">
            {/* Total Footprint */}
            <div className="card">
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                Total Footprint
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', lineHeight: 1 }}>
                {totalCO2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                kg CO₂
              </div>
            </div>

            {/* Carbon Grade */}
            <div className="card" style={{ background: `${grade.colour}15`, borderColor: `${grade.colour}40` }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Carbon Grade
              </div>
              <div style={{ fontSize: '48px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: grade.colour, lineHeight: 1 }}>
                {grade.grade}
              </div>
              <div style={{ fontSize: '12px', color: grade.colour, marginTop: '4px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>
                {grade.label}
              </div>
            </div>

            {/* Total Spend */}
            <div className="card">
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                Total Spend Tracked
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', lineHeight: 1 }}>
                ${totalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                USD tracked
              </div>
            </div>

            {/* Top Emission Category */}
            <div className="card">
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                Top Emission Category
              </div>
              {topCategory ? (
                <>
                  <div style={{ fontSize: '28px', marginBottom: '4px' }}>{topCategory.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                    {topCategory.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--accent-danger)', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {topCategory.co2_kg.toFixed(2)} kg CO₂
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px' }}>No data yet</div>
              )}
            </div>
          </div>

          {/* 2B + 2C: Charts Row */}
          {transactions.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }} className="charts-grid">
              <EmissionsBreakdownChart data={categoryData} />
              <MonthlyTrendChart data={monthlyData} />
            </div>
          )}

          {/* 2D: Transaction Table */}
          {transactions.length > 0 && (
            <TransactionTable
              transactions={transactions}
              onRefresh={fetchTransactions}
            />
          )}
        </>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @media (max-width: 1024px) {
          .summary-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .charts-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .summary-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
