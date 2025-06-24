import React from "react";
import { useTranslation } from "react-i18next";

export default function LeadershipSection() {
  const { t } = useTranslation();
  
  return (
    <section id="leadership" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-4">
            {t('leadership.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('leadership.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          <div className="bg-gray-50 p-6 rounded-xl shadow-lg text-center hover:-translate-y-1 hover:shadow-xl transition duration-300">
            <img
              src="https://placehold.co/150x150/7C3AED/FFFFFF?text=CEO"
              alt="M.A Halim - FOUNDER"
              className="w-32 h-32 rounded-full mx-auto mb-5 border-4 border-indigo-200 object-cover"
            />
            <h3 className="text-xl font-semibold text-gray-800">M.A Halim</h3>
            <p className="text-indigo-600 font-medium mb-2">
              {t('leadership.founder_visionary')}
            </p>
            <p className="text-gray-600 text-sm">
              "{t('leadership.founder_1_quote')}"
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl shadow-lg text-center hover:-translate-y-1 hover:shadow-xl transition duration-300">
            <img
              src="https://placehold.co/150x150/EC4899/FFFFFF?text=CTO"
              alt="NURUNNAHAR HALIM - FOUNDER"
              className="w-32 h-32 rounded-full mx-auto mb-5 border-4 border-pink-200 object-cover"
            />
            <h3 className="text-xl font-semibold text-gray-800">Nurunnahar Halim</h3>
            <p className="text-pink-600 font-medium mb-2">
              {t('leadership.founder_visionary')}
            </p>
            <p className="text-gray-600 text-sm">
             "{t('leadership.founder_2_quote')}"
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl shadow-lg text-center hover:-translate-y-1 hover:shadow-xl transition duration-300">
            <img
              src="https://placehold.co/150x150/10B981/FFFFFF?text=COO"
              alt="COO"
              className="w-32 h-32 rounded-full mx-auto mb-5 border-4 border-emerald-200 object-cover"
            />
            <h3 className="text-xl font-semibold text-gray-800">Alice Brown</h3>
            <p className="text-emerald-600 font-medium mb-2">
              Chief Operating Officer
            </p>
            <p className="text-gray-600 text-sm">
              "{t('leadership.coo_quote')}"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
