'use client';

import { LanguageProvider } from '@/components/LanguageProvider';
import AdminLoginForm from '@/components/AdminLoginForm';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AdminLoginPage() {
  return (
    <LanguageProvider>
      <AdminLoginForm />
      <LanguageSwitcher />
    </LanguageProvider>
  );
}

