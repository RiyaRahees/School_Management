'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { EduFlowLogo } from '../../components/Icons';
import '../auth.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password, role });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
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
            <span>EduFlow Admission Platform</span>
          </div>

          <h1 className="auth-brand-heading">
            A <span>brighter future</span><br />for every student.
          </h1>

          <p className="auth-brand-subtext">
            Track applications, manage admission steps, book examinations, and complete registrations from one secure platform.
          </p>

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">✓</div>
              <span>Real-time Application Stage Monitoring</span>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">✓</div>
              <span>Instant Entrance Examination Slot Booking</span>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">✓</div>
              <span>Automated Academic Evaluation & Course Assignment</span>
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
                <div className="journey-node-dot active">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="journey-node-label active">Apply</span>
              </div>

              <div className="journey-step-col">
                <div className="journey-node-dot current">2</div>
                <span className="journey-node-label current">Payment</span>
              </div>

              <div className="journey-step-col">
                <div className="journey-node-dot">3</div>
                <span className="journey-node-label">Exam</span>
              </div>

              <div className="journey-step-col">
                <div className="journey-node-dot">4</div>
                <span className="journey-node-label">Enrolled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          © 2026 EduFlow. School Admission Platform.
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form */}
      <div className="auth-form-panel">
        {/* Mobile Top Header & Title (Visible on Mobile) */}
        <div className="mobile-top-section">
          <EduFlowLogo size={42} showText={true} />
          <div className="mobile-brand-pill">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0F9D8A', display: 'inline-block' }} />
            <span>Admission Portal 2026-2027</span>
          </div>
          <h1 className="mobile-hero-title">
            Welcome to <span>EduFlow</span>
          </h1>
          <p className="mobile-hero-subtitle">
            Sign in to track applications, entrance exams & school enrollment.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Secure Access</span>
            </div>
            <h2 className="auth-title">
              Welcome back
            </h2>
            <p className="auth-subtitle">
              Choose your portal and sign in to continue.
            </p>
          </div>

          {error && (
            <div className="auth-error-alert" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Portal Selector Segmented Control */}
          <div className="portal-switcher" role="tablist" aria-label="Portal Selection">
            <button
              type="button"
              role="tab"
              aria-selected={role === 'parent'}
              className={`portal-tab ${role === 'parent' ? 'active' : ''}`}
              onClick={() => setRole('parent')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Parent Portal</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={role === 'admission_team'}
              className={`portal-tab ${role === 'admission_team' ? 'active' : ''}`}
              onClick={() => setRole('admission_team')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Admission Team</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-form-group">
              <label className="auth-form-label" htmlFor="email">
                Email address
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
                  type="email"
                  className="auth-form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>
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
                  type={showPassword ? 'text' : 'password'}
                  className="auth-form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
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
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="auth-spinner" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <svg className="auth-submit-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-switch-footer">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="auth-switch-link">
              Create parent account &rarr;
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
