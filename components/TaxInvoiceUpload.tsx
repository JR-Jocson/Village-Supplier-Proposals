'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageProvider';

const translations = {
  he: {
    title: 'העלאת חשבונית מס',
    subtitle: 'העלו את חשבונית המס שלכם כדי להתחיל',
    dropzone: 'גררו קובץ לכאן או לחצו לבחירה',
    fileTypes: 'PDF, JPG, PNG עד 10MB',
    analyzing: 'מנתח את החשבונית...',
    error: 'שגיאה בניתוח החשבונית',
    upload: 'העלה חשבונית',
    selected: 'קובץ נבחר:',
  },
  en: {
    title: 'Upload Tax Invoice',
    subtitle: 'Upload your tax invoice to get started',
    dropzone: 'Drag file here or click to select',
    fileTypes: 'PDF, JPG, PNG up to 10MB',
    analyzing: 'Analyzing invoice...',
    error: 'Error analyzing invoice',
    upload: 'Upload Invoice',
    selected: 'Selected file:',
  },
};

interface TaxInvoiceUploadProps {
  onAnalyzed: (price: number, file: File) => void;
  selectedVillage: string;
}

export default function TaxInvoiceUpload({ onAnalyzed, selectedVillage }: TaxInvoiceUploadProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
  };

  const validateAndSetFile = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError(language === 'he' ? 'סוג קובץ לא נתמך' : 'Unsupported file type');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(language === 'he' ? 'הקובץ גדול מדי' : 'File too large');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('invoice', file);

      // TODO: Replace with actual API endpoint
      // For now, simulating API call with mock data
      const response = await fetch('/api/analyze-invoice', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze invoice');
      }

      const data = await response.json();
      
      // Call the parent callback with the price
      onAnalyzed(data.price, file);
    } catch (err) {
      console.error('Error analyzing invoice:', err);
      setError(t.error);
      
      // TEMPORARY: Mock response for development
      // Remove this and uncomment the throw below when API is ready
      setTimeout(() => {
        const mockPrice = Math.random() * 200000; // Random price for testing
        onAnalyzed(mockPrice, file);
      }, 2000);
      
      // throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
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
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={isAnalyzing}
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            {file ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{t.selected}</p>
                <p className="text-base font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
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

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || isAnalyzing}
          className="w-full mt-8 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:bg-gray-900"
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-3">
              <svg
                className="animate-spin w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t.analyzing}
            </span>
          ) : (
            t.upload
          )}
        </button>
      </div>
    </div>
  );
}

