'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SearchIcon } from './Icons';

export default function Header({ onToggleSidebar }) {
  const { user } = useAuth();

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      <style>{`
        .header-mobile-toggle {
          display: none;
        }
        .header-search {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 0.45rem 0.85rem;
          width: 380px;
          max-width: 100%;
          height: 38px;
          transition: all 0.15s ease;
        }
        .header-search:focus-within {
          border-color: #0D9488;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
        }
        .header-search input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.84rem;
          font-weight: 500;
          width: 100%;
          color: #0F172A;
        }
        .header-search input::placeholder {
          color: #64748B;
        }
        .header-user-btn {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: transparent;
          border: none;
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .header-user-btn:hover {
          background: #F9FAFB;
        }
        @media (max-width: 768px) {
          .header-mobile-toggle {
            display: inline-flex !important;
          }
          .header-search {
            display: none;
          }
          header {
            padding: 0 1rem !important;
            height: 56px !important;
          }
        }
      `}</style>

      {/* Left Area: Mobile Toggle & Global Application Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, maxWidth: '480px' }}>
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="header-mobile-toggle btn btn-secondary btn-sm"
          style={{ padding: '0.35rem 0.55rem' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="header-search">
          <SearchIcon size={16} color="#64748B" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search applications, students, or anything..."
            aria-label="Search applications, students, or anything..."
          />
        </div>
      </div>

      {/* Right Area: User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* User Profile Info */}
        <div className="header-user-btn">
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#E8F8F5',
            color: '#0F9D8A',
            border: '1px solid #CCFBF1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.8125rem',
            flexShrink: 0
          }}>
            {(user?.name || 'User').charAt(0).toUpperCase()}
          </div>

          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#172033', lineHeight: 1.25 }}>
              {user?.name || 'User'}
            </span>
            <span style={{
              fontSize: '0.6875rem',
              color: '#667085',
              fontWeight: 500,
              textTransform: 'capitalize'
            }}>
              {user?.role === 'admission_team' ? 'Admission Team' : 'Parent'}
            </span>
          </div>

          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.15rem' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </header>
  );
}
