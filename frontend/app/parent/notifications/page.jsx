'use client';

import React from 'react';
import { BellIcon, CheckIcon, CalendarIcon, CreditCardIcon } from '../../../components/Icons';

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: 'Entrance Exam Slot Confirmed',
      message: 'Arjun Kumar has been successfully scheduled for Grade 2 entrance exam on 15 July 2026 at 10:00 AM in Main Campus Exam Hall A.',
      time: '2 hours ago',
      type: 'exam',
      read: false
    },
    {
      id: 2,
      title: 'Registration Fee Receipt Generated',
      message: 'Payment of ₹500 for application #APP-2026-001 has been received. Receipt #REC-88412 is available.',
      time: 'Yesterday',
      type: 'payment',
      read: true
    },
    {
      id: 3,
      title: 'Application Created Successfully',
      message: 'New admission application filed for Arjun Kumar (Grade 2). Please complete registration payment to proceed.',
      time: '3 days ago',
      type: 'application',
      read: true
    },
    {
      id: 4,
      title: 'Welcome to EduFlow',
      message: 'Thank you for registering on EduFlow School Admission Portal. Our admissions desk is available for any guidance.',
      time: '5 days ago',
      type: 'system',
      read: true
    }
  ];

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 0.35rem 0' }}>
          Notifications
        </h1>
        <p style={{ fontSize: '0.925rem', color: '#64748B', margin: 0 }}>
          Stay informed with real-time application updates, schedule changes, and admission confirmations.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            className="card"
            style={{
              padding: '1.35rem 1.5rem',
              borderRadius: '14px',
              border: `1px solid ${n.read ? '#E2E8F0' : '#CCFBF1'}`,
              backgroundColor: n.read ? '#FFFFFF' : '#F0FDFA',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.25rem'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: n.type === 'exam' ? '#EFF6FF' : n.type === 'payment' ? '#F0FDFA' : '#FAF5FF',
              color: n.type === 'exam' ? '#2563EB' : n.type === 'payment' ? '#0D9488' : '#8B5CF6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {n.type === 'exam' && <CalendarIcon size={18} />}
              {n.type === 'payment' && <CreditCardIcon size={18} />}
              {n.type !== 'exam' && n.type !== 'payment' && <BellIcon size={18} />}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {n.title}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{n.time}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                {n.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
