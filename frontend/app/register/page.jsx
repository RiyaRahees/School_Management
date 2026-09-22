'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { EduFlowLogo } from '../../components/Icons';
import '../auth.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!trimmedName) {
      errs.name = 'Full name is required.';
    } else if (trimmedName.length < 2) {
      errs.name = 'Full name must be at least 2 characters.';
    }

    if (!trimmedEmail) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
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
    if (name === 'password' && errors.confirmPassword && formData.confirmPassword) {
      if (value === formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: 'parent'
      });
    } catch (err) {
      setServerError(err.message || 'Unable to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* LEFT SIDE: Brand Experience (Desktop Only) */}
      <div className="auth-brand-panel">
        <div className="auth-brand-header">
          <EduFlowLogo size={36} />
        </div>

        <div className="auth-brand-content">
          <div className="auth-brand-pill">
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#0F9D8A', display: 'inline-block' }} />
            <span>Parent Community</span>
          </div>

          <h1 className="auth-brand-heading">
            Join the <span>EduFlow</span><br />Admission Portal
          </h1>

          <p className="auth-brand-subtext">
            Create an account to submit your child&apos;s application, schedule an entrance exam, and monitor stage-by-stage admission progress.
          </p>

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">✓</div>
              <span>Fast 3-minute student enrollment registration</span>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">✓</div>
              <span>Instant slot selection for assessment tests</span>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">✓</div>
              <span>Live notification on evaluation results</span>
            </div>
          </div>

          {/* Admission Journey Stepper */}
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

        <div className="auth-brand-footer">
          © 2026 EduFlow. School Admission Platform.
        </div>
      </div>

      {/* RIGHT SIDE: Registration Form */}
      <div className="auth-form-panel">
        {/* Mobile Top Header & Title (Visible on Mobile) */}
        <div className="mobile-top-section">
          <EduFlowLogo size={42} showText={true} />
          <div className="mobile-brand-pill">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0F9D8A', display: 'inline-block' }} />
            <span>Admission Portal 2026-2027</span>
          </div>
          <h1 className="mobile-hero-title">
            Join <span>EduFlow</span>
          </h1>
          <p className="mobile-hero-subtitle">
            Create a parent account to submit & track student applications.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              <span>Get Started</span>
            </div>
            <h2 className="auth-title">
              Create Parent Account
            </h2>
            <p className="auth-subtitle">
              Enter your details to begin your child&apos;s admission.
            </p>
          </div>

          {serverError && (
            <div className="auth-error-alert" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-form-group">
              <label className="auth-form-label" htmlFor="name">
                Full Name
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`auth-form-input ${errors.name ? 'has-error' : ''}`}
                  placeholder="e.g. Riya Rahees"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="name"
                  required
                />
              </div>
              {errors.name && <div className="auth-field-error">{errors.name}</div>}
            </div>

            <div className="auth-form-group">
              <label className="auth-form-label" htmlFor="email">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`auth-form-input ${errors.email ? 'has-error' : ''}`}
                  placeholder="parent@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>
              {errors.email && <div className="auth-field-error">{errors.email}</div>}
            </div>

            <div className="auth-form-group">
              <label className="auth-form-label" htmlFor="password">
                Password
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`auth-form-input ${errors.password ? 'has-error' : ''}`}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                  style={{ paddingRight: '40px' }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8 -4 8 -11 8 -11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <div className="auth-field-error">{errors.password}</div>}
            </div>

            <div className="auth-form-group">
              <label className="auth-form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`auth-form-input ${errors.confirmPassword ? 'has-error' : ''}`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                  style={{ paddingRight: '40px' }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8 -4 8 -11 8 -11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <div className="auth-field-error">{errors.confirmPassword}</div>}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="auth-spinner" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Parent Account</span>
                  <svg className="auth-submit-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-switch-footer">
            Already have an account?{' '}
            <Link href="/login" className="auth-switch-link">
              Sign In &rarr;
            </Link>
          </div>
        </div>

        {/* Mobile Page Footer */}
        <div className="mobile-page-footer">
          <div className="mobile-secure-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>256-Bit SSL Secure Admission Portal</span>
          </div>
          <div>© 2026 EduFlow Platform. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
}
