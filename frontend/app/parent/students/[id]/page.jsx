'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  getStudentById,
  updateStudent,
  getExamSlots,
  bookExamSlot,
  initiateRazorpayPayment
} from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';
import StatusBadge from '../../../../components/StatusBadge';
import ExamSlotList from '../../../../components/ExamSlotList';
import StudentForm from '../../../../components/StudentForm';
import Loading from '../../../../components/Loading';
import {
  ArrowLeftIcon,
  LockIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CheckIcon,
  ShieldCheckIcon,
  CreditCardIcon
} from '../../../../components/Icons';

const JOURNEY_STAGES = [
  { step: 1, key: 'APPLICATION_CREATED', title: 'Application Created' },
  { step: 2, key: 'REGISTRATION_FEE_PAID', title: 'Fee Paid' },
  { step: 3, key: 'SLOT_BOOKED', title: 'Slot Booked' },
  { step: 4, key: 'EXAM_COMPLETED', title: 'Exam Completed' },
  { step: 5, key: 'ADMISSION_COMPLETED', title: 'Admission Completed' }
];

export default function StudentDetailPage() {
  const { id } = useParams();
  const { user, showToast } = useAuth();

  const [student, setStudent] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      try {
        const std = await getStudentById(id);
        setStudent(std);
        if (std?.status === 'REGISTRATION_FEE_PAID') {
          const slotList = await getExamSlots();
          setSlots(slotList || []);
        }
      } catch (err) {
        showToast(err.message || 'Error loading application', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id, showToast]);

  const handleUpdate = async (updatedData) => {
    setActionLoading(true);
    try {
      const res = await updateStudent(id, updatedData);
      setStudent(res);
      setIsEditing(false);
      showToast('Student details updated successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Unable to update details.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setActionLoading(true);
    try {
      await initiateRazorpayPayment({
        studentId: id,
        studentName: student?.name,
        parentName: user?.name,
        parentEmail: user?.email,
        onSuccess: async (verifiedStudent) => {
          setStudent(verifiedStudent);
          showToast('✓ Registration complete! Fee of ₹500 verified.', 'success');

          const slotList = await getExamSlots();
          setSlots(slotList || []);
          setActionLoading(false);
        },
        onError: (err) => {
          showToast(err.message || 'Payment cancelled or failed.', 'error');
          setActionLoading(false);
        },
        onClose: () => {
          setActionLoading(false);
        }
      });
    } catch (err) {
      showToast(err.message || 'Payment processing failed.', 'error');
      setActionLoading(false);
    }
  };

  const handleBookSlot = async (slotId) => {
    setActionLoading(true);
    try {
      const res = await bookExamSlot(id, slotId);
      setStudent(res);
      showToast('Entrance exam slot booked successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Unable to book exam slot.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loading type="skeleton-details" />;
  }

  if (!student) {
    return (
      <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', borderRadius: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>Application Not Found</h3>
        <p style={{ color: '#64748B', margin: '0.5rem 0 1.5rem', fontSize: '0.875rem' }}>
          We could not locate this application in your portal.
        </p>
        <Link href="/parent/students" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Back to Students
        </Link>
      </div>
    );
  }

  const isEditable = student.status === 'APPLICATION_CREATED';

  // Determine stage index (1 to 5)
  const currentStageIndex = JOURNEY_STAGES.findIndex(s => s.key === student.status) + 1 || 1;

  // Stage guidance details
  const getStageMeta = () => {
    switch (student.status) {
      case 'APPLICATION_CREATED':
        return {
          label: 'STAGE 1 OF 5',
          description: 'Student application has been created and verified.',
          nextStep: 'Complete registration fee payment to unlock exam slot booking.'
        };
      case 'REGISTRATION_FEE_PAID':
        return {
          label: 'STAGE 2 OF 5',
          description: 'Registration fee is confirmed. Student details are locked.',
          nextStep: 'Select and book an available entrance exam session.'
        };
      case 'SLOT_BOOKED':
        return {
          label: 'STAGE 3 OF 5',
          description: 'Entrance exam date and session time reserved.',
          nextStep: 'Attend the examination. Score will be recorded after evaluation.'
        };
      case 'EXAM_COMPLETED':
        return {
          label: 'STAGE 4 OF 5',
          description: 'Entrance examination evaluated and score confirmed.',
          nextStep: 'Admission Committee is reviewing performance for final course allocation.'
        };
      case 'ADMISSION_COMPLETED':
        return {
          label: 'STAGE 5 OF 5',
          description: 'Admission requirements completed successfully.',
          nextStep: 'Student enrollment and assigned course are fully confirmed.'
        };
      default:
        return {
          label: `STAGE ${currentStageIndex} OF 5`,
          description: 'Application is being processed.',
          nextStep: 'Review current progress.'
        };
    }
  };

  const stageMeta = getStageMeta();

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* 1. Back Navigation */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          href="/parent/students"
          style={{
            fontSize: '0.85rem',
            color: '#64748B',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            textDecoration: 'none',
            transition: 'color 0.15s ease'
          }}
          className="hover-text-primary"
        >
          <ArrowLeftIcon size={14} />
          <span>Back to Students</span>
        </Link>
      </div>

      {/* 2. Compact, Polished Student Header */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: '#F0FDFA',
              border: '1px solid #CCFBF1',
              color: '#0D9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              fontWeight: 700,
              flexShrink: 0
            }}
          >
            {(student.name || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#0F172A',
                letterSpacing: '-0.015em',
                margin: '0 0 0.25rem 0',
                lineHeight: 1.2
              }}
            >
              {student.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#64748B' }}>
              <span>Application #{student.applicationNumber || 'APP-2026-001'}</span>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <span style={{ fontWeight: 600, color: '#0F766E' }}>{student.applyingGrade}</span>
            </div>
          </div>
        </div>

        <StatusBadge status={student.status} />
      </div>

      {/* 3. Redesigned Admission Journey */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 700,
            color: '#64748B',
            marginBottom: '1.5rem'
          }}
        >
          ADMISSION JOURNEY
        </div>

        {/* Desktop / Responsive Horizontal Stepper */}
        <div className="journey-stepper-container">
          <style>{`
            .journey-stepper-container {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              position: relative;
              gap: 0.5rem;
              margin-bottom: 1.5rem;
            }
            .journey-line-bg {
              position: absolute;
              top: 16px;
              left: 10%;
              right: 10%;
              height: 2px;
              background: #E2E8F0;
              z-index: 1;
            }
            .journey-line-active {
              position: absolute;
              top: 16px;
              left: 10%;
              height: 2px;
              background: #0F9D8A;
              z-index: 2;
              transition: width 0.25s ease;
            }
            .journey-node {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              position: relative;
              z-index: 3;
            }
            .journey-badge {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              font-size: 0.8125rem;
              font-weight: 700;
              line-height: 1;
              margin: 0 auto 0.5rem auto;
              padding: 0;
              box-sizing: border-box;
              background: #FFFFFF;
              border: 1.5px solid #E2E8F0;
              color: #94A3B8;
              transition: all 0.15s ease;
              position: relative;
              z-index: 3;
            }
            .journey-badge span {
              display: flex;
              align-items: center;
              justify-content: center;
              line-height: 1;
              width: 100%;
              height: 100%;
              text-align: center;
              margin: 0;
              padding: 0;
            }
            .journey-badge.completed {
              background: #0F9D8A;
              border-color: #0F9D8A;
              color: #FFFFFF;
            }
            .journey-badge.current {
              background: #F0FDFA;
              border-color: #0F9D8A;
              color: #0F9D8A;
              box-shadow: 0 0 0 3px rgba(15, 157, 138, 0.15);
            }
            .journey-badge.upcoming {
              background: #F8FAFC;
              border-color: #E2E8F0;
              color: #94A3B8;
            }
            .journey-text {
              font-size: 0.8125rem;
              font-weight: 500;
              color: #64748B;
              line-height: 1.25;
            }
            .journey-text.completed {
              color: #1E293B;
              font-weight: 600;
            }
            .journey-text.current {
              color: #0F9D8A;
              font-weight: 700;
            }
            .journey-text.upcoming {
              color: #94A3B8;
            }
            @media (max-width: 680px) {
              .journey-stepper-container {
                display: flex;
                flex-direction: column;
                gap: 0.85rem;
                align-items: flex-start;
              }
              .journey-line-bg, .journey-line-active {
                display: none;
              }
              .journey-node {
                flex-direction: row;
                text-align: left;
                gap: 0.75rem;
              }
              .journey-badge {
                margin-bottom: 0;
                width: 28px;
                height: 28px;
                font-size: 0.75rem;
              }
            }
          `}</style>

          <div className="journey-line-bg" />
          <div
            className="journey-line-active"
            style={{
              width: `${Math.min(80, Math.max(0, ((currentStageIndex - 1) / (JOURNEY_STAGES.length - 1)) * 80))}%`
            }}
          />

          {JOURNEY_STAGES.map((st) => {
            const isCompleted = st.step < currentStageIndex;
            const isCurrent = st.step === currentStageIndex;
            const isUpcoming = st.step > currentStageIndex;

            return (
              <div key={st.key} className="journey-node">
                <div
                  className={`journey-badge ${
                    isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'
                  }`}
                >
                  {isCompleted ? (
                    <CheckIcon size={14} color="#FFFFFF" />
                  ) : (
                    <span>{st.step}</span>
                  )}
                </div>
                <div
                  className={`journey-text ${
                    isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'
                  }`}
                >
                  {st.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stage Information Banner */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#0F9D8A',
                background: '#E8F8F5',
                padding: '2px 8px',
                borderRadius: '4px'
              }}
            >
              {stageMeta.label}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#1E293B', fontWeight: 600 }}>
              {stageMeta.description}
            </span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.4 }}>
            <strong style={{ color: '#334155' }}>Next Step:</strong> {stageMeta.nextStep}
          </div>
        </div>
      </div>

      {/* 4. Active Stage Action / Summary Section */}
      <div style={{ marginBottom: '1.5rem' }}>
        {/* STAGE 1: Refined Registration Fee Section */}
        {student.status === 'APPLICATION_CREATED' && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderLeft: '4px solid #F59E0B',
              borderRadius: '10px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
                  Registration Fee
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, maxWidth: '480px' }}>
                  A one-time registration fee is required to continue the admission process and unlock exam scheduling.
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  ₹500
                </div>
                <span style={{ fontSize: '0.725rem', color: '#92400E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Payment Required
                </span>
              </div>
            </div>

            {/* Candidate Summary Line */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                background: '#F8FAFC',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ color: '#475569' }}>
                Candidate: <strong style={{ color: '#0F172A' }}>{student.name}</strong>
              </div>
              <div style={{ color: '#475569' }}>
                Applying for: <strong style={{ color: '#0F766E' }}>{student.applyingGrade}</strong>
              </div>
            </div>

            {/* Bottom Action Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#64748B' }}>
                <ShieldCheckIcon size={16} color="#0D9488" />
                <span>Secure payment via Razorpay</span>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRazorpayPayment}
                disabled={actionLoading}
                style={{
                  padding: '0.65rem 1.4rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: '6px'
                }}
              >
                <CreditCardIcon size={15} />
                <span>{actionLoading ? 'Connecting Razorpay...' : 'Pay ₹500'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: Fee Paid - Prompt to Book Slot */}
        {student.status === 'REGISTRATION_FEE_PAID' && (
          <div
            style={{
              background: '#F0FDFA',
              border: '1px solid #CCFBF1',
              borderLeft: '4px solid #0D9488',
              borderRadius: '10px',
              padding: '1.25rem 1.5rem',
              marginBottom: '1rem'
            }}
          >
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0F766E', fontWeight: 700 }}>
              NEXT STEP · ENTRANCE EXAM SCHEDULING
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0.25rem 0' }}>
              Choose Entrance Exam Slot
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#0F766E', margin: 0 }}>
              Registration fee confirmed. Student profile is locked for verification. Please select an available entrance exam session below.
            </p>
          </div>
        )}

        {/* STAGE 3: Slot Booked Confirmation */}
        {student.status === 'SLOT_BOOKED' && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderLeft: '4px solid #2563EB',
              borderRadius: '10px',
              padding: '1.25rem 1.5rem'
            }}
          >
            <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563EB', fontWeight: 700 }}>
              ENTRANCE EXAM SCHEDULED
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0.25rem 0 0.75rem 0' }}>
              {student.name} — {student.applyingGrade}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#1E293B', fontWeight: 600 }}>
                <CalendarIcon size={15} color="#0D9488" />
                <span>{student.examSlot?.date || '15 July 2026'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#1E293B', fontWeight: 600 }}>
                <ClockIcon size={15} color="#2563EB" />
                <span>{student.examSlot?.time || '10:00 AM – 11:00 AM'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#1E293B', fontWeight: 600 }}>
                <MapPinIcon size={15} color="#F59E0B" />
                <span>{student.examSlot?.location || 'Main Campus, Exam Hall A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 4: Exam Completed */}
        {student.status === 'EXAM_COMPLETED' && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderLeft: '4px solid #8B5CF6',
              borderRadius: '10px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7E22CE', fontWeight: 700 }}>
                EXAMINATION EVALUATION
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0.25rem 0' }}>
                Score Confirmed
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, maxWidth: '500px' }}>
                Entrance examination evaluated. The Admission Committee is currently reviewing the profile to assign final grade placement.
              </p>
            </div>
            <div style={{ textAlign: 'right', background: '#FAF5FF', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #F3E8FF' }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A' }}>
                {student.examScore ?? student.marksObtained ?? 85} <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>/ 100</span>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 5: Admission Completed */}
        {student.status === 'ADMISSION_COMPLETED' && (
          <div
            style={{
              background: '#F0FDFA',
              border: '1px solid #CCFBF1',
              borderLeft: '4px solid #0D9488',
              borderRadius: '10px',
              padding: '1.25rem 1.5rem'
            }}
          >
            <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0F766E', fontWeight: 700 }}>
              ADMISSION FINALIZED
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0.25rem 0' }}>
              Welcome to EduFlow School!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#0F766E', margin: '0 0 0.25rem 0' }}>
              Confirmed Admitted Grade: <strong style={{ color: '#0F172A' }}>{student.assignedCourse || student.applyingGrade}</strong>
            </p>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Formal student admission verified by administration. Application #{student.applicationNumber || 'APP-2026-001'}.
            </span>
          </div>
        )}
      </div>

      {/* 5. Clean Two-Column Information Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* CARD 1: PERSONAL INFORMATION */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid #F1F5F9'
            }}
          >
            <h2
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#0F172A',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              PERSONAL INFORMATION
            </h2>

            {isEditable && !isEditing && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(true)}
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
              >
                Edit
              </button>
            )}
            {!isEditable && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <LockIcon size={12} />
                <span>Locked</span>
              </span>
            )}
          </div>

          {isEditing ? (
            <StudentForm
              initialData={student}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              isLoading={actionLoading}
              isEdit={true}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748B' }}>Student Name</span>
                <strong style={{ color: '#0F172A' }}>{student.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748B' }}>Date of Birth</span>
                <span style={{ color: '#1E293B', fontWeight: 500 }}>{student.dob || student.dateOfBirth || '12 May 2018'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748B' }}>Gender</span>
                <span style={{ color: '#1E293B', fontWeight: 500 }}>{student.gender || 'Male'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748B' }}>Parent / Guardian</span>
                <span style={{ color: '#1E293B', fontWeight: 500 }}>{student.parentName || 'Parent'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748B' }}>Previous School</span>
                <span style={{ color: '#1E293B', fontWeight: 500 }}>{student.previousSchool || 'None specified'}</span>
              </div>
            </div>
          )}
        </div>

        {/* CARD 2: APPLICATION INFORMATION */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid #F1F5F9'
            }}
          >
            <h2
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#0F172A',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              APPLICATION INFORMATION
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              #{student.applicationNumber || 'APP-2026-001'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B' }}>Application ID</span>
              <strong style={{ color: '#0F172A' }}>#{student.applicationNumber || 'APP-2026-001'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B' }}>Applying Grade</span>
              <strong style={{ color: '#0F9D8A' }}>{student.applyingGrade}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B' }}>Application Status</span>
              <StatusBadge status={student.status} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B' }}>Registration Fee</span>
              <span style={{ fontWeight: 600, color: student.status !== 'APPLICATION_CREATED' ? '#0F9D8A' : '#D97706' }}>
                {student.status !== 'APPLICATION_CREATED' ? '₹500 · Paid' : '₹500 · Pending'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B' }}>Exam Slot</span>
              <span style={{ fontWeight: 500, color: student.examSlot?.date ? '#1E293B' : '#94A3B8' }}>
                {student.examSlot?.date ? `${student.examSlot.date} · ${student.examSlot.time || '10:00 AM'}` : 'Not Booked'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B' }}>Exam Score</span>
              <span style={{ fontWeight: 700, color: (student.examScore != null || student.marksObtained != null) ? '#0F172A' : '#94A3B8' }}>
                {(student.examScore != null || student.marksObtained != null) ? `${student.examScore ?? student.marksObtained} / 100` : 'Pending'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B' }}>Assigned Course</span>
              <span style={{ fontWeight: 700, color: student.assignedCourse ? '#0F9D8A' : '#94A3B8' }}>
                {student.assignedCourse || 'Pending Admission'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Slot Selection (when fee is paid & awaiting slot booking) */}
      {student.status === 'REGISTRATION_FEE_PAID' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Available Entrance Exam Sessions
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Select a date and time slot for {student.name}&apos;s entrance examination.
            </p>
          </div>

          <ExamSlotList
            slots={slots}
            onBookSlot={handleBookSlot}
            isLoading={actionLoading}
          />
        </div>
      )}
    </div>
  );
}
