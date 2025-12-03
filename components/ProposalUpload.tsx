'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageProvider';

const translations = {
  he: {
    title: 'העלאת הצעות מחיר',
    priceDetected: 'מחיר שזוהה:',
    required: 'נדרש:',
    proposal: 'הצעת מחיר',
    proposals: 'הצעות מחיר',
    tenderDoc: 'מסמך מכרז',
    uploadProposals: 'העלו את הצעות המחיר',
    dragOrClick: 'גררו קובץ או לחצו לבחירה',
    uploaded: 'הועלה',
    submit: 'שלח הצעה',
    startOver: 'התחל מחדש',
    requirement1: 'הצעת מחיר אחת נדרשת עבור סכומים מתחת ל-5,500₪',
    requirement2: 'שתי הצעות מחיר נדרשות עבור סכומים מתחת ל-159,000₪',
    requirement3: '4 הצעות מחיר ומסמך מכרז נדרשים עבור סכומים מעל 159,000₪',
  },
  en: {
    title: 'Upload Price Proposals',
    priceDetected: 'Detected Price:',
    required: 'Required:',
    proposal: 'Price Proposal',
    proposals: 'Price Proposals',
    tenderDoc: 'Tender Document',
    uploadProposals: 'Upload your price proposals',
    dragOrClick: 'Drag file or click to select',
    uploaded: 'Uploaded',
    submit: 'Submit Proposal',
    startOver: 'Start Over',
    requirement1: 'One price proposal required for amounts below ₪5,500',
    requirement2: 'Two price proposals required for amounts below ₪159,000',
    requirement3: '4 price proposals and tender document required for amounts above ₪159,000',
  },
};

interface ProposalUploadProps {
  invoicePrice: number;
  invoiceFile: File;
  selectedVillage: string;
  onReset: () => void;
}

export default function ProposalUpload({ invoicePrice, invoiceFile, selectedVillage, onReset }: ProposalUploadProps) {
  const { language } = useLanguage();
  const t = translations[language];

  // Determine requirements based on price
  const getRequirements = () => {
    if (invoicePrice < 5500) {
      return { proposals: 1, tender: false, message: t.requirement1 };
    } else if (invoicePrice < 159000) {
      return { proposals: 2, tender: false, message: t.requirement2 };
    } else {
      return { proposals: 4, tender: true, message: t.requirement3 };
    }
  };

  const requirements = getRequirements();
  const [proposalFiles, setProposalFiles] = useState<(File | null)[]>(
    Array(requirements.proposals).fill(null)
  );
  const [tenderFile, setTenderFile] = useState<File | null>(null);

  const handleProposalUpload = (index: number, file: File) => {
    const newFiles = [...proposalFiles];
    newFiles[index] = file;
    setProposalFiles(newFiles);
  };

  const handleTenderUpload = (file: File) => {
    setTenderFile(file);
  };

  const allFilesUploaded = () => {
    const proposalsUploaded = proposalFiles.every(file => file !== null);
    const tenderUploaded = !requirements.tender || tenderFile !== null;
    return proposalsUploaded && tenderUploaded;
  };

  const handleSubmit = async () => {
    if (!allFilesUploaded()) return;

    // TODO: Implement submission logic
    console.log('Submitting:', {
      village: selectedVillage,
      invoiceFile,
      proposalFiles,
      tenderFile,
      invoicePrice,
    });

    alert(language === 'he' ? 'ההצעה נשלחה בהצלחה!' : 'Proposal submitted successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          {t.title}
        </h1>
        
        {/* Price Badge */}
        <div className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-full mb-4">
          <span className="text-sm font-medium">{t.priceDetected}</span>
          <span className="text-xl font-bold">
            ₪{invoicePrice.toLocaleString(language === 'he' ? 'he-IL' : 'en-US')}
          </span>
        </div>

        {/* Requirements Message */}
        <p className="text-base text-gray-600 mt-4">
          {requirements.message}
        </p>
      </div>

      {/* Upload Areas */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12 space-y-6">
        {/* Price Proposals */}
        {proposalFiles.map((file, index) => (
          <FileUploadSlot
            key={`proposal-${index}`}
            label={`${t.proposal} ${index + 1}`}
            file={file}
            onFileSelect={(file) => handleProposalUpload(index, file)}
            uploadedText={t.uploaded}
            dragText={t.dragOrClick}
          />
        ))}

        {/* Tender Document */}
        {requirements.tender && (
          <FileUploadSlot
            label={t.tenderDoc}
            file={tenderFile}
            onFileSelect={handleTenderUpload}
            uploadedText={t.uploaded}
            dragText={t.dragOrClick}
            highlight
          />
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            onClick={onReset}
            className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-200"
          >
            {t.startOver}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allFilesUploaded()}
            className="flex-1 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:bg-gray-900"
          >
            {t.submit}
          </button>
        </div>
      </div>
    </div>
  );
}

interface FileUploadSlotProps {
  label: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  uploadedText: string;
  dragText: string;
  highlight?: boolean;
}

function FileUploadSlot({ label, file, onFileSelect, uploadedText, dragText, highlight }: FileUploadSlotProps) {
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
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        {label}
      </label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
          isDragging
            ? 'border-gray-900 bg-gray-50'
            : highlight
            ? 'border-gray-900 bg-gray-50/50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileSelect}
          accept=".pdf,.jpg,.jpeg,.png"
        />

        {file ? (
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB • {uploadedText}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600">{dragText}</p>
          </div>
        )}
      </div>
    </div>
  );
}

