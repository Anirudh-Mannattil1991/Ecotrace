'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';
import Toast from '@/components/Toast';

const INDUSTRIES = [
  'Technology',
  'Retail & E-Commerce',
  'Food & Hospitality',
  'Manufacturing',
  'Logistics & Freight',
  'Energy & Utilities',
  'Professional Services',
  'Healthcare',
  'Finance',
  'Other',
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setCompanyName(data.company_name || '');
      setIndustry(data.industry || '');
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, company_name: companyName, industry });

    if (error) {
      setToast({ message: 'Failed to save settings: ' + error.message, type: 'error' });
    } else {
      setToast({ message: 'Settings saved successfully!', type: 'success' });
    }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
          Manage your company profile and account settings.
        </p>
      </div>

      <div style={{ maxWidth: '560px' }}>
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
            Company Profile
          </h2>
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company name"
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Industry
              </label>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option value="">Select industry...</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: '14px', height: '14px' }} /> Saving...</> : '💾 Save Changes'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Account Information
          </h2>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Email
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: 'var(--text-secondary)' }}>
              {user?.email}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              User ID
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
              {user?.id}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
