'use client';

import { useTranslations } from 'next-intl';

export function HowItWorks() {
  const t = useTranslations('howItWorks');

  const steps = [
    {
      number: '1',
      titleKey: 'step1',
      icon: '📤',
      color: 'blue'
    },
    {
      number: '2',
      titleKey: 'step2',
      icon: '🔍',
      color: 'purple'
    },
    {
      number: '3',
      titleKey: 'step3',
      icon: '🎉',
      color: 'green'
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      gradient: 'from-blue-500 to-cyan-500',
      ring: 'ring-blue-500/20'
    },
    purple: {
      bg: 'bg-purple-500',
      gradient: 'from-purple-500 to-pink-500',
      ring: 'ring-purple-500/20'
    },
    green: {
      bg: 'bg-green-500',
      gradient: 'from-green-500 to-emerald-500',
      ring: 'ring-green-500/20'
    }
  };

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
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

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-1/2 start-0 end-0 h-1 bg-gradient-to-e from-blue-500 via-purple-500 to-green-500 -translate-y-1/2 opacity-20"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {steps.map((step, index) => {
                const colors = colorClasses[step.color as keyof typeof colorClasses];
                return (
                  <div key={step.number} className="relative">
                    {/* Step Card */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow">
                      {/* Step Number */}
                      <div className={`absolute -top-6 start-8 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${colors.gradient} text-white text-xl font-bold shadow-lg ring-4 ${colors.ring}`}>
                        {step.number}
                      </div>

                      {/* Icon */}
                      <div className="text-6xl mb-6 mt-4 text-center">
                        {step.icon}
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                        {t(`${step.titleKey}.title`)}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                        {t(`${step.titleKey}.description`)}
                      </p>
                    </div>

                    {/* Arrow for mobile */}
                    {index < steps.length - 1 && (
                      <div className="lg:hidden flex justify-center my-6">
                        <div className="text-4xl text-gray-300 dark:text-gray-600 rotate-90">
                          →
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

