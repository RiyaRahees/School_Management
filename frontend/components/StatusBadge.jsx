'use client';

import React from 'react';

const STATUS_MAP = {
  APPLICATION_CREATED: {
    label: 'Application Created',
    dotColor: '#667085',
    bgColor: '#F8FAFC',
    textColor: '#334155',
    borderColor: '#E2E8F0'
  },
  REGISTRATION_FEE_PAID: {
    label: 'Registration Fee Paid',
    dotColor: '#F79009',
    bgColor: '#FFFAEB',
    textColor: '#B54708',
    borderColor: '#FEDF89'
  },
  SLOT_BOOKED: {
    label: 'Exam Slot Booked',
    dotColor: '#0F9D8A',
    bgColor: '#E8F8F5',
    textColor: '#087F71',
    borderColor: '#CCFBF1'
  },
  EXAM_COMPLETED: {
    label: 'Exam Completed',
    dotColor: '#0BA5EC',
    bgColor: '#F0F9FF',
    textColor: '#026AA2',
    borderColor: '#B9E6FE'
  },
  ADMISSION_COMPLETED: {
    label: 'Admission Completed',
    dotColor: '#12B76A',
    bgColor: '#ECFDF3',
    textColor: '#027A48',
    borderColor: '#A6F4C5'
  }
};

export default function StatusBadge({ status, size = 'normal' }) {
  const config = STATUS_MAP[status] || {
    label: status || 'Pending',
    dotColor: '#94A3B8',
    bgColor: '#F8FAFC',
    textColor: '#475569',
    borderColor: '#E5E7EB'
  };

  const isSmall = size === 'small';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: isSmall ? '0.15rem 0.5rem' : '0.225rem 0.65rem',
        borderRadius: '9999px',
        backgroundColor: config.bgColor,
        color: config.textColor,
        border: `1px solid ${config.borderColor}`,
        fontSize: isSmall ? '0.725rem' : '0.75rem',
        fontWeight: 500,
        letterSpacing: '0.01em',
        lineHeight: 1.25,
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.dotColor,
          flexShrink: 0
        }}
      />
      <span>{config.label}</span>
    </span>
  );
}
