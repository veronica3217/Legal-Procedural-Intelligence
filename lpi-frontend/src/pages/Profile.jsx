import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, Calendar, FileText, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/api';
import LoadingState from '../components/ui/LoadingState';

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 0', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>{icon}</div>
      <div>
        <div className="text-xs text-muted">{label}</div>
        <div style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.875rem' }}>{value}</div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => setProfile({ ...user, role: 'Self-represented Litigant', joinedAt: '2024-01-01', documentsAnalyzed: 0 }))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingState message="Loading profile..." />;

  const p = profile || user || {};

  return (
    <div className="page-content">
      <h1 style={{ marginBottom: '1.5rem' }}>Profile</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Avatar card */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem', fontWeight: 700, color: '#fff' }}>
            {p.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-accent)', marginBottom: '0.25rem' }}>{p.name}</div>
          <div className="text-sm text-muted" style={{ marginBottom: '1rem' }}>{p.role || 'User'}</div>
          <div className="badge badge-success" style={{ fontSize: '0.75rem' }}>Active Account</div>

          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-primary)' }}>{p.documentsAnalyzed ?? 0}</div>
              <div className="text-xs text-muted">Documents</div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Account Information</div>
          </div>
          <InfoRow icon={<User size={16} />}     label="Full Name"    value={p.name || '—'} />
          <InfoRow icon={<Mail size={16} />}     label="Email"        value={p.email || '—'} />
          <InfoRow icon={<Shield size={16} />}   label="Role"         value={p.role || 'User'} />
          <InfoRow icon={<Calendar size={16} />} label="Member Since" value={p.joinedAt ? new Date(p.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'} />
          <InfoRow icon={<FileText size={16} />} label="Documents Analyzed" value={p.documentsAnalyzed ?? 0} />

          <div className="divider" />
          <div className="card-header" style={{ padding: 0, marginBottom: '0.75rem', border: 'none' }}>
            <div className="card-title">API Configuration</div>
          </div>
          <div style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0.875rem 1rem', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="text-muted">Backend URL</span>
              <code style={{ color: 'var(--color-text-secondary)' }}>{import.meta.env.VITE_API_URL || 'Not configured'}</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Mock Fallback</span>
              <span className={`badge ${import.meta.env.VITE_USE_MOCK_FALLBACK === 'true' ? 'badge-warning' : 'badge-success'}`}>
                {import.meta.env.VITE_USE_MOCK_FALLBACK === 'true' ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
