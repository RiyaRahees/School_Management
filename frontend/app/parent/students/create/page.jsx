'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createStudent } from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';
import StudentForm from '../../../../components/StudentForm';
import { ArrowLeftIcon } from '../../../../components/Icons';

export default function CreateStudentPage() {
  const router = useRouter();
  const { user, showToast } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverErrors, setServerErrors] = useState({});

  const handleCreate = async (formData) => {
    setLoading(true);
    setError('');
    setServerErrors({});
    try {
      const payload = {
        ...formData,
        parentId: user?.id || user?._id,
        parentName: user?.name,
        parentEmail: user?.email,
        parentPhone: user?.phone
      };

      const created = await createStudent(payload);
      showToast('Student application created successfully!', 'success');
      // Navigate directly to student details to guide the parent to fee payment
      router.push(`/parent/students/${created._id || created.id}`);
    } catch (err) {
      console.error('Student creation error:', err);
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        const mapped = {};
        err.errors.forEach((e) => {
          mapped[e.field] = e.message;
        });
        setServerErrors(mapped);
        setError(err.errors.map((e) => e.message).join('. '));
      } else {
        setError(err.message || 'Failed to create student application.');
      }
      showToast(err.message || 'Validation failed. Please review the form.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header with Navigation */}
      <div style={{ marginBottom: '1.75rem' }}>
        <Link
          href="/parent/students"
          style={{
            fontSize: '0.84rem',
            color: '#667085',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            textDecoration: 'none',
            marginBottom: '0.75rem',
            transition: 'color 0.15s ease'
          }}
        >
          <ArrowLeftIcon size={14} />
          <span>Back to Students</span>
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#172033', letterSpacing: '-0.02em', margin: '0 0 0.35rem 0' }}>
          Create Student Application
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#667085', margin: 0 }}>
          Enter the student&apos;s personal and academic details to begin the admission process.
        </p>
      </div>

      {/* Clear, Professional Error Banner */}
      {error && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          backgroundColor: '#FEF3F2',
          border: '1px solid #FECDCA',
          color: '#B42318',
          fontSize: '0.85rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#FEE4E2',
            color: '#D92D20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.8rem',
            flexShrink: 0
          }}>
            !
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>
              Please correct the following before continuing:
            </div>
            <div style={{ lineHeight: 1.45 }}>{error}</div>
          </div>
        </div>
      )}

      {/* High-End Form */}
      <StudentForm
        onSubmit={handleCreate}
        onCancel={() => router.push('/parent/students')}
        isLoading={loading}
        isEdit={false}
        serverErrors={serverErrors}
      />
    </div>
  );
}
