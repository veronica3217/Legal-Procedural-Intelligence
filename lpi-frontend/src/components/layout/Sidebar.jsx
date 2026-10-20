import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Microscope, GitBranch,
  MessageSquare, History, User, LogOut, Scale, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/documents',  label: 'Documents',   icon: FileText },
  { to: '/analysis',   label: 'Analysis',    icon: Microscope },
  { to: '/timeline',   label: 'Timeline',    icon: GitBranch },
  { to: '/legal-qa',   label: 'Legal QA',    icon: MessageSquare },
  { to: '/history',    label: 'History',     icon: History },
  { to: '/profile',    label: 'Profile',     icon: User },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 99, display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{
          padding: '1.25rem 1.25rem 1rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 34, height: 34, background: 'rgba(255,255,255,0.15)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Scale size={18} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.2 }}>LEGAL</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Procedural Intelligence</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer', padding: '0.25rem', display: 'none',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, paddingTop: '0.75rem', overflowY: 'auto' }}>
          <div style={{ padding: '0 0.75rem 0.375rem', fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.5rem' }}>
            Menu
          </div>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0.75rem' }}>
          {user && (
            <div style={{ padding: '0.5rem 0.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8125rem', fontWeight: 600, color: '#fff', flexShrink: 0,
              }}>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: '#fff', fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
              </div>
            </div>
          )}
          <button className="sidebar-nav-item" onClick={handleLogout} style={{ color: 'rgba(255,100,100,0.8)' }}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
