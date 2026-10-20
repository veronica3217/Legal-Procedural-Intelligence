import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, FileText, BarChart2, RefreshCw } from 'lucide-react';
import { useDocument } from '../context/DocumentContext';
import { MOCK_ANALYSIS_RESULT } from '../services/mockData';
import { groupEntitiesByType, getEntityConfig } from '../utils/entityColors';
import EntityBadge from '../components/ui/EntityBadge';
import EntityTable from '../components/document/EntityTable';
import DocumentViewer from '../components/document/DocumentViewer';
import Button from '../components/ui/Button';

export default function EntityResults() {
  const { analysisResult } = useDocument();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('table'); // 'table' | 'document'

  // Fall back to mock data if no analysis has been run yet
  const result   = analysisResult || MOCK_ANALYSIS_RESULT;
  const entities = result.entities || [];
  const grouped  = groupEntitiesByType(entities);

  return (
    <div className="page-content">
      {/* Page header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap',
      }}>
        <div>
          <h1>Entity Results</h1>
          <p className="text-sm text-muted mt-1">
            {entities.length} entities extracted from the analyzed document.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <Button variant="outline" size="sm" onClick={() => navigate('/analysis')} icon={<RefreshCw size={14} />}>
            New Analysis
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/timeline')} icon={<BarChart2 size={14} />}>
            View Timeline
          </Button>
        </div>
      </div>

      {/* Mock data notice */}
      {!analysisResult && (
        <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
          <Tag size={15} />
          <span className="text-sm">
            Showing <strong>sample data</strong>. Run an analysis from the Dashboard or Document Analysis page to see real results.
          </span>
        </div>
      )}

      {/* Entity type summary cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        {Object.entries(grouped).map(([type, ents]) => (
          <div key={type} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '0.375rem' }}>
              <EntityBadge type={type} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)', lineHeight: 1 }}>
              {ents.length}
            </div>
            <div className="text-xs text-muted mt-1">
              {ents.length === 1 ? 'entity' : 'entities'}
            </div>
          </div>
        ))}
      </div>

      {/* Main entity viewer */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Extracted Entities</div>
          <div className="tabs" style={{ marginBottom: 0, border: 'none' }}>
            <button
              className={`tab ${activeView === 'table' ? 'active' : ''}`}
              onClick={() => setActiveView('table')}
            >
              <Tag size={13} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
              Table View
            </button>
            <button
              className={`tab ${activeView === 'document' ? 'active' : ''}`}
              onClick={() => setActiveView('document')}
            >
              <FileText size={13} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
              Document View
            </button>
          </div>
        </div>

        {activeView === 'table' && (
          <EntityTable entities={entities} />
        )}

        {activeView === 'document' && (
          <div>
            <p className="text-sm text-muted mb-3" style={{ marginBottom: '1rem' }}>
              Highlighted text shows detected entities. Click badge types above the text to show/hide specific categories.
            </p>
            <DocumentViewer text={result.text} entities={entities} />
          </div>
        )}
      </div>
    </div>
  );
}
