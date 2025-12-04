'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageProvider';

const translations = {
  he: {
    title: 'העלאת חשבוניות והצעות מחיר',
    subtitle: 'העלו את החשבוניות והצעות המחיר שלכם',
    invoice: 'חשבונית מס',
    invoices: 'חשבוניות מס',
    proposal: 'הצעת מחיר',
    proposals: 'הצעות מחיר',
    tenderDoc: 'מסמך מכרז',
    chargeNotice: 'מסמך הודעת חיוב',
    dragOrClick: 'גררו קובץ או לחצו לבחירה',
    uploaded: 'הועלה',
    submit: 'שלח הצעה',
    back: 'חזרה לעריכה',
    startOver: 'התחל מחדש',
    invoiceInstructions: 'העלו לפחות חשבונית מס אחת',
    proposalInstructions1: 'הצעת מחיר אחת נדרשת עבור סכומים מתחת ל-5,500₪',
    proposalInstructions2: 'שתי הצעות מחיר נדרשות עבור סכומים מתחת ל-159,000₪',
    proposalInstructions3: '4 הצעות מחיר ומסמך מכרז נדרשים עבור סכומים מעל 159,000₪',
    priceDetected: 'סכום הפרויקט:',
    priceChangedWarning: 'שים לב: שינוי המחיר ידרוש העלאת קבצים מחדש',
    additionalDocuments: 'מסמכים נוספים',
    approvals: 'אישורים',
    laApproval: 'התקבל אישור LA',
    avivaApproval: 'התקבל אישור אביבה (לבניינים ציבוריים)',
    yes: 'כן',
    no: 'לא',
  },
  en: {
    title: 'Upload Invoices and Proposals',
    subtitle: 'Upload your tax invoices and price proposals',
    invoice: 'Tax Invoice',
    invoices: 'Tax Invoices',
    proposal: 'Price Proposal',
    proposals: 'Price Proposals',
    tenderDoc: 'Tender Document',
    chargeNotice: 'Charge Notice Document',
    dragOrClick: 'Drag file or click to select',
    uploaded: 'Uploaded',
    submit: 'Submit Proposal',
    back: 'Back to Edit',
    startOver: 'Start Over',
    invoiceInstructions: 'Upload at least one tax invoice',
    proposalInstructions1: 'One price proposal required for amounts below ₪5,500',
    proposalInstructions2: 'Two price proposals required for amounts below ₪159,000',
    proposalInstructions3: '4 price proposals and tender document required for amounts above ₪159,000',
    priceDetected: 'Project Amount:',
    priceChangedWarning: 'Note: Changing the price will require re-uploading files',
    additionalDocuments: 'Additional Documents',
    approvals: 'Approvals',
    laApproval: 'LA Approval received',
    avivaApproval: "Aviva's approval (for public buildings) received",
    yes: 'Yes',
    no: 'No',
  },
};

interface ProposalUploadProps {
  committeeApprovalFile: File;
  projectPrice: number;
  initialPriceThreshold: number | null;
  selectedVillage: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string;
  onBack: () => void;
  onReset: () => void;
}

export default function ProposalUpload({ 
  committeeApprovalFile,
  projectPrice,
  initialPriceThreshold,
  selectedVillage, 
  submitterName, 
  submitterEmail, 
  submitterPhone,
  onBack,
  onReset 
}: ProposalUploadProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const [invoiceFiles, setInvoiceFiles] = useState<File[]>([]);
  const [proposalFiles, setProposalFiles] = useState<(File | null)[]>([]);
  const [tenderFile, setTenderFile] = useState<File | null>(null);
  const [chargeNoticeFile, setChargeNoticeFile] = useState<File | null>(null);
  const [laApproval, setLaApproval] = useState<boolean | null>(null);
  const [avivaApproval, setAvivaApproval] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPriceChangeWarning, setShowPriceChangeWarning] = useState<boolean>(false);

  // Determine requirements based on provided price
  const getRequirements = () => {
    if (projectPrice < 5500) {
      return { proposals: 1, tender: false, message: t.proposalInstructions1, threshold: 1 };
    } else if (projectPrice < 159000) {
      return { proposals: 2, tender: false, message: t.proposalInstructions2, threshold: 2 };
    } else {
      return { proposals: 4, tender: true, message: t.proposalInstructions3, threshold: 3 };
    }
  };

  const requirements = getRequirements();

  // Check if price threshold has changed
  const hasThresholdChanged = initialPriceThreshold !== null && 
                              initialPriceThreshold !== requirements.threshold;

  // Initialize proposal files array based on requirements
  // Clear files if threshold changed
  useState(() => {
    if (hasThresholdChanged) {
      // Price threshold changed, clear all proposal files
      setProposalFiles(Array(requirements.proposals).fill(null));
      setTenderFile(null);
      setInvoiceFiles([]);
      setShowPriceChangeWarning(true);
    } else if (proposalFiles.length === 0) {
      // First time, initialize array
      setProposalFiles(Array(requirements.proposals).fill(null));
    } else if (proposalFiles.length !== requirements.proposals) {
      // Threshold changed, resize array
      setProposalFiles(Array(requirements.proposals).fill(null));
      setTenderFile(null);
    }
  });

  const handleInvoiceUpload = (file: File) => {
    setInvoiceFiles(prev => [...prev, file]);
  };

  const removeInvoice = (indexToRemove: number) => {
    setInvoiceFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleProposalUpload = (index: number, file: File) => {
    const newFiles = [...proposalFiles];
    newFiles[index] = file;
    setProposalFiles(newFiles);
  };

  const handleTenderUpload = (file: File) => {
    setTenderFile(file);
  };

  const handleChargeNoticeUpload = (file: File) => {
    setChargeNoticeFile(file);
  };

  const allFilesUploaded = () => {
    if (invoiceFiles.length === 0) return false;
    
    const proposalsUploaded = proposalFiles.every(file => file !== null);
    const tenderUploaded = !requirements.tender || tenderFile !== null;
    return proposalsUploaded && tenderUploaded;
  };

  const handleSubmit = async () => {
    if (!allFilesUploaded()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create FormData with all project information and files
      const formData = new FormData();
      formData.append('kibbutzName', selectedVillage);
      formData.append('submitterName', submitterName);
      formData.append('submitterEmail', submitterEmail);
      formData.append('submitterPhone', submitterPhone);
      formData.append('invoicePrice', projectPrice.toString());

      // Add committee approval file
      formData.append('committeeApprovalFile', committeeApprovalFile);

      // Add invoice files
      invoiceFiles.forEach((file, index) => {
        formData.append(`invoiceFile_${index}`, file);
      });

      // Add proposal files
      proposalFiles.forEach((file, index) => {
        if (file) {
          formData.append(`proposalFile_${index}`, file);
        }
      });

      // Add tender file if exists
      if (tenderFile) {
        formData.append('tenderFile', tenderFile);
      }

      // Add charge notice file if exists
      if (chargeNoticeFile) {
        formData.append('chargeNoticeFile', chargeNoticeFile);
      }

      // Add approvals
      if (laApproval !== null) {
        formData.append('laApproval', laApproval.toString());
      }
      if (avivaApproval !== null) {
        formData.append('avivaApproval', avivaApproval.toString());
      }

      // Submit to API
      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to submit project';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          console.error('API Error:', errorData);
        } catch (parseError) {
          // Response wasn't JSON, try to get text
          const errorText = await response.text();
          console.error('API Error (non-JSON):', errorText);
          errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Success - show message and reset form
      alert(language === 'he' ? 'ההצעה נשלחה בהצלחה!' : 'Proposal submitted successfully!');
      onReset();
      
    } catch (error) {
      console.error('Error submitting project:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : (language === 'he' ? 'שגיאה בשליחת ההצעה' : 'Error submitting proposal')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          {t.title}
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          {t.subtitle}
        </p>

        {/* Price Change Warning */}
        {showPriceChangeWarning && (
          <div className="inline-block mb-4 px-6 py-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ {t.priceChangedWarning}
            </p>
          </div>
        )}
      </div>

      {/* Upload Areas */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12 space-y-8">
        
        {/* Section 1: Tax Invoices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t.invoices}</h2>
            <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full">
              <span className="text-xs font-medium">{t.priceDetected}</span>
              <span className="text-sm font-bold">
                ₪{projectPrice.toLocaleString(language === 'he' ? 'he-IL' : 'en-US')}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">{t.invoiceInstructions}</p>

          {/* Invoice Upload Slot */}
          <MultiFileUploadSlot
            files={invoiceFiles}
            onFileAdd={handleInvoiceUpload}
            onFileRemove={removeInvoice}
            uploadedText={t.uploaded}
            dragText={t.dragOrClick}
          />
        </div>

        {/* Section 2: Price Proposals */}
        <div className="border-t border-gray-200 pt-8 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">{t.proposals}</h2>
          <p className="text-sm text-gray-600">{requirements.message}</p>

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
        </div>

        {/* Section 3: Additional Documents */}
        <div className="border-t border-gray-200 pt-8 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">{t.additionalDocuments}</h2>

          {/* Charge Notice Document */}
          <FileUploadSlot
            label={t.chargeNotice}
            file={chargeNoticeFile}
            onFileSelect={handleChargeNoticeUpload}
            uploadedText={t.uploaded}
            dragText={t.dragOrClick}
          />
        </div>

        {/* Section 4: Approvals */}
        <div className="border-t border-gray-200 pt-8 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">{t.approvals}</h2>

          {/* LA Approval */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              {t.laApproval}
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setLaApproval(true)}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  laApproval === true
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t.yes}
              </button>
              <button
                type="button"
                onClick={() => setLaApproval(false)}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  laApproval === false
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t.no}
              </button>
            </div>
          </div>

          {/* Aviva Approval */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              {t.avivaApproval}
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setAvivaApproval(true)}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  avivaApproval === true
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t.yes}
              </button>
              <button
                type="button"
                onClick={() => setAvivaApproval(false)}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  avivaApproval === false
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t.no}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.back}
          </button>
          <button
            onClick={onReset}
            disabled={isSubmitting}
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.startOver}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allFilesUploaded() || isSubmitting}
            className="flex-1 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:bg-gray-900"
          >
            {isSubmitting 
              ? (language === 'he' ? 'שולח...' : 'Submitting...')
              : t.submit
            }
          </button>
        </div>
      </div>
    </div>
  );
}

interface MultiFileUploadSlotProps {
  files: File[];
  onFileAdd: (file: File) => void;
  onFileRemove: (index: number) => void;
  uploadedText: string;
  dragText: string;
  disabled?: boolean;
}

function MultiFileUploadSlot({ 
  files, 
  onFileAdd, 
  onFileRemove, 
  uploadedText, 
  dragText,
  disabled 
}: MultiFileUploadSlotProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(file => {
      if (file.type === 'application/pdf') {
        onFileAdd(file);
      }
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(file => {
      if (file.type === 'application/pdf') {
        onFileAdd(file);
      }
    });
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
          isDragging
            ? 'border-gray-900 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileSelect}
          accept=".pdf"
          multiple
          disabled={disabled}
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
          <p className="text-sm text-gray-600">{dragText}</p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB • {uploadedText}</p>
              </div>
              <button
                onClick={() => onFileRemove(index)}
                disabled={disabled}
                className="ms-2 text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
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
