import React, { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import Button from '../ui/Button';

export default function DocumentUploader({ onFileSelect, disabled }) {
  const inputRef = useRef();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.endsWith('.txt')) {
      alert('Please upload a PDF or TXT file.');
      return;
    }
    setFile(f);
    onFileSelect?.(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const clearFile = () => {
    setFile(null);
    onFileSelect?.(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      {!file ? (
        <div
          className={`dropzone ${dragOver ? 'active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
            disabled={disabled}
          />
          <Upload size={32} color="var(--color-text-light)" style={{ marginBottom: '0.75rem' }} />
          <p style={{ fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>
            Drop your PDF here, or click to browse
          </p>
          <p className="text-xs text-muted">Supports PDF and TXT files</p>
        </div>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.875rem 1rem',
          background: 'var(--color-info-bg)',
          border: '1px solid #BAE6FD',
          borderRadius: 'var(--radius)',
        }}>
          <FileText size={20} color="var(--color-info)" />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {file.name}
            </div>
            <div className="text-xs text-muted">
              {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>
          <button
            onClick={clearFile}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0.25rem' }}
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
