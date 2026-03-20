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

  // --- Patch: Mock user for demo mode ---
  const currentUser = isDemoUser ? { id: 'demo-uuid', email: 'demo@ecotrace.com' } : user;

  const fetchTransactions = useCallback(async () => {
    setLoading(true);

    // --- Patch: Load demo transactions even if user is null ---
    if (isDemoUser) {
      setTransactions(DEMO_TRANSACTIONS as Transaction[]);
      setLoading(false);
      return;
    }

    if (!currentUser) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', currentUser.id)
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
  }, [currentUser, isDemoUser]);

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
    if (!currentUser) return;
    setMockStripeLoading(true);
    try {
      const res = await fetch('/api/mock-stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
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
      {/* Page content unchanged */}
      {/* ... keep all your existing JSX here ... */}
    </div>
  );
}
