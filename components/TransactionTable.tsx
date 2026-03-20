'use client';

import { useState, useMemo } from 'react';
import { CARBON_COEFFICIENTS } from '@/lib/carbonCoefficients';

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
  onRefresh: () => void;
}

type SortKey = 'date' | 'description' | 'category' | 'amount_usd' | 'co2_kg';
type SortDir = 'asc' | 'desc';

const ROWS_PER_PAGE = 10;

export default function TransactionTable({ transactions }: Props) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return transactions.filter(tx =>
      tx.description?.toLowerCase().includes(q) ||
      (CARBON_COEFFICIENTS[tx.category]?.label || tx.category).toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number = a[sortKey] || '';
      let bv: string | number = b[sortKey] || '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / ROWS_PER_PAGE);
  const paginated = sorted.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span style={{ color: 'var(--text-muted)' }}>↕</span>;
    return <span style={{ color: 'var(--accent-primary)' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const getCO2Color = (co2: number) => {
    if (co2 > 500) return 'var(--accent-danger)';
    if (co2 > 200) return 'var(--accent-warn)';
    return 'var(--accent-primary)';
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Transaction History
          <span style={{ marginLeft: '10px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400, fontFamily: 'JetBrains Mono, monospace' }}>
            ({filtered.length} records)
          </span>
        </h3>
        <input
          type="text"
          placeholder="Search by description or category..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ width: '280px', padding: '8px 12px', fontSize: '13px' }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('date')} style={{ minWidth: '100px' }}>Date <SortIcon col="date" /></th>
              <th onClick={() => handleSort('description')} style={{ minWidth: '200px' }}>Description <SortIcon col="description" /></th>
              <th onClick={() => handleSort('category')} style={{ minWidth: '160px' }}>Category <SortIcon col="category" /></th>
              <th onClick={() => handleSort('amount_usd')} style={{ minWidth: '120px', textAlign: 'right' }}>Amount <SortIcon col="amount_usd" /></th>
              <th onClick={() => handleSort('co2_kg')} style={{ minWidth: '120px', textAlign: 'right' }}>CO₂ (kg) <SortIcon col="co2_kg" /></th>
              <th style={{ minWidth: '80px' }}>Source</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {search ? 'No transactions match your search.' : 'No transactions yet.'}
                </td>
              </tr>
            ) : (
              paginated.map((tx) => {
                const catInfo = CARBON_COEFFICIENTS[tx.category];
                return (
                  <tr key={tx.id}>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {tx.date}
                    </td>
                    <td style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px' }}>
                      {tx.description || '—'}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--bg-elevated)',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontFamily: 'Space Grotesk, sans-serif',
                        color: 'var(--text-secondary)',
                      }}>
                        {catInfo?.icon} {catInfo?.label || tx.category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--text-primary)' }}>
                      ${Number(tx.amount_usd).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: getCO2Color(tx.co2_kg), fontWeight: 600 }}>
                      {Number(tx.co2_kg).toFixed(4)}
                    </td>
                    <td>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        background: tx.source === 'mock_stripe' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(129, 199, 132, 0.1)',
                        color: tx.source === 'mock_stripe' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                        {tx.source === 'mock_stripe' ? 'Stripe' : 'CSV'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            Page {page} of {totalPages} · {sorted.length} total
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: page === 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '12px',
                transition: 'all 0.2s ease',
              }}
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: p === page ? 'var(--accent-primary)' : 'var(--border)',
                    background: p === page ? 'rgba(46, 204, 113, 0.15)' : 'transparent',
                    color: p === page ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '12px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: page === totalPages ? 'var(--text-muted)' : 'var(--text-secondary)',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '12px',
                transition: 'all 0.2s ease',
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
