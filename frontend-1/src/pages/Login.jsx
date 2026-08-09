import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateUsername, validatePassword } from '../utils/validators';
import './Auth.css';

export default function Login() {
  const { login, authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: '' }));
  }

  function validate() {
    const next = {
      username: validateUsername(form.username),
      password: validatePassword(form.password)
    };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    try {
      await login(form.username, form.password);
      toast.success('Welcome back! Login successful.');
      const dest = location.state?.from?.pathname || '/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      setSubmitError(err.friendlyMessage || 'Invalid username or password.');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <div className="auth-logo">
            <span className="navbar-logo-mark">N</span>
            <span>Integrated Bank</span>
          </div>
          <h1>Banking that moves at the speed of your life.</h1>
          <p>Manage accounts, send transfers, and track every transaction — all in one secure place.</p>
          <div className="auth-visual-stats">
           
            <div>
              <p className="mono">99.98%</p>
              <span>Uptime</span>
            </div>
            <div>
              <p className="mono">256-bit</p>
              <span>Encryption</span>
            </div>
          </div>
        </div>
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-form-side">
        <div className="auth-card slide-up">
          <h2>Log in</h2>
          <p className="auth-subtitle">Enter your credentials to access your account.</p>

          {submitError && <div className="auth-alert">{submitError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                className={errors.username ? 'has-error' : ''}
                placeholder="demo"
              />
              {errors.username && <p className="field-error">{errors.username}</p>}
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? 'has-error' : ''}
                placeholder="demo"
              />
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={authLoading}>
              {authLoading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
