'use client';

import React from 'react';
import Link from 'next/link';

const STAGES = [
  { step: '01', key: 'APPLICATION_CREATED', title: 'Application Created', desc: 'Initial details submitted', order: 1 },
  { step: '02', key: 'REGISTRATION_FEE_PAID', title: 'Fee Paid', desc: 'Registration fee confirmed', order: 2 },
  { step: '03', key: 'SLOT_BOOKED', title: 'Slot Booked', desc: 'Entrance exam scheduled', order: 3 },
  { step: '04', key: 'EXAM_COMPLETED', title: 'Exam Completed', desc: 'Evaluation evaluated', order: 4 },
  { step: '05', key: 'ADMISSION_COMPLETED', title: 'Admission Completed', desc: 'Grade & course confirmed', order: 5 }
];

export default function StatusTimeline({
  currentStatus,
  studentId,
  isAdmissionTeam = false,
  onPayFee = null,
  showAction = true
}) {
  const currentStageObj = STAGES.find((s) => s.key === currentStatus) || STAGES[0];
  const currentOrder = currentStageObj.order;

  // Guidance card helper for Section 22 UX Rule
  const getWorkflowGuidance = () => {
    switch (currentStatus) {
      case 'APPLICATION_CREATED':
        return {
          badge: 'Stage 1 of 5',
          completedText: 'Student application has been created and verified.',
          nextActionText: 'Next Step: Complete registration fee payment to lock student details and enable exam slot booking.',
          buttonLabel: isAdmissionTeam ? null : 'Pay Registration Fee (₹500)',
          buttonHref: onPayFee || isAdmissionTeam ? null : `/parent/payments`,
          notice: 'Student details can be edited only while in this initial stage.'
        };
      case 'REGISTRATION_FEE_PAID':
        return {
          badge: 'Stage 2 of 5',
          completedText: 'Registration fee is verified. Student information is now locked for admissions audit.',
          nextActionText: 'Next Step: Select and book an available entrance exam time slot.',
          buttonLabel: isAdmissionTeam ? null : 'Book Exam Slot',
          buttonHref: isAdmissionTeam ? null : `/parent/exam-slots`,
          notice: 'Student details are permanently locked.'
        };
      case 'SLOT_BOOKED':
        return {
          badge: 'Stage 3 of 5',
          completedText: 'Entrance examination date & time slot have been reserved.',
          nextActionText: isAdmissionTeam
            ? 'Next Step: Record entrance test evaluation marks (0 – 100).'
            : 'Next Step: Attend the entrance examination. Admission team will record the score following the test.',
          buttonLabel: isAdmissionTeam ? 'Enter Exam Score' : null,
          buttonHref: isAdmissionTeam && studentId ? `/admission/applications/${studentId}` : null,
          notice: 'Only one exam slot is permitted per applicant.'
        };
      case 'EXAM_COMPLETED':
        return {
          badge: 'Stage 4 of 5',
          completedText: 'Entrance test evaluated and score confirmed.',
          nextActionText: isAdmissionTeam
            ? 'Next Step: Assign final admitted grade (Grade 1 – 4) to finalize admission.'
            : 'Next Step: Admission Committee is reviewing test performance for final course allocation.',
          buttonLabel: isAdmissionTeam ? 'Assign Course' : null,
          buttonHref: isAdmissionTeam && studentId ? `/admission/applications/${studentId}` : null,
          notice: 'Course assignment is pending admission committee decision.'
        };
      case 'ADMISSION_COMPLETED':
        return {
          badge: 'Stage 5 of 5 — Complete',
          completedText: 'Candidate has successfully completed all admission requirements.',
          nextActionText: 'Admission finalized! Assigned course and student enrollment are confirmed.',
          buttonLabel: null,
          buttonHref: null,
          notice: 'Formal student admission verified by administration.'
        };
      default:
        return {
          badge: 'In Progress',
          completedText: 'Application is being processed.',
          nextActionText: 'Please review milestones.',
          buttonLabel: null,
          buttonHref: null
        };
    }
  };

  const guidance = getWorkflowGuidance();

  return (
    <div style={{ width: '100%', margin: '0.5rem 0' }}>
      <style>{`
        .stepper-container {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          position: relative;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .stepper-track {
          position: absolute;
          top: 26px;
          left: 10%;
          right: 10%;
          height: 2px;
          background: #E5E7EB;
          z-index: 1;
        }

        .stepper-track-active {
          position: absolute;
          top: 26px;
          left: 10%;
          height: 2px;
          background: #0F9D8A;
          z-index: 2;
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .stepper-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 3;
        }

        .stepper-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8125rem;
          margin-bottom: 0.5rem;
          transition: all 0.2s ease;
          background: #FFFFFF;
          border: 2px solid #E5E7EB;
          color: #94A3B8;
        }

        .stepper-circle.completed {
          background: #0F9D8A;
          border-color: #0F9D8A;
          color: #FFFFFF;
        }

        .stepper-circle.current {
          background: #FFFFFF;
          border-color: #0F9D8A;
          color: #0F9D8A;
          box-shadow: 0 0 0 4px #E8F8F5;
        }

        .stepper-circle.pulse-dot::after {
          content: '';
          width: 8px;
          height: 8px;
          background-color: #0F9D8A;
          border-radius: 50%;
        }

        .stepper-title {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #64748B;
          margin-bottom: 0.15rem;
        }

        .stepper-title.active {
          color: #0F9D8A;
          font-weight: 700;
        }

        .stepper-title.completed {
          color: #0F172A;
        }

        @media (max-width: 768px) {
          .stepper-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          .stepper-track, .stepper-track-active {
            display: none;
          }
          .stepper-item {
            flex-direction: row;
            text-align: left;
            gap: 0.75rem;
          }
          .stepper-circle {
            margin-bottom: 0;
            width: 32px;
            height: 32px;
            font-size: 0.75rem;
          }
        }
      `}</style>

      {/* Modern Stepper Diagram */}
      <div className="stepper-container">
        {/* Background Track */}
        <div className="stepper-track" />
        {/* Active Progress Track */}
        <div
          className="stepper-track-active"
          style={{
            width: `${Math.min(100, Math.max(0, ((currentOrder - 1) / (STAGES.length - 1)) * 80))}%`
          }}
        />

        {STAGES.map((stage) => {
          const isCompleted = stage.order < currentOrder;
          const isCurrent = stage.order === currentOrder;

          return (
            <div key={stage.key} className="stepper-item">
              <div
                className={`stepper-circle ${
                  isCompleted ? 'completed' : isCurrent ? 'current pulse-dot' : ''
                }`}
              >
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : null}
              </div>

              <div
                className={`stepper-title ${
                  isCompleted ? 'completed' : isCurrent ? 'active' : ''
                }`}
              >
                {stage.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Guidance Card based on Section 22 UX Rules */}
      <div
        style={{
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '1.1rem 1.35rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#0F9D8A',
              background: '#E8F8F5',
              padding: '2px 8px',
              borderRadius: '9999px'
            }}>
              {guidance.badge}
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#172033', fontWeight: 600 }}>
              {guidance.completedText}
            </span>
          </div>
          <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.45 }}>
            {guidance.nextActionText}
          </div>
          {guidance.notice && (
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>
              ℹ {guidance.notice}
            </div>
          )}
        </div>

        {showAction && (
          onPayFee && currentStatus === 'APPLICATION_CREATED' ? (
            <button
              type="button"
              onClick={onPayFee}
              className="btn btn-primary"
              style={{ flexShrink: 0 }}
            >
              <span>Pay Registration Fee (₹500)</span>
              <span style={{ fontSize: '1rem' }}>→</span>
            </button>
          ) : guidance.buttonLabel && guidance.buttonHref ? (
            <Link
              href={guidance.buttonHref}
              className="btn btn-primary"
              style={{ textDecoration: 'none', flexShrink: 0 }}
            >
              <span>{guidance.buttonLabel}</span>
              <span style={{ fontSize: '1rem' }}>→</span>
            </Link>
          ) : null
        )}
      </div>
    </div>
  );
}
