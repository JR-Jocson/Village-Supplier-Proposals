'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageProvider';

const translations = {
  he: {
    title: 'העלאת חשבוניות מס',
    subtitle: 'העלו את כל חשבוניות המס של הפרויקט',
    invoice: 'חשבונית מס',
    invoices: 'חשבוניות מס',
    dragOrClick: 'גררו קובץ או לחצו לבחירה',
    uploaded: 'הועלה',
    continue: 'המשך',
    back: 'חזרה',
    invoiceInstructions: 'העלו לפחות חשבונית מס אחת',
  },
  en: {
    title: 'Upload Tax Invoices',
    subtitle: 'Upload all tax invoices for the project',
    invoice: 'Tax Invoice',
    invoices: 'Tax Invoices',
    dragOrClick: 'Drag file or click to select',
    uploaded: 'Uploaded',
    continue: 'Continue',
    back: 'Back',
    invoiceInstructions: 'Upload at least one tax invoice',
  },
};

interface InvoiceUploadStepProps {
  onInvoicesUploaded: (files: File[]) => void;
  onBack: () => void;
}

export default function InvoiceUploadStep({
  onInvoicesUploaded,
  onBack,
}: InvoiceUploadStepProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const [invoiceFiles, setInvoiceFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf');
    setInvoiceFiles(prev => [...prev, ...pdfFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    setInvoiceFiles(prev => [...prev, ...pdfFiles]);
    e.target.value = '';
  };

  const removeInvoice = (indexToRemove: number) => {
    setInvoiceFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleContinue = () => {
    if (invoiceFiles.length === 0) return;
    onInvoicesUploaded(invoiceFiles);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          {t.title}
        </h1>
        <p className="text-lg text-gray-600">
          {t.subtitle}
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t.invoices}</h2>
          <p className="text-sm text-gray-600 mb-4">{t.invoiceInstructions}</p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
            isDragging
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileSelect}
            accept=".pdf"
            multiple
          />

          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600">{t.dragOrClick}</p>
          </div>
        </div>

        {/* Uploaded Files List */}
        {invoiceFiles.length > 0 && (
          <div className="space-y-2">
            {invoiceFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB • {t.uploaded}</p>
                </div>
                <button
                  onClick={() => removeInvoice(index)}
                  className="ms-2 text-red-600 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={onBack}
            className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-200"
          >
            {t.back}
          </button>
          <button
            onClick={handleContinue}
            disabled={invoiceFiles.length === 0}
            className="flex-1 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:bg-gray-900"
          >
            {t.continue}
          </button>
        </div>
      </div>
    </div>
  );
}

