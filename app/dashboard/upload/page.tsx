'use client';

import { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { useAuth } from '@/lib/authContext';
import { CARBON_COEFFICIENTS, calculateCO2 } from '@/lib/carbonCoefficients';
import { matchCategory } from '@/lib/categoryMatcher';
import Toast from '@/components/Toast';

interface ParsedRow {
  date: string;
  description: string;
  category: string;
  amount_usd: string;
  co2_kg?: number;
  error?: string;
  valid: boolean;
  originalCategory?: string;
  categoryFixed?: boolean;
}

const SAMPLE_CSV = `date,description,category,amount_usd
2025-01-05,Singapore Airlines SQ412,air_travel,1200.00
2025-01-08,AWS Monthly Bill,it_cloud,340.00
2025-01-12,DHL Express Shipment,road_freight,875.00
2025-01-15,Fairprice Groceries,local_groceries,220.00
2025-01-20,SP Group Electricity,energy_utilities,480.00
2025-01-22,Grab Food Office Lunch,food_hospitality,95.00
2025-02-01,Cathay Pacific CX101,air_travel,2100.00
2025-02-05,Azure Cloud Services,it_cloud,510.00
2025-02-10,Shopee Logistics,retail_ecommerce,340.00
2025-02-18,Office Supplies Shopee,retail_ecommerce,150.00
2025-02-22,SP Group Electricity,energy_utilities,460.00
2025-03-03,FedEx International,road_freight,1200.00
2025-03-07,Zoom Pro Annual,it_cloud,190.00
2025-03-14,Catering for AGM,food_hospitality,780.00
2025-03-19,Singapore Airlines SQ317,air_travel,980.00`;

export default function UploadPage() {
  const { user } = useAuth();
  const [dragging, setDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (file: File) => {
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: ParsedRow[] = (results.data as Record<string, string>[]).map((row) => {
          const errors: string[] = [];
          if (!row.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) errors.push('Invalid date (use YYYY-MM-DD)');
          if (!row.amount_usd || isNaN(parseFloat(row.amount_usd))) errors.push('Invalid amount_usd');

          let category = row.category || '';
          let categoryFixed = false;

          // Try to match category with fuzzy matching
          if (category) {
            if (!CARBON_COEFFICIENTS[category]) {
              const match = matchCategory(category);
              if (match.matched && match.confidence > 0.6) {
                category = match.category;
                categoryFixed = true;
              } else {
                errors.push(`Unknown category: "${row.category}" (auto-matched to "${category}")`);
              }
            }
          } else {
            errors.push('Missing category');
          }

          const valid = errors.length === 0;
          const co2_kg = valid ? calculateCO2(category, parseFloat(row.amount_usd)) : undefined;

          return {
            date: row.date || '',
            description: row.description || '',
            category,
            amount_usd: row.amount_usd || '',
            co2_kg,
            error: errors.join('; '),
            valid,
            originalCategory: row.category,
            categoryFixed,
          };
        });
        setParsedRows(rows);
      },
      error: (err) => {
        setToast({ message: `CSV parse error: ${err.message}`, type: 'error' });
      },
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      parseCSV(file);
    } else {
      setToast({ message: 'Please upload a .csv file only.', type: 'error' });
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseCSV(file);
  };

  const updateRowCategory = (index: number, newCategory: string) => {
    const updated = [...parsedRows];
    updated[index].category = newCategory;
    updated[index].categoryFixed = true;
    updated[index].co2_kg = calculateCO2(newCategory, parseFloat(updated[index].amount_usd));
    updated[index].valid = true;
    updated[index].error = '';
    setParsedRows(updated);
  };

  const handleConfirmUpload = async () => {
    if (!user) return;
    const validRows = parsedRows.filter(r => r.valid);
    if (validRows.length === 0) {
      setToast({ message: 'No valid rows to upload.', type: 'error' });
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/transactions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          transactions: validRows.map(r => ({
            date: r.date,
            description: r.description,
            category: r.category,
            amount_usd: parseFloat(r.amount_usd),
            source: 'csv',
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({
          message: `${data.inserted} transactions imported. ${data.totalCO2Kg.toFixed(2)} kg CO₂ calculated.`,
          type: 'success',
        });
        setParsedRows([]);
        setFileName('');
      } else {
        setToast({ message: data.error || 'Upload failed', type: 'error' });
      }
    } catch {
      setToast({ message: 'Network error. Please try again.', type: 'error' });
    }
    setUploading(false);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecotrace_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedRows.filter(r => r.valid).length;
  const invalidCount = parsedRows.filter(r => !r.valid).length;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Upload Transaction Data
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
          Import your business transactions via CSV to calculate your carbon footprint.
        </p>
      </div>

      {/* Valid categories reference */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Valid Category Keys
          </h3>
          <button onClick={handleDownloadTemplate} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>
            ⬇ Download Sample CSV
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Object.entries(CARBON_COEFFICIENTS).map(([key, val]) => (
            <span key={key} style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--text-secondary)',
            }}>
              {val.icon} <strong style={{ color: 'var(--accent-primary)' }}>{key}</strong> — {val.label}
            </span>
          ))}
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent-primary)' : 'var(--border)'}`,
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(46, 204, 113, 0.05)' : 'var(--bg-surface)',
          transition: 'all 0.2s ease',
          marginBottom: '24px',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📤</div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {fileName ? `✓ ${fileName}` : 'Drag & drop your CSV here'}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
          or click to browse · .csv files only
        </div>
        {fileName && (
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--accent-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
            {parsedRows.length} rows parsed · {validCount} valid · {invalidCount} errors
          </div>
        )}
      </div>

      {/* Preview Table */}
      {parsedRows.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Preview ({parsedRows.length} rows)
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {invalidCount > 0 && (
                <span style={{ fontSize: '12px', color: 'var(--accent-danger)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  ⚠ {invalidCount} invalid rows will be skipped
                </span>
              )}
              <button
                onClick={handleConfirmUpload}
                className="btn-primary"
                disabled={uploading || validCount === 0}
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                {uploading ? <><span className="spinner" style={{ width: '14px', height: '14px' }} /> Uploading...</> : `✓ Confirm Upload (${validCount} rows)`}
              </button>
              <button
                onClick={() => { setParsedRows([]); setFileName(''); }}
                className="btn-secondary"
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                Cancel
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Amount (USD)</th>
                  <th style={{ textAlign: 'right' }}>CO₂ (kg)</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((row, i) => (
                  <tr key={i} style={{ background: row.valid ? 'transparent' : 'rgba(231, 76, 60, 0.05)' }}>
                    <td>
                      {row.valid ? (
                        <span style={{ color: 'var(--accent-primary)', fontSize: '14px' }}>✓</span>
                      ) : (
                        <span title={row.error} style={{ color: 'var(--accent-danger)', fontSize: '14px', cursor: 'help' }}>✗</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: row.valid ? 'var(--text-secondary)' : 'var(--accent-danger)' }}>
                      {row.date || '—'}
                    </td>
                    <td style={{ fontSize: '13px' }}>{row.description || '—'}</td>
                    <td>
                      {row.valid ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            background: 'var(--bg-elevated)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontFamily: 'JetBrains Mono, monospace',
                            color: 'var(--text-secondary)',
                          }}>
                            {CARBON_COEFFICIENTS[row.category]?.icon} {row.category}
                          </span>
                          {row.categoryFixed && (
                            <span style={{ fontSize: '10px', color: 'var(--accent-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
                              (auto-matched)
                            </span>
                          )}
                        </div>
                      ) : (
                        <select
                          value={row.category}
                          onChange={(e) => updateRowCategory(i, e.target.value)}
                          style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--accent-danger)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontFamily: 'JetBrains Mono, monospace',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <option value="">-- Select category --</option>
                          {Object.entries(CARBON_COEFFICIENTS).map(([key, val]) => (
                            <option key={key} value={key}>
                              {val.icon} {key}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
                      {row.amount_usd ? `$${parseFloat(row.amount_usd).toFixed(2)}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: row.valid ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                      {row.co2_kg ? row.co2_kg.toFixed(4) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
