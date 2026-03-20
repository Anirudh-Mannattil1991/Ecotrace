'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/authContext';

interface CategoryData {
  category: string;
  label: string;
  icon: string;
  co2_kg: number;
  amount_usd: number;
  pct: number;
  color: string;
}

interface MonthlyData {
  month: string;
  co2_kg: number;
  amount_usd: number;
}

interface GradeInfo {
  grade: string;
  colour: string;
  label: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount_usd: number;
  co2_kg: number;
  source: string;
}

interface Props {
  transactions: Transaction[];
  categoryData: CategoryData[];
  monthlyData: MonthlyData[];
  totalCO2: number;
  totalSpend: number;
  grade: GradeInfo;
}

export default function ExportPDFButton({ transactions, categoryData, totalCO2, totalSpend, grade }: Props) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleExport = async () => {
    setLoading(true);
    try {
      // Fetch company name from profile
      let companyName = 'Your Company';
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_name')
          .eq('id', user.id)
          .single();
        if (profile?.company_name) companyName = profile.company_name;
      }

      // Fetch latest AI insight
      let insightData = null;
      if (user) {
        const { data: insight } = await supabase
          .from('ai_insights')
          .select('insight_json')
          .eq('user_id', user.id)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();
        if (insight?.insight_json) insightData = insight.insight_json;
      }

      // Dynamic import to avoid SSR issues with @react-pdf/renderer
      const { pdf } = await import('@react-pdf/renderer');
      const { EcoTraceReport } = await import('./EcoTraceReport');

      // Get date range
      const dates = transactions.map(t => t.date).sort();
      const startDate = dates[0] || format(new Date(), 'yyyy-MM-dd');
      const endDate = dates[dates.length - 1] || format(new Date(), 'yyyy-MM-dd');
      const reportMonth = format(new Date(startDate), 'yyyy-MM');

      const blob = await pdf(
        EcoTraceReport({
          categoryData,
          totalCO2,
          totalSpend,
          grade,
          startDate,
          endDate,
          generatedAt: format(new Date(), 'dd MMM yyyy, HH:mm'),
          companyName,
          insightData,
        })
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EcoTrace_Impact_Report_${reportMonth}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('PDF export failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleExport}
      className="btn-primary"
      disabled={loading || transactions.length === 0}
      style={{ fontSize: '13px', padding: '8px 16px' }}
    >
      {loading ? (
        <><span className="spinner" style={{ width: '14px', height: '14px' }} /> Generating...</>
      ) : (
        '📄 Export Impact Report'
      )}
    </button>
  );
}
