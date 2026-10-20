import React from 'react';

const MAX_CHARS = 10000;

export default function TextEditor({ value, onChange, placeholder, disabled }) {
  const count = value?.length || 0;
  return (
    <div>
      <textarea
        className="form-textarea"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder || 'Paste your legal document text here...'}
        disabled={disabled}
        maxLength={MAX_CHARS}
        style={{ minHeight: 260, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8125rem', lineHeight: 1.7 }}
      />
      <div style={{
        display: 'flex', justifyContent: 'flex-end',
        fontSize: '0.75rem', color: count > MAX_CHARS * 0.9 ? 'var(--color-warning)' : 'var(--color-text-light)',
        marginTop: '0.375rem',
      }}>
        {count.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
      </div>
    </div>
  );
}
