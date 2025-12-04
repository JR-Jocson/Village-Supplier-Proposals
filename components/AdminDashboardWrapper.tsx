'use client';

import { LanguageProvider } from './LanguageProvider';
import AdminDashboard from './AdminDashboard';
import LanguageSwitcher from './LanguageSwitcher';
import type { AdminSession } from '@/lib/auth';

interface AdminDashboardWrapperProps {
  session: AdminSession;
}

export default function AdminDashboardWrapper({ session }: AdminDashboardWrapperProps) {
  return (
    <LanguageProvider>
      <AdminDashboard session={session} />
      <LanguageSwitcher />
    </LanguageProvider>
  );
}

