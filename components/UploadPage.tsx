'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import VillageSelector from './VillageSelector';
import LocalCommitteeApproval from './LocalCommitteeApproval';
import InvoiceUploadStep from './InvoiceUploadStep';
import InvoicePriceInput from './InvoicePriceInput';
import ProposalUpload from './ProposalUpload';

const translations = {
  he: {
    backHome: 'חזרה לדף הבית',
    submitterInfo: 'פרטי השולח',
    submitterName: 'שם השולח',
    submitterNamePlaceholder: 'הזן את שם השולח',
    submitterEmail: 'אימייל השולח',
    submitterEmailPlaceholder: 'הזן את כתובת האימייל',
    submitterPhone: 'טלפון השולח',
    submitterPhonePlaceholder: 'הזן את מספר הטלפון',
    projectName: 'שם הפרויקט',
    projectNameLabel: 'שם הפרויקט כפי שמופיע באישור ועדה מקומית',
    projectNamePlaceholder: 'הזן את שם הפרויקט',
    projectNameRequired: 'שם הפרויקט הוא שדה חובה',
    projectPrice: 'סכום הפרויקט הכולל',
    projectPricePlaceholder: 'הזן את הסכום הכולל של הפרויקט',
    projectPriceHelp: 'זהו הסכום הכולל של הפרויקט. לאחר מכן תתבקשו להזין את הסכום של כל חשבונית בנפרד.',
    requiredField: 'שדה חובה',
    invalidEmail: 'כתובת אימייל לא תקינה',
    invalidPhone: 'מספר טלפון לא תקין',
    invalidPrice: 'סכום לא תקין',
    requirement1: 'הצעת מחיר אחת נדרשת',
    requirement2: 'שתי הצעות מחיר נדרשות',
    requirement3: '4 הצעות מחיר ומסמך מכרז נדרשים',
  },
  en: {
    backHome: 'Back to Home',
    submitterInfo: 'Your Contact Information',
    submitterName: 'Your Full Name',
    submitterNamePlaceholder: 'Enter your full name',
    submitterEmail: 'Your Email Address',
    submitterEmailPlaceholder: 'Enter your email address',
    submitterPhone: 'Your Phone Number',
    submitterPhonePlaceholder: 'Enter your phone number',
    projectName: 'Project Name',
    projectNameLabel: 'Project name as written in Local Committee Approval',
    projectNamePlaceholder: 'Enter the project name',
    projectNameRequired: 'Project name is required',
    projectPrice: 'Total Project Cost',
    projectPricePlaceholder: 'Enter the total project cost',
    projectPriceHelp: 'This is the total cost of the project. You will be asked to enter the amount for each invoice separately.',
    requiredField: 'Required field',
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Invalid phone number',
    invalidPrice: 'Invalid amount',
    requirement1: 'One price proposal required',
    requirement2: 'Two price proposals required',
    requirement3: '4 price proposals and tender document required',
  },
};

type Step = 'info' | 'committee' | 'invoices' | 'invoicePrices' | 'proposals';

export default function UploadPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  const [committeeApprovalFile, setCommitteeApprovalFile] = useState<File | null>(null);
  const [invoiceFiles, setInvoiceFiles] = useState<File[]>([]);
  const [invoicesWithPrices, setInvoicesWithPrices] = useState<Array<{ file: File; price: number }>>([]);
  const [submitterName, setSubmitterName] = useState<string>('');
  const [submitterEmail, setSubmitterEmail] = useState<string>('');
  const [submitterPhone, setSubmitterPhone] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [totalProjectCost, setTotalProjectCost] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    projectName?: string;
    price?: string;
  }>({});

  const handleCommitteeApprovalUploaded = (file: File) => {
    setCommitteeApprovalFile(file);
    setCurrentStep('invoices');
  };

  const handleBackFromCommitteeApproval = () => {
    setCommitteeApprovalFile(null);
    setCurrentStep('info');
  };

  const handleInvoicesUploaded = (files: File[]) => {
    setInvoiceFiles(files);
    setCurrentStep('invoicePrices');
  };

  const handleBackFromInvoices = () => {
    setInvoiceFiles([]);
    setCurrentStep('committee');
  };

  const handleInvoicePricesEntered = (invoices: Array<{ file: File; price: number }>) => {
    setInvoicesWithPrices(invoices);
    setCurrentStep('proposals');
  };

  const handleBackFromInvoicePrices = () => {
    setInvoicesWithPrices([]);
    setCurrentStep('invoices');
  };

  const handleReset = () => {
    setCurrentStep('info');
    setCommitteeApprovalFile(null);
    setInvoiceFiles([]);
    setInvoicesWithPrices([]);
    setSelectedVillage('');
    setSubmitterName('');
    setSubmitterEmail('');
    setSubmitterPhone('');
    setProjectName('');
    setTotalProjectCost('');
    setFormErrors({});
  };

  const handleBackFromProposals = () => {
    setInvoicesWithPrices([]);
    setCurrentStep('invoicePrices');
  };

  const validateContactInfo = () => {
    const errors: { name?: string; email?: string; phone?: string; projectName?: string; price?: string } = {};
    
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

    if (!projectName.trim()) {
      errors.projectName = t.projectNameRequired;
    }

    if (!totalProjectCost.trim()) {
      errors.price = t.requiredField;
    } else {
      const price = parseFloat(totalProjectCost);
      if (isNaN(price) || price <= 0) {
        errors.price = t.invalidPrice;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
        {currentStep === 'info' && (
          <div className="space-y-12">
            {/* Village Selector and Contact Information */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12 space-y-6">
                {/* Village Selector */}
                <VillageSelector
                  selectedVillage={selectedVillage}
                  onVillageSelect={setSelectedVillage}
                />

                {/* Contact Information Form */}
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {t.submitterInfo}
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    {language === 'he' 
                      ? 'אנא מלא את פרטי הקשר שלך כדי שנוכל ליצור איתך קשר'
                      : 'Please fill in your contact information so we can reach you'}
                  </p>
                  
                  <div className="space-y-4">
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
                        maxLength={100}
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
                        maxLength={100}
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
                        maxLength={100}
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

                    {/* Project Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        {t.projectNameLabel} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => {
                          setProjectName(e.target.value);
                          if (formErrors.projectName) {
                            setFormErrors({ ...formErrors, projectName: undefined });
                          }
                        }}
                        placeholder={t.projectNamePlaceholder}
                        maxLength={100}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                          formErrors.projectName
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:border-gray-900'
                        }`}
                        dir={language === 'he' ? 'rtl' : 'ltr'}
                      />
                      {formErrors.projectName && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.projectName}</p>
                      )}
                      <p className="mt-2 text-sm text-gray-500">
                        {language === 'he' 
                          ? 'יש להזין את שם הפרויקט בדיוק כפי שהוא מופיע במסמך אישור הוועדה המקומית'
                          : 'Enter the project name exactly as it appears in the Local Committee Approval document'}
                      </p>
                    </div>

                    {/* Total Project Cost */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        {t.projectPrice} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={totalProjectCost}
                          onChange={(e) => {
                            setTotalProjectCost(e.target.value);
                            if (formErrors.price) {
                              setFormErrors({ ...formErrors, price: undefined });
                            }
                          }}
                          placeholder={t.projectPricePlaceholder}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                            formErrors.price
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:border-gray-900'
                          } ${language === 'he' ? 'pe-10' : 'ps-10'}`}
                          dir="ltr"
                        />
                        <span className={`absolute top-1/2 -translate-y-1/2 text-gray-500 ${language === 'he' ? 'right-4' : 'left-4'}`}>
                          ₪
                        </span>
                      </div>
                      {formErrors.price && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
                      )}
                      {!formErrors.price && totalProjectCost && (
                        <p className="mt-2 text-sm text-gray-600">
                          {t.projectPriceHelp}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Local Committee Approval Upload - only show if village is selected and all contact info including price is valid */}
            {selectedVillage && submitterName.trim() && submitterEmail.trim() && submitterPhone.trim() && projectName.trim() && totalProjectCost.trim() && !formErrors.price && (
              <LocalCommitteeApproval 
                onApprovalUploaded={handleCommitteeApprovalUploaded}
                onBack={handleBackFromCommitteeApproval}
                totalProjectCost={parseFloat(totalProjectCost)}
              />
            )}
          </div>
        )}

        {currentStep === 'invoices' && (
          <InvoiceUploadStep
            onInvoicesUploaded={handleInvoicesUploaded}
            onBack={handleBackFromInvoices}
          />
        )}

        {currentStep === 'invoicePrices' && (
          <InvoicePriceInput
            invoiceFiles={invoiceFiles}
            onPricesEntered={handleInvoicePricesEntered}
            onBack={handleBackFromInvoicePrices}
          />
        )}

        {currentStep === 'proposals' && (
          <ProposalUpload 
            committeeApprovalFile={committeeApprovalFile!}
            totalProjectCost={parseFloat(totalProjectCost)}
            invoices={invoicesWithPrices}
            selectedVillage={selectedVillage}
            projectName={projectName}
            submitterName={submitterName}
            submitterEmail={submitterEmail}
            submitterPhone={submitterPhone}
            onBack={handleBackFromProposals}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
