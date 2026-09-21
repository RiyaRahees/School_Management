'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  EduFlowLogo,
  DashboardIcon,
  StudentsIcon,
  ApplicationsIcon,
  CalendarIcon,
  ClockIcon,
  CreditCardIcon,
  LogoutIcon,
  CheckIcon,
  AcademicCapIcon
} from './Icons';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdmission = user?.role === 'admission_team';

  const parentLinks = [
    { label: 'Dashboard', href: '/parent/dashboard', icon: <DashboardIcon size={18} /> },
    { label: 'Student Applications', href: '/parent/students', icon: <StudentsIcon size={18} /> },
    { label: 'Payments', href: '/parent/payments', icon: <CreditCardIcon size={18} /> },
    { label: 'Exam Slots', href: '/parent/exam-slots', icon: <CalendarIcon size={18} /> },
    { label: 'Admission Completed', href: '/parent/admission-completed', icon: <AcademicCapIcon size={18} /> }
  ];

  const admissionLinks = [
    { label: 'Dashboard', href: '/admission/dashboard', icon: <DashboardIcon size={18} /> },
    { label: 'Student Applications', href: '/admission/applications', icon: <ApplicationsIcon size={18} /> },
    { label: 'Exam Slots', href: '/admission/exam-slots', icon: <CalendarIcon size={18} /> },
    { label: 'Update Score', href: '/admission/update-score', icon: <ClockIcon size={18} /> },
    { label: 'Assign Course', href: '/admission/assign-course', icon: <CheckIcon size={18} /> },
    { label: 'Admission Completed', href: '/admission/admission-completed', icon: <AcademicCapIcon size={18} /> }
  ];

  const links = isAdmission ? admissionLinks : parentLinks;

  return (
    <>
      <style>{`
        .sidebar {
          width: 240px;
          background: #FFFFFF;
          color: #667085;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: 100vh;
          height: 100dvh;
          max-height: 100dvh;
          position: sticky;
          top: 0;
          bottom: 0;
          z-index: 40;
          border-right: 1px solid #E5E7EB;
          overflow: hidden;
          user-select: none;
        }

        .sidebar-brand {
          height: 64px;
          padding: 0 1.25rem;
          border-bottom: 1px solid #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .sidebar-close-btn {
          display: none;
          background: #F1F5F9;
          border: none;
          border-radius: 6px;
          padding: 6px;
          color: #64748B;
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }

        .nav-group {
          padding: 1.15rem 0.75rem;
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          min-height: 0;
        }

        .nav-label {
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
          color: #94A3B8;
          padding: 0 0.65rem 0.6rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.55rem 0.75rem;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 500;
          color: #475569;
          margin-bottom: 0.25rem;
          transition: all 0.15s ease;
          position: relative;
          text-decoration: none;
        }

        .nav-link:hover {
          background-color: #F8FAFC;
          color: #172033;
        }

        .nav-link.active {
          background-color: #E8F8F5;
          color: #0F9D8A;
          font-weight: 600;
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          bottom: 6px;
          width: 3px;
          background-color: #0F9D8A;
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
        }

        .nav-link .link-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: inherit;
        }

        .sidebar-footer {
          padding: 0.85rem;
          border-top: 1px solid #F1F5F9;
          background: #FFFFFF;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .user-panel {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.5rem 0.65rem;
          border-radius: 9px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
        }

        .user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #E8F8F5;
          color: #0F9D8A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.825rem;
          border: 1px solid #CCFBF1;
          flex-shrink: 0;
        }

        .signout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          width: 100%;
          height: 40px;
          border-radius: 8px;
          background-color: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
          font-size: 0.825rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .signout-btn:hover {
          background-color: #FEE2E2;
          color: #B91C1C;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: min(285px, 85vw);
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            height: 100% !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            transform: translateX(-100%);
            box-shadow: 0 20px 30px rgba(0, 0, 0, 0.2);
            transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 50;
            overflow: hidden !important;
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .sidebar-brand {
            padding-top: max(0.65rem, env(safe-area-inset-top));
            height: auto;
            min-height: 58px;
            padding-left: 1rem;
            padding-right: 1rem;
            flex-shrink: 0;
          }
          .sidebar-close-btn {
            display: inline-flex !important;
          }
          .nav-group {
            flex: 1 1 auto !important;
            overflow-y: auto !important;
            padding: 0.75rem 0.65rem !important;
            min-height: 0;
          }
          .sidebar-footer {
            flex-shrink: 0 !important;
            position: sticky !important;
            bottom: 0 !important;
            background: #FFFFFF !important;
            padding: 0.75rem 0.85rem !important;
            padding-bottom: max(0.85rem, env(safe-area-inset-bottom)) !important;
            border-top: 1px solid #F1F5F9 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 0.45rem !important;
          }
          .user-panel {
            padding: 0.45rem 0.6rem !important;
          }
          .signout-btn {
            height: 40px !important;
            font-size: 0.84rem !important;
          }
          .sidebar-backdrop {
            display: none;
          }
          .sidebar-backdrop.open {
            display: block !important;
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.5);
            backdrop-filter: blur(3px);
            z-index: 45;
          }
        }
      `}</style>

      {/* Mobile Backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header with Close Button */}
        <div className="sidebar-brand">
          <Link href={isAdmission ? '/admission/dashboard' : '/parent/dashboard'} style={{ textDecoration: 'none' }}>
            <EduFlowLogo size={30} />
          </Link>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation Group */}
        <div className="nav-group">
          <div className="nav-label">
            {isAdmission ? 'Operations' : 'Main Menu'}
          </div>

          <nav style={{ flex: 1 }}>
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/parent/dashboard' && link.href !== '/admission/dashboard' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="link-icon">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer: User profile & Sign Out pinned to bottom without scrolling */}
        <div className="sidebar-footer">
          <div className="user-panel">
            <div className="user-avatar">
              {(user?.name || 'User').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'capitalize' }}>
                {user?.role === 'admission_team' ? 'Admission Team' : 'Parent'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="signout-btn"
          >
            <LogoutIcon size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
