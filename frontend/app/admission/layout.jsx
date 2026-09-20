'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Loading from '../../components/Loading';

export default function AdmissionLayout({ children }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const userRole = (user?.role || '').toLowerCase();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userRole !== 'admission_team') {
        router.push('/parent/dashboard');
      }
    }
  }, [user, loading, userRole, router]);

  if (loading || !user || userRole !== 'admission_team') {
    return <Loading type="dashboard-skeleton" />;
  }

  let title = 'Admission Dashboard';
  let subtitle = 'Manage student applications and admission progress.';
  let breadcrumb = 'Admission Team / Dashboard';

  if (pathname.includes('/applications/')) {
    title = 'Candidate Application Review';
    subtitle = 'Evaluate entrance exam scores and assign final courses.';
    breadcrumb = 'Admission Team / Applications / Review';
  } else if (pathname.includes('/applications')) {
    title = 'Candidate Applications';
    subtitle = 'All student applications across admission stages.';
    breadcrumb = 'Admission Team / Applications';
  }

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Header
          title={title}
          subtitle={subtitle}
          breadcrumb={breadcrumb}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="content-container">
          {children}
        </main>
      </div>
    </div>
  );
}
