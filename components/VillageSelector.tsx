'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

const villages = [
  'איילת השחר',
  'ברעם',
  'גדות',
  'גונן',
  'דן',
  'דפנה',
  'הגושרים',
  'חולתה',
  'יפתח',
  'יראון',
  'כפר בלום',
  'כפר גלעדי',
  'כפר הנשיא',
  'כפר סאלד',
  'להבות הבשן',
  'מחניים',
  'מלכיה',
  'מנרה',
  'מעיין ברוך',
  'משגב עם',
  'נאות מרדכי',
  'סאסא',
  'עמיעד',
  'עמיר',
  'צבעון',
  'קדרים',
  'שדה נחמיה',
  'שמיר',
  'שניר',
];

const translations = {
  he: {
    label: 'בחר יישוב',
    placeholder: 'חפש יישוב...',
    selected: 'יישוב נבחר:',
    noResults: 'לא נמצאו תוצאות',
  },
  en: {
    label: 'Select Village',
    placeholder: 'Search village...',
    selected: 'Selected village:',
    noResults: 'No results found',
  },
};

interface VillageSelectorProps {
  selectedVillage: string | null;
  onVillageSelect: (village: string) => void;
}

export default function VillageSelector({ selectedVillage, onVillageSelect }: VillageSelectorProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter villages based on search term
  const filteredVillages = villages.filter(village =>
    village.includes(searchTerm)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleVillageSelect = (village: string) => {
    onVillageSelect(village);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== 'Escape') {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredVillages.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredVillages.length > 0) {
          handleVillageSelect(filteredVillages[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        {t.label}
      </label>

      {/* Selected Village Display */}
      {selectedVillage && (
        <div className="mb-3 p-4 bg-gray-900 text-white rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div>
              <p className="text-xs opacity-75">{t.selected}</p>
              <p className="font-semibold">{selectedVillage}</p>
            </div>
          </div>
          <button
            onClick={() => {
              onVillageSelect('');
              setSearchTerm('');
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={t.placeholder}
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-gray-900 focus:outline-none transition-colors text-lg"
          dir={language === 'he' ? 'rtl' : 'ltr'}
        />
        <div className="absolute top-1/2 -translate-y-1/2 end-4 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {filteredVillages.length > 0 ? (
            <ul>
              {filteredVillages.map((village, index) => (
                <li key={village}>
                  <button
                    onClick={() => handleVillageSelect(village)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-5 py-3 text-start transition-colors ${
                      index === highlightedIndex
                        ? 'bg-gray-900 text-white'
                        : 'hover:bg-gray-50 text-gray-900'
                    } ${index === 0 ? 'rounded-t-xl' : ''} ${
                      index === filteredVillages.length - 1 ? 'rounded-b-xl' : ''
                    }`}
                  >
                    <span className="font-medium">{village}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p>{t.noResults}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

