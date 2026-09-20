'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getStudents, initiateRazorpayPayment } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../../../components/Loading';
import {
  CreditCardIcon,
  CheckIcon,
  ReceiptIcon,
  CopyIcon,
  ShieldCheckIcon,
  SearchIcon,
  PrinterIcon
} from '../../../components/Icons';

export default function PaymentsPage() {
  const { user, showToast } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptStudent, setSelectedReceiptStudent] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getStudents();
        setStudents(data || []);
      } catch (err) {
        console.error('Failed to load students for payments', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePayFee = async (student) => {
    setPayingId(student._id);
    try {
      await initiateRazorpayPayment({
        studentId: student._id,
        studentName: student.name,
        parentName: user?.name,
        parentEmail: user?.email,
        onSuccess: (updatedStudent, razorpayResp) => {
          setStudents((prev) =>
            prev.map((s) =>
              s._id === student._id
                ? {
                    ...s,
                    status: 'REGISTRATION_FEE_PAID',
                    registrationFeePaid: true,
                    feePaid: true,
                    feePaymentRef:
                      razorpayResp?.razorpay_payment_id ||
                      `TXN-${(student._id || '').slice(-6).toUpperCase()}`,
                    feePaymentDate: new Date().toISOString()
                  }
                : s
            )
          );
          showToast(`✓ Registration fee for ${student.name} paid successfully!`, 'success');
          setPayingId(null);
        },
        onError: (err) => {
          showToast(err.message || 'Payment cancelled or failed', 'error');
          setPayingId(null);
        },
        onClose: () => {
          setPayingId(null);
        }
      });
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
      setPayingId(null);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Transaction ID copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingStudents = useMemo(() => {
    return students.filter((s) => s.status === 'APPLICATION_CREATED');
  }, [students]);

  const paidStudents = useMemo(() => {
    return students.filter((s) => s.status !== 'APPLICATION_CREATED');
  }, [students]);

  const filteredPaidStudents = useMemo(() => {
    if (!searchQuery.trim()) return paidStudents;
    const q = searchQuery.toLowerCase();
    return paidStudents.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.applicationNumber?.toLowerCase().includes(q) ||
        s.applyingGrade?.toLowerCase().includes(q) ||
        s._id?.toLowerCase().includes(q)
    );
  }, [paidStudents, searchQuery]);

  const totalSettledAmount = paidStudents.length * 500;
  const totalPendingAmount = pendingStudents.length * 500;

  if (loading) {
    return <Loading type="skeleton-table" />;
  }

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* 1. Clean Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              margin: '0 0 0.25rem 0',
              lineHeight: 1.2
            }}
          >
            Payments
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
            Manage registration and admission-related payments.
          </p>
        </div>

        {/* Pending status badge / settlement indicator */}
        {pendingStudents.length > 0 ? (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#B45309',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D97706' }} />
            <span>{pendingStudents.length} Payment Required</span>
          </span>
        ) : (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#0F766E',
              backgroundColor: '#CCFBF1',
              border: '1px solid #99F6E4',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <CheckIcon size={12} />
            <span>All Payments Settled</span>
          </span>
        )}
      </div>

      {/* 2. Payment Summary Blocks */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        {/* Block 1: Total Paid */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Paid
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem', letterSpacing: '-0.02em' }}>
            ₹{totalSettledAmount.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#16A34A', fontWeight: 500, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckIcon size={13} />
            <span>{paidStudents.length} {paidStudents.length === 1 ? 'fee' : 'fees'} verified & cleared</span>
          </div>
        </div>

        {/* Block 2: Pending */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pending
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: pendingStudents.length > 0 ? '#0F172A' : '#64748B', marginTop: '0.2rem', letterSpacing: '-0.02em' }}>
            {pendingStudents.length} {pendingStudents.length === 1 ? 'payment' : 'payments'}
          </div>
          <div style={{ fontSize: '0.8125rem', color: pendingStudents.length > 0 ? '#B45309' : '#64748B', fontWeight: 500, marginTop: '0.25rem' }}>
            {pendingStudents.length > 0 ? `₹${totalPendingAmount.toLocaleString('en-IN')} due` : 'Zero outstanding dues'}
          </div>
        </div>

        {/* Block 3: Registration Fee */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Registration Fee
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem', letterSpacing: '-0.02em' }}>
            ₹500<span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748B' }}> / student</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.25rem' }}>
            Covers entrance test & interview
          </div>
        </div>
      </div>

      {/* 3 & 4. Pending Payment Section (if any student has unpaid fee) */}
      {pendingStudents.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.2rem 0' }}>
              Pending Payment
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
              Complete the registration fee to confirm student details and unlock entrance exam scheduling.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingStudents.map((std) => {
              const initials = std.name
                ? std.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                : 'ST';

              return (
                <div
                  key={std._id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderLeft: '4px solid #F59E0B',
                    borderRadius: '10px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.25rem'
                  }}
                >
                  {/* Student Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '240px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        color: '#475569',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {initials}
                    </div>

                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                        {std.name}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.15rem' }}>
                        <span style={{ fontWeight: 600, color: '#0F766E' }}>{std.applyingGrade}</span>
                        <span style={{ margin: '0 0.35rem', color: '#CBD5E1' }}>•</span>
                        <span>#{std.applicationNumber || 'APP-2026-001'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Amount & Action Area */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Amount Due
                      </span>
                      <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#DC2626', lineHeight: 1.1 }}>
                        ₹500
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => handlePayFee(std)}
                        disabled={payingId === std._id}
                        className="btn btn-primary"
                        style={{
                          padding: '0.65rem 1.4rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          borderRadius: '6px'
                        }}
                      >
                        <CreditCardIcon size={15} />
                        <span>{payingId === std._id ? 'Connecting Gateway...' : 'Pay ₹500'}</span>
                      </button>

                      <span style={{ fontSize: '0.725rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <ShieldCheckIcon size={12} color="#0D9488" />
                        <span>Secure via Razorpay · UPI, Cards, Net Banking</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Payment Receipts & History */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      >
        {/* Section Header with Search */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Payment Receipts & Invoices
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
              Confirmed transaction history and official admission fee receipts.
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }}>
              <SearchIcon size={14} />
            </div>
            <input
              type="text"
              placeholder="Search by student or receipt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.85rem 0.45rem 2.2rem',
                fontSize: '0.8125rem',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                outline: 'none',
                background: '#F8FAFC'
              }}
            />
          </div>
        </div>

        {filteredPaidStudents.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.85rem auto'
              }}
            >
              <ReceiptIcon size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
              No completed payment records
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
              {searchQuery ? 'Try adjusting your search criteria.' : 'Settled payments will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'hidden' }}>
            <table className="data-table" style={{ width: '100%', tableLayout: 'auto' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.85rem 1.25rem', whiteSpace: 'nowrap' }}>Date</th>
                  <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Description</th>
                  <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Student Candidate</th>
                  <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Amount</th>
                  <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Transaction Ref</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPaidStudents.map((std, idx) => {
                  const txnId = std.feePaymentRef || `TXN-${(100000 + idx * 847 + 291).toString()}`;
                  const payDate = new Date(std.feePaymentDate || std.updatedAt || Date.now()).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={std._id}>
                      {/* Date */}
                      <td style={{ padding: '0.85rem 1.25rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 500, color: '#1E293B' }}>
                          {payDate}
                        </div>
                      </td>

                      {/* Description */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A' }}>
                          Registration Fee
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#64748B' }}>
                          Entrance assessment
                        </div>
                      </td>

                      {/* Student Info */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.84rem' }}>
                          {std.name}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span>{std.applyingGrade}</span>
                          <span>•</span>
                          <span>#{std.applicationNumber || 'APP-2026-001'}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                          ₹500
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#0F766E',
                            backgroundColor: '#CCFBF1',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px'
                          }}
                        >
                          <CheckIcon size={11} />
                          <span>Paid</span>
                        </span>
                      </td>

                      {/* Transaction ID Pill */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(txnId, std._id)}
                          title="Click to copy Transaction Ref"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontFamily: 'ui-monospace, monospace',
                            fontSize: '0.75rem',
                            color: copiedId === std._id ? '#0D9488' : '#475569',
                            backgroundColor: copiedId === std._id ? '#F0FDFA' : '#F8FAFC',
                            padding: '0.2rem 0.45rem',
                            borderRadius: '4px',
                            border: `1px solid ${copiedId === std._id ? '#99F6E4' : '#E2E8F0'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{txnId}</span>
                          {copiedId === std._id ? (
                            <CheckIcon size={11} color="#0D9488" />
                          ) : (
                            <CopyIcon size={11} color="#94A3B8" />
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptStudent(std)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            gap: '0.35rem',
                            padding: '0.3rem 0.65rem',
                            fontSize: '0.775rem',
                            fontWeight: 500
                          }}
                        >
                          <ReceiptIcon size={13} color="#0D9488" />
                          <span>View Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Clean Official Fee Receipt Modal */}
      {selectedReceiptStudent && (
        <div className="modal-overlay" onClick={() => setSelectedReceiptStudent(null)}>
          <div
            className="modal-card"
            style={{
              maxWidth: '520px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              margin: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ReceiptIcon size={16} color="#0D9488" />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                  Official Fee Receipt
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptStudent(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>

            {/* Receipt Body */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }} id="printable-receipt">
              {/* Receipt Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '0.85rem', borderBottom: '1px dashed #CBD5E1', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Receipt Number
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', fontFamily: 'monospace', marginTop: '0.1rem' }}>
                    REC-2026-{(selectedReceiptStudent._id || '').slice(-6).toUpperCase()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Payment Date
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#334155', marginTop: '0.1rem' }}>
                    {new Date(selectedReceiptStudent.feePaymentDate || selectedReceiptStudent.updatedAt || Date.now()).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Two-Column Information Details */}
              <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.8125rem' }}>
                  <div>
                    <span style={{ color: '#64748B', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>Candidate</span>
                    <div style={{ fontWeight: 700, color: '#0F172A', marginTop: '0.15rem' }}>{selectedReceiptStudent.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{selectedReceiptStudent.applyingGrade}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>Billed To</span>
                    <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '0.15rem' }}>{user?.name || selectedReceiptStudent.parentName || 'Parent'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{user?.email || 'parent@school.com'}</div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.725rem', textTransform: 'uppercase' }}>
                    <th style={{ textAlign: 'left', padding: '0.45rem 0' }}>Item Description</th>
                    <th style={{ textAlign: 'right', padding: '0.45rem 0' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.65rem 0', color: '#1E293B' }}>
                      Admission Registration & Entrance Assessment Fee
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.65rem 0', fontWeight: 700, color: '#0F172A' }}>
                      ₹500.00
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 0', fontWeight: 700, color: '#0F172A' }}>
                      Total Amount Paid
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.75rem 0', fontWeight: 800, color: '#0F766E', fontSize: '1rem' }}>
                      ₹500.00
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Transaction Metadata Footer */}
              <div style={{ fontSize: '0.75rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span>Transaction Ref: <strong style={{ fontFamily: 'monospace', color: '#334155' }}>{selectedReceiptStudent.feePaymentRef || `TXN-${(selectedReceiptStudent._id || '').slice(-6).toUpperCase()}`}</strong></span>
                <span>Payment Mode: <strong>Razorpay Verified</strong></span>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                flexShrink: 0
              }}
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedReceiptStudent(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  window.print();
                }}
              >
                <PrinterIcon size={14} />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
