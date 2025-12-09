'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

const translations = {
  he: {
    title: 'העלאת הצעות מחיר ומסמכי מכרז',
    subtitle: 'העלו את הצעות המחיר ומסמכי המכרז עבור כל חשבונית',
    invoice: 'חשבונית',
    proposal: 'הצעת מחיר',
    proposals: 'הצעות מחיר',
    tenderDoc: 'מסמך מכרז',
    chargeNotice: 'מסמך הודעת חיוב',
    dragOrClick: 'גררו קובץ או לחצו לבחירה',
    uploaded: 'הועלה',
    submit: 'שלח הצעה',
    back: 'חזרה לעריכה',
    startOver: 'התחל מחדש',
    proposalInstructions1: 'הצעת מחיר אחת נדרשת עבור סכומים מתחת ל-5,500₪',
    proposalInstructions2: 'שתי הצעות מחיר נדרשות עבור סכומים מתחת ל-159,000₪',
    proposalInstructions3: '4 הצעות מחיר ומסמך מכרז נדרשים עבור סכומים מעל 159,000₪',
    invoicePrice: 'מחיר החשבונית',
    additionalDocuments: 'מסמכים נוספים',
    additionalNotes: 'הערות נוספות',
    additionalNotesLabel: 'הערות נוספות (אופציונלי)',
    additionalNotesPlaceholder: 'הוסף כל מידע נוסף שתרצה לשתף',
    charactersRemaining: 'תווים נותרו',
    approvals: 'אישורים',
    laApproval: 'התקבל אישור LA',
    avivaApproval: 'התקבל אישור אביבה (לבניינים ציבוריים)',
    yes: 'כן',
    no: 'לא',
    allFilesRequired: 'יש להעלות את כל הקבצים הנדרשים',
  },
  en: {
    title: 'Upload Proposals and Tender Documents',
    subtitle: 'Upload price proposals and tender documents for each invoice',
    invoice: 'Invoice',
    proposal: 'Price Proposal',
    proposals: 'Price Proposals',
    tenderDoc: 'Tender Document',
    chargeNotice: 'Charge Notice Document',
    dragOrClick: 'Drag file or click to select',
    uploaded: 'Uploaded',
    submit: 'Submit Proposal',
    back: 'Back to Edit',
    startOver: 'Start Over',
    proposalInstructions1: 'One price proposal required for amounts below ₪5,500',
    proposalInstructions2: 'Two price proposals required for amounts below ₪159,000',
    proposalInstructions3: '4 price proposals and tender document required for amounts above ₪159,000',
    invoicePrice: 'Invoice Price',
    additionalDocuments: 'Additional Documents',
    additionalNotes: 'Additional Notes',
    additionalNotesLabel: 'Additional Notes (Optional)',
    additionalNotesPlaceholder: 'Add any additional information you would like to share',
    charactersRemaining: 'characters remaining',
    approvals: 'Approvals',
    laApproval: 'LA Approval received',
    avivaApproval: "Aviva's approval (for public buildings) received",
    yes: 'Yes',
    no: 'No',
    allFilesRequired: 'All required files must be uploaded',
  },
};

interface InvoiceData {
  file: File;
  price: number;
}

interface ProposalUploadProps {
  committeeApprovalFile: File;
  totalProjectCost: number;
  invoices: InvoiceData[];
  selectedVillage: string;
  projectName: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string;
  onBack: () => void;
  onReset: () => void;
}

// Calculate requirements based on invoice price
function getInvoiceRequirements(price: number) {
  if (price < 5500) {
    return { proposals: 1, tender: false, message: 'proposalInstructions1' };
  } else if (price < 159000) {
    return { proposals: 2, tender: false, message: 'proposalInstructions2' };
  } else {
    return { proposals: 4, tender: true, message: 'proposalInstructions3' };
  }
}

export default function ProposalUpload({ 
  committeeApprovalFile,
  totalProjectCost,
  invoices,
  selectedVillage,
  projectName,
  submitterName, 
  submitterEmail, 
  submitterPhone,
  onBack,
  onReset 
}: ProposalUploadProps) {
  const { language } = useLanguage();
  const t = translations[language];

  // State for each invoice's proposals and tender
  const [invoiceProposals, setInvoiceProposals] = useState<Map<number, (File | null)[]>>(new Map());
  const [invoiceTenders, setInvoiceTenders] = useState<Map<number, File | null>>(new Map());
  const [chargeNoticeFile, setChargeNoticeFile] = useState<File | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [laApproval, setLaApproval] = useState<boolean | null>(null);
  const [avivaApproval, setAvivaApproval] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize proposal arrays for each invoice
  useEffect(() => {
    const newProposals = new Map<number, (File | null)[]>();
    invoices.forEach((invoice, index) => {
      const requirements = getInvoiceRequirements(invoice.price);
      if (!newProposals.has(index)) {
        newProposals.set(index, Array(requirements.proposals).fill(null));
      }
    });
    setInvoiceProposals(newProposals);
  }, [invoices]);

  const handleProposalUpload = (invoiceIndex: number, proposalIndex: number, file: File) => {
    const newProposals = new Map(invoiceProposals);
    const invoiceProposalArray = [...(newProposals.get(invoiceIndex) || [])];
    invoiceProposalArray[proposalIndex] = file;
    newProposals.set(invoiceIndex, invoiceProposalArray);
    setInvoiceProposals(newProposals);
  };

  const handleTenderUpload = (invoiceIndex: number, file: File) => {
    const newTenders = new Map(invoiceTenders);
    newTenders.set(invoiceIndex, file);
    setInvoiceTenders(newTenders);
  };

  const handleChargeNoticeUpload = (file: File) => {
    setChargeNoticeFile(file);
  };

  const allFilesUploaded = () => {
    // Check each invoice has its required files
    for (let i = 0; i < invoices.length; i++) {
      const requirements = getInvoiceRequirements(invoices[i].price);
      const proposals = invoiceProposals.get(i) || [];
      
      // Check all proposals are uploaded
      if (proposals.length !== requirements.proposals || proposals.some(p => p === null)) {
        return false;
      }
      
      // Check tender if required
      if (requirements.tender && !invoiceTenders.get(i)) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!allFilesUploaded()) {
      setSubmitError(t.allFilesRequired);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create FormData with all project information and files
      const formData = new FormData();
      formData.append('kibbutzName', selectedVillage);
      formData.append('projectName', projectName);
      formData.append('submitterName', submitterName);
      formData.append('submitterEmail', submitterEmail);
      formData.append('submitterPhone', submitterPhone);
      formData.append('totalProjectCost', totalProjectCost.toString());
      
      // Add additional notes if provided
      if (additionalNotes.trim()) {
        formData.append('additionalNotes', additionalNotes.trim());
      }

      // Add committee approval file
      formData.append('committeeApprovalFile', committeeApprovalFile);

      // Add invoices with prices and their files
      invoices.forEach((invoice, invoiceIndex) => {
        formData.append(`invoice_${invoiceIndex}_file`, invoice.file);
        formData.append(`invoice_${invoiceIndex}_price`, invoice.price.toString());
        
        // Add proposals for this invoice
        const proposals = invoiceProposals.get(invoiceIndex) || [];
        proposals.forEach((proposalFile, proposalIndex) => {
          if (proposalFile) {
            formData.append(`invoice_${invoiceIndex}_proposal_${proposalIndex}`, proposalFile);
          }
        });
        
        // Add tender for this invoice if exists
        const tender = invoiceTenders.get(invoiceIndex);
        if (tender) {
          formData.append(`invoice_${invoiceIndex}_tender`, tender);
        }
      });

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
        const status = response.status;
        
        try {
          const errorData = await response.json();
          console.error('API Error Response:', {
            status,
            errorData,
            error: errorData.error,
            details: errorData.details,
            debugInfo: errorData.debugInfo,
          });
          
          // Try to get a meaningful error message
          errorMessage = errorData.details || errorData.error || errorMessage;
          
          // If we have debug info in development, include it
          if (errorData.debugInfo && process.env.NODE_ENV === 'development') {
            console.error('Debug Info:', errorData.debugInfo);
            errorMessage += ` (${errorData.debugInfo.message || ''})`;
          }
        } catch (parseError) {
          // Response wasn't JSON, try to get text
          const errorText = await response.text();
          console.error('API Error (non-JSON):', {
            status,
            errorText,
            parseError,
          });
          errorMessage = `Server error (${status}): ${errorText.substring(0, 200)}`;
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          {t.title}
        </h1>
        <p className="text-lg text-gray-600">
          {t.subtitle}
        </p>
      </div>

      {/* Upload Areas */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12 space-y-8">
        
        {/* Per-Invoice Sections */}
        {invoices.map((invoice, invoiceIndex) => {
          const requirements = getInvoiceRequirements(invoice.price);
          const proposals = invoiceProposals.get(invoiceIndex) || [];
          const tender = invoiceTenders.get(invoiceIndex) ?? null;

          return (
            <div key={invoiceIndex} className="border border-gray-200 rounded-2xl p-6 space-y-6">
              {/* Invoice Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t.invoice} {invoiceIndex + 1}: {invoice.file.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t.invoicePrice}: ₪{invoice.price.toLocaleString(language === 'he' ? 'he-IL' : 'en-US')}
                  </p>
                </div>
              </div>

              {/* Proposals Section */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-2">{t.proposals}</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {t[requirements.message as keyof typeof t]}
                  </p>
                </div>

                {/* Proposal Upload Slots */}
                {proposals.map((proposalFile, proposalIndex) => (
                  <FileUploadSlot
                    key={`invoice-${invoiceIndex}-proposal-${proposalIndex}`}
                    label={`${t.proposal} ${proposalIndex + 1}`}
                    file={proposalFile}
                    onFileSelect={(file) => handleProposalUpload(invoiceIndex, proposalIndex, file)}
                    uploadedText={t.uploaded}
                    dragText={t.dragOrClick}
                  />
                ))}

                {/* Tender Document */}
                {requirements.tender && (
                  <FileUploadSlot
                    label={t.tenderDoc}
                    file={tender}
                    onFileSelect={(file) => handleTenderUpload(invoiceIndex, file)}
                    uploadedText={t.uploaded}
                    dragText={t.dragOrClick}
                    highlight
                  />
                )}
              </div>
            </div>
          );
        })}

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

        {/* Section 4: Additional Notes */}
        <div className="border-t border-gray-200 pt-8 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">{t.additionalNotes}</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t.additionalNotesLabel}
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder={t.additionalNotesPlaceholder}
              maxLength={1000}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 transition-colors resize-none"
              dir={language === 'he' ? 'rtl' : 'ltr'}
            />
            <p className="mt-2 text-sm text-gray-500">
              {1000 - additionalNotes.length} {t.charactersRemaining}
            </p>
          </div>
        </div>

        {/* Section 5: Approvals */}
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
