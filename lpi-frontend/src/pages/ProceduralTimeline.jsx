import React from 'react';
import { GitBranch, Info } from 'lucide-react';
import Timeline from '../components/timeline/Timeline';
import { useDocument } from '../context/DocumentContext';

export default function ProceduralTimeline() {
  const { analysisResult } = useDocument();

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1>Procedural Timeline</h1>
          <p className="text-sm text-muted mt-1">Visual representation of procedural events extracted from the legal document.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: 'var(--color-warning-bg)', border: '1px solid #FDE68A', borderRadius: 'var(--radius)', fontSize: '0.8125rem', color: 'var(--color-warning)' }}>
          <Info size={14} />
          Model 2 Not Yet Integrated
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Timeline */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GitBranch size={16} color="var(--color-primary)" />
              <div className="card-title">Case Timeline</div>
            </div>
          </div>
          {/* TODO (Model 2): Pass real events prop: <Timeline events={realEvents} /> */}
          <Timeline />
        </div>

        {/* Legend / Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: '0.75rem' }}>Legend</div>
            {[
              { color: 'var(--color-success)', label: 'Completed Event' },
              { color: 'var(--color-text-light)', label: 'Pending Event' },
              { color: 'var(--color-primary)', label: 'Current Stage' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: l.color, border: '2px solid white', boxShadow: `0 0 0 2px ${l.color}` }} />
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{l.label}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: '0.75rem' }}>Integration Note</div>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              This timeline uses mock data. When Model 2 (Procedural Event Extractor) is ready:
            </p>
            <ol style={{ marginTop: '0.75rem', paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
              <li>Add backend endpoint: <code style={{ background: 'var(--color-bg-alt)', padding: '0.1em 0.3em', borderRadius: 2 }}>GET /api/timeline/:documentId</code></li>
              <li>Add <code style={{ background: 'var(--color-bg-alt)', padding: '0.1em 0.3em', borderRadius: 2 }}>getTimeline()</code> to <code style={{ background: 'var(--color-bg-alt)', padding: '0.1em 0.3em', borderRadius: 2 }}>api.js</code></li>
              <li>Pass real events to <code style={{ background: 'var(--color-bg-alt)', padding: '0.1em 0.3em', borderRadius: 2 }}>{'<Timeline events={...} />'}</code></li>
            </ol>
          </div>

          {analysisResult && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: '0.5rem' }}>Current Document</div>
              <div className="text-sm text-muted">
                {analysisResult.entities?.length || 0} entities extracted.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
