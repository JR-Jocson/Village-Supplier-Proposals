'use client';

import { LanguageProvider } from '@/components/LanguageProvider';
import UploadPage from '@/components/UploadPage';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Upload() {
  return (
    <LanguageProvider>
      <UploadPage />
      <LanguageSwitcher />
    </LanguageProvider>
  );
}







