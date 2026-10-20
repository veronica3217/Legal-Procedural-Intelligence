import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
  error:   <AlertCircle size={16} />,
  success: <CheckCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info:    <Info size={16} />,
};

/**
 * ErrorMessage / Alert component.
 * Props:
 *   type: 'error' | 'success' | 'warning' | 'info'
 *   message: string
 *   onDismiss: function (optional — shows close button)
 */
export default function ErrorMessage({ type = 'error', message, onDismiss }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} role="alert">
      {icons[type]}
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0 0.25rem', color: 'inherit', opacity: 0.7,
            fontSize: '1rem', lineHeight: 1,
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
