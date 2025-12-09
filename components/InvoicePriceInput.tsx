'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageProvider';

const translations = {
  he: {
    title: 'הזנת מחירי חשבוניות',
    subtitle: 'אנא הזינו את המחיר של כל חשבונית',
    invoice: 'חשבונית',
    invoicePrice: 'מחיר החשבונית',
    invoicePricePlaceholder: 'הזן את המחיר',
    requiredField: 'שדה חובה',
    invalidPrice: 'מחיר לא תקין',
    requirement1: 'הצעת מחיר אחת נדרשת',
    requirement2: 'שתי הצעות מחיר נדרשות',
    requirement3: '4 הצעות מחיר ומסמך מכרז נדרשים',
    continue: 'המשך',
    back: 'חזרה',
  },
  en: {
    title: 'Enter Invoice Prices',
    subtitle: 'Please enter the price for each invoice',
    invoice: 'Invoice',
    invoicePrice: 'Invoice Price',
    invoicePricePlaceholder: 'Enter the price',
    requiredField: 'Required field',
    invalidPrice: 'Invalid price',
    requirement1: 'One price proposal required',
    requirement2: 'Two price proposals required',
    requirement3: '4 price proposals and tender document required',
    continue: 'Continue',
    back: 'Back',
  },
};

interface InvoiceWithPrice {
  file: File;
  price: string;
  error?: string;
}

interface InvoicePriceInputProps {
  invoiceFiles: File[];
  onPricesEntered: (invoices: Array<{ file: File; price: number }>) => void;
  onBack: () => void;
}

// Calculate requirements based on invoice price
function getInvoiceRequirements(price: number) {
  if (price < 5500) {
    return { proposals: 1, tender: false, message: 'requirement1' };
  } else if (price < 159000) {
    return { proposals: 2, tender: false, message: 'requirement2' };
  } else {
    return { proposals: 4, tender: true, message: 'requirement3' };
  }
}

export default function InvoicePriceInput({
  invoiceFiles,
  onPricesEntered,
  onBack,
}: InvoicePriceInputProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const [invoices, setInvoices] = useState<InvoiceWithPrice[]>(() =>
    invoiceFiles.map(file => ({ file, price: '' }))
  );

  const handlePriceChange = (index: number, value: string) => {
    const newInvoices = [...invoices];
    newInvoices[index] = {
      ...newInvoices[index],
      price: value,
      error: undefined,
    };
    setInvoices(newInvoices);
  };

  const handleContinue = () => {
    // Validate all prices
    const errors: string[] = [];
    const validInvoices: Array<{ file: File; price: number }> = [];

    invoices.forEach((invoice, index) => {
      if (!invoice.price.trim()) {
        errors.push(`${t.invoice} ${index + 1}`);
        const newInvoices = [...invoices];
        newInvoices[index].error = t.requiredField;
        setInvoices(newInvoices);
      } else {
        const price = parseFloat(invoice.price);
        if (isNaN(price) || price <= 0) {
          errors.push(`${t.invoice} ${index + 1}`);
          const newInvoices = [...invoices];
          newInvoices[index].error = t.invalidPrice;
          setInvoices(newInvoices);
        } else {
          validInvoices.push({ file: invoice.file, price });
        }
      }
    });

    if (errors.length === 0) {
      onPricesEntered(validInvoices);
    }
  };

  const allPricesValid = invoices.every(inv => {
    const price = parseFloat(inv.price);
    return inv.price.trim() && !isNaN(price) && price > 0;
  });

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

      {/* Invoice Price Inputs */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12 space-y-6">
        {invoices.map((invoice, index) => {
          const price = parseFloat(invoice.price);
          const requirements = !isNaN(price) && price > 0 
            ? getInvoiceRequirements(price)
            : null;

          return (
            <div
              key={`${invoice.file.name}-${index}`}
              className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
            >
              <div className="space-y-4">
                {/* Invoice File Info */}
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {t.invoice} {index + 1}: {invoice.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(invoice.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {/* Price Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {t.invoicePrice} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={invoice.price}
                      onChange={(e) => handlePriceChange(index, e.target.value)}
                      placeholder={t.invoicePricePlaceholder}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                        invoice.error
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:border-gray-900'
                      } ${language === 'he' ? 'pe-10' : 'ps-10'}`}
                      dir="ltr"
                    />
                    <span className={`absolute top-1/2 -translate-y-1/2 text-gray-500 ${language === 'he' ? 'right-4' : 'left-4'}`}>
                      ₪
                    </span>
                  </div>
                  {invoice.error && (
                    <p className="mt-1 text-sm text-red-500">{invoice.error}</p>
                  )}
                  {!invoice.error && requirements && (
                    <p className="mt-2 text-sm text-blue-600 font-medium">
                      {t[requirements.message as keyof typeof t]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
          disabled={!allPricesValid}
          className="flex-1 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:bg-gray-900"
        >
          {t.continue}
        </button>
      </div>
    </div>
  );
}

