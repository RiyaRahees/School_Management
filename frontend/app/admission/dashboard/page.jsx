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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#172033', letterSpacing: '-0.025em', margin: '0 0 0.35rem 0' }}>
            Admission Office Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#667085', margin: 0 }}>
            Manage candidate evaluations, monitor entrance exam schedules, and complete student grade enrollments.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admission/update-score" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <span>Update Scores</span>
          </Link>
          <Link href="/admission/assign-course" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <span>Assign Course</span>
          </Link>
          <Link href="/admission/applications" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <span>View All Applications</span>
            <ArrowRightIcon size={15} />
          </Link>
        </div>
      </div>

      {/* Section 15: Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Card 1: Total Applications */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          padding: '1.25rem 1.35rem',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>
              Total Applications
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#E8F8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F9D8A' }}>
              <ApplicationsIcon size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#172033', lineHeight: 1.15 }}>
            {totalApplications.toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.775rem', color: '#667085', marginTop: '0.35rem' }}>
            All active candidates
          </div>
        </div>

        {/* Card 2: Pending Review */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          padding: '1.25rem 1.35rem',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>
              Pending Review
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#FEF0C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F79009' }}>
              <ClockIcon size={15} color="#F79009" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#172033', lineHeight: 1.15 }}>
            {pendingReview.toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.775rem', color: '#F79009', fontWeight: 600, marginTop: '0.35rem' }}>
            Awaiting admission action
          </div>
        </div>

        {/* Card 3: Upcoming Exams */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          padding: '1.25rem 1.35rem',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>
              Upcoming Exams
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EFF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#175CD3' }}>
              <CalendarIcon size={15} color="#175CD3" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#172033', lineHeight: 1.15 }}>
            {upcomingExams.toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.775rem', color: '#175CD3', fontWeight: 600, marginTop: '0.35rem' }}>
            Booked candidate slots
          </div>
        </div>

        {/* Card 4: Completed Admissions */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          padding: '1.25rem 1.35rem',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>
              Completed Admissions
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#E8F8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F9D8A' }}>
              <CheckIcon size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#172033', lineHeight: 1.15 }}>
            {completedAdmissions.toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.775rem', color: '#0F9D8A', fontWeight: 600, marginTop: '0.35rem' }}>
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

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Parent</th>
                <th>Grade</th>
                <th>Status</th>
                <th>Exam Score</th>
                <th>Course</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.slice(0, 10).map((app) => (
                <tr key={app._id || app.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
                        fontSize: '0.8rem'
                      }}>
                        {app.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#172033', fontSize: '0.875rem' }}>
                          {app.name}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#667085' }}>
                          #{app.applicationNumber || 'APP-2026-001'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#172033' }}>
                      {app.parentName || 'Parent'}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#667085' }}>
                      {app.parentEmail || app.parentPhone || ''}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: '#172033', fontSize: '0.8125rem' }}>
                      {app.applyingGrade}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: (app.examScore != null || app.marksObtained != null) ? '#172033' : '#94A3B8' }}>
                      {app.examScore != null ? `${app.examScore} / 100` : app.marksObtained != null ? `${app.marksObtained} / 100` : '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: app.assignedCourse ? '#0F9D8A' : '#667085' }}>
                      {app.assignedCourse || 'Unassigned'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
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
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
