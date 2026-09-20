'use client';

import React, { useEffect, useState } from 'react';
import { getApplications, assignCourse } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import StatusBadge from '../../../components/StatusBadge';
import Loading from '../../../components/Loading';
import EmptyState from '../../../components/EmptyState';
import { SearchIcon, CheckIcon, ArrowRightIcon } from '../../../components/Icons';

const COURSES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'];

export default function AssignCoursePage() {
  const { showToast } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'READY_FOR_ASSIGNMENT' | 'ASSIGNED'

  // Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('Grade 1');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedStudent, setConfirmedStudent] = useState(null);

  useEffect(() => {
    async function fetchList() {
      try {
        const data = await getApplications();
        setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load applications for course assignment', err);
      } finally {
        setLoading(false);
      }
    }
    fetchList();
  }, []);

  const openAssignModal = (student) => {
    setSelectedStudent(student);
    // Default to candidate's applying grade if valid, else Grade 1
    const defaultGrade = COURSES.includes(student.applyingGrade) ? student.applyingGrade : 'Grade 1';
    setSelectedCourse(student.assignedCourse || defaultGrade);
    setConfirmedStudent(null);
  };

  const closeAssignModal = () => {
    setSelectedStudent(null);
    setConfirmedStudent(null);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setSubmitting(true);
    try {
      const studentId = selectedStudent._id || selectedStudent.id;
      await assignCourse(studentId, selectedCourse);

      // Update local applications state dynamically
      setApplications(prev => prev.map(s => {
        if ((s._id || s.id) === studentId) {
          return {
            ...s,
            assignedCourse: selectedCourse,
            status: 'ADMISSION_COMPLETED'
          };
        }
        return s;
      }));

      setConfirmedStudent({
        name: selectedStudent.name,
        course: selectedCourse
      });

      showToast(`Course ${selectedCourse} assigned to ${selectedStudent.name}. Admission Finalized!`, 'success');
    } catch (error) {
      showToast(error.message || 'Course assignment failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading type="skeleton-table" />;
  }

  // Filter candidates
  const filteredCandidates = applications.filter((app) => {
    const q = search.toLowerCase();
    const name = (app.name || '').toLowerCase();
    const appNo = (app.applicationNumber || '').toLowerCase();
    const grade = (app.applyingGrade || '').toLowerCase();
    const matchesSearch = !search || name.includes(q) || appNo.includes(q) || grade.includes(q);

    if (!matchesSearch) return false;

    if (filter === 'READY_FOR_ASSIGNMENT') {
      return app.status === 'EXAM_COMPLETED';
    }
    if (filter === 'ASSIGNED') {
      return app.status === 'ADMISSION_COMPLETED';
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F9D8A', textTransform: 'uppercase', letterSpacing: '0.06em', backgroundColor: '#E8F8F5', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
            ADMISSION TEAM
          </span>
          <span style={{ fontSize: '0.8rem', color: '#667085' }}>• Final Course Placement Section</span>
        </div>
        <h1 className="page-title" style={{ margin: 0 }}>
          Assign Course
        </h1>
        <p className="page-subtitle">
          Place evaluated candidates into finalized academic courses and complete the student enrollment milestone.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-search-box">
          <SearchIcon size={15} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search candidates by name, application ID, or grade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('ALL')}
          >
            All Candidates ({applications.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filter === 'READY_FOR_ASSIGNMENT' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('READY_FOR_ASSIGNMENT')}
          >
            Ready for Course ({applications.filter(a => a.status === 'EXAM_COMPLETED').length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filter === 'ASSIGNED' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('ASSIGNED')}
          >
            Admitted / Assigned ({applications.filter(a => a.status === 'ADMISSION_COMPLETED').length})
          </button>
        </div>
      </div>

      {/* Table Section */}
      {filteredCandidates.length === 0 ? (
        <EmptyState
          title={filter === 'READY_FOR_ASSIGNMENT' ? "No Candidates Awaiting Course Assignment" : "No Candidates Found"}
          description={
            filter === 'READY_FOR_ASSIGNMENT'
              ? "Candidates will appear here once their entrance examination score is entered and status changes to 'Exam Completed'."
              : "No candidate records match your search or filter criteria."
          }
          actionLabel={filter !== 'ALL' ? "View All Candidates" : null}
          onAction={filter !== 'ALL' ? () => setFilter('ALL') : null}
        />
      ) : (
        <div className="table-container" style={{ overflowX: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', tableLayout: 'auto' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1rem' }}>Candidate</th>
                <th style={{ padding: '0.85rem 0.85rem' }}>Exam Score</th>
                <th style={{ padding: '0.85rem 0.85rem' }}>Status</th>
                <th style={{ padding: '0.85rem 0.85rem' }}>Assigned Course</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((cand) => {
                const hasScore = cand.examScore !== null && cand.examScore !== undefined;
                const isReady = cand.status === 'EXAM_COMPLETED';
                const isAssigned = cand.status === 'ADMISSION_COMPLETED';

                return (
                  <tr key={cand._id || cand.id}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                          {(cand.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
                            {cand.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#0D9488', fontWeight: 600 }}>
                              {cand.applyingGrade}
                            </span>
                            <span style={{ color: '#CBD5E1' }}>•</span>
                            <span style={{ fontSize: '0.725rem', color: '#64748B' }}>
                              #{cand.applicationNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                      {hasScore ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#ECFDF3', color: '#027A48', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8125rem' }}>
                          <CheckIcon size={12} />
                          <span>{cand.examScore} / 100</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                          Awaiting Exam
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                      <StatusBadge status={cand.status} />
                    </td>

                    <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                      {cand.assignedCourse ? (
                        <span style={{ fontWeight: 700, color: '#0F9D8A', backgroundColor: '#E8F8F5', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.8125rem' }}>
                          ✓ {cand.assignedCourse}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                          Not Assigned
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {isReady ? (
                        <button
                          type="button"
                          onClick={() => openAssignModal(cand)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          <span>Assign Course</span>
                          <ArrowRightIcon size={12} />
                        </button>
                      ) : isAssigned ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#0F766E',
                          backgroundColor: '#CCFBF1',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '6px'
                        }}>
                          <CheckIcon size={12} />
                          <span>Enrolled</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
                          Score Needed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION 17: Clean Course Assignment Modal (Prompt Section 17 UI) */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={closeAssignModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            {/* Modal Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#0F9D8A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ADMISSION PLACEMENT
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#172033', margin: '0.2rem 0 0 0' }}>
                  Assign Academic Course
                </h3>
              </div>
              <button
                type="button"
                onClick={closeAssignModal}
                style={{ fontSize: '1.25rem', color: '#94A3B8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleAssignSubmit} style={{ padding: '1.5rem' }}>
              {/* Section 17 Specifications: Student Name & Exam Score */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '1.15rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Student:
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#172033', marginTop: '0.1rem' }}>
                      {selectedStudent.name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Exam Score:
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F9D8A', marginTop: '0.1rem' }}>
                      {selectedStudent.examScore ?? '—'} / 100
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748B', paddingTop: '0.65rem', borderTop: '1px solid #E2E8F0' }}>
                  Application #{selectedStudent.applicationNumber} · Target: {selectedStudent.applyingGrade}
                </div>
              </div>

              {/* Assign Grade / Course Dropdown (Section 17 specification) */}
              <div className="form-group">
                <label className="form-label" htmlFor="course-select">
                  <span>Assign Grade / Course <span className="required">*</span></span>
                </label>
                <select
                  id="course-select"
                  className="form-select"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  disabled={submitting}
                  style={{ height: '44px', fontWeight: 600 }}
                >
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="form-hint">
                  Selecting a course finalizes the admission workflow into &apos;Admission Completed&apos;.
                </div>
              </div>

              {/* Success confirmation message if already confirmed */}
              {confirmedStudent && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#ECFDF3',
                  border: '1px solid #A6F4C5',
                  color: '#027A48',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckIcon size={14} />
                  <span>Successfully assigned {confirmedStudent.course} to {confirmedStudent.name}!</span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAssignModal}
                  disabled={submitting}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  <span>{submitting ? 'Assigning...' : 'Assign Course'}</span>
                  <CheckIcon size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
