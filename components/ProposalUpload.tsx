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
    submitterInfo: 'פרטי השולח',
    submitterName: 'שם השולח',
    submitterNamePlaceholder: 'הזן את שם השולח',
    submitterEmail: 'אימייל השולח',
    submitterEmailPlaceholder: 'הזן את כתובת האימייל',
    submitterPhone: 'טלפון השולח',
    submitterPhonePlaceholder: 'הזן את מספר הטלפון',
    kibbutzName: 'שם הקיבוץ',
    requiredField: 'שדה חובה',
    invalidEmail: 'כתובת אימייל לא תקינה',
    invalidPhone: 'מספר טלפון לא תקין',
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
    submitterInfo: 'Submitter Information',
    submitterName: 'Submitter Name',
    submitterNamePlaceholder: 'Enter submitter name',
    submitterEmail: 'Submitter Email',
    submitterEmailPlaceholder: 'Enter email address',
    submitterPhone: 'Submitter Phone',
    submitterPhonePlaceholder: 'Enter phone number',
    kibbutzName: 'Kibbutz Name',
    requiredField: 'Required field',
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Invalid phone number',
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
  const [submitterName, setSubmitterName] = useState<string>('');
  const [submitterEmail, setSubmitterEmail] = useState<string>('');
  const [submitterPhone, setSubmitterPhone] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleProposalUpload = (index: number, file: File) => {
    const newFiles = [...proposalFiles];
    newFiles[index] = file;
    setProposalFiles(newFiles);
  };

  const handleTenderUpload = (file: File) => {
    setTenderFile(file);
  };

  const validateForm = () => {
    const errors: { name?: string; email?: string; phone?: string } = {};
    
    if (!submitterName.trim()) {
      errors.name = t.requiredField;
    }
    
    if (!submitterEmail.trim()) {
      errors.email = t.requiredField;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) {
      errors.email = t.invalidEmail;
    }
    
    if (!submitterPhone.trim()) {
      errors.phone = t.requiredField;
    } else if (!/^[\d\s\-\+\(\)]+$/.test(submitterPhone)) {
      errors.phone = t.invalidPhone;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const allFilesUploaded = () => {
    const proposalsUploaded = proposalFiles.every(file => file !== null);
    const tenderUploaded = !requirements.tender || tenderFile !== null;
    return proposalsUploaded && tenderUploaded;
  };

  const isFormValid = () => {
    return allFilesUploaded() && validateForm();
  };

  const handleSubmit = async () => {
    if (!allFilesUploaded() || !validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create FormData with all project information and files
      const formData = new FormData();
      formData.append('kibbutzName', selectedVillage);
      formData.append('submitterName', submitterName);
      formData.append('submitterEmail', submitterEmail);
      formData.append('submitterPhone', submitterPhone);
      if (invoicePrice !== null) {
        formData.append('invoicePrice', invoicePrice.toString());
      }

      // Add invoice file
      if (invoiceFile) {
        formData.append('invoiceFile', invoiceFile);
      }

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

      // Submit to API
      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit project');
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
        {/* Submitter Information Form */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {t.submitterInfo}
          </h2>
          
          <div className="space-y-4">
            {/* Kibbutz Name (read-only, already selected) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t.kibbutzName}
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-700">
                {selectedVillage}
              </div>
            </div>

            {/* Submitter Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t.submitterName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={submitterName}
                onChange={(e) => {
                  setSubmitterName(e.target.value);
                  if (formErrors.name) {
                    setFormErrors({ ...formErrors, name: undefined });
                  }
                }}
                placeholder={t.submitterNamePlaceholder}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  formErrors.name
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-gray-900'
                }`}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            {/* Submitter Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t.submitterEmail} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={submitterEmail}
                onChange={(e) => {
                  setSubmitterEmail(e.target.value);
                  if (formErrors.email) {
                    setFormErrors({ ...formErrors, email: undefined });
                  }
                }}
                placeholder={t.submitterEmailPlaceholder}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  formErrors.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-gray-900'
                }`}
                dir="ltr"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* Submitter Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t.submitterPhone} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={submitterPhone}
                onChange={(e) => {
                  setSubmitterPhone(e.target.value);
                  if (formErrors.phone) {
                    setFormErrors({ ...formErrors, phone: undefined });
                  }
                }}
                placeholder={t.submitterPhonePlaceholder}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  formErrors.phone
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-gray-900'
                }`}
                dir="ltr"
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
              )}
            </div>
          </div>
        </div>

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

        {/* Error Message */}
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            onClick={onReset}
            disabled={isSubmitting}
            className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.startOver}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allFilesUploaded() || !submitterName.trim() || !submitterEmail.trim() || !submitterPhone.trim() || isSubmitting}
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

