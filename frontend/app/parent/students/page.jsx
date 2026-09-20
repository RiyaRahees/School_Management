'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { getStudents } from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';
import EmptyState from '../../../components/EmptyState';
import Loading from '../../../components/Loading';
import {
  PlusIcon,
  SearchIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  CreditCardIcon,
  CheckIcon
} from '../../../components/Icons';

const GRADE_OPTIONS = ['ALL', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 9'];

export default function UnifiedStudentApplicationsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  useEffect(() => {
    async function fetchList() {
      try {
        const data = await getStudents();
        setStudents(data || []);
      } catch (err) {
        console.error('Failed to load student applications', err);
      } finally {
        setLoading(false);
      }
    }
    fetchList();
  }, []);

  const counts = useMemo(() => {
    const total = students.length;
    const inProgress = students.filter(s => s.status !== 'ADMISSION_COMPLETED').length;
    const awaitingFee = students.filter(s => s.status === 'APPLICATION_CREATED').length;
    const examScheduled = students.filter(s => s.status === 'SLOT_BOOKED').length;
    const enrolled = students.filter(s => s.status === 'ADMISSION_COMPLETED').length;
    return { total, inProgress, awaitingFee, examScheduled, enrolled };
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((std) => {
      const q = search.toLowerCase();
      const name = (std.studentName || std.name || '').toLowerCase();
      const grade = (std.applyingGrade || '').toLowerCase();
      const appNo = (std.applicationNumber || std.id || std._id || '').toLowerCase();

      const matchesSearch = !search || name.includes(q) || grade.includes(q) || appNo.includes(q);
      const matchesGrade = gradeFilter === 'ALL' || std.applyingGrade === gradeFilter;

      let matchesStatus = true;
      if (statusTab === 'IN_PROGRESS') {
        matchesStatus = std.status !== 'ADMISSION_COMPLETED';
      } else if (statusTab === 'AWAITING_FEE') {
        matchesStatus = std.status === 'APPLICATION_CREATED';
      } else if (statusTab === 'EXAM_SCHEDULED') {
        matchesStatus = std.status === 'SLOT_BOOKED';
      } else if (statusTab === 'ENROLLED') {
        matchesStatus = std.status === 'ADMISSION_COMPLETED';
      } else if (statusTab !== 'ALL') {
        matchesStatus = std.status === statusTab;
      }

      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [students, search, statusTab, gradeFilter]);

  const getInitials = (name) => {
    if (!name) return 'S';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* 1. Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            Student Applications
          </h1>
          <p className="page-subtitle">
            Manage student profiles, track admission journey stages, and schedule entrance examinations.
          </p>
        </div>

        <Link
          href="/parent/students/create"
          className="btn btn-primary"
          style={{ textDecoration: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px' }}
        >
          <PlusIcon size={16} />
          <span>New Application</span>
        </Link>
      </div>

      {/* 2. Key Metrics Summary Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Registered
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>
            {counts.total} <span style={{ fontSize: '0.825rem', fontWeight: 500, color: '#64748B' }}>Students</span>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            In Progress
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>
            {counts.inProgress} <span style={{ fontSize: '0.825rem', fontWeight: 500, color: '#64748B' }}>Active</span>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Enrolled & Confirmed
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F9D8A', marginTop: '0.15rem' }}>
            {counts.enrolled} <span style={{ fontSize: '0.825rem', fontWeight: 500, color: '#0F9D8A' }}>Completed</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Toolbar & Tabs */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Quick Filter Pill Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'All Applications', value: 'ALL', count: counts.total },
            { label: 'In Progress', value: 'IN_PROGRESS', count: counts.inProgress },
            { label: 'Awaiting Fee', value: 'AWAITING_FEE', count: counts.awaitingFee },
            { label: 'Exam Scheduled', value: 'EXAM_SCHEDULED', count: counts.examScheduled },
            { label: 'Enrolled', value: 'ENROLLED', count: counts.enrolled }
          ].map((tab) => {
            const isActive = statusTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusTab(tab.value)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? '#E8F8F5' : '#F8FAFC',
                  color: isActive ? '#0F9D8A' : '#475569',
                  border: isActive ? '1px solid #CCFBF1' : '1px solid #E2E8F0',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '0.725rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? '#0F9D8A' : '#E2E8F0',
                  color: isActive ? '#FFFFFF' : '#64748B',
                  fontWeight: 700
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search and Grade Filter Line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="filter-search-box" style={{ flex: '1 1 300px', margin: 0 }}>
            <SearchIcon size={15} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search by candidate name, application ID, or grade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>{g === 'ALL' ? 'All Grades' : g}</option>
            ))}
          </select>

          {(search || statusTab !== 'ALL' || gradeFilter !== 'ALL') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setStatusTab('ALL');
                setGradeFilter('ALL');
              }}
              style={{ fontSize: '0.8rem' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Table List */}
      {loading ? (
        <Loading type="skeleton-table" />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          title={students.length === 0 ? "No student applications yet" : "No matching applications found"}
          description={
            students.length === 0
              ? "You haven't registered any student admission applications yet."
              : "No candidate applications match your current search and filter criteria."
          }
          actionLabel={students.length === 0 ? "+ Create Application" : "Clear Filters"}
          actionHref={students.length === 0 ? "/parent/students/create" : null}
          onAction={students.length > 0 ? () => { setSearch(''); setStatusTab('ALL'); setGradeFilter('ALL'); } : null}
        />
      ) : (
        <div className="table-container" style={{ overflowX: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', tableLayout: 'auto' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Candidate</th>
                <th style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>Grade</th>
                <th style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>Admission Stage</th>
                <th style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>Exam Session</th>
                <th style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>Fee Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((std) => {
                const stdId = std._id || std.id;
                const isFeePaid = std.status !== 'APPLICATION_CREATED';

                return (
                  <tr key={stdId}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#F0FDFA',
                          border: '1px solid #CCFBF1',
                          color: '#0D9488',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          flexShrink: 0
                        }}>
                          {getInitials(std.name || std.studentName)}
                        </div>
                        <div>
                          <Link
                            href={`/parent/students/${stdId}`}
                            style={{
                              fontWeight: 700,
                              color: '#0F172A',
                              fontSize: '0.875rem',
                              textDecoration: 'none',
                              whiteSpace: 'nowrap'
                            }}
                            className="hover-text-primary"
                          >
                            {std.name || std.studentName}
                          </Link>
                          <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '0.1rem', whiteSpace: 'nowrap' }}>
                            #{std.applicationNumber || (stdId ? stdId.slice(-6).toUpperCase() : '')}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.8125rem' }}>
                        {std.applyingGrade}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                      <StatusBadge status={std.status} />
                    </td>

                    <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                      {std.status === 'ADMISSION_COMPLETED' ? (
                        <div>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: '#0F766E',
                            fontWeight: 700,
                            fontSize: '0.8125rem'
                          }}>
                            <CheckIcon size={12} />
                            <span>Exam Completed</span>
                          </div>
                          <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '0.1rem' }}>
                            {std.examSlot?.date || (std.examScore != null ? `Score: ${std.examScore}/100` : 'Evaluated')}
                          </div>
                        </div>
                      ) : std.status === 'EXAM_COMPLETED' ? (
                        <div>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: '#0D9488',
                            fontWeight: 700,
                            fontSize: '0.8125rem'
                          }}>
                            <CheckIcon size={12} />
                            <span>Exam Completed</span>
                          </div>
                          <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '0.1rem' }}>
                            {std.examScore != null ? `Score: ${std.examScore}/100` : (std.examSlot?.date || 'Evaluated')}
                          </div>
                        </div>
                      ) : std.status === 'SLOT_BOOKED' ? (
                        <div>
                          <div style={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: '#0F172A',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}>
                            <CalendarIcon size={12} color="#0D9488" />
                            <span>{std.examSlot?.date || 'Slot Booked'}</span>
                          </div>
                          {std.examSlot?.time && (
                            <div style={{
                              fontSize: '0.725rem',
                              color: '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              marginTop: '0.1rem'
                            }}>
                              <ClockIcon size={11} color="#94A3B8" />
                              <span>{std.examSlot.time}</span>
                            </div>
                          )}
                        </div>
                      ) : std.status === 'REGISTRATION_FEE_PAID' ? (
                        <Link
                          href="/parent/exam-slots"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: '#D97706',
                            backgroundColor: '#FEF3C7',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textDecoration: 'none'
                          }}
                        >
                          <span>Schedule Slot &rarr;</span>
                        </Link>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          Not Scheduled
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                      {isFeePaid ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          color: '#0F766E',
                          backgroundColor: '#CCFBF1',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap'
                        }}>
                          <CheckIcon size={11} />
                          <span>Paid</span>
                        </span>
                      ) : (
                        <span style={{
                          color: '#DC2626',
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FECACA',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap'
                        }}>
                          ₹500 Pending
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Link
                        href={`/parent/students/${stdId}`}
                        className="btn btn-secondary btn-sm"
                        style={{
                          textDecoration: 'none',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span>View Details</span>
                        <ArrowRightIcon size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
