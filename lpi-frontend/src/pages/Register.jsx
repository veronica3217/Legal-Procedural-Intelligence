import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields.'); return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    setError(''); setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
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
            Create Your Account
          </h1>
          <p className="text-sm text-muted">Legal Procedural Intelligence</p>
        </div>

        <ErrorMessage message={error} type="error" onDismiss={() => setError('')} />
        {error && <div style={{ height: '0.75rem' }} />}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" type="text" className="form-input" placeholder="Your name" value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" type="password" className="form-input" placeholder="At least 6 characters" value={form.password} onChange={set('password')} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <input id="reg-confirm" type="password" className="form-input" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
          </div>
          <Button type="submit" variant="primary" fullWidth loading={loading} icon={<UserPlus size={16} />} style={{ marginTop: '0.5rem' }}>
            Create Account
          </Button>
        </form>

        <div className="divider" />
        <p className="text-sm" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
