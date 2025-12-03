'use client';

import { useTranslations } from 'next-intl';

export function CTA() {
  const t = useTranslations('cta');

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 lg:p-16 shadow-2xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                {t('title')}
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                {t('subtitle')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 text-lg font-semibold bg-white text-blue-600 hover:bg-gray-100 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 transform">
                  {t('villageButton')}
                  <span className="ms-2 inline-block">🏘️</span>
                </button>
                <button className="px-8 py-4 text-lg font-semibold bg-transparent text-white border-2 border-white hover:bg-white/10 rounded-xl transition-all">
                  {t('municipalityButton')}
                  <span className="ms-2 inline-block">🏛️</span>
                </button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-16 -start-16 w-32 h-32 bg-white rounded-full mix-blend-soft-light opacity-20 blur-2xl"></div>
            <div className="absolute -bottom-16 -end-16 w-32 h-32 bg-white rounded-full mix-blend-soft-light opacity-20 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

