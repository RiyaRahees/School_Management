'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UnifiedStudentApplicationsPage from '../students/page';

export default function ApplicationsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/parent/students');
  }, [router]);

  return <UnifiedStudentApplicationsPage />;
}
