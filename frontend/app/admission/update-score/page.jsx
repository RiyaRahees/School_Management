'use client';

import React, { useEffect, useState } from 'react';
import { getApplications, updateExamScore } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import StatusBadge from '../../../components/StatusBadge';
import Loading from '../../../components/Loading';
import EmptyState from '../../../components/EmptyState';
import { SearchIcon, CheckIcon, CalendarIcon, ArrowRightIcon } from '../../../components/Icons';

export default function UpdateScorePage() {
  const { showToast } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING_EVALUATION' | 'EVALUATED'
  
  // Active selected student for score entry modal/card
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scoreInput, setScoreInput] = useState('');
  const [scoreError, setScoreError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchList() {
      try {
        const data = await getApplications();
        setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load applications for score entry', err);
      } finally {
        setLoading(false);
      }
    }
    fetchList();
  }, []);

  const openScoreModal = (student) => {
    setSelectedStudent(student);
    setScoreInput(student.examScore !== null && student.examScore !== undefined ? String(student.examScore) : '');
    setScoreError('');
  };

  const closeScoreModal = () => {
    setSelectedStudent(null);
    setScoreInput('');
    setScoreError('');
  };

  const validateScore = (val) => {
    if (val === '') return 'Score is required.';
    const num = Number(val);
    if (isNaN(num)) return 'Please enter a valid number.';
    if (num < 0 || num > 100) return 'Score must be between 0 and 100.';
    return '';
  };

  const handleScoreChange = (e) => {
    const val = e.target.value;
    setScoreInput(val);
    setScoreError(validateScore(val));
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const err = validateScore(scoreInput);
    if (err) {
      setScoreError(err);
      return;
    }

    setSubmitting(true);
    try {
      const numScore = Number(scoreInput);
      await updateExamScore(selectedStudent._id || selectedStudent.id, numScore);

      // Update local state dynamically
      setApplications(prev => prev.map(s => {
        if ((s._id || s.id) === (selectedStudent._id || selectedStudent.id)) {
          return {
            ...s,
            examScore: numScore,
            status: 'EXAM_COMPLETED'
          };
        }
        return s;
      }));

      showToast(`Exam score of ${numScore}/100 recorded for ${selectedStudent.name}. Status updated to Exam Completed!`, 'success');
      closeScoreModal();
    } catch (error) {
      showToast(error.message || 'Failed to update exam score.', 'error');
      setScoreError(error.message || 'Submission failed.');
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

    if (filter === 'PENDING_EVALUATION') {
      return app.status === 'SLOT_BOOKED';
    }
    if (filter === 'EVALUATED') {
      return app.status === 'EXAM_COMPLETED' || app.status === 'ADMISSION_COMPLETED';
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
          <span style={{ fontSize: '0.8rem', color: '#667085' }}>• Examination Evaluation Section</span>
        </div>
        <h1 className="page-title" style={{ margin: 0 }}>
          Update Exam Scores
        </h1>
        <p className="page-subtitle">
          Record entrance examination marks for candidates with booked exam slots. Scores validate between 0 and 100.
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

        {/* Status Filter Buttons */}
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
            className={`btn btn-sm ${filter === 'PENDING_EVALUATION' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('PENDING_EVALUATION')}
          >
            Awaiting Score Entry ({applications.filter(a => a.status === 'SLOT_BOOKED').length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filter === 'EVALUATED' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('EVALUATED')}
          >
            Evaluated ({applications.filter(a => a.status === 'EXAM_COMPLETED' || a.status === 'ADMISSION_COMPLETED').length})
          </button>
        </div>
      </div>

      {/* Candidates Table */}
      {filteredCandidates.length === 0 ? (
        <EmptyState
          title={filter === 'PENDING_EVALUATION' ? "No Candidates Awaiting Evaluation" : "No Candidates Found"}
          description={
            filter === 'PENDING_EVALUATION'
              ? "There are currently no candidates in 'Slot Booked' status awaiting exam evaluation. Once candidates book an exam slot, they will appear in this queue."
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
                <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Candidate</th>
                <th style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>Exam Slot</th>
                <th style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>Current Score</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Evaluation Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((cand) => {
                const isEligible = cand.status === 'SLOT_BOOKED' || cand.status === 'EXAM_COMPLETED';
                const hasScore = cand.examScore !== null && cand.examScore !== undefined;

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
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                            {cand.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem', whiteSpace: 'nowrap' }}>
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
                      <StatusBadge status={cand.status} />
                    </td>

                    <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                      {cand.examSlot?.date ? (
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap' }}>
                            {cand.examSlot.date}
                          </div>
                          {cand.examSlot.time && (
                            <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '0.1rem', whiteSpace: 'nowrap' }}>
                              {cand.examSlot.time}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          No Slot
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                      {hasScore ? (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: '#ECFDF3',
                          color: '#027A48',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          whiteSpace: 'nowrap'
                        }}>
                          <CheckIcon size={12} />
                          <span>{cand.examScore} / 100</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          Not Evaluated
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {cand.status === 'SLOT_BOOKED' ? (
                        <button
                          type="button"
                          onClick={() => openScoreModal(cand)}
                          className="btn btn-primary btn-sm"
                          style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem' }}
                        >
                          <span>Enter Score</span>
                          <ArrowRightIcon size={13} />
                        </button>
                      ) : cand.status === 'EXAM_COMPLETED' ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#0F766E',
                          backgroundColor: '#CCFBF1',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap'
                        }}>
                          <CheckIcon size={12} />
                          <span>Score Recorded</span>
                        </span>
                      ) : cand.status === 'ADMISSION_COMPLETED' ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#0284C7',
                          backgroundColor: '#E0F2FE',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap'
                        }}>
                          ✓ Admitted
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          Awaiting Slot
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

      {/* SECTION 16: Professional Score-Entry Interface Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={closeScoreModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            {/* Modal Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#0F9D8A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  EXAMINATION EVALUATION
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#172033', margin: '0.2rem 0 0 0' }}>
                  Record Exam Score
                </h3>
              </div>
              <button
                type="button"
                onClick={closeScoreModal}
                style={{ fontSize: '1.25rem', color: '#94A3B8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitScore} style={{ padding: '1.5rem' }}>
              {/* Student Information Card at Top (Section 16 requirement) */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#172033' }}>
                    {selectedStudent.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                    #{selectedStudent.applicationNumber}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Applying for <strong>{selectedStudent.applyingGrade}</strong></span>
                  <span>•</span>
                  <span>Exam Slot: <strong>{selectedStudent.examSlot?.date || 'Scheduled'}</strong></span>
                </div>
              </div>

              {/* Score Input [ 0 – 100 ] with validation feedback */}
              <div className="form-group">
                <label className="form-label" htmlFor="score-input">
                  <span>Exam Score (Marks) <span className="required">*</span></span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Scale: 0 – 100</span>
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    id="score-input"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="Enter score (e.g. 85)"
                    value={scoreInput}
                    onChange={handleScoreChange}
                    className={`form-control ${scoreError ? 'is-invalid' : ''}`}
                    style={{ fontSize: '1.15rem', fontWeight: 700, paddingRight: '4.5rem' }}
                    autoFocus
                    disabled={submitting}
                  />
                  <span style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.85rem',
                    color: '#64748B',
                    fontWeight: 600
                  }}>
                    / 100
                  </span>
                </div>

                {/* Validation Feedback (Section 16: "Score must be between 0 and 100") */}
                {scoreError ? (
                  <div className="form-error">
                    <span>⚠</span>
                    <span>{scoreError}</span>
                  </div>
                ) : scoreInput !== '' && !scoreError ? (
                  <div className="form-hint" style={{ color: Number(scoreInput) >= 50 ? '#0F9D8A' : '#F79009', fontWeight: 600 }}>
                    {Number(scoreInput) >= 75
                      ? '✓ Distinction Performance (Eligible for Course Assignment)'
                      : Number(scoreInput) >= 50
                        ? '✓ Satisfactory Pass (Eligible for Course Assignment)'
                        : '⚠ Below Assessment Benchmark (Review placement carefully)'}
                  </div>
                ) : (
                  <div className="form-hint">Must be an integer or decimal between 0 and 100.</div>
                )}
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeScoreModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || Boolean(scoreError) || scoreInput === ''}
                >
                  <span>{submitting ? 'Saving Score...' : 'Submit Exam Score'}</span>
                  <ArrowRightIcon size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
