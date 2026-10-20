import React from 'react';
import { MOCK_TIMELINE } from '../../services/mockData';
import { CheckCircle, Circle, Clock, FileText, Bell, Scale, BookOpen } from 'lucide-react';

const IconMap = {
  FileText, Bell, Scale, Clock, BookOpen,
  Gavel: Scale,
};

function ConfidenceBadge({ value }) {
  if (value === null || value === undefined) return <span className="badge badge-neutral">Awaited</span>;
  const pct = Math.round(value * 100);
  const cls = pct >= 90 ? 'badge-success' : pct >= 75 ? 'badge-warning' : 'badge-neutral';
  return <span className={`badge ${cls}`}>{pct}% confidence</span>;
}

/**
 * Timeline component.
 * -----------------------------------------------------------------
 * TODO (Model 2 integration): Pass real `events` prop from backend.
 * Expected shape: Array of { id, event, label, date, description,
 *   sourceSentence, confidence, status, icon }
 * -----------------------------------------------------------------
 */
export default function Timeline({ events }) {
  const items = events || MOCK_TIMELINE;

  return (
    <div>
      {/* Mock data notice */}
      {!events && (
        <div className="alert alert-info mb-4" style={{ marginBottom: '1.25rem' }}>
          <Clock size={15} />
          <span style={{ fontSize: '0.8125rem' }}>
            <strong>Mock Data:</strong> This timeline is generated from sample data.
            Connect Model 2 (Procedural Event Extractor) to generate real timelines.
          </span>
        </div>
      )}

      <div className="timeline">
        {items.map((item, idx) => {
          const Icon = IconMap[item.icon] || Circle;
          const isLast = idx === items.length - 1;

          return (
            <div key={item.id} className="timeline-item">
              <div className={`timeline-dot ${item.status === 'completed' ? 'completed' : item.status === 'pending' ? 'pending' : ''}`} />

              <div className="timeline-content">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: item.status === 'completed' ? 'var(--color-success-bg)' : 'var(--color-bg-alt)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={14} color={item.status === 'completed' ? 'var(--color-success)' : 'var(--color-text-muted)'} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-accent)' }}>{item.event}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.label}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <ConfidenceBadge value={item.confidence} />
                    <span className={`badge ${item.status === 'completed' ? 'badge-success' : 'badge-neutral'}`}>
                      {item.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', fontWeight: 500, marginBottom: '0.5rem' }}>
                  📅 {item.date}
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: item.sourceSentence ? '0.625rem' : 0 }}>
                  {item.description}
                </p>

                {/* Source sentence */}
                {item.sourceSentence && (
                  <div style={{
                    background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                    borderLeft: '3px solid var(--color-primary)', borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem 0.75rem', fontSize: '0.8125rem',
                    color: 'var(--color-text-muted)', fontStyle: 'italic',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    "{item.sourceSentence}"
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
