'use client';

import React from 'react';

export default function StatCard({ title, value, icon, subtitle, trendColor }) {
  return (
    <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </span>
        {icon && (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569'
          }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: trendColor || '#0F172A', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        {value}
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.8125rem', color: '#94A3B8', marginTop: '0.45rem' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
