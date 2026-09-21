'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getApplications } from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';
import EmptyState from '../../../components/EmptyState';
import Loading from '../../../components/Loading';
import { SearchIcon } from '../../../components/Icons';

const GRADES = ['ALL', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];
const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'APPLICATION_CREATED', label: 'Application Created' },
  { value: 'REGISTRATION_FEE_PAID', label: 'Fee Paid' },
  { value: 'SLOT_BOOKED', label: 'Slot Booked' },
  { value: 'EXAM_COMPLETED', label: 'Exam Completed' },
  { value: 'ADMISSION_COMPLETED', label: 'Admission Completed' }
];

export default function ApplicationsListPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedGrade, setSelectedGrade] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getApplications();
        setApplications(data || []);
      } catch (err) {
        console.error('Failed to load applications', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = applications.filter((app) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (app.name && app.name.toLowerCase().includes(q)) ||
      (app.parentName && app.parentName.toLowerCase().includes(q)) ||
      (app.parentEmail && app.parentEmail.toLowerCase().includes(q)) ||
      (app.applicationNumber && app.applicationNumber.toLowerCase().includes(q)) ||
      ((app._id || app.id || '').toLowerCase().includes(q));

    const matchesStatus = selectedStatus === 'ALL' || app.status === selectedStatus;
    const matchesGrade = selectedGrade === 'ALL' || app.applyingGrade === selectedGrade;

    return matchesSearch && matchesStatus && matchesGrade;
  });

  const isCompletedTab = selectedStatus === 'ADMISSION_COMPLETED';

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3rem' }}>
      <style>{`
        .app-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.75rem;
        }
        .desktop-app-table {
          display: block;
        }
        .mobile-app-cards {
          display: none;
        }

        /* MOBILE RESPONSIVE ONLY (< 768px) */
        @media (max-width: 768px) {
          .app-list-header {
            flex-direction: column;
            align-items: stretch;
            gap: 0.85rem;
            margin-bottom: 1.25rem;
          }
          .app-list-header h1 {
            font-size: 1.45rem !important;
          }
          .app-list-header p {
            font-size: 0.825rem !important;
          }
          .quick-tab-switcher {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
            width: 100%;
          }
          .quick-tab-switcher .btn {
            justify-content: center;
            font-size: 0.8rem !important;
            padding: 0.55rem 0.65rem !important;
          }
          .filter-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 0.65rem;
            padding: 0.85rem !important;
            overflow: hidden !important;
          }
          .filter-search-box {
            width: 100% !important;
            min-width: 0 !important;
            flex: 1 1 auto !important;
          }
          .filter-select {
            width: 100% !important;
            min-width: 0 !important;
          }

          /* Show mobile touch cards instead of wide table */
          .desktop-app-table {
            display: none !important;
          }
          .mobile-app-cards {
            display: flex !important;
            flex-direction: column;
            gap: 0.75rem;
          }
          .mobile-candidate-card {
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 0.95rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.03);
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .mobile-candidate-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 0.5rem;
          }
          .mobile-candidate-body {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
            padding: 0.6rem 0.75rem;
            background: #F8FAFC;
            border-radius: 8px;
            font-size: 0.775rem;
            border: 1px solid #F1F5F9;
          }
          .mobile-candidate-actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .mobile-candidate-actions .btn {
            flex: 1;
            justify-content: center;
            padding: 0.5rem;
            font-size: 0.8rem;
          }
        }
      `}</style>

      {/* Top Header */}
      <div className="app-list-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 0.35rem 0' }}>
            {isCompletedTab ? 'Completed Admissions' : 'Candidate Applications'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
            {isCompletedTab
              ? 'List of formally enrolled students with assigned grades and entrance test results.'
              : 'Evaluate entrance test marks, coordinate schedules, and assign courses across all admission stages.'}
          </p>
        </div>

        {/* Quick Tab Switcher */}
        <div className="quick-tab-switcher" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${!isCompletedTab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedStatus('ALL')}
          >
            All Applications
          </button>
          <button
            type="button"
            className={`btn btn-sm ${isCompletedTab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedStatus('ADMISSION_COMPLETED')}
          >
            ✓ Completed ({applications.filter(a => a.status === 'ADMISSION_COMPLETED').length})
          </button>
        </div>
      </div>

      {/* Section 7: Compact Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-search-box">
          <SearchIcon size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search candidate name, parent, or application ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((st) => (
            <option key={st.value} value={st.value}>{st.label}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
        >
          {GRADES.map((g) => (
            <option key={g} value={g}>{g === 'ALL' ? 'All Grades' : g}</option>
          ))}
        </select>

        {(search || selectedStatus !== 'ALL' || selectedGrade !== 'ALL') && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearch('');
              setSelectedStatus('ALL');
              setSelectedGrade('ALL');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <Loading type="skeleton-table" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No candidate records found"
          description="Try adjusting your search criteria or resetting active filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedStatus('ALL');
            setSelectedGrade('ALL');
          }}
        />
      ) : (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="desktop-app-table table-container" style={{ overflowX: 'auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
            <table className="data-table" style={{ width: '100%', tableLayout: 'auto' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem 0.7rem', whiteSpace: 'nowrap' }}>Student</th>
                  <th style={{ padding: '0.75rem 0.65rem', whiteSpace: 'nowrap' }}>Parent</th>
                  <th style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>Grade</th>
                  <th style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>Exam Score</th>
                  <th style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>Course</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => {
                  const appId = app._id || app.id;
                  return (
                    <tr key={appId}>
                      <td style={{ padding: '0.75rem 0.7rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            backgroundColor: '#E8F8F5',
                            color: '#0F9D8A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            flexShrink: 0
                          }}>
                            {app.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#172033', fontSize: '0.84rem' }}>
                              {app.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#667085' }}>
                              #{app.applicationNumber || 'APP-2026-001'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.65rem', maxWidth: '160px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#172033', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {app.parentName || 'Parent'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#667085', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                          {app.parentEmail || app.parentPhone || '—'}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 500, color: '#172033', fontSize: '0.8rem' }}>
                          {app.applyingGrade}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>
                        <StatusBadge status={app.status} size="small" />
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: (app.examScore != null || app.marksObtained != null) ? '#172033' : '#94A3B8' }}>
                          {app.examScore != null ? `${app.examScore} / 100` : app.marksObtained != null ? `${app.marksObtained} / 100` : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: app.assignedCourse ? '#0F9D8A' : '#667085' }}>
                          {app.assignedCourse || 'Unassigned'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.75rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {app.status === 'SLOT_BOOKED' && (
                            <Link
                              href="/admission/update-score"
                              className="btn btn-primary btn-sm"
                              style={{ textDecoration: 'none', padding: '0.3rem 0.65rem', fontSize: '0.775rem', whiteSpace: 'nowrap' }}
                            >
                              Update Score
                            </Link>
                          )}

                          {app.status === 'EXAM_COMPLETED' && (
                            <Link
                              href="/admission/assign-course"
                              className="btn btn-primary btn-sm"
                              style={{ textDecoration: 'none', padding: '0.3rem 0.65rem', fontSize: '0.775rem', whiteSpace: 'nowrap' }}
                            >
                              Assign Course
                            </Link>
                          )}

                          <Link
                            href={`/admission/applications/${appId}`}
                            className="btn btn-secondary btn-sm"
                            style={{ textDecoration: 'none', padding: '0.3rem 0.55rem', fontSize: '0.775rem' }}
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS VIEW */}
          <div className="mobile-app-cards">
            {filtered.map((app) => {
              const appId = app._id || app.id;
              return (
                <div key={appId} className="mobile-candidate-card">
                  <div className="mobile-candidate-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#E8F8F5',
                        color: '#0F9D8A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        flexShrink: 0
                      }}>
                        {app.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#172033', fontSize: '0.925rem' }}>
                          {app.name}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#667085', marginTop: '0.1rem' }}>
                          #{app.applicationNumber || 'APP-2026-001'} &bull; <strong style={{ color: '#334155' }}>{app.applyingGrade}</strong>
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={app.status} />
                  </div>

                  <div className="mobile-candidate-body">
                    <div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Parent</div>
                      <div style={{ fontWeight: 600, color: '#172033' }}>{app.parentName || 'Parent'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#667085', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.parentEmail || app.parentPhone || '—'}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Score & Course</div>
                      <div style={{ fontWeight: 700, color: (app.examScore != null || app.marksObtained != null) ? '#172033' : '#94A3B8' }}>
                        {app.examScore != null ? `${app.examScore}/100` : app.marksObtained != null ? `${app.marksObtained}/100` : 'No score'}
                      </div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: app.assignedCourse ? '#0F9D8A' : '#667085' }}>
                        {app.assignedCourse || 'Unassigned'}
                      </div>
                    </div>
                  </div>

                  <div className="mobile-candidate-actions">
                    {app.status === 'SLOT_BOOKED' && (
                      <Link
                        href="/admission/update-score"
                        className="btn btn-primary btn-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        Update Score
                      </Link>
                    )}

                    {app.status === 'EXAM_COMPLETED' && (
                      <Link
                        href="/admission/assign-course"
                        className="btn btn-primary btn-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        Assign Course
                      </Link>
                    )}

                    <Link
                      href={`/admission/applications/${appId}`}
                      className="btn btn-secondary btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
