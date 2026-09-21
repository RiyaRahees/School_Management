'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { getStudents } from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';
import Loading from '../../../components/Loading';
import {
  AcademicCapIcon,
  CheckIcon,
  PrinterIcon,
  ArrowRightIcon,
  CalendarIcon,
  CreditCardIcon,
  SearchIcon,
  EduFlowLogo
} from '../../../components/Icons';

export default function AdmissionCompletedPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudentForLetter, setSelectedStudentForLetter] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getStudents();
        setStudents(data || []);
      } catch (err) {
        console.error('Failed to load students', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter only admission completed students
  const admittedStudents = useMemo(() => {
    return students.filter((s) => s.status === 'ADMISSION_COMPLETED');
  }, [students]);

  const filteredAdmitted = useMemo(() => {
    if (!search.trim()) return admittedStudents;
    const q = search.toLowerCase();
    return admittedStudents.filter((s) => {
      const name = (s.studentName || s.name || '').toLowerCase();
      const grade = (s.applyingGrade || '').toLowerCase();
      const appNo = (s.applicationNumber || s._id || '').toLowerCase();
      const course = (s.assignedCourse || '').toLowerCase();
      return name.includes(q) || grade.includes(q) || appNo.includes(q) || course.includes(q);
    });
  }, [admittedStudents, search]);

  const getInitials = (name) => {
    if (!name) return 'S';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return <Loading type="skeleton-cards" />;
  }

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      <style>{`
        .admitted-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.25rem;
        }

        .admitted-card {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          padding: 1.5rem;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .admitted-card:hover {
          border-color: #0F9D8A;
          box-shadow: 0 8px 24px rgba(15, 157, 138, 0.1);
          transform: translateY(-2px);
        }

        .admitted-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .metric-tile {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 1.25rem 1.35rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }

        @media (max-width: 768px) {
          .admitted-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .admitted-metrics {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .printable-admission-letter, .printable-admission-letter * {
            visibility: visible;
          }
          .printable-admission-letter {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: #FFFFFF;
            padding: 2rem;
            z-index: 999999;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AcademicCapIcon size={20} />
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              Admission Completed Students
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
            Official directory of your registered candidates who have passed all assessments and finalized admission enrollment.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <Link href="/parent/students" className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>
            View All Applications
          </Link>
          <Link href="/parent/students/create" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>
            <span>+ New Application</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="admitted-metrics">
        <div className="metric-tile">
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Admitted Students
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
            {admittedStudents.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '0.2rem', fontWeight: 600 }}>
            ✓ Enrollment Confirmed
          </div>
        </div>

        <div className="metric-tile">
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Academic Session
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem' }}>
            2026 – 2027
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
            Regular Academic Term
          </div>
        </div>

        <div className="metric-tile">
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Tuition & Registration Fee
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F766E', marginTop: '0.4rem' }}>
            100% Cleared
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
            No pending admission dues
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {admittedStudents.length > 0 && (
        <div style={{
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          background: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          borderRadius: '10px',
          padding: '0.65rem 1rem',
          maxWidth: '420px'
        }}>
          <SearchIcon size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search by student name, grade, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.875rem',
              color: '#0F172A'
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.8rem', padding: '2px 6px' }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Zero State / Empty State */}
      {admittedStudents.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: '#ECFDF5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <AcademicCapIcon size={32} />
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
            No Completed Admissions Yet
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '480px', margin: '0 auto 1.75rem auto', lineHeight: 1.6 }}>
            When candidate entrance exams are evaluated and courses are assigned by the admissions office, students with confirmed enrollment will be listed here with their official admission letters.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxWidth: '380px',
            margin: '0 auto 2rem auto',
            textAlign: 'left',
            background: '#F8FAFC',
            padding: '1.25rem',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            fontSize: '0.82rem',
            color: '#475569'
          }}>
            <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>Admission Flow:</div>
            <div>1. Submit Student Application 📝</div>
            <div>2. Pay Registration Fee (₹500) 💳</div>
            <div>3. Choose Entrance Exam Slot 📅</div>
            <div>4. Attend Exam & Receive Evaluation 🎯</div>
            <div>5. Course Assigned → <strong>Admission Completed 🎉</strong></div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/parent/students" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <span>Track Active Applications</span>
            </Link>
            <Link href="/parent/exam-slots" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              <span>Check Exam Slots</span>
            </Link>
          </div>
        </div>
      ) : filteredAdmitted.length === 0 ? (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>No admitted students matched your search "{search}".</p>
          <button onClick={() => setSearch('')} className="btn btn-secondary btn-sm">Clear Search</button>
        </div>
      ) : (
        /* Admitted Students Grid */
        <div className="admitted-grid">
          {filteredAdmitted.map((std) => {
            const initials = getInitials(std.name);
            const appNumber = std.applicationNumber || (std._id ? `ADM-${std._id.slice(-6).toUpperCase()}` : 'ADM-2026');

            return (
              <div key={std._id} className="admitted-card">
                {/* Verified Ribbon / Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '12px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    border: '1px solid #A7F3D0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <CheckIcon size={12} />
                    <span>Admission Completed</span>
                  </span>

                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                    {appNumber}
                  </span>
                </div>

                {/* Student Info Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '2px solid #A7F3D0'
                  }}>
                    {initials}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.15rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {std.name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{std.applyingGrade}</span>
                      <span>•</span>
                      <span>Enrolled Candidate</span>
                    </div>
                  </div>
                </div>

                {/* Admission Details Box */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '1rem',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#64748B' }}>Assigned Course:</span>
                    <span style={{ fontWeight: 700, color: '#0F766E' }}>
                      {std.assignedCourse || `${std.applyingGrade} - Primary Section`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#64748B' }}>Assessment Score:</span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>
                      {std.examScore !== null && std.examScore !== undefined ? `${std.examScore}% (Passed)` : 'Qualified (Passed)'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#64748B' }}>Fee Clearance:</span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>
                      Paid (₹500) ✓
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForLetter(std)}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '0.65rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}
                  >
                    <PrinterIcon size={15} />
                    <span>View Admission Letter</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link
                      href={`/parent/students/${std._id}`}
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.8rem',
                        textDecoration: 'none'
                      }}
                    >
                      <span>Full Record</span>
                      <ArrowRightIcon size={13} />
                    </Link>

                    <Link
                      href="/parent/payments"
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.8rem',
                        textDecoration: 'none'
                      }}
                    >
                      <CreditCardIcon size={14} />
                      <span>Receipts</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Admission Letter Modal */}
      {selectedStudentForLetter && (
        <div className="modal-overlay" style={{ zIndex: 99999 }}>
          <div className="modal-card printable-admission-letter" style={{ maxWidth: '640px', padding: '2rem 2.25rem', backgroundColor: '#FFFFFF', borderRadius: '16px' }}>
            {/* Modal Header */}
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F9D8A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Official Document Preview
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForLetter(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#64748B', cursor: 'pointer', padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>

            {/* Certificate Body */}
            <div style={{ border: '2px double #0F9D8A', padding: '2rem 1.75rem', borderRadius: '12px', background: '#FAFCFF', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <EduFlowLogo size={42} />
              </div>

              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', marginBottom: '0.25rem' }}>
                PROVISIONAL ADMISSION LETTER
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.5rem' }}>
                Academic Session 2026 – 2027
              </div>

              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, textAlign: 'left', marginBottom: '1.25rem' }}>
                This is to officially certify that candidate <strong>{selectedStudentForLetter.name}</strong> (Application #{selectedStudentForLetter.applicationNumber || selectedStudentForLetter._id?.slice(-6).toUpperCase()}) has successfully qualified the entrance assessment and has been granted confirmed admission into:
              </p>

              <div style={{
                backgroundColor: '#ECFDF5',
                border: '1.5px solid #A7F3D0',
                borderRadius: '10px',
                padding: '1rem',
                margin: '1.25rem 0',
                textAlign: 'left'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748B' }}>Enrolled Grade: </span>
                    <strong style={{ color: '#0F172A' }}>{selectedStudentForLetter.applyingGrade}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Assigned Course: </span>
                    <strong style={{ color: '#059669' }}>{selectedStudentForLetter.assignedCourse || `${selectedStudentForLetter.applyingGrade} General`}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Fee Status: </span>
                    <strong style={{ color: '#059669' }}>Cleared (₹500) ✓</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Status: </span>
                    <strong style={{ color: '#059669' }}>Confirmed Active</strong>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5, textAlign: 'left', margin: '1rem 0' }}>
                Please preserve this official document for student orientation and ID card issuance on the first day of the academic session.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', textAlign: 'left' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Issue Date</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'cursive', fontSize: '1.1rem', color: '#0F9D8A', fontWeight: 700 }}>Office of Admissions</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>EduFlow Academy Authority</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedStudentForLetter(null)}
                className="btn btn-secondary"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-primary"
              >
                <PrinterIcon size={16} />
                <span>Print Admission Letter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
