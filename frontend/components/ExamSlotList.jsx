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

  const selectedSlot = slots.find((s) => (s._id || s.id) === selectedSlotId);

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
          Choose an available date and time. Once confirmed, your seat will be reserved.
        </p>
      </div>

      <style>{`
        .exam-slot-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .exam-slot-card {
          background: #FFFFFF;
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          padding: 1.25rem;
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
          background: #F7F9FA;
          border-color: #E5E7EB;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .slot-check-indicator {
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

        .selected-slot-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: #FFFFFF;
          border: 1.5px solid #0F9D8A;
          borderRadius: 10px;
          box-shadow: 0 2px 8px rgba(15, 157, 138, 0.08);
        }

        @media (max-width: 640px) {
          .exam-slot-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          .selected-slot-action-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 0.85rem;
            padding: 1rem;
          }
          .selected-slot-action-bar .btn {
            width: 100%;
            justify-content: center;
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
                  <CheckIcon size={12} />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
                <CalendarIcon size={15} color={isSelected ? '#0F9D8A' : '#667085'} />
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#172033' }}>
                  {slot.date || '15 July'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                <ClockIcon size={14} color={isSelected ? '#0F9D8A' : '#667085'} />
                <span style={{ fontSize: '0.925rem', fontWeight: 600, color: isSelected ? '#087F71' : '#475569' }}>
                  {slot.time || '10:00 AM'}
                </span>
              </div>

              <div style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: isSelected ? '1px solid #BFECE4' : '1px solid #F1F5F9'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isFull ? '#667085' : '#0F9D8A',
                  backgroundColor: isFull ? '#E5E7EB' : '#E8F8F5',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {isFull ? 'Unavailable' : 'Available'}
                </span>

                <span style={{ fontSize: '0.75rem', color: '#667085' }}>
                  {isFull ? 'Full' : `${seatsLeft} seats left`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Slot Confirmation Bar */}
      {selectedSlot && (
        <div className="selected-slot-action-bar">
          <div>
            <div style={{ fontSize: '0.725rem', color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Selected Slot
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#172033', marginTop: '0.15rem' }}>
              {selectedSlot.date} · {selectedSlot.time}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#0F9D8A', fontWeight: 500, marginTop: '0.1rem' }}>
              Venue: {selectedSlot.location || 'Main Campus, Exam Hall A'}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.25rem' }}
            disabled={isLoading}
            onClick={() => onBookSlot(selectedSlot._id || selectedSlot.id)}
          >
            {isLoading ? 'Confirming...' : 'Confirm Slot'}
          </button>
        </div>
      )}
    </div>
  );
}
