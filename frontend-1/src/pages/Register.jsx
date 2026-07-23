import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  validateUsername,
  validatePassword,
  validateName,
  validateEmail,
  validatePhone
} from '../utils/validators';
import './Auth.css';

const initialForm = { name: '', username: '', email: '', phone: '', password: '', confirmPassword: '' };

export default function Register() {
  const { register, authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: '' }));
  }

  function validate() {
    const next = {
      name: validateName(form.name),
      username: validateUsername(form.username),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      password: validatePassword(form.password),
      confirmPassword: form.confirmPassword !== form.password ? 'Passwords do not match.' : ''
    };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    try {
      await register({
        name: form.name,
        username: form.username,
        email: form.email,
        phone: form.phone,
        password: form.password
      });
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      setSubmitError(err.friendlyMessage || 'Registration failed. Please try again.');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <div className="auth-logo">
            <span className="navbar-logo-mark">N</span>
            <span>Nimbus Bank</span>
          </div>
          <h1>Open an account in minutes, not days.</h1>
          <p>Join thousands of customers who manage their money smarter with Nimbus Bank.</p>
        </div>
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-form-side">
        <div className="auth-card auth-card-wide slide-up">
          <h2>Create your account</h2>
          <p className="auth-subtitle">It takes less than two minutes.</p>

          {submitError && <div className="auth-alert">{submitError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={errors.name ? 'has-error' : ''}
                  placeholder="Jane Doe"
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>

              <div className="field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className={errors.username ? 'has-error' : ''}
                  placeholder="jane.doe"
                />
                {errors.username && <p className="field-error">{errors.username}</p>}
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={errors.email ? 'has-error' : ''}
                  placeholder="jane@email.com"
                />
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>

              <div className="field">
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'has-error' : ''}
                  placeholder="9876543210"
                />
                {errors.phone && <p className="field-error">{errors.phone}</p>}
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? 'has-error' : ''}
                  placeholder="••••••••"
                />
                {errors.password && <p className="field-error">{errors.password}</p>}
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'has-error' : ''}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={authLoading}>
              {authLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
