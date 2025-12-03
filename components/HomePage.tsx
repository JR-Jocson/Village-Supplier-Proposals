'use client';

import { useLanguage } from './LanguageProvider';

const translations = {
  he: {
    title: {
      line1: 'הצעות פרויקטים',
      line2: 'לרשויות מקומיות',
    },
    subtitle: 'פלטפורמה פשוטה ויעילה להעלאת ואימות הצעות פרויקטים כפריים',
    cta: 'התחל עכשיו',
    tagline: 'מחבר בין יישובים כפריים לרשויות מקומיות',
    footer: '© 2025 הצעות פרויקטים כפריים. כל הזכויות שמורות.',
  },
  en: {
    title: {
      line1: 'Village Project',
      line2: 'Proposals',
    },
    subtitle: 'A simple and efficient platform for uploading and verifying rural project proposals',
    cta: 'Get Started',
    tagline: 'Connecting rural villages with local authorities',
    footer: '© 2025 Village Project Proposals. All rights reserved.',
  },
};

export default function HomePage() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 sm:px-8 lg:px-12">
        <div className="max-w-4xl w-full text-center">
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6">
            {t.title.line1}
            <br />
            {t.title.line2}
          </h1>
          
          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <a
              href="/upload"
              className="inline-flex items-center gap-3 px-10 py-5 text-lg font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>{t.cta}</span>
              <svg 
                className={`w-5 h-5 ${language === 'he' ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                />
              </svg>
            </a>
          </div>

          {/* Optional subtle tagline */}
          <p className="mt-16 text-sm text-gray-400">
            {t.tagline}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}

