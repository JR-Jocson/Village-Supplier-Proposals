'use client';

import { useTranslations } from 'next-intl';

export function Features() {
  const t = useTranslations('features');

  const features = [
    {
      icon: '📝',
      titleKey: 'easySubmission',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '📍',
      titleKey: 'tracking',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: '✅',
      titleKey: 'verification',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: '📄',
      titleKey: 'documentation',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: '🤝',
      titleKey: 'collaboration',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: '📊',
      titleKey: 'reports',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.titleKey}
              className="group relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:scale-105 transform"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} text-white text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t(`${feature.titleKey}.title`)}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t(`${feature.titleKey}.description`)}
              </p>

              {/* Decorative Element */}
              <div className="absolute top-0 end-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -me-10 -mt-10 group-hover:scale-150 transition-transform"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

