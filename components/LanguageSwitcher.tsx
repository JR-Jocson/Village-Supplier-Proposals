'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageProvider';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleLanguageChange = (lang: 'he' | 'en') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 start-6 z-50">
      <div className="relative">
        {/* Language Options - Slides in from bottom */}
        <div
          className={`absolute bottom-full mb-3 transition-all duration-300 ease-out ${
            isOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden min-w-[140px]">
            <button
              onClick={() => handleLanguageChange('he')}
              className={`w-full px-5 py-3 text-start transition-colors ${
                language === 'he'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium">עברית</span>
            </button>
            <div className="h-px bg-gray-200" />
            <button
              onClick={() => handleLanguageChange('en')}
              className={`w-full px-5 py-3 text-start transition-colors ${
                language === 'en'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium">English</span>
            </button>
          </div>
        </div>

        {/* Main Button */}
        <button
          onClick={toggleOpen}
          className="flex items-center gap-2 px-5 py-3 bg-white text-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:scale-105"
          aria-label="Change language"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
          <span className="font-medium text-sm">
            {language === 'he' ? 'עברית' : 'English'}
          </span>
          <svg
            className={`w-4 h-4 text-gray-700 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
