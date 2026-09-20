'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { EduFlowLogo } from '../components/Icons';
import Loading from '../components/Loading';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const role = (user.role || '').toLowerCase();
      if (role === 'admission_team') {
        router.push('/admission/dashboard');
      } else {
        router.push('/parent/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading text="Loading EduFlow Admission Portal..." />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      backgroundColor: '#F8FAFC'
    }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '2.75rem 2.25rem', borderRadius: '18px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <EduFlowLogo size={44} showText={false} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          EDUFLOW
        </h1>
        <p style={{ fontSize: '0.825rem', color: '#0D9488', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
          School Admission Platform
        </p>
        <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '2rem', lineHeight: 1.6 }}>
          A modern, unified admission platform for parents and faculty. Track complete applicant journeys from registration to entrance assessments and course allocation.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link href="/login" className="btn btn-primary btn-block" style={{ padding: '0.75rem', fontSize: '0.925rem', justifyContent: 'center', textDecoration: 'none' }}>
            Sign In to Portal
          </Link>
          <Link href="/register" className="btn btn-secondary btn-block" style={{ padding: '0.75rem', fontSize: '0.925rem', justifyContent: 'center', textDecoration: 'none' }}>
            New Parent? Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
