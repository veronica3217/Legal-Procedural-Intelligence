import React, { useEffect, useState } from 'react';
import { History, Eye, FileText, File } from 'lucide-react';
import { getDocuments } from '../services/api';
import Button from '../components/ui/Button';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';

function StatusBadge({ status }) {
  if (status === 'completed') return <span className="badge badge-success">Completed</span>;
  if (status === 'processing') return <span className="badge badge-warning">Processing</span>;
  return <span className="badge badge-neutral">{status}</span>;
}

export default function DocumentHistory() {
  const [docs, setDocs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getDocuments()
      .then(setDocs)
      .catch(() => setError('Failed to load document history.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading document history..." />;

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1>Document History</h1>
          <p className="text-sm text-muted mt-1">Previously analyzed legal documents.</p>
        </div>
        <span className="badge badge-neutral">{docs.length} documents</span>
      </div>

      <ErrorMessage message={error} type="error" onDismiss={() => setError('')} />

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Date Analyzed</th>
                <th>Entities</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                    <History size={32} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                    <div>No documents analyzed yet.</div>
                  </td>
                </tr>
              ) : (
                docs.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ color: 'var(--color-text-muted)' }}>
                          {doc.type === 'pdf' ? <FileText size={16} /> : <File size={16} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.875rem' }}>{doc.name}</div>
                          <div className="text-xs text-muted">{doc.type?.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                      {new Date(doc.dateAnalyzed).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{doc.entityCount}</span>
                      <span className="text-xs text-muted"> entities</span>
                    </td>
                    <td><StatusBadge status={doc.status} /></td>
                    <td>
                      <Button variant="ghost" size="sm" icon={<Eye size={14} />} onClick={() => {}}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
