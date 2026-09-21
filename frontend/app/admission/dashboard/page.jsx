'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getApplications } from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';
import Loading from '../../../components/Loading';
import { ApplicationsIcon, CalendarIcon, CheckIcon, ArrowRightIcon, ClockIcon } from '../../../components/Icons';

export default function AdmissionDashboardPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getApplications();
        setApplications(data || []);
      } catch (err) {
        console.error('Failed to load admission dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <Loading type="dashboard-skeleton" />;
  }

  const totalApplications = applications.length;
  const pendingReview = applications.filter((a) => a.status === 'REGISTRATION_FEE_PAID' || a.status === 'EXAM_COMPLETED').length;
  const upcomingExams = applications.filter((a) => a.status === 'SLOT_BOOKED').length;
  const completedAdmissions = applications.filter((a) => a.status === 'ADMISSION_COMPLETED').length;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3rem' }}>
      <style>{`
        .adm-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .adm-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .adm-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .adm-metric-card {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          padding: 1.25rem 1.35rem;
          box-shadow: 0 1px 3px rgba(16, 24, 40, 0.04);
        }
        .desktop-queue-table {
          display: block;
        }
        .mobile-queue-cards {
          display: none;
        }

        /* MOBILE RESPONSIVE ONLY (< 768px) */
        @media (max-width: 768px) {
          .adm-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
            margin-bottom: 1.25rem;
          }
          .adm-title {
            font-size: 1.45rem !important;
          }
          .adm-subtitle {
            font-size: 0.825rem !important;
          }
          .adm-header-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
          }
          .adm-header-actions .btn-view-all {
            grid-column: span 2;
            justify-content: center;
          }
          .adm-header-actions .btn {
            justify-content: center;
            padding: 0.6rem 0.75rem;
            font-size: 0.825rem;
          }
          .adm-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.65rem;
            margin-bottom: 1.25rem;
          }
          .adm-metric-card {
            padding: 0.85rem 0.95rem;
          }
          .adm-metric-value {
            font-size: 1.45rem !important;
          }
          .adm-metric-subtext {
            font-size: 0.7rem !important;
          }

          /* Switch from Wide Table to Native Cards on Mobile */
          .desktop-queue-table {
            display: none !important;
          }
          .mobile-queue-cards {
            display: flex !important;
            flex-direction: column;
            gap: 0.75rem;
          }
          .mobile-app-card {
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 0.95rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.03);
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .mobile-app-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 0.5rem;
          }
          .mobile-app-body {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
            padding: 0.6rem 0.75rem;
            background: #F8FAFC;
            border-radius: 8px;
            font-size: 0.775rem;
            border: 1px solid #F1F5F9;
          }
          .mobile-app-actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .mobile-app-actions .btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>

      {/* Header */}
      <div className="adm-header">
        <div>
          <h1 className="adm-title" style={{ fontSize: '2rem', fontWeight: 700, color: '#172033', letterSpacing: '-0.025em', margin: '0 0 0.35rem 0' }}>
            Admission Office Dashboard
          </h1>
          <p className="adm-subtitle" style={{ fontSize: '0.875rem', color: '#667085', margin: 0 }}>
            Manage candidate evaluations, monitor entrance exam schedules, and complete student grade enrollments.
          </p>
        </div>

        <div className="adm-header-actions">
          <Link href="/admission/update-score" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <span>Update Scores</span>
          </Link>
          <Link href="/admission/assign-course" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <span>Assign Course</span>
          </Link>
          <Link href="/admission/applications" className="btn btn-primary btn-view-all" style={{ textDecoration: 'none' }}>
            <span>View All Applications</span>
            <ArrowRightIcon size={15} />
          </Link>
        </div>
      </div>

      {/* Section 15: Metric Cards */}
      <div className="adm-metrics-grid">
        {/* Card 1: Total Applications */}
        <div className="adm-metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>
              Total Applications
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#E8F8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F9D8A' }}>
              <ApplicationsIcon size={15} />
            </div>
          </div>
          <div className="adm-metric-value" style={{ fontSize: '1.85rem', fontWeight: 700, color: '#172033', lineHeight: 1.15 }}>
            {totalApplications.toString().padStart(2, '0')}
          </div>
          <div className="adm-metric-subtext" style={{ fontSize: '0.775rem', color: '#667085', marginTop: '0.35rem' }}>
            All active candidates
          </div>
        </div>

        {/* Card 2: Pending Review */}
        <div className="adm-metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>
              Pending Review
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#FEF0C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F79009' }}>
              <ClockIcon size={15} color="#F79009" />
            </div>
          </div>
          <div className="adm-metric-value" style={{ fontSize: '1.85rem', fontWeight: 700, color: '#172033', lineHeight: 1.15 }}>
            {pendingReview.toString().padStart(2, '0')}
          </div>
          <div className="adm-metric-subtext" style={{ fontSize: '0.775rem', color: '#F79009', fontWeight: 600, marginTop: '0.35rem' }}>
            Awaiting admission action
          </div>
        </div>

        {/* Card 3: Upcoming Exams */}
        <div className="adm-metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>
              Upcoming Exams
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EFF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#175CD3' }}>
              <CalendarIcon size={15} color="#175CD3" />
            </div>
          </div>
          <div className="adm-metric-value" style={{ fontSize: '1.85rem', fontWeight: 700, color: '#172033', lineHeight: 1.15 }}>
            {upcomingExams.toString().padStart(2, '0')}
          </div>
          <div className="adm-metric-subtext" style={{ fontSize: '0.775rem', color: '#175CD3', fontWeight: 600, marginTop: '0.35rem' }}>
            Booked candidate slots
          </div>
        </div>

        {/* Card 4: Completed Admissions */}
        <div className="adm-metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>
              Completed Admissions
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#E8F8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F9D8A' }}>
              <CheckIcon size={15} />
            </div>
          </div>
          <div className="adm-metric-value" style={{ fontSize: '1.85rem', fontWeight: 700, color: '#172033', lineHeight: 1.15 }}>
            {completedAdmissions.toString().padStart(2, '0')}
          </div>
          <div className="adm-metric-subtext" style={{ fontSize: '0.775rem', color: '#0F9D8A', fontWeight: 600, marginTop: '0.35rem' }}>
            Formally enrolled students
          </div>
        </div>
      </div>

      {/* Section 15: Application Table */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#172033', margin: 0 }}>
              Candidate Application Queue
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#667085', margin: '0.15rem 0 0 0' }}>
              Review student progress, update scores, and assign courses
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F9D8A', backgroundColor: '#E8F8F5', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
            {applications.length} Records
          </span>
        </div>

        {/* DESKTOP QUEUE TABLE */}
        <div className="desktop-queue-table table-container" style={{ overflowX: 'auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
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
              {applications.slice(0, 10).map((app) => (
                <tr key={app._id || app.id}>
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
                      {app.parentEmail || app.parentPhone || ''}
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
                          href={`/admission/update-score`}
                          className="btn btn-primary btn-sm"
                          style={{ textDecoration: 'none', padding: '0.3rem 0.65rem', fontSize: '0.775rem', whiteSpace: 'nowrap' }}
                        >
                          Update Score
                        </Link>
                      )}

                      {app.status === 'EXAM_COMPLETED' && (
                        <Link
                          href={`/admission/assign-course`}
                          className="btn btn-primary btn-sm"
                          style={{ textDecoration: 'none', padding: '0.3rem 0.65rem', fontSize: '0.775rem', whiteSpace: 'nowrap' }}
                        >
                          Assign Course
                        </Link>
                      )}

                      <Link
                        href={`/admission/applications/${app._id || app.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ textDecoration: 'none', padding: '0.3rem 0.55rem', fontSize: '0.775rem' }}
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE QUEUE CARDS */}
        <div className="mobile-queue-cards">
          {applications.slice(0, 10).map((app) => (
            <div key={app._id || app.id} className="mobile-app-card">
              <div className="mobile-app-header">
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
                    <div style={{ fontWeight: 700, color: '#172033', fontSize: '0.9rem' }}>
                      {app.name}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#667085', marginTop: '0.1rem' }}>
                      #{app.applicationNumber || 'APP-2026-001'} &bull; <strong style={{ color: '#334155' }}>{app.applyingGrade}</strong>
                    </div>
                  </div>
                </div>

                <StatusBadge status={app.status} />
              </div>

              <div className="mobile-app-body">
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Parent</div>
                  <div style={{ fontWeight: 600, color: '#172033' }}>{app.parentName || 'Parent'}</div>
                  <div style={{ fontSize: '0.7rem', color: '#667085', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.parentEmail || app.parentPhone || ''}</div>
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

              <div className="mobile-app-actions">
                {app.status === 'SLOT_BOOKED' && (
                  <Link
                    href={`/admission/update-score`}
                    className="btn btn-primary btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    Update Score
                  </Link>
                )}

                {app.status === 'EXAM_COMPLETED' && (
                  <Link
                    href={`/admission/assign-course`}
                    className="btn btn-primary btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    Assign Course
                  </Link>
                )}

                <Link
                  href={`/admission/applications/${app._id || app.id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

