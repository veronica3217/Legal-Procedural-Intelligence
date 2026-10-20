import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PAGE_TITLES = {
  '/dashboard':  'Dashboard',
  '/documents':  'Document Analysis',
  '/analysis':   'Document Analysis',
  '/entities':   'Entity Results',
  '/timeline':   'Procedural Timeline',
  '/legal-qa':   'Legal QA',
  '/history':    'Document History',
  '/profile':    'Profile',
};

export default function Navbar({ onMenuClick }) {
  const location  = useLocation();
  const { user }  = useAuth();
  const title = PAGE_TITLES[location.pathname] || 'Legal Procedural Intelligence';

  return (
    <header className="navbar">
      <button
        onClick={onMenuClick}
        className="btn btn-ghost btn-sm"
        style={{ marginRight: '0.75rem', padding: '0.375rem' }}
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-accent)', lineHeight: 1 }}>
          {title}
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
          Legal Procedural Intelligence System
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="btn btn-ghost btn-sm" style={{ padding: '0.375rem', position: 'relative' }} aria-label="Notifications">
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: 2, right: 2, width: 7, height: 7,
            borderRadius: '50%', background: 'var(--color-error)',
            border: '1.5px solid var(--color-surface)',
          }} />
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--color-primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8125rem', fontWeight: 600, color: '#fff',
            }}>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ display: 'none' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{user.name}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
