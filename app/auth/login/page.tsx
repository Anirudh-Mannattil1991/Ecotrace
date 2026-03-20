'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { enableDemoMode } from '@/lib/demoMode';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Enable built-in demo mode (no Supabase required)
      enableDemoMode();
      router.push('/dashboard');
    } catch {
      setError('Failed to enter demo mode. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🌿</div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--accent-primary)',
            }}>EcoTrace</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Decarbonizing Commerce, One Transaction at a Time.
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="card">
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '22px',
            fontWeight: 700,
            marginBottom: '24px',
            color: 'var(--text-primary)',
          }}>
            Sign In
          </h1>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(231, 76, 60, 0.1)',
                border: '1px solid var(--accent-danger)',
                borderRadius: '8px',
                padding: '12px',
                color: 'var(--accent-danger)',
                fontSize: '13px',
                marginBottom: '16px',
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginBottom: '12px' }}
            >
              {loading ? <><span className="spinner" style={{ width: '16px', height: '16px' }} /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <button
            onClick={handleDemoLogin}
            className="btn-secondary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginBottom: '24px' }}
          >
            🎯 Try Demo Account
          </button>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
