'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import VillageSelector from './VillageSelector';
import LocalCommitteeApproval from './LocalCommitteeApproval';
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
    projectPrice: 'סכום הפרויקט',
    projectPricePlaceholder: 'הזן את הסכום הכולל',
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
    projectPrice: 'Project Amount',
    projectPricePlaceholder: 'Enter the total amount',
    requiredField: 'Required field',
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Invalid phone number',
    invalidPrice: 'Invalid amount',
    requirement1: 'One price proposal required',
    requirement2: 'Two price proposals required',
    requirement3: '4 price proposals and tender document required',
  },
};

export default function UploadPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  const [committeeApprovalFile, setCommitteeApprovalFile] = useState<File | null>(null);
  const [submitterName, setSubmitterName] = useState<string>('');
  const [submitterEmail, setSubmitterEmail] = useState<string>('');
  const [submitterPhone, setSubmitterPhone] = useState<string>('');
  const [projectPrice, setProjectPrice] = useState<string>('');
  const [initialPriceThreshold, setInitialPriceThreshold] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    price?: string;
  }>({});

  const handleCommitteeApprovalUploaded = (file: File) => {
    setCommitteeApprovalFile(file);
    // Store the initial price threshold when moving to proposals step
    const price = parseFloat(projectPrice);
    if (price < 5500) {
      setInitialPriceThreshold(1);
    } else if (price < 159000) {
      setInitialPriceThreshold(2);
    } else {
      setInitialPriceThreshold(3);
    }
  };

  const handleBackFromCommitteeApproval = () => {
    setCommitteeApprovalFile(null);
  };

  const handleReset = () => {
    setCommitteeApprovalFile(null);
    setSelectedVillage('');
    setSubmitterName('');
    setSubmitterEmail('');
    setSubmitterPhone('');
    setProjectPrice('');
    setInitialPriceThreshold(null);
    setFormErrors({});
  };

  const handleBackFromProposals = () => {
    // Go back to Step 1 (kibbutz selection)
    setCommitteeApprovalFile(null);
    setInitialPriceThreshold(null);
  };

  // Calculate requirements based on price
  const getRequirements = () => {
    const price = parseFloat(projectPrice);
    if (isNaN(price) || price <= 0) {
      return { proposals: 0, tender: false, message: '' };
    }
    
    if (price < 5500) {
      return { proposals: 1, tender: false, message: t.requirement1 };
    } else if (price < 159000) {
      return { proposals: 2, tender: false, message: t.requirement2 };
    } else {
      return { proposals: 4, tender: true, message: t.requirement3 };
    }
  };

  const requirements = getRequirements();

  const validateContactInfo = () => {
    const errors: { name?: string; email?: string; phone?: string; price?: string } = {};
    
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

    if (!projectPrice.trim()) {
      errors.price = t.requiredField;
    } else {
      const price = parseFloat(projectPrice);
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
        {committeeApprovalFile === null ? (
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

                    {/* Project Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        {t.projectPrice} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={projectPrice}
                          onChange={(e) => {
                            setProjectPrice(e.target.value);
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
                      {!formErrors.price && projectPrice && requirements.message && (
                        <p className="mt-2 text-sm text-blue-600 font-medium">
                          {requirements.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Local Committee Approval Upload - only show if village is selected and all contact info including price is valid */}
            {selectedVillage && submitterName.trim() && submitterEmail.trim() && submitterPhone.trim() && projectPrice.trim() && !formErrors.price && (
              <LocalCommitteeApproval 
                onApprovalUploaded={handleCommitteeApprovalUploaded}
                onBack={handleBackFromCommitteeApproval}
                projectPrice={parseFloat(projectPrice)}
                requirements={requirements}
              />
            )}
          </div>
        ) : (
          <ProposalUpload 
            committeeApprovalFile={committeeApprovalFile}
            projectPrice={parseFloat(projectPrice)}
            initialPriceThreshold={initialPriceThreshold}
            selectedVillage={selectedVillage}
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
