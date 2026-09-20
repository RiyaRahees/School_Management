'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          style={{
            display: 'none',
            fontSize: '1.25rem',
            padding: '0.25rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--bg-main)',
            color: 'var(--text-primary)'
          }}
          className="mobile-nav-toggle"
        >
          ☰
        </button>

        <Link href={user?.role === 'admission_team' ? '/admission/dashboard' : '/parent/dashboard'} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            fontWeight: 700
          }}>
            🎓
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              St. Mary's Academy
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Admission Management Portal
            </div>
          </div>
        </Link>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-nav-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user.name || user.email}
            </span>
            <span style={{
              fontSize: '0.725rem',
              color: user.role === 'admission_team' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {user.role === 'admission_team' ? 'Admission Team' : 'Parent Account'}
            </span>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Log out of your account"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span>Log out</span>
            <span style={{ fontSize: '0.9rem' }}>↪</span>
          </button>
        </div>
      )}
    </header>
  );
}
