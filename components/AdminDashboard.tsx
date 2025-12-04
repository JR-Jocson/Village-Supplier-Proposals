'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import type { AdminSession } from '@/lib/auth';

const translations = {
  he: {
    dashboard: 'לוח בקרה למנהלים',
    welcome: 'שלום',
    logout: 'התנתק',
    loggingOut: 'מתנתק...',
    totalProposals: 'סה״כ הצעות',
    pendingReview: 'ממתינות לבדיקה',
    approved: 'אושרו',
    welcomeTitle: 'ברוך הבא ללוח הבקרה',
    welcomeMessage: 'מערכת ניהול הצעות ספקים לקיבוצים. כאן תוכל לנהל ולעקוב אחר כל ההצעות במערכת.',
    moreFeatures: 'תכונות נוספות יתווספו בקרוב...',
  },
  en: {
    dashboard: 'Admin Dashboard',
    welcome: 'Welcome',
    logout: 'Logout',
    loggingOut: 'Logging out...',
    totalProposals: 'Total Proposals',
    pendingReview: 'Pending Review',
    approved: 'Approved',
    welcomeTitle: 'Welcome to the Dashboard',
    welcomeMessage: 'Village supplier proposal management system. Here you can manage and track all proposals in the system.',
    moreFeatures: 'More features coming soon...',
  },
};

interface AdminDashboardProps {
  session: AdminSession;
}

export default function AdminDashboard({ session }: AdminDashboardProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t.dashboard}
              </h1>
              <p className="text-base text-gray-600 mt-1">
                {t.welcome}, {session.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.loggingOut : t.logout}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {t.totalProposals}
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-3">
                  -
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {t.pendingReview}
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-3">
                  -
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {t.approved}
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-3">
                  -
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="text-center max-w-2xl mx-auto py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t.welcomeTitle}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {t.welcomeMessage}
          </p>
          <p className="mt-8 text-sm text-gray-400">
            {t.moreFeatures}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400">
        <p>© 2025 {language === 'he' ? 'הצעות פרויקטים לקיבוצים' : 'Village Project Proposals'}. {language === 'he' ? 'כל הזכויות שמורות' : 'All rights reserved'}.</p>
      </footer>
    </div>
  );
}

