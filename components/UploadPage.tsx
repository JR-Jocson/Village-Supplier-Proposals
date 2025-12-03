'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import VillageSelector from './VillageSelector';
import TaxInvoiceUpload from './TaxInvoiceUpload';
import ProposalUpload from './ProposalUpload';

const translations = {
  he: {
    backHome: 'חזרה לדף הבית',
  },
  en: {
    backHome: 'Back to Home',
  },
};

export default function UploadPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  const [invoicePrice, setInvoicePrice] = useState<number | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  const handleInvoiceAnalyzed = (price: number, file: File) => {
    setInvoicePrice(price);
    setInvoiceFile(file);
  };

  const handleReset = () => {
    setInvoicePrice(null);
    setInvoiceFile(null);
    setSelectedVillage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="text-sm font-medium">{t.backHome}</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        {invoicePrice === null ? (
          <div className="space-y-12">
            {/* Village Selector */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12">
                <VillageSelector
                  selectedVillage={selectedVillage}
                  onVillageSelect={setSelectedVillage}
                />
              </div>
            </div>

            {/* Tax Invoice Upload - only show if village is selected */}
            {selectedVillage && (
              <TaxInvoiceUpload 
                onAnalyzed={handleInvoiceAnalyzed}
                selectedVillage={selectedVillage}
              />
            )}
          </div>
        ) : (
          <ProposalUpload 
            invoicePrice={invoicePrice} 
            invoiceFile={invoiceFile!}
            selectedVillage={selectedVillage}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}

