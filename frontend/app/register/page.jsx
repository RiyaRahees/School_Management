'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { EduFlowLogo } from '../../components/Icons';

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'parent'
      });
    } catch (err) {
      setServerError(err.message || 'Unable to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-root">
      <style>{`
        .register-root {
          min-height: 100vh;
          display: flex;
          background-color: #FFFFFF;
          color: #0F172A;
          font-family: inherit;
        }

        /* Left Side: Brand Experience */
        .register-brand-panel {
          flex: 1.05;
          background-color: #F8FAFC;
          border-right: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3.5rem 4rem;
          position: relative;
        }

        .brand-header {
          display: flex;
          align-items: center;
        }

        .brand-content {
          max-width: 440px;
          margin: 2.5rem 0;
        }

        .brand-heading {
          font-size: 2.25rem;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.025em;
          line-height: 1.2;
          margin: 0 0 1rem 0;
        }

        .brand-subtext {
          font-size: 0.95rem;
          color: #64748B;
          line-height: 1.6;
          margin: 0 0 2.25rem 0;
        }

        /* Admission Journey Visualization Card */
        .journey-visual-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 1.35rem 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .journey-visual-title {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94A3B8;
          margin-bottom: 1.25rem;
        }

        .journey-stepper-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          position: relative;
          width: 100%;
        }

        .journey-stepper-track-line {
          position: absolute;
          top: 13px;
          left: 12.5%;
          right: 12.5%;
          height: 2px;
          background: #E2E8F0;
          z-index: 1;
        }

        .journey-step-col {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .journey-node-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 2px solid #CBD5E1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748B;
          margin-bottom: 0.45rem;
          box-sizing: border-box;
          line-height: 1;
          user-select: none;
        }

        .journey-node-dot.active {
          background: #0D9488;
          border-color: #0D9488;
          color: #FFFFFF;
        }

        .journey-node-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748B;
          white-space: nowrap;
        }

        .journey-node-label.active {
          color: #0F172A;
          font-weight: 600;
        }

        .brand-footer {
          font-size: 0.8125rem;
          color: #94A3B8;
        }

        /* Right Side: Registration Panel */
        .register-form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justifyContent: center;
          padding: 3rem 2rem;
          background-color: #FFFFFF;
        }

        .register-form-container {
          width: 100%;
          max-width: 420px;
        }

        .register-header {
          margin-bottom: 1.75rem;
        }

        .register-title {
          font-size: 2rem;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.025em;
          margin: 0 0 0.35rem 0;
          line-height: 1.2;
        }

        .register-subtitle {
          font-size: 0.925rem;
          color: #64748B;
          margin: 0;
        }

        /* Form Controls */
        .form-group {
          margin-bottom: 1.15rem;
        }

        .form-label {
          display: block;
          font-size: 0.84rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.4rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .form-input {
          width: 100%;
          height: 48px;
          padding: 0 0.95rem;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          font-size: 0.9rem;
          color: #0F172A;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .form-input::placeholder {
          color: #94A3B8;
        }

        .form-input:focus {
          border-color: #0D9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
        }

        .form-input.has-error {
          border-color: #EF4444;
        }

        .field-error {
          color: #DC2626;
          font-size: 0.775rem;
          margin-top: 0.3rem;
          font-weight: 500;
        }

        .password-toggle-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #64748B;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: color 0.15s ease;
        }

        .password-toggle-btn:hover {
          color: #0F172A;
        }

        /* Server Error Alert */
        .error-alert {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background-color: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
          font-size: 0.84rem;
          font-weight: 500;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Primary Submit Button */
        .submit-btn {
          width: 100%;
          height: 48px;
          background-color: #0D9488;
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: background-color 0.15s ease, transform 0.05s ease, box-shadow 0.15s ease;
          box-shadow: 0 1px 2px rgba(13, 148, 136, 0.2);
          margin-top: 0.75rem;
        }

        .submit-btn:hover:not(:disabled) {
          background-color: #0F766E;
        }

        .submit-btn:active:not(:disabled) {
          transform: scale(0.99);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Footer Link */
        .login-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.875rem;
          color: #64748B;
        }

        .login-link {
          color: #0D9488;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .login-link:hover {
          color: #0F766E;
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 960px) {
          .register-brand-panel {
            display: none;
          }

          .register-form-panel {
            padding: 3rem 1.5rem;
          }

          .mobile-brand-header {
            display: block !important;
            margin-bottom: 2rem;
          }
        }

        @media (min-width: 961px) {
          .mobile-brand-header {
            display: none !important;
          }
        }
      `}</style>

      {/* LEFT SIDE: Brand Experience */}
      <div className="register-brand-panel">
        <div className="brand-header">
          <EduFlowLogo size={36} />
        </div>

        <div className="brand-content">
          <h1 className="brand-heading">
            Join the EduFlow<br />Parent Community
          </h1>

          <p className="brand-subtext">
            Create an account to submit your child&apos;s application, schedule an entrance exam, and monitor stage-by-stage admission progress.
          </p>

          {/* Admission Journey Grid Visualization */}
          <div className="journey-visual-card">
            <div className="journey-visual-title">
              ADMISSION JOURNEY
            </div>
            <div className="journey-stepper-grid">
              <div className="journey-stepper-track-line" />

              <div className="journey-step-col">
                <div className="journey-node-dot active">1</div>
                <span className="journey-node-label active">Register</span>
              </div>

              <div className="journey-step-col">
                <div className="journey-node-dot">2</div>
                <span className="journey-node-label">Apply</span>
              </div>

              <div className="journey-step-col">
                <div className="journey-node-dot">3</div>
                <span className="journey-node-label">Exam</span>
              </div>

              <div className="journey-step-col">
                <div className="journey-node-dot">4</div>
                <span className="journey-node-label">Admitted</span>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          © 2026 EduFlow. School Admission Platform.
        </div>
      </div>

      {/* RIGHT SIDE: Registration Form */}
      <div className="register-form-panel">
        <div className="register-form-container">
          {/* Mobile Only Logo */}
          <div className="mobile-brand-header">
            <EduFlowLogo size={34} />
          </div>

          <div className="register-header">
            <h2 className="register-title">
              Create Parent Account
            </h2>
            <p className="register-subtitle">
              Register to start your admission journey.
            </p>
          </div>

          {serverError && (
            <div className="error-alert" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'has-error' : ''}`}
                placeholder="e.g. Riya Rahees"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                autoComplete="name"
                required
              />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'has-error' : ''}`}
                placeholder="parent@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
                required
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'has-error' : ''}`}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                  style={{ paddingRight: '44px' }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={`form-input ${errors.confirmPassword ? 'has-error' : ''}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
                required
              />
              {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <div className="login-footer">
            Already have an account?{' '}
            <Link href="/login" className="login-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
