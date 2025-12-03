'use client';

import { useTranslations } from 'next-intl';

export function Stats() {
  const t = useTranslations('stats');

  const stats = [
    {
      value: '500+',
      labelKey: 'proposals',
      icon: '📋'
    },
    {
      value: '50+',
      labelKey: 'villages',
      icon: '🏘️'
    },
    {
      value: '20+',
      labelKey: 'municipalities',
      icon: '🏛️'
    },
    {
      value: '85%',
      labelKey: 'approved',
      icon: '✅'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat) => (
            <div key={stat.labelKey} className="text-center">
              <div className="text-5xl mb-3">{stat.icon}</div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-blue-100 text-lg font-medium">
                {t(stat.labelKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

