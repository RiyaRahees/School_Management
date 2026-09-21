'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getStudentById, updateExamScore, assignCourse } from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';
import StatusBadge from '../../../../components/StatusBadge';
import StatusTimeline from '../../../../components/StatusTimeline';
import Loading from '../../../../components/Loading';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, MapPinIcon, CheckIcon } from '../../../../components/Icons';

const GRADES_OPTIONS = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'];

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const { showToast } = useAuth();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Score state
  const [scoreInput, setScoreInput] = useState('');
  const [scoreError, setScoreError] = useState('');

  // Course selection state
  const [selectedGrade, setSelectedGrade] = useState('Grade 1');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getStudentById(id);
        setStudent(data);
        if (data?.examScore !== null && data?.examScore !== undefined) {
          setScoreInput(data.examScore.toString());
        } else if (data?.marksObtained !== null && data?.marksObtained !== undefined) {
          setScoreInput(data.marksObtained.toString());
        }
        if (data?.assignedCourse) {
          setSelectedGrade(data.assignedCourse);
        } else if (data?.applyingGrade && GRADES_OPTIONS.includes(data.applyingGrade)) {
          setSelectedGrade(data.applyingGrade);
        }
      } catch (err) {
        showToast(err.message || 'Error loading candidate application', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, showToast]);

  const handleSaveScore = async (e) => {
    e.preventDefault();
    setScoreError('');

    const val = Number(scoreInput);
    if (scoreInput.trim() === '' || isNaN(val) || val < 0 || val > 100) {
      setScoreError('Score must be between 0 and 100.');
      return;
    }

    setActionLoading(true);
    try {
      await updateExamScore(id, val);
      setStudent(prev => ({
        ...prev,
        examScore: val,
        status: 'EXAM_COMPLETED'
      }));
      showToast('Exam score recorded successfully. Status updated to Exam Completed.', 'success');
    } catch (err) {
      showToast(err.message || 'Unable to record score.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignGrade = async (e) => {
    e.preventDefault();
    if (!selectedGrade) return;

    setActionLoading(true);
    try {
      await assignCourse(id, selectedGrade);
      setStudent(prev => ({
        ...prev,
        assignedCourse: selectedGrade,
        status: 'ADMISSION_COMPLETED'
      }));
      showToast(`Admission confirmed! ${student?.name} assigned to ${selectedGrade}.`, 'success');
    } catch (err) {
      showToast(err.message || 'Unable to complete admission.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loading type="skeleton-details" />;
  }

  if (!student) {
    return (
      <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#172033' }}>Application Not Found</h3>
        <p style={{ color: '#667085', margin: '0.5rem 0 1.5rem', fontSize: '0.875rem' }}>
          No candidate was found matching ID: {id}
        </p>
        <Link href="/admission/applications" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Back to Applications
        </Link>
      </div>
    );
  }

  const canEnterScore = student.status === 'SLOT_BOOKED' || student.status === 'EXAM_COMPLETED';
  const canAssignCourse = student.status === 'EXAM_COMPLETED' || student.status === 'ADMISSION_COMPLETED';

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '3rem' }}>
      <style>{`
        /* MOBILE RESPONSIVE ONLY (< 768px) */
        @media (max-width: 768px) {
          .candidate-overview-card {
            padding: 1.15rem !important;
          }
          .candidate-overview-card h1 {
            font-size: 1.45rem !important;
          }
          .candidate-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .candidate-info-section {
            padding: 1.15rem !important;
          }
        }
      `}</style>

      {/* Back Link */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          href="/admission/applications"
          style={{
            fontSize: '0.84rem',
            color: '#667085',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            textDecoration: 'none'
          }}
        >
          <ArrowLeftIcon size={14} />
          <span>Back to Applications</span>
        </Link>
      </div>

      {/* Candidate Overview Header Card */}
      <div className="candidate-overview-card" style={{
        marginBottom: '2rem',
        padding: '1.75rem',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              APPLICATION #{student.applicationNumber || 'APP-2026-001'}
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#172033', letterSpacing: '-0.02em', margin: '0.2rem 0 0.35rem 0' }}>
              {student.name}
            </h1>
            <div style={{ fontSize: '0.875rem', color: '#667085' }}>
              Candidate for <strong style={{ color: '#172033' }}>{student.applyingGrade}</strong> • Parent: {student.parentName || 'Parent'} ({student.parentEmail || '—'})
            </div>
          </div>

          <StatusBadge status={student.status} />
        </div>

        {/* Stepper Timeline */}
        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: '#667085', marginBottom: '1rem' }}>
            ADMISSION PROGRESS
          </div>
          <StatusTimeline currentStatus={student.status} />
        </div>
      </div>

      {/* Two-Column: Personal Information & Application Information */}
      <div className="candidate-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* PERSONAL INFORMATION Card */}
        <div className="candidate-info-section" style={{ padding: '1.75rem', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#172033', margin: '0 0 1.25rem 0', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            PERSONAL INFORMATION
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: '#667085', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Student Name</span>
              <div style={{ fontWeight: 700, color: '#172033', marginTop: '0.2rem' }}>{student.name}</div>
            </div>
            <div>
              <span style={{ color: '#667085', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Date of Birth</span>
              <div style={{ fontWeight: 600, color: '#172033', marginTop: '0.2rem' }}>{student.dob || student.dateOfBirth || '12 May 2018'}</div>
            </div>
            <div>
              <span style={{ color: '#667085', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Gender</span>
              <div style={{ fontWeight: 600, color: '#172033', marginTop: '0.2rem' }}>{student.gender || 'Male'}</div>
            </div>
            <div>
              <span style={{ color: '#667085', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Parent Contact</span>
              <div style={{ fontWeight: 600, color: '#172033', marginTop: '0.2rem' }}>{student.parentName || 'Parent'}</div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: '#667085', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Previous School</span>
              <div style={{ fontWeight: 600, color: '#172033', marginTop: '0.2rem' }}>{student.previousSchool || 'None specified'}</div>
            </div>
          </div>
        </div>

        {/* APPLICATION INFORMATION Card */}
        <div style={{ padding: '1.75rem', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#172033', margin: '0 0 1.25rem 0', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            APPLICATION INFORMATION
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: '#667085', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Applying Grade</span>
              <div style={{ fontWeight: 700, color: '#0F9D8A', marginTop: '0.2rem' }}>{student.applyingGrade}</div>
            </div>
            <div>
              <span style={{ color: '#667085', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Application Status</span>
              <div style={{ marginTop: '0.2rem' }}>
                <StatusBadge status={student.status} />
              </div>
            </div>
            <div>
              <span style={{ color: '#667085', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Registration Fee</span>
              <div style={{ fontWeight: 600, color: student.status !== 'APPLICATION_CREATED' ? '#0F9D8A' : '#F79009', marginTop: '0.2rem' }}>
                {student.status !== 'APPLICATION_CREATED' ? '₹500 · Paid' : '₹500 · Pending'}
              </div>
            </div>
            <div>
              <span style={{ color: '#667085', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Exam Slot</span>
              <div style={{ fontWeight: 600, color: student.examSlot?.date ? '#172033' : '#667085', marginTop: '0.2rem' }}>
                {student.examSlot?.date ? `${student.examSlot.date} · ${student.examSlot.time || '10:00 AM'}` : 'Not Booked'}
              </div>
            </div>
            <div>
              <span style={{ color: '#667085', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Exam Score</span>
              <div style={{ fontWeight: 700, color: student.marksObtained != null ? '#172033' : '#667085', marginTop: '0.2rem' }}>
                {student.marksObtained != null ? `${student.marksObtained} / 100` : 'Pending'}
              </div>
            </div>
            <div>
              <span style={{ color: '#667085', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Assigned Course</span>
              <div style={{ fontWeight: 700, color: student.assignedCourse ? '#0F9D8A' : '#667085', marginTop: '0.2rem' }}>
                {student.assignedCourse || 'Pending Admission'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 16: UPDATE SCORE UI */}
      <div id="score" style={{
        marginBottom: '2rem',
        padding: '1.75rem',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#667085', fontWeight: 700 }}>
          STEP 1 · RECORD ENTRANCE EXAM RESULT
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#172033', margin: '0.35rem 0 0.15rem 0' }}>
          Update Exam Score
        </h2>
        <div style={{ fontSize: '0.84rem', color: '#667085', marginBottom: '1.5rem' }}>
          Candidate: <strong style={{ color: '#172033' }}>{student.name}</strong> ({student.applyingGrade})
        </div>

        {student.status === 'EXAM_COMPLETED' || student.status === 'ADMISSION_COMPLETED' ? (
          <div style={{
            padding: '1.25rem',
            borderRadius: '8px',
            backgroundColor: '#F0FDFA',
            border: '1px solid #CCFBF1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#0D9488',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                <CheckIcon size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F766E' }}>
                  {student.examScore ?? student.marksObtained ?? 80} / 100 Marks
                </div>
                <div style={{ fontSize: '0.775rem', color: '#115E59', marginTop: '0.1rem' }}>
                  Score finalized and recorded. Candidate is eligible for course assignment.
                </div>
              </div>
            </div>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#0F766E',
              backgroundColor: '#CCFBF1',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              border: '1px solid #99F6E4'
            }}>
              ✓ Final Evaluation Locked
            </div>
          </div>
        ) : !canEnterScore ? (
          <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: '#F7F9FA', border: '1px solid #E5E7EB', color: '#667085', fontSize: '0.85rem' }}>
            ℹ Exam score entry unlocks once the candidate books an entrance exam slot (Current Status: <strong>{student.status.replace(/_/g, ' ')}</strong>).
          </div>
        ) : (
          <form onSubmit={handleSaveScore} style={{ maxWidth: '440px' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#172033', marginBottom: '0.4rem' }}>
                Exam Score (0 – 100)
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="85"
                  value={scoreInput}
                  onChange={(e) => {
                    setScoreInput(e.target.value);
                    if (scoreError) setScoreError('');
                  }}
                  disabled={actionLoading}
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    width: '120px',
                    textAlign: 'center',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: scoreError ? '1.5px solid #F04438' : '1.5px solid #E5E7EB',
                    color: '#172033',
                    backgroundColor: '#F7F9FA'
                  }}
                />
                <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#667085' }}>/ 100</span>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading || scoreInput.trim() === ''}
                  style={{ padding: '0.55rem 1.25rem' }}
                >
                  {actionLoading ? 'Saving...' : 'Save Score'}
                </button>
              </div>

              {scoreError ? (
                <div style={{ color: '#F04438', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600 }}>
                  {scoreError}
                </div>
              ) : (
                <div style={{ fontSize: '0.775rem', color: '#667085', marginTop: '0.4rem' }}>
                  Score must be between 0 and 100.
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Section 17: COURSE ASSIGNMENT UI */}
      <div id="assign" style={{
        marginBottom: '2.5rem',
        padding: '1.75rem',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#667085', fontWeight: 700 }}>
          STEP 2 · ASSIGN COURSE & FINALIZE ENROLLMENT
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#172033', margin: '0.35rem 0 0.15rem 0' }}>
          Assign Grade / Course
        </h2>
        <div style={{ fontSize: '0.84rem', color: '#667085', marginBottom: '1.5rem' }}>
          Student: <strong style={{ color: '#172033' }}>{student.name}</strong> • Exam Score: <strong style={{ color: '#0F9D8A' }}>{student.marksObtained != null ? `${student.marksObtained} / 100` : 'Pending'}</strong>
        </div>

        {!canAssignCourse ? (
          <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: '#F7F9FA', border: '1px solid #E5E7EB', color: '#667085', fontSize: '0.85rem' }}>
            ℹ Course assignment unlocks after exam score is evaluated (Status: <strong>EXAM_COMPLETED</strong>).
          </div>
        ) : student.status === 'ADMISSION_COMPLETED' ? (
          <div style={{ padding: '1.25rem', background: '#E8F8F5', border: '1px solid #BFECE4', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0F9D8A', fontWeight: 700 }}>
              <CheckIcon size={14} />
              <span>Admission Completed</span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#172033', marginTop: '0.35rem' }}>
              Enrolled Grade: {student.assignedCourse || student.applyingGrade}
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#087F71', margin: '0.2rem 0 0 0' }}>
              Student application #{student.applicationNumber || 'APP-2026-001'} is formally completed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleAssignGrade} style={{ maxWidth: '440px' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#172033', marginBottom: '0.4rem' }}>
                Assign Grade / Course:
              </label>
              <select
                className="form-control"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                disabled={actionLoading}
                style={{ height: '42px', fontSize: '0.9rem' }}
              >
                {GRADES_OPTIONS.map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={actionLoading || !selectedGrade}
              style={{ padding: '0.6rem 1.4rem' }}
            >
              {actionLoading ? 'Assigning...' : 'Assign Course'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
