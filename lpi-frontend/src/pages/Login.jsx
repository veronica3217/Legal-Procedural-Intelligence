import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Scale size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '0.25rem' }}>
            Legal Procedural Intelligence
          </h1>
          <p className="text-sm text-muted">Sign in to your account</p>
        </div>

        <ErrorMessage message={error} type="error" onDismiss={() => setError('')} />
        {error && <div style={{ height: '0.75rem' }} />}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: '0.625rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--color-text-light)',
                  padding: '0.25rem',
                }}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            icon={<LogIn size={16} />}
            style={{ marginTop: '0.5rem' }}
          >
            Sign In
          </Button>
        </form>

        <div className="divider" />

        <p className="text-sm" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 500 }}>Create account</Link>
        </p>

        {/* Demo hint */}
        <div style={{
          marginTop: '1rem', padding: '0.75rem', background: 'var(--color-bg-alt)',
          borderRadius: 'var(--radius)', border: '1px solid var(--color-border)',
          fontSize: '0.75rem', color: 'var(--color-text-muted)',
        }}>
          <strong>Demo:</strong> Use any email and password to log in (mock auth).
        </div>
      </div>
    </div>
  );
}
