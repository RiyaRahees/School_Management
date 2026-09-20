'use client';

import React from 'react';
import Link from 'next/link';

export default function EmptyState({
  title = 'No students yet',
  description = "You haven't submitted any student admission applications.",
  actionLabel = '+ Add Student',
  actionHref = '/parent/students/create',
  onAction
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        margin: '0 auto',
        maxWidth: '460px',
        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)'
      }}
    >
      {/* Education / student line icon with subtle teal circle */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#E8F8F5',
          color: '#0F9D8A',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          border: '1px solid #CCFBF1'
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#172033', margin: '0 0 0.35rem 0', letterSpacing: '-0.01em' }}>
        {title}
      </h3>

      <p style={{ color: '#667085', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 auto 1.25rem', maxWidth: '340px' }}>
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn-primary" style={{ textDecoration: 'none' }}>
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionHref && (
        <button type="button" onClick={onAction} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
