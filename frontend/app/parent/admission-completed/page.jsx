'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { getStudents } from '../../../lib/api';
import Loading from '../../../components/Loading';
import {
  AcademicCapIcon,
  CheckIcon,
  PrinterIcon,
  ArrowRightIcon,
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
    <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '3rem' }}>
      <style>{`
        .admitted-page-header {
          margin-bottom: 1.25rem;
        }

        .admitted-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.15rem;
        }

        .admitted-card {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          padding: 1.25rem;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        }

        .admitted-card:hover {
          border-color: #0F9D8A;
          box-shadow: 0 6px 18px rgba(15, 157, 138, 0.09);
        }

        @media (max-width: 640px) {
          .admitted-grid {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }
          .admitted-card {
            padding: 1.1rem;
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

      {/* Clean, Simple Header */}
      <div className="admitted-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Admission Completed
          </h1>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: '#ECFDF5',
            color: '#059669',
            border: '1px solid #A7F3D0',
            padding: '0.15rem 0.6rem',
            borderRadius: '12px'
          }}>
            {admittedStudents.length} {admittedStudents.length === 1 ? 'Student' : 'Students'}
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
          Official list of enrolled candidates with confirmed admission letters.
        </p>
      </div>

      {/* Clean Search Input */}
      {admittedStudents.length > 0 && (
        <div style={{
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          background: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          borderRadius: '10px',
          padding: '0.6rem 0.95rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <SearchIcon size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search admitted students by name or grade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.875rem',
              color: '#0F172A',
              backgroundColor: 'transparent'
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.85rem', padding: '2px 6px' }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Admitted Student Cards / Empty State */}
      {admittedStudents.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            backgroundColor: '#ECFDF5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <AcademicCapIcon size={28} />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem 0' }}>
            No Completed Admissions Yet
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '440px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
            When candidate entrance assessments are evaluated and course assignments are finalized, confirmed students will appear here with official admission letters.
          </p>

          <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/parent/students" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
              <span>Track Applications</span>
            </Link>
          </div>
        </div>
      ) : filteredAdmitted.length === 0 ? (
        <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>No admitted students matched "{search}".</p>
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
                {/* Verified Top Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '10px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    border: '1px solid #A7F3D0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <CheckIcon size={11} strokeWidth={3} />
                    <span>Admission Completed</span>
                  </span>

                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, fontFamily: 'monospace' }}>
                    {appNumber}
                  </span>
                </div>

                {/* Student Info Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1.5px solid #A7F3D0'
                  }}>
                    {initials}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.1rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {std.name}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <strong style={{ color: '#334155' }}>{std.applyingGrade}</strong>
                      <span style={{ color: '#CBD5E1' }}>•</span>
                      <span>Enrolled Candidate</span>
                    </div>
                  </div>
                </div>

                {/* Admission Details Box */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  padding: '0.75rem 0.85rem',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                    <span style={{ color: '#64748B' }}>Assigned Course:</span>
                    <span style={{ fontWeight: 700, color: '#0F766E' }}>
                      {std.assignedCourse || `${std.applyingGrade} Primary Section`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                    <span style={{ color: '#64748B' }}>Exam Evaluation:</span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>
                      {std.examScore !== null && std.examScore !== undefined ? `${std.examScore}% (Passed)` : 'Qualified (Passed)'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                    <span style={{ color: '#64748B' }}>Fee Clearance:</span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>
                      Paid (₹500) ✓
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForLetter(std)}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '0.6rem 0.85rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      borderRadius: '8px'
                    }}
                  >
                    <PrinterIcon size={15} />
                    <span>View Admission Letter</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.45rem' }}>
                    <Link
                      href={`/parent/students/${std._id}`}
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        padding: '0.45rem 0.6rem',
                        fontSize: '0.78rem',
                        textDecoration: 'none',
                        borderRadius: '6px'
                      }}
                    >
                      <span>Full Record</span>
                      <ArrowRightIcon size={12} />
                    </Link>

                    <Link
                      href="/parent/payments"
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        padding: '0.45rem 0.6rem',
                        fontSize: '0.78rem',
                        textDecoration: 'none',
                        borderRadius: '6px'
                      }}
                    >
                      <CreditCardIcon size={13} />
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
          <div className="modal-card printable-admission-letter" style={{ maxWidth: '600px', padding: '1.75rem', backgroundColor: '#FFFFFF', borderRadius: '14px' }}>
            {/* Modal Header */}
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F9D8A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Official Document Preview
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForLetter(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#64748B', cursor: 'pointer', padding: '2px 6px' }}
              >
                ✕
              </button>
            </div>

            {/* Certificate Body */}
            <div style={{ border: '2px double #0F9D8A', padding: '1.75rem 1.5rem', borderRadius: '10px', background: '#FAFCFF', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.85rem' }}>
                <EduFlowLogo size={38} />
              </div>

              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', marginBottom: '0.15rem' }}>
                PROVISIONAL ADMISSION LETTER
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>
                Academic Session 2026 – 2027
              </div>

              <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, textAlign: 'left', marginBottom: '1rem' }}>
                This is to officially certify that candidate <strong>{selectedStudentForLetter.name}</strong> (Application #{selectedStudentForLetter.applicationNumber || selectedStudentForLetter._id?.slice(-6).toUpperCase()}) has successfully qualified the entrance assessment and has been granted confirmed admission into:
              </p>

              <div style={{
                backgroundColor: '#ECFDF5',
                border: '1.5px solid #A7F3D0',
                borderRadius: '8px',
                padding: '0.85rem',
                margin: '1rem 0',
                textAlign: 'left'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.8rem' }}>
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

              <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4, textAlign: 'left', margin: '0.85rem 0' }}>
                Please preserve this official document for student orientation and ID card issuance on the first day of the academic session.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem', paddingTop: '0.85rem', borderTop: '1px solid #E2E8F0', textAlign: 'left' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Issue Date</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'cursive', fontSize: '1rem', color: '#0F9D8A', fontWeight: 700 }}>Office of Admissions</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>EduFlow Academy Authority</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setSelectedStudentForLetter(null)}
                className="btn btn-secondary btn-sm"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-primary btn-sm"
              >
                <PrinterIcon size={14} />
                <span>Print Admission Letter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
