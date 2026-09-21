'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getApplications } from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';
import Loading from '../../../components/Loading';
import {
  AcademicCapIcon,
  CheckIcon,
  SearchIcon,
  PrinterIcon,
  EduFlowLogo
} from '../../../components/Icons';

const GRADES = ['ALL', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 9'];

export default function AdmissionCompletedAdminPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedStudentForLetter, setSelectedStudentForLetter] = useState(null);

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

  const completedList = useMemo(() => {
    return applications.filter((app) => app.status === 'ADMISSION_COMPLETED');
  }, [applications]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return completedList.filter((app) => {
      const matchesSearch =
        !search ||
        (app.name && app.name.toLowerCase().includes(q)) ||
        (app.parentName && app.parentName.toLowerCase().includes(q)) ||
        (app.parentEmail && app.parentEmail.toLowerCase().includes(q)) ||
        (app.applicationNumber && app.applicationNumber.toLowerCase().includes(q)) ||
        (app.assignedCourse && app.assignedCourse.toLowerCase().includes(q)) ||
        ((app._id || app.id || '').toLowerCase().includes(q));

      const matchesGrade = selectedGrade === 'ALL' || app.applyingGrade === selectedGrade;

      return matchesSearch && matchesGrade;
    });
  }, [completedList, search, selectedGrade]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return <Loading type="skeleton-table" />;
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3rem' }}>
      <style>{`
        .admitted-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .admitted-table th {
          text-align: left;
          padding: 0.85rem 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #E2E8F0;
          background-color: #F8FAFC;
        }
        .admitted-table td {
          padding: 1rem;
          border-bottom: 1px solid #F1F5F9;
          color: #334155;
          vertical-align: middle;
        }
        .admitted-table tr:hover td {
          background-color: #F8FAFC;
        }

        .desktop-table-view {
          display: block;
        }
        .mobile-cards-view {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-table-view {
            display: none !important;
          }
          .mobile-cards-view {
            display: flex !important;
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .printable-doc, .printable-doc * {
            visibility: visible;
          }
          .printable-doc {
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
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '7px',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AcademicCapIcon size={18} />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              Admission Completed
            </h1>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
            Master directory of all candidates with finalized evaluations and assigned courses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/admission/assign-course" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
            Assign Courses
          </Link>
          <Link href="/admission/applications" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
            All Applications
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.85rem',
        marginBottom: '1.25rem'
      }}>
        <div className="card" style={{ padding: '0.85rem 1rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Admitted Students
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669', marginTop: '0.15rem' }}>
            {completedList.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '0.15rem', fontWeight: 600 }}>
            Active Confirmed Admissions
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            Academic Session
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
            2026 – 2027
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.15rem' }}>
            Current Intake
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.15rem',
        backgroundColor: '#FFFFFF',
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '0.45rem 0.85rem',
          minWidth: '280px',
          flex: '1 1 280px',
          maxWidth: '420px'
        }}>
          <SearchIcon size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search student, parent, ID, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '0.85rem',
              color: '#0F172A'
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', color: '#94A3B8', cursor: 'pointer' }}>✕</button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Grade:</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              fontSize: '0.85rem',
              color: '#0F172A',
              fontWeight: 600
            }}
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results View */}
      {completedList.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '14px',
            backgroundColor: '#ECFDF5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <AcademicCapIcon size={30} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
            No Completed Admissions Yet
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '460px', margin: '0 auto 1.5rem auto' }}>
            Students will appear here once entrance assessments are scored and courses are assigned.
          </p>
          <Link href="/admission/assign-course" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <span>Go to Assign Course →</span>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>No admitted students matching your filters.</p>
          <button onClick={() => { setSearch(''); setSelectedGrade('ALL'); }} className="btn btn-secondary btn-sm">Reset Filters</button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-table-view card" style={{ padding: 0, backgroundColor: '#FFFFFF', overflow: 'hidden', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <table className="admitted-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Application ID</th>
                  <th>Grade</th>
                  <th>Assigned Course</th>
                  <th>Exam Score</th>
                  <th>Parent / Contact</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((std) => {
                  const appNo = std.applicationNumber || (std._id ? `ADM-${std._id.slice(-6).toUpperCase()}` : 'ADM-2026');
                  return (
                    <tr key={std._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.925rem' }}>{std.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckIcon size={11} />
                          <span>Admitted</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.825rem', color: '#475569', fontWeight: 600 }}>{appNo}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{std.applyingGrade}</span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.65rem',
                          borderRadius: '12px',
                          backgroundColor: '#E0F2FE',
                          color: '#0369A1',
                          border: '1px solid #BAE6FD'
                        }}>
                          {std.assignedCourse || `${std.applyingGrade} Regular`}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#059669' }}>
                          {std.examScore !== null && std.examScore !== undefined ? `${std.examScore}%` : 'Passed'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>{std.parentName || 'Parent'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{std.parentEmail || '—'}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForLetter(std)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                        >
                          <PrinterIcon size={14} />
                          <span>Letter</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="mobile-cards-view">
            {filtered.map((std) => {
              const appNo = std.applicationNumber || (std._id ? `ADM-${std._id.slice(-6).toUpperCase()}` : 'ADM-2026');
              return (
                <div key={std._id} className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
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
                      gap: '0.25rem'
                    }}>
                      <CheckIcon size={11} />
                      <span>Admission Completed</span>
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'monospace' }}>{appNo}</span>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A', marginBottom: '0.25rem' }}>
                    {std.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.85rem' }}>
                    Grade: <strong style={{ color: '#334155' }}>{std.applyingGrade}</strong> • Score: <strong style={{ color: '#059669' }}>{std.examScore ? `${std.examScore}%` : 'Passed'}</strong>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1rem', fontSize: '0.8rem' }}>
                    <div style={{ color: '#64748B', marginBottom: '0.2rem' }}>Assigned Course:</div>
                    <div style={{ fontWeight: 700, color: '#0369A1' }}>{std.assignedCourse || `${std.applyingGrade} Regular`}</div>
                    <div style={{ color: '#64748B', marginTop: '0.4rem' }}>Parent: {std.parentName} ({std.parentEmail})</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedStudentForLetter(std)}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
                  >
                    <PrinterIcon size={15} />
                    <span>View Official Admission Letter</span>
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Official Admission Letter Modal */}
      {selectedStudentForLetter && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 99999
        }}>
          <div className="modal-card printable-doc" style={{
            maxWidth: '540px',
            width: '100%',
            maxHeight: '92dvh',
            overflowY: 'auto',
            padding: '1.25rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0'
          }}>
            <div className="no-print" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.85rem',
              borderBottom: '1px solid #F1F5F9',
              paddingBottom: '0.65rem'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F9D8A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Official Admission Document
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForLetter(null)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  border: 'none',
                  fontSize: '1rem',
                  color: '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              border: '2px solid #0F9D8A',
              padding: '1.35rem 1.15rem',
              borderRadius: '12px',
              background: '#FFFFFF',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.65rem' }}>
                <EduFlowLogo size={36} />
              </div>

              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', margin: '0 0 0.15rem 0' }}>
                CERTIFICATE OF ADMISSION
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>
                Academic Session 2026 – 2027
              </div>

              <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5, textAlign: 'left', margin: '0 0 0.75rem 0' }}>
                This is to officially certify that candidate <strong>{selectedStudentForLetter.name}</strong> (Application #{selectedStudentForLetter.applicationNumber || (selectedStudentForLetter._id ? selectedStudentForLetter._id.slice(-6).toUpperCase() : 'APP-2026')}) has been granted confirmed admission:
              </p>

              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '0.75rem 0.95rem',
                margin: '0.75rem 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 500 }}>Enrolled Grade:</span>
                  <strong style={{ color: '#0F172A' }}>{selectedStudentForLetter.applyingGrade}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 500 }}>Assigned Course:</span>
                  <strong style={{ color: '#0F766E' }}>{selectedStudentForLetter.assignedCourse || `${selectedStudentForLetter.applyingGrade} Regular`}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 500 }}>Parent Contact:</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{selectedStudentForLetter.parentName || 'Parent'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 500 }}>Admission Status:</span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#059669',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '0.1rem 0.5rem',
                    borderRadius: '6px'
                  }}>
                    Confirmed Active
                  </span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                paddingTop: '0.75rem',
                borderTop: '1px solid #E2E8F0',
                textAlign: 'left'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase' }}>Issue Date</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'cursive', fontSize: '0.95rem', color: '#0F9D8A', fontWeight: 700 }}>Office of Admissions</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>EduFlow Academy Authority</div>
                </div>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
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
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
