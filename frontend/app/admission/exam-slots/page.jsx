'use client';

import React, { useEffect, useState } from 'react';
import { getAllAdminExamSlots, createExamSlot } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../../../components/Loading';
import EmptyState from '../../../components/EmptyState';
import { CalendarIcon, ClockIcon, PlusIcon, CheckIcon } from '../../../components/Icons';

export default function AdminExamSlotsPage() {
  const { showToast } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New slot form state
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('10:00 AM');
  const [formEndTime, setFormEndTime] = useState('11:00 AM');
  const [formCapacity, setFormCapacity] = useState('15');
  const [formError, setFormError] = useState('');

  const fetchSlots = async () => {
    try {
      const data = await getAllAdminExamSlots();
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load admin slots', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleOpenModal = () => {
    // Default date suggestion
    setFormDate('');
    setFormStartTime('10:00 AM');
    setFormEndTime('11:00 AM');
    setFormCapacity('15');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError('');
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formDate.trim()) {
      setFormError('Exam date is required.');
      return;
    }

    const inputD = new Date(formDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(inputD.getTime()) || inputD < today) {
      setFormError('Exam date cannot be in the past. Please select an upcoming date.');
      return;
    }

    if (!formStartTime.trim()) {
      setFormError('Start time is required.');
      return;
    }
    if (!formEndTime.trim()) {
      setFormError('End time is required.');
      return;
    }
    const capNum = Number(formCapacity);
    if (isNaN(capNum) || capNum <= 0) {
      setFormError('Capacity must be a positive number greater than 0.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      // Format date nicely if input is YYYY-MM-DD
      let formattedDate = formDate.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
        const d = new Date(formattedDate);
        formattedDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      }

      const newSlot = await createExamSlot({
        date: formattedDate,
        startTime: formStartTime.trim(),
        endTime: formEndTime.trim(),
        capacity: capNum
      });

      setSlots(prev => [newSlot, ...prev]);
      showToast(`Exam slot for ${formattedDate} (${formStartTime.trim()}) created successfully!`, 'success');
      handleCloseModal();
    } catch (err) {
      setFormError(err.message || 'Failed to create exam slot.');
      showToast(err.message || 'Slot creation failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading type="skeleton-table" />;
  }

  // Calculate statistics
  const totalSlots = slots.length;
  const totalCapacity = slots.reduce((acc, s) => acc + (Number(s.capacity) || 0), 0);
  const totalBooked = slots.reduce((acc, s) => acc + (Number(s.bookedCount) || 0), 0);
  const totalAvailable = slots.reduce((acc, s) => acc + (Number(s.availableSeats) || 0), 0);

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F9D8A', textTransform: 'uppercase', letterSpacing: '0.06em', backgroundColor: '#E8F8F5', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              ADMISSION TEAM
            </span>
            <span style={{ fontSize: '0.8rem', color: '#667085' }}>• Schedule Management</span>
          </div>
          <h1 className="page-title" style={{ margin: 0 }}>
            Exam Slot Management
          </h1>
          <p className="page-subtitle">
            Create and manage entrance assessment sessions. Available slots will be visible to parents for booking.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="btn btn-primary"
        >
          <PlusIcon size={16} />
          <span>Create New Slot</span>
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Total Slots */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>Total Exam Slots</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#E8F8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F9D8A' }}>
              <CalendarIcon size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#172033' }}>
            {totalSlots.toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: '0.25rem' }}>Active assessment sessions</div>
        </div>

        {/* Total Capacity */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>Total Seat Capacity</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7' }}>
              <CheckIcon size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#172033' }}>
            {totalCapacity}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: '0.25rem' }}>Across all sessions</div>
        </div>

        {/* Booked Candidates */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>Booked Candidates</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#FEF0C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F79009' }}>
              <ClockIcon size={15} color="#F79009" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#172033' }}>
            {totalBooked}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: '0.25rem' }}>Confirmed exam bookings</div>
        </div>

        {/* Remaining Seats */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085' }}>Remaining Vacancies</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#ECFDF3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#12B76A' }}>
              <CheckIcon size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F9D8A' }}>
            {totalAvailable}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: '0.25rem' }}>Seats open for parents</div>
        </div>
      </div>

      {/* Slots List Table */}
      {slots.length === 0 ? (
        <EmptyState
          title="No Exam Slots Created Yet"
          description="Create predefined examination dates and times with seat capacities so parents can book assessment slots."
          actionLabel="+ Create First Slot"
          onAction={handleOpenModal}
        />
      ) : (
        <div className="table-container" style={{ overflowX: 'auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Date</th>
                <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Time Session</th>
                <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Seat Capacity</th>
                <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Booked Count</th>
                <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Available Seats</th>
                <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => {
                const cap = Number(slot.capacity) || 10;
                const booked = Number(slot.bookedCount) || 0;
                const available = Math.max(0, cap - booked);
                const isFull = available <= 0;

                return (
                  <tr key={slot._id || slot.id}>
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: '#E8F8F5',
                          color: '#0F9D8A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          <CalendarIcon size={15} />
                        </div>
                        <span style={{ fontWeight: 700, color: '#172033', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                          {slot.date}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.84rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <ClockIcon size={14} color="#667085" />
                        <span>{slot.time || `${slot.startTime} – ${slot.endTime}`}</span>
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600, color: '#172033', fontSize: '0.85rem' }}>
                        {cap} seats
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600, color: booked > 0 ? '#F79009' : '#667085', fontSize: '0.85rem' }}>
                        {booked} booked
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontWeight: 700,
                        color: isFull ? '#F04438' : '#0F9D8A',
                        backgroundColor: isFull ? '#FEF3F2' : '#E8F8F5',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        whiteSpace: 'nowrap'
                      }}>
                        {available} seats left
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '12px',
                        backgroundColor: isFull ? '#FEF3F2' : '#ECFDF3',
                        color: isFull ? '#B42318' : '#027A48',
                        whiteSpace: 'nowrap'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: isFull ? '#EF4444' : '#12B76A',
                          flexShrink: 0
                        }} />
                        <span>{isFull ? 'Full' : 'Available'}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE SLOT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#0F9D8A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  NEW ASSESSMENT SESSION
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#172033', margin: '0.2rem 0 0 0' }}>
                  Create Entrance Exam Slot
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{ fontSize: '1.25rem', color: '#94A3B8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: '1.5rem' }}>
              {formError && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#FEF3F2',
                  border: '1px solid #FECDCA',
                  color: '#B42318',
                  fontSize: '0.84rem',
                  marginBottom: '1.25rem'
                }}>
                  ⚠ {formError}
                </div>
              )}

              {/* Date Input */}
              <div className="form-group">
                <label className="form-label" htmlFor="slot-date">
                  <span>Exam Date <span className="required">*</span></span>
                  <span style={{ fontSize: '0.725rem', color: '#64748B' }}>e.g. 17 July or pick date</span>
                </label>
                <input
                  id="slot-date"
                  type="date"
                  className="form-control"
                  min={new Date().toISOString().split('T')[0]}
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              {/* 2-Column: Start Time & End Time */}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="start-time">
                    <span>Start Time <span className="required">*</span></span>
                  </label>
                  <select
                    id="start-time"
                    className="form-select"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="end-time">
                    <span>End Time <span className="required">*</span></span>
                  </label>
                  <select
                    id="end-time"
                    className="form-select"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Capacity */}
              <div className="form-group">
                <label className="form-label" htmlFor="capacity-input">
                  <span>Candidate Capacity (Seats) <span className="required">*</span></span>
                  <span style={{ fontSize: '0.725rem', color: '#64748B' }}>Max bookings allowed</span>
                </label>
                <input
                  id="capacity-input"
                  type="number"
                  min="1"
                  max="100"
                  className="form-control"
                  placeholder="e.g. 20"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  <span>{submitting ? 'Creating...' : 'Create Exam Slot'}</span>
                  <PlusIcon size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
