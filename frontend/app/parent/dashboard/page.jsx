'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { getStudents } from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';
import Loading from '../../../components/Loading';
import EmptyState from '../../../components/EmptyState';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ArrowRightIcon,
  CheckIcon,
  StudentsIcon,
  ApplicationsIcon,
  PlusIcon
} from '../../../components/Icons';

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const data = await getStudents();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load parent dashboard data', err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return <Loading type="dashboard-skeleton" />;
  }

  // Calculate statistics purely from real dynamic data
  const totalAppsCount = students.length;
  const pendingActionsCount = students.filter(
    s => s.status === 'APPLICATION_CREATED' || s.status === 'REGISTRATION_FEE_PAID'
  ).length;
  const completedAdmissionsCount = students.filter(
    s => s.status === 'ADMISSION_COMPLETED'
  ).length;
  
  // Real booked students
  const bookedStudents = students.filter(
    s => (s.status === 'SLOT_BOOKED' || s.status === 'EXAM_COMPLETED') && s.examSlot
  );
  const bookedStudent = bookedStudents.find(s => s.status === 'SLOT_BOOKED') || null;

  // Primary student for centerpiece (only from real data)
  const primaryStudent = students.length > 0
    ? (students.find(s => s.status === 'SLOT_BOOKED' || s.status === 'REGISTRATION_FEE_PAID' || s.status === 'APPLICATION_CREATED') || students[0])
    : null;

  const stages = [
    { key: 'APPLICATION_CREATED', label: 'Application Created' },
    { key: 'REGISTRATION_FEE_PAID', label: 'Fee Paid' },
    { key: 'SLOT_BOOKED', label: 'Slot Booked' },
    { key: 'EXAM_COMPLETED', label: 'Exam Completed' },
    { key: 'ADMISSION_COMPLETED', label: 'Admitted' }
  ];

  const getStageStatus = (studentStatus, stageKey) => {
    const order = [
      'APPLICATION_CREATED',
      'REGISTRATION_FEE_PAID',
      'SLOT_BOOKED',
      'EXAM_COMPLETED',
      'ADMISSION_COMPLETED'
    ];
    const currentIndex = order.indexOf(studentStatus);
    const targetIndex = order.indexOf(stageKey);

    if (currentIndex > targetIndex) return 'completed';
    if (currentIndex === targetIndex) return 'current';
    return 'upcoming';
  };

  const getNextAction = (student) => {
    if (!student) return null;
    switch (student.status) {
      case 'APPLICATION_CREATED':
        return {
          title: 'Pay Registration Fee',
          description: `A one-time registration fee of ₹${student.feeAmount || 1000} is required to unlock exam booking.`,
          buttonText: `Pay ₹${student.feeAmount || 1000} Fee`,
          href: '/parent/payments',
          tag: 'Action Required'
        };
      case 'REGISTRATION_FEE_PAID':
        return {
          title: 'Book Entrance Exam Slot',
          description: 'Registration fee confirmed. Please choose an on-campus entrance assessment slot.',
          buttonText: 'Select Exam Slot',
          href: `/parent/students/${student._id}`,
          tag: 'Priority Action'
        };
      case 'SLOT_BOOKED':
        return {
          title: 'Prepare for Entrance Exam',
          description: `Exam booked for ${student.examSlot?.date || 'Scheduled Date'} at ${student.examSlot?.time || 'Scheduled Time'}. Please bring candidate ID.`,
          buttonText: 'View Exam Details',
          href: `/parent/students/${student._id}`,
          tag: 'Upcoming Session'
        };
      case 'EXAM_COMPLETED':
        return {
          title: 'Awaiting Admission Evaluation',
          description: student.examScore !== null
            ? `Exam evaluated with score ${student.examScore}/100. Admission Committee is reviewing final placement.`
            : 'Entrance test evaluated. Awaiting final grade course assignment.',
          buttonText: 'View Application',
          href: `/parent/students/${student._id}`,
          tag: 'Under Review'
        };
      case 'ADMISSION_COMPLETED':
        return {
          title: 'Admission Finalized',
          description: `Formally admitted into ${student.assignedCourse || student.applyingGrade}. Welcome to EduFlow!`,
          buttonText: 'View Enrollment Details',
          href: `/parent/students/${student._id}`,
          tag: 'Completed'
        };
      default:
        return {
          title: 'View Details',
          description: 'Check candidate application profile.',
          buttonText: 'View Application',
          href: `/parent/students/${student._id}`,
          tag: 'In Progress'
        };
    }
  };

  const nextAction = primaryStudent ? getNextAction(primaryStudent) : null;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3rem' }}>
      <style>{`
        /* Page Header Layout */
        .page-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;
          margin-bottom: 1.75rem;
        }

        .dashboard-page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #172033;
          letter-spacing: -0.025em;
          line-height: 1.2;
          margin: 0;
        }

        .dashboard-page-desc {
          font-size: 0.875rem;
          color: #667085;
          margin: 0.35rem 0 0 0;
          line-height: 1.5;
        }

        /* Section 12: Summary Cards Grid */
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .stat-card-refined {
          padding: 1.25rem 1.35rem;
          border-radius: 10px;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          box-shadow: 0 1px 3px rgba(16, 24, 40, 0.04);
          display: flex;
          flex-direction: column;
        }

        /* 2-Column Section */
        .dashboard-grid-two {
          display: grid;
          grid-template-columns: 1.3fr 0.95fr;
          gap: 1.5rem;
          align-items: stretch;
          margin-bottom: 2rem;
        }

        /* Stepper Styling */
        .stepper-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          padding: 0.5rem 0;
        }

        .stepper-line {
          position: absolute;
          top: 19px;
          left: 15px;
          right: 15px;
          height: 2px;
          background-color: #E2E8F0;
          z-index: 1;
        }

        .stepper-node {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
        }

        .stepper-circle {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .stepper-circle.completed {
          background-color: #0F9D8A;
          color: #FFFFFF;
          border: 2px solid #0F9D8A;
        }

        .stepper-circle.current {
          background-color: #FFFFFF;
          color: #0F9D8A;
          border: 2px solid #0F9D8A;
          box-shadow: 0 0 0 3px rgba(15, 157, 138, 0.15);
        }

        .stepper-circle.upcoming {
          background-color: #FFFFFF;
          color: #94A3B8;
          border: 2px solid #CBD5E1;
        }

        .stepper-label {
          font-size: 0.7rem;
          font-weight: 600;
          text-align: center;
          white-space: nowrap;
        }

        .desktop-recent-table {
          display: block;
        }
        .mobile-recent-cards {
          display: none;
        }

        @media (max-width: 1024px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-grid-two {
            grid-template-columns: 1fr;
          }
        }

        /* MOBILE RESPONSIVE ONLY (< 768px) */
        @media (max-width: 768px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
          }
          .stat-card-refined {
            padding: 0.95rem !important;
          }
          .stat-card-refined div:nth-child(2) {
            font-size: 1.45rem !important;
          }
          .dashboard-page-title {
            font-size: 1.45rem !important;
          }
          /* Mobile Stepper Adjustments */
          .stepper-label {
            display: none !important;
          }
          .mobile-stepper-stage-info {
            display: flex !important;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            margin-top: 0.65rem;
            font-size: 0.775rem;
            font-weight: 600;
            color: #0F9D8A;
            background: #E8F8F5;
            padding: 0.35rem 0.75rem;
            border-radius: 6px;
            text-align: center;
          }
          .dashboard-next-action-box {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.85rem !important;
            padding: 1rem !important;
          }
          .dashboard-next-action-box .btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 0.65rem 1rem !important;
            font-size: 0.875rem !important;
          }

          /* Hide desktop table on mobile */
          .desktop-recent-table {
            display: none !important;
          }
          /* Show mobile touch cards */
          .mobile-recent-cards {
            display: flex !important;
            flex-direction: column;
            gap: 0.75rem;
          }
          .mobile-recent-card {
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 0.95rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.03);
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .mobile-recent-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 0.5rem;
          }
          .mobile-recent-body {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
            padding: 0.6rem 0.75rem;
            background: #F8FAFC;
            border-radius: 8px;
            border: 1px solid #F1F5F9;
            font-size: 0.775rem;
          }
          .mobile-recent-actions .btn {
            width: 100%;
            justify-content: center;
            padding: 0.5rem;
            font-size: 0.8rem;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="dashboard-page-title">
            Admission Dashboard
          </h1>
          <p className="dashboard-page-desc">
            Track student applications, manage entrance exams, and complete enrollment milestones.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/parent/students/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <PlusIcon size={15} />
            <span>New Student</span>
          </Link>
        </div>
      </div>

      {/* Section 12: Top Summary (4 Small Clean Statistic Cards) */}
      <div className="summary-grid">
        {/* Card 1: Total Applications */}
        <div className="stat-card-refined">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>
              Total Applications
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#E8F8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F9D8A' }}>
              <ApplicationsIcon size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#172033', lineHeight: 1.15 }}>
            {totalAppsCount.toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.775rem', color: '#667085', marginTop: '0.35rem' }}>
            {totalAppsCount === 0 ? 'No applications created' : 'Across all admission applications'}
          </div>
        </div>

        {/* Card 2: Pending Actions */}
        <div className="stat-card-refined">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>
              Pending Actions
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#FEF0C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F79009' }}>
              <ClockIcon size={15} color="#F79009" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#172033', lineHeight: 1.15 }}>
            {pendingActionsCount.toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.775rem', color: pendingActionsCount > 0 ? '#F79009' : '#667085', fontWeight: 500, marginTop: '0.35rem' }}>
            {pendingActionsCount === 0 ? 'No actions required' : 'Awaiting parent response'}
          </div>
        </div>

        {/* Card 3: Upcoming Exam */}
        <div className="stat-card-refined">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>
              Upcoming Exam
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EFF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#175CD3' }}>
              <CalendarIcon size={15} color="#175CD3" />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#172033', lineHeight: 1.25 }}>
            {bookedStudent ? (bookedStudent.examSlot?.date || 'Booked') : 'None'}
          </div>
          <div style={{ fontSize: '0.775rem', color: '#667085', marginTop: '0.35rem' }}>
            {bookedStudent ? (bookedStudent.examSlot?.time || '10:00 AM') : 'No active bookings'}
          </div>
        </div>

        {/* Card 4: Completed Admissions */}
        <div className="stat-card-refined">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>
              Completed Admissions
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#E8F8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F9D8A' }}>
              <CheckIcon size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#172033', lineHeight: 1.15 }}>
            {completedAdmissionsCount.toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.775rem', color: completedAdmissionsCount > 0 ? '#0F9D8A' : '#667085', fontWeight: 500, marginTop: '0.35rem' }}>
            {completedAdmissionsCount === 0 ? 'No completed enrollments' : 'Formally enrolled students'}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Current Application & Next Action + Upcoming Exam & Recent Activity */}
      <div className="dashboard-grid-two">
        {/* Left Column: CURRENT APPLICATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {primaryStudent ? (
            <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CURRENT APPLICATION
                </div>
                <StatusBadge status={primaryStudent.status} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    backgroundColor: '#E8F8F5',
                    color: '#0F9D8A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.15rem',
                    fontWeight: 700
                  }}>
                    {primaryStudent.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#172033' }}>
                      {primaryStudent.name}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#667085', marginTop: '0.15rem' }}>
                      {primaryStudent.applyingGrade} · App #{primaryStudent.applicationNumber}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/parent/students/${primaryStudent._id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  View Profile
                </Link>
              </div>

              {/* Admission Progress Stepper */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                  Admission Progress
                </div>
                <div className="stepper-container">
                  <div className="stepper-line" />
                  {stages.map((st, idx) => {
                    const statusType = getStageStatus(primaryStudent.status, st.key);
                    return (
                      <div key={st.key} className="stepper-node">
                        <div className={`stepper-circle ${statusType}`}>
                          {statusType === 'completed' ? (
                            <CheckIcon size={12} />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <span className="stepper-label" style={{
                          color: statusType === 'completed' ? '#0F9D8A' : statusType === 'current' ? '#0F9D8A' : '#94A3B8'
                        }}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Active Stage Indicator */}
                <div className="mobile-stepper-stage-info" style={{ display: 'none' }}>
                  <span>● Stage {stages.findIndex(s => s.key === primaryStudent.status) + 1} of 5:</span>
                  <strong>{stages.find(s => s.key === primaryStudent.status)?.label || 'Application Created'}</strong>
                </div>
              </div>

              {/* Next Action Box */}
              {nextAction && (
                <div
                  className="dashboard-next-action-box"
                  style={{
                    marginTop: '1.5rem',
                    padding: '1.15rem 1.25rem',
                    borderRadius: '8px',
                    backgroundColor: '#F7F9FA',
                    border: '1px solid #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0F9D8A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Next Action
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#667085' }}>•</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#172033' }}>
                        {nextAction.title}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#667085', marginTop: '0.2rem', maxWidth: '420px' }}>
                      {nextAction.description}
                    </div>
                  </div>

                  <Link
                    href={nextAction.href}
                    className="btn btn-primary btn-sm"
                    style={{ textDecoration: 'none', padding: '0.45rem 1rem', whiteSpace: 'nowrap' }}
                  >
                    <span>{nextAction.buttonText}</span>
                    <ArrowRightIcon size={14} />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Section 9: Empty State when no student applications exist */
            <div className="card" style={{ padding: '2.5rem 1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: '#E8F8F5',
                color: '#0F9D8A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <StudentsIcon size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#172033', margin: '0 0 0.5rem 0' }}>
                No Student Applications Yet
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#667085', maxWidth: '440px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                You haven't submitted any student admission applications yet. Start an application to track enrollment milestones, exam booking, and admission status.
              </p>
              <Link href="/parent/students/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                <PlusIcon size={15} />
                <span>+ Create First Application</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: UPCOMING EXAM & RECENT ACTIVITY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section: UPCOMING EXAM */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.65rem', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                UPCOMING EXAM
              </div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: bookedStudent ? '#0F9D8A' : '#667085',
                backgroundColor: bookedStudent ? '#E8F8F5' : '#F7F9FA',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px'
              }}>
                {bookedStudent ? 'Confirmed' : 'None'}
              </span>
            </div>

            {bookedStudent ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                  <CalendarIcon size={16} color="#0F9D8A" />
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#172033' }}>
                    {bookedStudent.examSlot?.date}
                  </span>
                  <span style={{ color: '#667085', fontSize: '0.875rem' }}>•</span>
                  <ClockIcon size={15} color="#667085" />
                  <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>
                    {bookedStudent.examSlot?.time}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8125rem', color: '#667085', backgroundColor: '#F7F9FA', padding: '0.85rem', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                  <div><strong>Student:</strong> {bookedStudent.name} ({bookedStudent.applyingGrade})</div>
                  <div><strong>Location:</strong> {bookedStudent.examSlot?.location || 'Main Campus'}</div>
                  <div style={{ color: '#0F9D8A', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.2rem' }}>
                    ✓ Exam seat booked. Please arrive 15 minutes before start time.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.25rem 0', color: '#667085' }}>
                <CalendarIcon size={24} color="#94A3B8" />
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#172033', marginTop: '0.5rem' }}>
                  No Upcoming Exams Scheduled
                </div>
                <p style={{ fontSize: '0.775rem', color: '#667085', margin: '0.2rem 0 0 0' }}>
                  Entrance exam booking will unlock after registration fee payment.
                </p>
              </div>
            )}
          </div>

          {/* Section: RECENT ACTIVITY */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', paddingBottom: '0.65rem', borderBottom: '1px solid #F1F5F9' }}>
              RECENT ACTIVITY
            </div>

            {primaryStudent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0F9D8A', marginTop: '6px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#172033' }}>
                      Application created
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#667085' }}>
                      {primaryStudent.name} ({primaryStudent.applyingGrade}) record submitted
                    </div>
                  </div>
                </div>

                {primaryStudent.feePaid && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0F9D8A', marginTop: '6px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#172033' }}>
                        Registration fee paid
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#667085' }}>
                        ₹{primaryStudent.feeAmount || 1000} fee verified & confirmed
                      </div>
                    </div>
                  </div>
                )}

                {primaryStudent.examSlot && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0F9D8A', marginTop: '6px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#172033' }}>
                        Exam slot booked
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#667085' }}>
                        {primaryStudent.examSlot?.date} session confirmed
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0', color: '#94A3B8' }}>
                <div style={{ fontSize: '0.8125rem', color: '#667085' }}>
                  No recent activity yet.
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                  Milestones will record here automatically as you progress.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECENT APPLICATIONS TABLE */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#172033', margin: 0 }}>
              Recent Applications
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#667085', margin: '0.15rem 0 0 0' }}>
              Summary of your student applications
            </p>
          </div>

          {students.length > 0 && (
            <Link href="/parent/students" style={{ fontSize: '0.8125rem', color: '#0F9D8A', fontWeight: 600, textDecoration: 'none' }}>
              View All ({students.length}) →
            </Link>
          )}
        </div>

        {students.length > 0 ? (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="desktop-recent-table table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Exam Slot</th>
                    <th>Last Updated</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 6).map((std) => (
                    <tr key={std._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            backgroundColor: '#E8F8F5',
                            color: '#0F9D8A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            flexShrink: 0
                          }}>
                            {std.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#172033', fontSize: '0.875rem' }}>
                              {std.name}
                            </div>
                            <div style={{ fontSize: '0.725rem', color: '#667085' }}>
                              #{std.applicationNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, color: '#172033', fontSize: '0.8125rem' }}>
                          {std.applyingGrade}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={std.status} />
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: std.examSlot?.date ? '#172033' : '#667085', fontWeight: 500 }}>
                          {std.examSlot?.date ? `${std.examSlot.date} · ${std.examSlot.time || ''}` : 'Not Booked'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: '#667085' }}>
                          {new Date(std.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          href={`/parent/students/${std._id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ textDecoration: 'none' }}
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS VIEW */}
            <div className="mobile-recent-cards">
              {students.slice(0, 6).map((std) => (
                <div key={std._id} className="mobile-recent-card">
                  <div className="mobile-recent-header">
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
                        {std.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#172033', fontSize: '0.925rem' }}>
                          {std.name}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '0.1rem' }}>
                          #{std.applicationNumber} &bull; <strong style={{ color: '#0D9488' }}>{std.applyingGrade}</strong>
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={std.status} />
                  </div>

                  <div className="mobile-recent-body">
                    <div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Exam Slot</div>
                      <div style={{ fontWeight: 600, color: std.examSlot?.date ? '#172033' : '#94A3B8' }}>
                        {std.examSlot?.date ? `${std.examSlot.date}` : 'Not Booked'}
                      </div>
                      {std.examSlot?.time && (
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{std.examSlot.time}</div>
                      )}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Last Update</div>
                      <div style={{ fontWeight: 600, color: '#475569' }}>
                        {new Date(std.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div className="mobile-recent-actions">
                    <Link
                      href={`/parent/students/${std._id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="card" style={{ padding: '2rem 1.5rem', textAlign: 'center', color: '#667085' }}>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>
              No applications submitted yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
