'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageProvider';

const translations = {
  he: {
    title: 'העלאת אישור ועדה מקומית',
    subtitle: 'העלו את אישור הועדה המקומית כדי להתחיל',
    dropzone: 'גררו קובץ לכאן או לחצו לבחירה',
    fileTypes: 'PDF עד 10MB',
    uploading: 'מעלה קובץ...',
    error: 'שגיאה בהעלאת הקובץ',
    continue: 'המשך',
    back: 'חזרה',
    selected: 'קובץ נבחר:',
    onlyPdf: 'רק קבצי PDF מותרים',
    removeFile: 'הסר',
    pleaseSelect: 'נא לבחור קובץ אישור ועדה מקומית',
    nextSteps: 'השלבים הבאים:',
    willNeed: 'תצטרכו להעלות:',
    invoices: 'חשבוניות מס',
  },
  en: {
    title: 'Upload Local Committee Approval',
    subtitle: 'Upload your local committee approval to get started',
    dropzone: 'Drag file here or click to select',
    fileTypes: 'PDF up to 10MB',
    uploading: 'Uploading file...',
    error: 'Error uploading file',
    continue: 'Continue',
    back: 'Back',
    selected: 'Selected file:',
    onlyPdf: 'Only PDF files are allowed',
    removeFile: 'Remove',
    pleaseSelect: 'Please select a local committee approval file',
    nextSteps: 'Next Steps:',
    willNeed: 'You will need to upload:',
    invoices: 'Tax Invoices',
  },
};

interface LocalCommitteeApprovalProps {
  onApprovalUploaded: (file: File) => void;
  onBack: () => void;
}

export default function LocalCommitteeApproval({ 
  onApprovalUploaded,
  onBack,
}: LocalCommitteeApprovalProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    
    // Validate file type - only PDF
    if (selectedFile.type !== 'application/pdf') {
      setError(t.onlyPdf);
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(language === 'he' ? 'קובץ גדול מדי' : 'File too large');
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  const handleContinue = () => {
    if (!file) {
      setError(t.pleaseSelect);
      return;
    }

    onApprovalUploaded(file);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          {t.title}
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          {t.subtitle}
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 ${
            isDragging
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileSelect}
            accept=".pdf"
          />

          <div className="text-center">
            {/* Upload Icon */}
            <div className="mb-6">
              <svg
                className="mx-auto w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            {file ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-4">{t.selected}</p>
              </div>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {t.dropzone}
                </p>
                <p className="text-sm text-gray-500">{t.fileTypes}</p>
              </>
            )}
          </div>
        </div>

        {/* Selected File */}
        {file && (
          <div className="mt-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <svg className="w-8 h-8 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="ms-4 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                {t.removeFile}
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={onBack}
            className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-200"
          >
            {t.back}
          </button>
          <button
            onClick={handleContinue}
            disabled={!file}
            className="flex-1 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:bg-gray-900"
          >
            {t.continue}
          </button>
        </div>
      </div>
    </div>
  );
}

