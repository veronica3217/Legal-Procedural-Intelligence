import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Upload, AlignLeft } from 'lucide-react';
import { analyzeText, uploadDocument } from '../services/api';
import { useDocument } from '../context/DocumentContext';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';
import DocumentUploader from '../components/document/DocumentUploader';
import TextEditor from '../components/document/TextEditor';

function StatRow({ label, value, color = 'var(--color-text)' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.625rem 0', borderBottom: '1px solid var(--color-border)',
    }}>
      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: '0.875rem', color }}>{value}</span>
    </div>
  );
}

function ListBlock({ title, items }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
        {title}
      </div>
      {items.length > 0
        ? items.map((item, i) => (
            <div key={i} className="text-sm" style={{ color: 'var(--color-text-secondary)', padding: '0.2rem 0' }}>
              {item}
            </div>
          ))
        : <div className="text-xs text-muted">None detected</div>
      }
    </div>
  );
}

export default function DocumentAnalysis() {
  const { setAnalysisResult } = useDocument();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('text');
  const [text, setText]           = useState('');
  const [file, setFile]           = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError]         = useState('');
  const [stats, setStats]         = useState(null);
  const [progress, setProgress]   = useState(0);

  const handleAnalyze = async () => {
    if (activeTab === 'text' && !text.trim()) { setError('Please paste some legal text first.'); return; }
    if (activeTab === 'file' && !file)        { setError('Please select a PDF or TXT file first.'); return; }
    setError(''); setAnalyzing(true); setProgress(0);
    try {
      const result = activeTab === 'text'
        ? await analyzeText(text)
        : await uploadDocument(file, (pct) => setProgress(pct));
      setAnalysisResult(result);
      const ents = result.entities || [];
      setStats({
        total:    ents.length,
        courts:   ents.filter(e => e.entity === 'COURT').map(e => e.text),
        judges:   ents.filter(e => e.entity === 'JUDGE').map(e => e.text),
        dates:    ents.filter(e => e.entity === 'DATE').map(e => e.text),
        statutes: ents.filter(e => e.entity === 'STATUTE').map(e => e.text),
        time:     result.processingTime,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="page-content">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Document Analysis</h1>
        <p className="text-sm text-muted mt-1">
          Upload a legal document or paste text to extract named entities using the BERT Legal NER model.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* ── Left Panel: Input ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Document Input</div>
          </div>

          <div className="tabs">
            <button className={`tab ${activeTab === 'file' ? 'active' : ''}`} onClick={() => setActiveTab('file')}>
              <Upload size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
              Upload PDF
            </button>
            <button className={`tab ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>
              <AlignLeft size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
              Paste Text
            </button>
          </div>

          {activeTab === 'file' && (
            <div style={{ marginBottom: '1rem' }}>
              <DocumentUploader onFileSelect={setFile} disabled={analyzing} />
            </div>
          )}
          {activeTab === 'text' && (
            <div style={{ marginBottom: '1rem' }}>
              <TextEditor value={text} onChange={setText} disabled={analyzing} />
            </div>
          )}

          {analyzing && activeTab === 'file' && progress > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-xs text-muted mt-1" style={{ textAlign: 'right' }}>{progress}% uploaded</div>
            </div>
          )}

          <ErrorMessage message={error} type="error" onDismiss={() => setError('')} />
          {error && <div style={{ height: '0.75rem' }} />}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            {stats && (
              <Button variant="outline" onClick={() => navigate('/entities')} iconRight={<ArrowRight size={15} />}>
                View Full Results
              </Button>
            )}
            <Button variant="primary" size="lg" loading={analyzing} onClick={handleAnalyze}>
              {analyzing ? 'Analyzing...' : 'Analyze Document'}
            </Button>
          </div>
        </div>

        {/* ── Right Panel: Stats ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Analysis Status</div>
            {stats && !analyzing && <span className="badge badge-success">Complete</span>}
            {analyzing && <span className="badge badge-warning">Processing...</span>}
            {!stats && !analyzing && <span className="badge badge-neutral">Idle</span>}
          </div>

          {!stats && !analyzing && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-light)' }}>
              <FileText size={36} style={{ marginBottom: '0.75rem', opacity: 0.35 }} />
              <p className="text-sm">Results will appear here after analysis.</p>
            </div>
          )}

          {analyzing && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', gap: '1rem' }}>
              <div className="spinner spinner-lg" />
              <p className="text-sm text-muted">Running BERT Legal NER model...</p>
              <p className="text-xs text-muted">This may take a few seconds.</p>
            </div>
          )}

          {stats && !analyzing && (
            <div>
              <StatRow label="Total Entities"   value={stats.total}  color="var(--color-primary)" />
              <StatRow label="Processing Time"  value={stats.time || '—'} />

              <div className="divider" />
              <ListBlock title="Detected Courts"   items={stats.courts}   />
              <div className="divider" />
              <ListBlock title="Detected Judges"   items={stats.judges}   />
              <div className="divider" />
              <ListBlock title="Detected Dates"    items={stats.dates}    />
              <div className="divider" />
              <ListBlock title="Detected Statutes" items={stats.statutes} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
