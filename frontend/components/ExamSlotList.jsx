'use client';

import React, { useState } from 'react';
import { CalendarIcon, ClockIcon, CheckIcon, MapPinIcon } from './Icons';

export default function ExamSlotList({
  slots = [],
  currentSlot = null,
  onBookSlot,
  isLoading = false
}) {
  const [selectedSlotId, setSelectedSlotId] = useState(currentSlot?._id || currentSlot?.id || null);

  // If already booked
  if (currentSlot) {
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#E8F8F5',
            color: '#0F9D8A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem'
          }}>
            <CheckIcon size={14} />
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#667085', fontWeight: 700 }}>
              Confirmed Exam Slot
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#172033' }}>
              Entrance Examination
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          backgroundColor: '#F7F9FA',
          padding: '1.25rem',
          borderRadius: '8px',
          border: '1px solid #E5E7EB'
        }}>
          <div>
            <div style={{ fontSize: '0.725rem', color: '#667085', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Exam Date</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#172033', marginTop: '0.2rem' }}>{currentSlot.date}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', color: '#667085', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Scheduled Time</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#172033', marginTop: '0.2rem' }}>{currentSlot.time}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', color: '#667085', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Venue / Location</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#172033', marginTop: '0.2rem' }}>{currentSlot.location || 'Main Campus, Exam Hall A'}</div>
          </div>
        </div>

        <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: '#667085', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>ℹ</span>
          <span>Please arrive 15 minutes before the scheduled time with the student and a valid ID proof.</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#667085', fontWeight: 700 }}>
          Available Slots
        </div>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#172033', marginTop: '0.15rem' }}>
          Select an Entrance Exam Session
        </div>
        <p style={{ fontSize: '0.84rem', color: '#667085', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
          Tap on your preferred slot card and click Confirm Slot directly on the card.
        </p>
      </div>

      <style>{`
        .exam-slot-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .exam-slot-card {
          background: #FFFFFF;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .exam-slot-card:hover:not(.disabled) {
          border-color: #0F9D8A;
          box-shadow: 0 4px 14px rgba(15, 157, 138, 0.1);
        }

        .exam-slot-card.selected {
          border: 2px solid #0F9D8A;
          background-color: #F0FDFA;
          box-shadow: 0 6px 18px rgba(15, 157, 138, 0.15);
        }

        .exam-slot-card.disabled {
          background: #F7F9FA;
          border-color: #E5E7EB;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .slot-check-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #0F9D8A;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(15, 157, 138, 0.3);
        }

        @media (max-width: 640px) {
          .exam-slot-grid {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }
        }
      `}</style>

      <div className="exam-slot-grid">
        {slots.map((slot) => {
          const slotId = slot._id || slot.id;
          const isSelected = selectedSlotId === slotId;
          const capacity = slot.capacity || 30;
          const booked = slot.bookedCount || 0;
          const seatsLeft = capacity - booked;
          const isFull = seatsLeft <= 0;

          return (
            <div
              key={slotId}
              className={`exam-slot-card ${isSelected ? 'selected' : ''} ${isFull ? 'disabled' : ''}`}
              onClick={() => {
                if (!isFull) setSelectedSlotId(slotId);
              }}
            >
              {isSelected && (
                <div className="slot-check-indicator">
                  <CheckIcon size={13} strokeWidth={2.5} />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                <CalendarIcon size={16} color={isSelected ? '#0F9D8A' : '#64748B'} />
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: isSelected ? '#0F766E' : '#172033' }}>
                  {slot.date || '15 July'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                <ClockIcon size={15} color={isSelected ? '#0F9D8A' : '#64748B'} />
                <span style={{ fontSize: '0.925rem', fontWeight: 600, color: isSelected ? '#087F71' : '#475569' }}>
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
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isFull ? '#64748B' : '#0F9D8A',
                  backgroundColor: isFull ? '#E5E7EB' : '#E8F8F5',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '5px'
                }}>
                  {isFull ? 'Unavailable' : 'Available'}
                </span>

                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                  {isFull ? 'Full' : `${seatsLeft} seats left`}
                </span>
              </div>

              {/* INLINE CONFIRM BUTTON: Rendered directly inside the selected card */}
              {isSelected && (
                <div style={{
                  marginTop: '0.85rem',
                  paddingTop: '0.85rem',
                  borderTop: '1.5px solid #CCFBF1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                }}>
                  <div style={{ fontSize: '0.775rem', color: '#0F766E', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
                    <MapPinIcon size={14} color="#0D9488" />
                    <span>Venue: {slot.location || 'Main Campus, Examination Center'}</span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      justifyContent: 'center',
                      borderRadius: '8px',
                      boxShadow: '0 3px 10px rgba(15, 157, 138, 0.3)'
                    }}
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookSlot(slotId);
                    }}
                  >
                    {isLoading ? 'Confirming Slot...' : 'Confirm Slot →'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
