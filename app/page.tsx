'use client';

import { LanguageProvider } from '@/components/LanguageProvider';
import HomePage from '@/components/HomePage';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Page() {
  return (
    <LanguageProvider>
      <HomePage />
      <LanguageSwitcher />
    </LanguageProvider>
  );
}


