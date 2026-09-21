'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getStudents, getExamSlots, bookExamSlot, payRegistrationFee, initiateRazorpayPayment } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import StatusBadge from '../../../components/StatusBadge';
import Loading from '../../../components/Loading';
import { CalendarIcon, ClockIcon, CheckIcon, ArrowRightIcon, CreditCardIcon } from '../../../components/Icons';

export default function ExamSlotsPage() {
  const { user, showToast } = useAuth();
  const searchParams = useSearchParams();
  const initialStudentId = searchParams?.get('studentId') || '';

  const [students, setStudents] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [payingFee, setPayingFee] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close custom dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.student-dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPLICATION_CREATED':
        return { label: 'Fee Pending', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' };
      case 'REGISTRATION_FEE_PAID':
        return { label: 'Ready for Slot', bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' };
      case 'SLOT_BOOKED':
        return { label: 'Slot Booked', bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' };
      case 'EXAM_COMPLETED':
        return { label: 'Exam Completed', bg: '#F5F3FF', color: '#5B21B6', border: '#DDD6FE' };
      case 'ADMISSION_COMPLETED':
        return { label: 'Admitted', bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' };
      default:
        return { label: status, bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
    }
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [stdList, slotList] = await Promise.all([getStudents(), getExamSlots()]);
        const list = stdList || [];
        setStudents(list);
        setSlots(slotList || []);

        const eligible = list.filter(
          (s) => s.status === 'REGISTRATION_FEE_PAID' || s.status === 'APPLICATION_CREATED'
        );

        if (initialStudentId && eligible.some(s => s._id === initialStudentId)) {
          setSelectedStudentId(initialStudentId);
        } else if (eligible.length > 0) {
          const readyForSlot = eligible.find(s => s.status === 'REGISTRATION_FEE_PAID');
          const unpaid = eligible.find(s => s.status === 'APPLICATION_CREATED');
          if (readyForSlot) {
            setSelectedStudentId(readyForSlot._id);
          } else if (unpaid) {
            setSelectedStudentId(unpaid._id);
          } else {
            setSelectedStudentId(eligible[0]._id);
          }
        }

        if (slotList && slotList.length > 0) {
          setSelectedSlotId(slotList[0]._id || slotList[0].id);
        }
      } catch (err) {
        console.error('Failed to load slots data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialStudentId]);

  const handlePayFeeNow = async (studentId) => {
    setPayingFee(true);
    const targetStudent = students.find(s => s._id === studentId);
    try {
      await initiateRazorpayPayment({
        studentId: studentId,
        studentName: targetStudent?.name,
        parentName: user?.name,
        parentEmail: user?.email,
        onSuccess: (updatedStudent) => {
          setStudents(prev => prev.map(s => (s._id === studentId ? {
            ...s,
            status: 'REGISTRATION_FEE_PAID',
            registrationFeePaid: true,
            feePaid: true
          } : s)));
          showToast(`✓ Registration fee for ${targetStudent?.name || 'Student'} paid! You can now choose an exam slot.`, 'success');
          setPayingFee(false);
        },
        onError: (err) => {
          showToast(err.message || 'Payment cancelled or failed', 'error');
          setPayingFee(false);
        },
        onClose: () => {
          setPayingFee(false);
        }
      });
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
      setPayingFee(false);
    }
  };

  const [bookingSuccessModal, setBookingSuccessModal] = useState(false);
  const [bookedSlotData, setBookedSlotData] = useState(null);

  const handleConfirmSlot = async () => {
    if (!selectedStudentId) {
      showToast('Please select a student first.', 'error');
      return;
    }

    const targetStudent = students.find(s => s._id === selectedStudentId);
    if (!targetStudent) {
      showToast('Selected student not found.', 'error');
      return;
    }

    if (targetStudent.status === 'APPLICATION_CREATED') {
      showToast(`Registration fee must be paid for ${targetStudent.name} before booking an exam slot.`, 'error');
      return;
    }

    if (targetStudent.status === 'SLOT_BOOKED') {
      showToast(`${targetStudent.name} has already booked an entrance exam slot.`, 'info');
      return;
    }

    if (!selectedSlotId) {
      showToast('Please select an available examination slot.', 'error');
      return;
    }

    setBookingLoading(true);
    try {
      const updated = await bookExamSlot(selectedStudentId, selectedSlotId);
      setStudents(prev => prev.map(s => (s._id === selectedStudentId ? updated : s)));
      const chosenSlot = slots.find(s => (s._id || s.id) === selectedSlotId);
      setBookedSlotData({
        student: updated || targetStudent,
        slot: chosenSlot || updated.examSlot
      });
      setBookingSuccessModal(true);
      showToast(`Exam slot booked successfully for ${updated.name || targetStudent.name}!`, 'success');
    } catch (err) {
      showToast(err.message || 'Slot booking failed', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const eligibleStudents = students.filter(
    (s) => s.status === 'REGISTRATION_FEE_PAID' || s.status === 'APPLICATION_CREATED'
  );

  useEffect(() => {
    if (eligibleStudents.length > 0) {
      if (!eligibleStudents.some(s => s._id === selectedStudentId)) {
        const readyForSlot = eligibleStudents.find(s => s.status === 'REGISTRATION_FEE_PAID');
        const unpaid = eligibleStudents.find(s => s.status === 'APPLICATION_CREATED');
        if (readyForSlot) {
          setSelectedStudentId(readyForSlot._id);
        } else if (unpaid) {
          setSelectedStudentId(unpaid._id);
        } else {
          setSelectedStudentId(eligibleStudents[0]._id);
        }
      }
    }
  }, [eligibleStudents, selectedStudentId]);

  if (loading) {
    return <Loading type="skeleton-cards" />;
  }

  if (students.length === 0) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#172033', letterSpacing: '-0.02em', margin: '0 0 0.35rem 0' }}>
            Entrance Exam Scheduling
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#667085', margin: 0 }}>
            Choose an on-campus entrance assessment date and time for candidate evaluation.
          </p>
        </div>
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
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
            <CalendarIcon size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#172033', margin: '0 0 0.5rem 0' }}>
            No Students to Schedule
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#667085', maxWidth: '440px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
            You haven't submitted any student admission applications yet. Create an application and pay the registration fee to unlock exam slot booking.
          </p>
          <Link href="/parent/students/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <span>+ Create Student Application</span>
          </Link>
        </div>
      </div>
    );
  }

  if (eligibleStudents.length === 0) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#172033', letterSpacing: '-0.02em', margin: '0 0 0.35rem 0' }}>
            Entrance Exam Scheduling
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#667085', margin: 0 }}>
            All your registered candidate students have already confirmed and booked their entrance exam slots.
          </p>
        </div>
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: '#ECFDF5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <CheckIcon size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#172033', margin: '0 0 0.5rem 0' }}>
            All Candidate Exam Slots Are Booked
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#667085', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
            Every candidate student in your account has already secured an examination slot. You can review scheduled exam timings and admission progress in your applications dashboard.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link href="/parent/applications" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <span>View My Applications</span>
            </Link>
            <Link href="/parent/students" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              <span>All Students</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStudent = eligibleStudents.find(s => s._id === selectedStudentId) || eligibleStudents[0];
  const currentSlot = slots.find(s => (s._id || s.id) === selectedSlotId);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      <style>{`
        .slot-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .exam-slot-card {
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          background: #FFFFFF;
          padding: 1.35rem;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .exam-slot-card:hover:not(.disabled) {
          border-color: #0F9D8A;
          box-shadow: 0 4px 12px rgba(15, 157, 138, 0.08);
        }

        .exam-slot-card.selected {
          border: 2px solid #0F9D8A;
          background-color: #E8F8F5;
        }

        .exam-slot-card.disabled {
          background-color: #F7F9FA;
          border-color: #E5E7EB;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .slot-selected-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #0F9D8A;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .student-dropdown-item:hover {
          background-color: #F8FAFC !important;
        }

        .student-dropdown-item.selected {
          background-color: #F0FDF9 !important;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#172033', letterSpacing: '-0.02em', margin: '0 0 0.35rem 0' }}>
          Entrance Exam Scheduling
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#667085', margin: 0 }}>
          Choose an on-campus entrance assessment date and time for candidate evaluation.
        </p>
      </div>

      {/* Student Selector Card */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ flex: '1 1 360px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.45rem'
          }}>
            Select Candidate Student:
          </label>

          {/* Custom Interactive Dropdown */}
          <div className="student-dropdown-container" style={{ position: 'relative', width: '100%', maxWidth: '520px' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen(prev => !prev)}
              style={{
                width: '100%',
                padding: '0.65rem 0.95rem',
                backgroundColor: '#FFFFFF',
                border: dropdownOpen ? '1.5px solid #0F9D8A' : '1.5px solid #E2E8F0',
                boxShadow: dropdownOpen ? '0 0 0 3px rgba(15, 157, 138, 0.12)' : '0 1px 2px rgba(0,0,0,0.04)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              {currentStudent ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#E8F8F5',
                    color: '#0F9D8A',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getInitials(currentStudent.name)}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, color: '#172033', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentStudent.name}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1px' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{currentStudent.applyingGrade}</span>
                      <span>•</span>
                      <span>App #{currentStudent.applicationNumber || (currentStudent._id ? currentStudent._id.slice(-6).toUpperCase() : '')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Select a candidate student</span>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
                {currentStudent && (
                  <span style={{
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '12px',
                    backgroundColor: getStatusConfig(currentStudent.status).bg,
                    color: getStatusConfig(currentStudent.status).color,
                    border: `1px solid ${getStatusConfig(currentStudent.status).border}`
                  }}>
                    {getStatusConfig(currentStudent.status).label}
                  </span>
                )}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>

            {/* Floating Options Menu */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.12), 0 6px 12px -4px rgba(0, 0, 0, 0.08)',
                zIndex: 60,
                padding: '0.45rem',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <div style={{
                  padding: '0.4rem 0.65rem 0.5rem 0.65rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Eligible Candidate Students ({eligibleStudents.length})
                </div>

                {eligibleStudents.map((s) => {
                  const isSelected = s._id === selectedStudentId;
                  const cfg = getStatusConfig(s.status);
                  return (
                    <div
                      key={s._id}
                      onClick={() => {
                        setSelectedStudentId(s._id);
                        setDropdownOpen(false);
                      }}
                      className={`student-dropdown-item ${isSelected ? 'selected' : ''}`}
                      style={{
                        padding: '0.7rem 0.75rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        marginBottom: '2px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', overflow: 'hidden' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: isSelected ? '#CCFBF1' : '#F1F5F9',
                          color: isSelected ? '#0F9D8A' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {getInitials(s.name)}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: 600, color: '#172033', fontSize: '0.9rem' }}>
                            {s.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>{s.applyingGrade}</span>
                            <span>•</span>
                            <span>App #{s.applicationNumber || (s._id ? s._id.slice(-6).toUpperCase() : '')}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.55rem',
                          borderRadius: '12px',
                          backgroundColor: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`
                        }}>
                          {cfg.label}
                        </span>
                        {isSelected ? (
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#0F9D8A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckIcon size={11} />
                          </div>
                        ) : (
                          <div style={{ width: '18px' }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {currentStudent && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            backgroundColor: '#F8FAFC',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
              Current Admission Stage
            </div>
            <StatusBadge status={currentStudent.status} />
          </div>
        )}
      </div>

      {/* 1. Status: Fee Unpaid */}
      {currentStudent && currentStudent.status === 'APPLICATION_CREATED' && (
        <div style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '10px',
          backgroundColor: '#FFFAEB',
          border: '1.5px solid #FEDF89',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#B54708', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
              ⚠️ Registration Fee Pending for {currentStudent.name}
            </div>
            <div style={{ fontSize: '0.84rem', color: '#7A2E0E' }}>
              The registration fee (₹500) must be paid before an entrance exam slot can be confirmed.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => handlePayFeeNow(currentStudent._id)}
              disabled={payingFee}
              className="btn btn-primary"
              style={{ backgroundColor: '#D97706', borderColor: '#D97706', padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
            >
              <CreditCardIcon size={15} />
              <span>{payingFee ? 'Processing...' : 'Pay Fee (₹500) Now'}</span>
            </button>
            <Link href="/parent/payments" className="btn btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}>
              View Payments
            </Link>
          </div>
        </div>
      )}

      {/* 2. Status: Slot Already Booked */}
      {currentStudent && (currentStudent.status === 'SLOT_BOOKED' || currentStudent.status === 'EXAM_COMPLETED' || currentStudent.status === 'ADMISSION_COMPLETED') && (
        <div style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '10px',
          backgroundColor: '#F0FDF9',
          border: '1.5px solid #A7F3D0',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#065F46', fontSize: '0.95rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckIcon size={16} color="#059669" />
              <span>Exam Slot Already Booked for {currentStudent.name}</span>
            </div>
            <div style={{ fontSize: '0.84rem', color: '#047857' }}>
              {currentStudent.examSlot ? (
                <span>Scheduled on <strong>{currentStudent.examSlot.date}</strong> at <strong>{currentStudent.examSlot.time}</strong> ({currentStudent.examSlot.location})</span>
              ) : (
                <span>Exam slot is locked and confirmed on record.</span>
              )}
            </div>
          </div>
          <Link href={`/parent/students/${currentStudent._id}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
            View Student Record →
          </Link>
        </div>
      )}

      {/* 3. Status: Ready to Book Slot */}
      {currentStudent && currentStudent.status === 'REGISTRATION_FEE_PAID' && (
        <div style={{
          padding: '0.85rem 1.15rem',
          borderRadius: '8px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          fontSize: '0.84rem',
          color: '#1E40AF',
          marginBottom: '1.75rem'
        }}>
          ✓ <strong>Registration fee paid for {currentStudent.name}:</strong> Select an available exam slot below and click <strong>Confirm Slot</strong>.
        </div>
      )}

      {/* Available Slots Section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#172033', margin: '0 0 0.2rem 0' }}>
            Available Examination Slots
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
            Select a date and time session below, then click Confirm Slot.
          </p>
        </div>

        <div className="slot-card-grid">
          {slots.map((slot) => {
            const slotId = slot._id || slot.id;
            const isSelected = selectedSlotId === slotId;
            const capacity = slot.capacity || 30;
            const booked = slot.bookedCount || 0;
            const availableSeats = capacity - booked;
            const isFull = availableSeats <= 0;

            return (
              <div
                key={slotId}
                onClick={() => {
                  if (!isFull) setSelectedSlotId(slotId);
                }}
                className={`exam-slot-card ${isSelected ? 'selected' : ''} ${isFull ? 'disabled' : ''}`}
                style={{
                  cursor: isFull ? 'not-allowed' : 'pointer',
                  borderColor: isSelected ? '#0D9488' : '#E2E8F0',
                  boxShadow: isSelected ? '0 0 0 2px rgba(13, 148, 136, 0.2), 0 4px 12px rgba(13, 148, 136, 0.12)' : 'none'
                }}
              >
                {isSelected && (
                  <div className="slot-selected-indicator">
                    <CheckIcon size={12} />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
                  <CalendarIcon size={15} color={isSelected ? '#0D9488' : '#64748B'} />
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: isSelected ? '#0F766E' : '#172033' }}>
                    {slot.date || '15 July'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                  <ClockIcon size={14} color={isSelected ? '#0D9488' : '#64748B'} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: isSelected ? '#0F766E' : '#475569' }}>
                    {slot.time || '10:00 AM'}
                  </span>
                </div>

                <div style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.65rem',
                  borderTop: isSelected ? '1px solid #CCFBF1' : '1px solid #F1F5F9'
                }}>
                  <span style={{
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    color: isFull ? '#64748B' : '#0F766E',
                    backgroundColor: isFull ? '#E5E7EB' : '#CCFBF1',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px'
                  }}>
                    {isFull ? 'Unavailable' : 'Available'}
                  </span>
                  <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 500 }}>
                    {isFull ? 'Full' : `${availableSeats} left`}
                  </span>
                </div>

                {/* Inline Card Status Action */}
                <div style={{ marginTop: '0.65rem' }}>
                  {isSelected ? (
                    <div style={{
                      backgroundColor: '#0D9488',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      padding: '0.35rem 0.5rem',
                      borderRadius: '6px'
                    }}>
                      ✓ Slot Selected
                    </div>
                  ) : isFull ? (
                    <div style={{
                      backgroundColor: '#F1F5F9',
                      color: '#94A3B8',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      padding: '0.35rem 0.5rem',
                      borderRadius: '6px'
                    }}>
                      Fully Booked
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      color: '#64748B',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      padding: '0.35rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0'
                    }}>
                      Click to Select
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Floating Confirmation Bar */}
      <div style={{
        position: 'sticky',
        bottom: '1rem',
        zIndex: 40,
        padding: '1.15rem 1.5rem',
        borderRadius: '12px',
        border: '1.5px solid #0D9488',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ minWidth: '240px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {currentSlot ? 'Selected Examination Slot' : 'No Slot Selected'}
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginTop: '0.1rem' }}>
            {currentSlot ? `${currentSlot.date} · ${currentSlot.time}` : 'Click any slot card above'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.1rem' }}>
            {currentSlot
              ? `Candidate: ${currentStudent?.name || 'Selected Student'} • Venue: Main Campus Examination Center`
              : 'Choose an available assessment date and time from the list above'}
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirmSlot}
          disabled={
            bookingLoading ||
            !selectedSlotId ||
            !currentStudent ||
            currentStudent.status !== 'REGISTRATION_FEE_PAID'
          }
          className="btn btn-primary"
          style={{
            padding: '0.75rem 1.75rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            borderRadius: '8px',
            opacity: currentStudent?.status !== 'REGISTRATION_FEE_PAID' ? 0.65 : 1,
            cursor: currentStudent?.status !== 'REGISTRATION_FEE_PAID' ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)'
          }}
        >
          <span>
            {bookingLoading
              ? 'Confirming Slot...'
              : currentStudent?.status === 'APPLICATION_CREATED'
              ? 'Pay Registration Fee First'
              : currentStudent?.status === 'SLOT_BOOKED'
              ? 'Slot Already Booked'
              : 'Confirm Slot'}
          </span>
          <ArrowRightIcon size={16} />
        </button>
      </div>

      {/* Decent Standard Exam Slot Booking Confirmation Modal */}
      {bookingSuccessModal && (
        <div className="modal-overlay" style={{ zIndex: 99999 }}>
          <div className="modal-card" style={{ maxWidth: '480px', padding: '2rem 1.75rem', textAlign: 'center' }}>
            {/* Animated Checkmark Circle */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              border: '2px solid #A7F3D0',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.12)'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
              Exam Slot Confirmed!
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
              Your entrance examination session has been officially reserved on record.
            </p>

            {/* Ticket Box */}
            <div style={{
              background: '#F8FAFC',
              border: '1.5px dashed #CBD5E1',
              borderRadius: '12px',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Candidate</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>{bookedSlotData?.student?.name || currentStudent?.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grade</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0D9488' }}>{bookedSlotData?.student?.applyingGrade || currentStudent?.applyingGrade}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Exam Date</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                    <CalendarIcon size={14} color="#0D9488" />
                    <span>{bookedSlotData?.slot?.date || currentSlot?.date || 'Confirmed'}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Session Time</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                    <ClockIcon size={14} color="#0D9488" />
                    <span>{bookedSlotData?.slot?.time || currentSlot?.time || '10:00 AM'}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.775rem', color: '#475569' }}>
                <MapPinIcon size={14} color="#0D9488" />
                <span>Venue: <strong>{bookedSlotData?.slot?.location || currentSlot?.location || 'Main Campus, Examination Center'}</strong></span>
              </div>
            </div>

            {/* Instructions */}
            <div style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              borderRadius: '8px',
              padding: '0.75rem 0.95rem',
              fontSize: '0.775rem',
              color: '#1E40AF',
              textAlign: 'left',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>📌</span>
              <span>Please report 15 minutes before the session with valid student ID proof and writing stationery.</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                href={`/parent/students/${bookedSlotData?.student?._id || selectedStudentId}`}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', justifyContent: 'center', textDecoration: 'none' }}
              >
                <span>View Student Admission Journey</span>
                <ArrowRightIcon size={14} />
              </Link>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setBookingSuccessModal(false)}
                style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem', justifyContent: 'center' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
