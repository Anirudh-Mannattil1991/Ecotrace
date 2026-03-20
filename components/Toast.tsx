'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const borderColor = type === 'error' ? 'var(--accent-danger)' : type === 'info' ? 'var(--accent-warn)' : 'var(--accent-primary)';
  const icon = type === 'error' ? '✗' : type === 'info' ? 'ℹ' : '✓';

  return (
    <div
      className="toast"
      style={{ borderColor }}
      onClick={onClose}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <span style={{ color: borderColor, fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>{icon}</span>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', lineHeight: '1.4' }}>{message}</span>
      </div>
    </div>
  );
}
