'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Loading from '../../components/Loading';

export default function ParentLayout({ children }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const userRole = (user?.role || '').toLowerCase();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userRole === 'admission_team') {
        router.push('/admission/dashboard');
      }
    }
  }, [user, loading, userRole, router]);

  if (loading || !user || userRole !== 'parent') {
    return <Loading type="dashboard-skeleton" />;
  }

  // Generate dynamic page title & breadcrumbs
  let title = 'Dashboard';
  let subtitle = "Track your children's admission progress here.";
  let breadcrumb = 'Parent Portal / Dashboard';

  if (pathname.includes('/students/create')) {
    title = 'Create Student Application';
    subtitle = "Enter the student's details to start the admission process.";
    breadcrumb = 'Parent Portal / Students / Create';
  } else if (pathname.includes('/students/')) {
    title = 'Student Application Details';
    subtitle = 'View admission timeline, payment, and entrance exam status.';
    breadcrumb = 'Parent Portal / Students / Details';
  } else if (pathname.includes('/students')) {
    title = 'Students';
    subtitle = 'Manage student applications and entrance exam booking.';
    breadcrumb = 'Parent Portal / Students';
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
