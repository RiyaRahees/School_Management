'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        const role = (user.role || '').toLowerCase();
        if (role === 'admission_team') {
          router.replace('/admission/dashboard');
        } else {
          router.replace('/parent/dashboard');
        }
      } else {
        router.replace('/register');
      }
    }
  }, [user, loading, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
      <Loading text="Redirecting to Register..." />
    </div>
  );
}


