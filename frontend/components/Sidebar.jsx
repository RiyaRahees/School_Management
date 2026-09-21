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
  CheckIcon
} from './Icons';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdmission = user?.role === 'admission_team';

  const parentLinks = [
    { label: 'Dashboard', href: '/parent/dashboard', icon: <DashboardIcon size={18} /> },
    { label: 'Student Applications', href: '/parent/students', icon: <StudentsIcon size={18} /> },
    { label: 'Payments', href: '/parent/payments', icon: <CreditCardIcon size={18} /> },
    { label: 'Exam Slots', href: '/parent/exam-slots', icon: <CalendarIcon size={18} /> }
  ];

  const admissionLinks = [
    { label: 'Dashboard', href: '/admission/dashboard', icon: <DashboardIcon size={18} /> },
    { label: 'Student Applications', href: '/admission/applications', icon: <ApplicationsIcon size={18} /> },
    { label: 'Exam Slots', href: '/admission/exam-slots', icon: <CalendarIcon size={18} /> },
    { label: 'Update Score', href: '/admission/update-score', icon: <ClockIcon size={18} /> },
    { label: 'Assign Course', href: '/admission/assign-course', icon: <CheckIcon size={18} /> }
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
          max-height: 100vh;
          position: sticky;
          top: 0;
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
          flex-shrink: 0;
        }

        .nav-group {
          padding: 1.15rem 0.75rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
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
          background-color: #E8F8F5; /* Soft Mint / Teal */
          color: #0F9D8A; /* Primary Teal */
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
          padding: 0.45rem 0.6rem;
          border-radius: 8px;
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #E8F8F5;
          color: #0F9D8A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
          border: 1px solid #CCFBF1;
          flex-shrink: 0;
        }

        .signout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          width: 100%;
          height: 32px;
          border-radius: 8px;
          background-color: #FFFFFF;
          border: 1px solid #E5E7EB;
          color: #667085;
          font-size: 0.775rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .signout-btn:hover {
          background-color: #FEF3F2;
          border-color: #FECDCA;
          color: #F04438;
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .sidebar-backdrop.open {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(2px);
            z-index: 35;
          }
        }
      `}</style>

      {/* Mobile Backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        style={{ display: isOpen ? 'block' : 'none' }}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <Link href={isAdmission ? '/admission/dashboard' : '/parent/dashboard'} style={{ textDecoration: 'none' }}>
            <EduFlowLogo size={32} />
          </Link>
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

        {/* Footer: User profile & Sign Out always anchored in single window */}
        <div className="sidebar-footer">
          <div className="user-panel">
            <div className="user-avatar">
              {(user?.name || 'User').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#172033', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '0.675rem', color: '#667085', textTransform: 'capitalize' }}>
                {user?.role === 'admission_team' ? 'Admission Team' : 'Parent'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="signout-btn"
          >
            <LogoutIcon size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
