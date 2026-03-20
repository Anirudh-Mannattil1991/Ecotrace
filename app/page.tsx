import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EcoTrace — Decarbonizing Commerce, One Transaction at a Time.',
  description: 'Upload your transactions. Understand your footprint. Act on AI-powered recommendations. Built for SMEs.',
};

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', fontFamily: 'Space Grotesk, sans-serif' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10, 15, 10, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 32px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🌿</span>
            <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--accent-primary)' }}>EcoTrace</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/auth/login" style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
            }}>
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 18px', fontSize: '13px' }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '100px 32px 80px',
        textAlign: 'center',
      }}>


        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.15,
          marginBottom: '20px',
          maxWidth: '800px',
          margin: '0 auto 20px',
        }}>
          Decarbonizing Commerce,{' '}
          <span style={{ color: 'var(--accent-primary)' }}>One Transaction</span>{' '}
          at a Time.
        </h1>

        <p style={{
          fontSize: '18px',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: 1.6,
          fontFamily: 'Space Grotesk, sans-serif',
        }}>
          Upload your transactions. Understand your footprint. Act on AI-powered recommendations.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/signup" className="btn-primary" style={{
            textDecoration: 'none',
            padding: '14px 28px',
            fontSize: '15px',
          }}>
            🚀 Get Started Free
          </Link>
          <Link href="/dashboard" className="btn-secondary" style={{
            textDecoration: 'none',
            padding: '14px 28px',
            fontSize: '15px',
          }}>
            🎯 See Demo
          </Link>
        </div>

        {/* Dashboard Preview */}
        <div style={{
          marginTop: '64px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '28px',
          maxWidth: '900px',
          margin: '64px auto 0',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, var(--accent-primary), #58D68D, var(--accent-primary))',
          }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }} className="preview-grid">
            {[
              { label: 'Total Footprint', value: '2,847.32', unit: 'kg CO₂' },
              { label: 'Carbon Grade', value: 'B', unit: 'Good', highlight: '#81C784' },
              { label: 'Spend Tracked', value: '$18,265', unit: 'USD' },
              { label: 'Top Emitter', value: '✈️ Air Travel', unit: '1,264 kg', highlight: 'var(--accent-danger)' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '14px',
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: stat.highlight || 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
                  {stat.unit}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            height: '70px',
            background: 'var(--bg-elevated)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '20px',
            padding: '12px 20px',
          }}>
            {[
              { month: 'Jan 25', h: 45 },
              { month: 'Feb 25', h: 70 },
              { month: 'Mar 25', h: 55 },
              { month: 'Apr 25', h: 30 },
            ].map((item) => (
              <div key={item.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '28px',
                  height: `${item.h}%`,
                  background: 'var(--accent-primary)',
                  borderRadius: '3px 3px 0 0',
                  opacity: 0.8,
                }} />
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{item.month}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
            Sample Dashboard Preview — Monthly Carbon Trend
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '80px 32px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            How It Works
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '56px', fontSize: '15px' }}>
            From zero visibility to full carbon intelligence in minutes.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }} className="steps-grid">
            {[
              {
                step: '01',
                icon: '📤',
                title: 'Upload CSV',
                desc: 'Import your business transactions via CSV or connect your payment processor. Our validator ensures data quality instantly.',
              },
              {
                step: '02',
                icon: '⚡',
                title: 'Instant Carbon Analysis',
                desc: 'Our EPA GHG Protocol-aligned engine calculates CO₂ emissions per transaction, grades your footprint, and visualises your data.',
              },
              {
                step: '03',
                icon: '🤖',
                title: 'AI-Powered Actions',
                desc: 'Claude analyses your data and generates hyper-local, Singapore-specific recommendations with estimated reduction percentages.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '28px',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '24px',
                  background: 'var(--accent-primary)',
                  color: '#0A0F0A',
                  fontWeight: 700,
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  STEP {item.step}
                </div>
                <div style={{ fontSize: '36px', marginBottom: '14px', marginTop: '8px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section style={{ padding: '80px 32px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Everything You Need
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '56px', fontSize: '15px' }}>
            A complete carbon intelligence platform for modern SMEs.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="features-grid">
            {[
              {
                icon: '📊',
                title: 'Eco-Pulse Dashboard',
                desc: 'Real-time carbon grade, emissions breakdown by category, month-over-month trends, and full transaction history — all in one view.',
                features: ['Carbon Grade (A–F)', 'Pie & Line Charts', 'Sortable Transaction Table'],
              },
              {
                icon: '🤖',
                title: 'AI Sustainability Coach',
                desc: 'Claude analyses your spending patterns and generates specific, actionable recommendations with effort ratings and local context.',
                features: ['Headline Insight', '3 Prioritised Actions', 'Quick Wins & Benchmarks'],
              },
              {
                icon: '📄',
                title: 'Exportable Impact Report',
                desc: 'Generate a professional 3-page PDF report with your carbon grade, breakdown table, and AI recommendations — ready to share.',
                features: ['Cover + Grade Page', 'Category Breakdown', 'AI Recommendations'],
              },
            ].map((feature, i) => (
              <div key={i} style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '28px',
              }}>
                <div style={{ fontSize: '36px', marginBottom: '14px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                  {feature.desc}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {feature.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '28px 32px',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          gap: '48px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {[
            { icon: '🏛️', text: 'Aligned with EPA GHG Protocol' },
            { icon: '🏢', text: 'Built for SMEs' },
            { icon: '🇸🇬', text: 'Singapore-first recommendations' },
            { icon: '🔒', text: 'Row-level security with Supabase' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
            }}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Start Tracking Your Carbon Footprint
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
            Join businesses using EcoTrace to understand and reduce their environmental impact.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup" className="btn-primary" style={{ textDecoration: 'none', padding: '14px 32px', fontSize: '15px' }}>
              🚀 Get Started Free
            </Link>
            <Link href="/auth/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '14px 32px', fontSize: '15px' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '28px 32px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '18px' }}>🌿</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '16px' }}>EcoTrace</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            Ignite Hack 2.0 · Carbon data sourced from EPA GHG Protocol &amp; IPCC AR6
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .preview-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
