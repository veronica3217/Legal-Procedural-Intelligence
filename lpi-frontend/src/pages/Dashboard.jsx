import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Tag, GitBranch, MessageSquare, Upload, AlignLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDocument } from '../context/DocumentContext';
import { getDashboardStats, analyzeText, uploadDocument } from '../services/api';
import DashboardCard from '../components/ui/DashboardCard';
import Button from '../components/ui/Button';
import DocumentUploader from '../components/document/DocumentUploader';
import TextEditor from '../components/document/TextEditor';
import ErrorMessage from '../components/ui/ErrorMessage';

const STAT_CARDS = [
  { key: 'documentsAnalyzed', label: 'Documents Analyzed', icon: <FileText size={20} />, iconBg: '#EFF6FF', iconColor: '#2563EB' },
  { key: 'entitiesExtracted',  label: 'Entities Extracted',  icon: <Tag size={20} />,      iconBg: '#F0FDF4', iconColor: '#059669' },
  { key: 'proceduralEvents',   label: 'Procedural Events',   icon: <GitBranch size={20} />, iconBg: '#FFF7ED', iconColor: '#D97706' },
  { key: 'questionsAsked',     label: 'Questions Asked',     icon: <MessageSquare size={20} />, iconBg: '#F5F3FF', iconColor: '#7C3AED' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { setAnalysisResult, setIsAnalyzing } = useDocument();
  const navigate = useNavigate();

  const [stats, setStats]           = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab]   = useState('text'); // 'text' | 'file'
  const [text, setText]             = useState('');
  const [file, setFile]             = useState(null);
  const [analyzing, setAnalyzing]   = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const handleAnalyze = async () => {
    if (activeTab === 'text' && !text.trim()) { setError('Please paste some legal text first.'); return; }
    if (activeTab === 'file' && !file)        { setError('Please select a PDF or TXT file first.'); return; }
    setError('');
    setAnalyzing(true);
    setIsAnalyzing(true);
    try {
      const result = activeTab === 'text'
        ? await analyzeText(text)
        : await uploadDocument(file);
      setAnalysisResult(result);
      navigate('/entities');
    } catch (err) {
      setError(err?.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
      setIsAnalyzing(false);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '0.25rem' }}>
          {greeting}, {user?.name?.split(' ')[0] || 'Counselor'}
        </h1>
        <p className="text-sm text-muted">Here's your Legal Procedural Intelligence dashboard.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {STAT_CARDS.map(card => (
          <DashboardCard
            key={card.key}
            label={card.label}
            value={statsLoading ? '—' : (stats?.[card.key] ?? 0)}
            icon={card.icon}
            iconBg={card.iconBg}
            iconColor={card.iconColor}
          />
        ))}
      </div>

      {/* Analyze Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Analyze a Legal Document</div>
            <div className="text-xs text-muted mt-1">Upload a PDF or paste legal text to extract entities using the BERT Legal NER model.</div>
          </div>
        </div>

        {/* Input Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            <Upload size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
            Upload PDF
          </button>
          <button
            className={`tab ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            <AlignLeft size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
            Paste Legal Text
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

        <ErrorMessage message={error} type="error" onDismiss={() => setError('')} />
        {error && <div style={{ height: '0.75rem' }} />}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="primary"
            size="lg"
            loading={analyzing}
            onClick={handleAnalyze}
            iconRight={!analyzing ? <ArrowRight size={16} /> : null}
          >
            {analyzing ? 'Analyzing...' : 'Analyze Document'}
          </Button>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        {[
          { label: 'View Entity Results', sub: 'Last analysis results', to: '/entities', color: '#2563EB' },
          { label: 'Procedural Timeline', sub: 'Case event timeline',   to: '/timeline', color: '#D97706' },
          { label: 'Legal QA',            sub: 'Ask about your case',   to: '/legal-qa', color: '#059669' },
          { label: 'Document History',    sub: 'Previously analyzed',   to: '/history',  color: '#7C3AED' },
        ].map(item => (
          <button
            key={item.to}
            onClick={() => navigate(item.to)}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.125rem 1.25rem',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'box-shadow 0.15s, border-color 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = item.color; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: item.color, marginBottom: '0.25rem' }}>{item.label}</div>
            <div className="text-xs text-muted">{item.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
