'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { AuthProvider, useAuth } from '@/lib/authContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px', margin: '0 auto 16px' }} />
          <div style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Loading EcoTrace...
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main
        style={{
          marginLeft: '240px',
          flex: 1,
          padding: '32px',
          maxWidth: 'calc(100% - 240px)',
          minHeight: '100vh',
        }}
        className="dashboard-main"
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
      <style>{`
        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0 !important;
            max-width: 100% !important;
            padding: 16px !important;
            padding-bottom: 80px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}
