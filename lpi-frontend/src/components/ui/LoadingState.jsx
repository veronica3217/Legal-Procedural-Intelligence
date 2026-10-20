import React from 'react';

/**
 * LoadingState — shows a centered spinner with optional message.
 * Props:
 *   message: string
 *   fullPage: bool — if true fills the entire viewport
 *   size: 'sm' | 'lg'
 */
export default function LoadingState({ message = 'Loading...', fullPage = false, size = 'lg' }) {
  const style = fullPage
    ? {
        position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)', zIndex: 9999, gap: '1rem',
      }
    : {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '3rem 1rem', gap: '1rem',
      };

  return (
    <div style={style}>
      <div className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`} />
      {message && (
        <p className="text-sm text-muted" style={{ textAlign: 'center' }}>
          {message}
        </p>
      )}
    </div>
  );
}
