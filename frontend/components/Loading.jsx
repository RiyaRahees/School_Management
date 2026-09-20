'use client';

import React from 'react';

export default function Loading({ type = 'dashboard-skeleton', text = 'Loading...' }) {
  // Styles for Shimmer Skeleton
  const shimmerStyle = {
    background: 'linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%)',
    backgroundSize: '200% 100%',
    animation: 'skeletonShimmer 1.5s infinite ease-in-out',
    borderRadius: '8px'
  };

  if (type === 'skeleton-cards') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', width: '100%', marginBottom: '1.5rem' }}>
        <style>{`
          @keyframes skeletonShimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ ...shimmerStyle, width: '40%', height: '14px' }} />
              <div style={{ ...shimmerStyle, width: '32px', height: '32px', borderRadius: '10px' }} />
            </div>
            <div style={{ ...shimmerStyle, width: '55%', height: '32px' }} />
            <div style={{ ...shimmerStyle, width: '70%', height: '12px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'skeleton-table') {
    return (
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', width: '100%' }}>
        <style>{`
          @keyframes skeletonShimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
        {/* Header placeholder */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ ...shimmerStyle, width: '25%', height: '22px' }} />
          <div style={{ ...shimmerStyle, width: '120px', height: '36px', borderRadius: '10px' }} />
        </div>
        {/* Table Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem 0',
              borderBottom: i < 5 ? '1px solid #F1F5F9' : 'none'
            }}
          >
            <div style={{ ...shimmerStyle, width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ ...shimmerStyle, flex: 2, height: '16px' }} />
            <div style={{ ...shimmerStyle, flex: 1.5, height: '16px' }} />
            <div style={{ ...shimmerStyle, flex: 1, height: '24px', borderRadius: '12px' }} />
            <div style={{ ...shimmerStyle, width: '70px', height: '32px', borderRadius: '8px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'skeleton-details') {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <style>{`
          @keyframes skeletonShimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
        {/* Top Banner */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '60%' }}>
              <div style={{ ...shimmerStyle, width: '56px', height: '56px', borderRadius: '14px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div style={{ ...shimmerStyle, width: '50%', height: '22px' }} />
                <div style={{ ...shimmerStyle, width: '30%', height: '14px' }} />
              </div>
            </div>
            <div style={{ ...shimmerStyle, width: '120px', height: '36px', borderRadius: '10px' }} />
          </div>
        </div>

        {/* Two Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ ...shimmerStyle, width: '40%', height: '20px', marginBottom: '0.5rem' }} />
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0' }}>
                <div style={{ ...shimmerStyle, width: '35%', height: '14px' }} />
                <div style={{ ...shimmerStyle, width: '45%', height: '14px' }} />
              </div>
            ))}
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ ...shimmerStyle, width: '45%', height: '20px', marginBottom: '0.5rem' }} />
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.6rem 0' }}>
                <div style={{ ...shimmerStyle, width: '28px', height: '28px', borderRadius: '50%' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <div style={{ ...shimmerStyle, width: '50%', height: '14px' }} />
                  <div style={{ ...shimmerStyle, width: '30%', height: '12px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Full Portal / Dashboard Skeleton
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#F8FAFC', display: 'flex' }}>
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* Main Skeleton Content */}
      <div style={{ flex: 1, padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header Placeholder */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '35%' }}>
            <div style={{ ...shimmerStyle, width: '70%', height: '26px' }} />
            <div style={{ ...shimmerStyle, width: '95%', height: '14px' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ ...shimmerStyle, width: '40px', height: '40px', borderRadius: '10px' }} />
            <div style={{ ...shimmerStyle, width: '130px', height: '40px', borderRadius: '10px' }} />
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ ...shimmerStyle, width: '40%', height: '14px' }} />
                <div style={{ ...shimmerStyle, width: '32px', height: '32px', borderRadius: '10px' }} />
              </div>
              <div style={{ ...shimmerStyle, width: '50%', height: '30px' }} />
              <div style={{ ...shimmerStyle, width: '65%', height: '12px' }} />
            </div>
          ))}
        </div>

        {/* Big Showcase & Table Placeholders */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ ...shimmerStyle, width: '45%', height: '22px' }} />
            <div style={{ ...shimmerStyle, width: '100%', height: '120px', borderRadius: '12px' }} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ ...shimmerStyle, flex: 1, height: '40px', borderRadius: '10px' }} />
              <div style={{ ...shimmerStyle, flex: 1, height: '40px', borderRadius: '10px' }} />
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ ...shimmerStyle, width: '40%', height: '22px' }} />
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                <div style={{ ...shimmerStyle, width: '40px', height: '40px', borderRadius: '10px' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ ...shimmerStyle, width: '60%', height: '15px' }} />
                  <div style={{ ...shimmerStyle, width: '35%', height: '12px' }} />
                </div>
                <div style={{ ...shimmerStyle, width: '65px', height: '26px', borderRadius: '12px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
