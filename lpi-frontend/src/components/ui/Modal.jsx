import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal — accessible dialog overlay.
 * Props:
 *   isOpen: bool
 *   onClose: function
 *   title: string
 *   children: ReactNode
 *   footer: ReactNode
 *   size: 'sm' | 'md' | 'lg'
 */
export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = { sm: '420px', md: '560px', lg: '720px' };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-box" style={{ maxWidth: maxWidths[size] }}>
        <div className="modal-header">
          <h3 id="modal-title" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-accent)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            aria-label="Close modal"
            style={{ padding: '0.25rem' }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
