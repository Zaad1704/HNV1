import React from "react";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function LeadershipSection() {
  const { t } = useTranslation();
  // FIX: Fetch dynamic settings from the CMS to show executives
  const { data: settings, isLoading } = useSiteSettings();

  // Use the executives from the settings, or an empty array as a fallback
  const executives = settings?.aboutPage?.executives || [];

  return (
    <section id="leadership" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-4">
            {/* FIX: Use dynamic title from settings */}
            {settings?.leadershipSection?.title || t('leadership.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {/* FIX: Use dynamic subtitle from settings */}
            {settings?.leadershipSection?.subtitle || t('leadership.subtitle')}
          </p>
        </div>

        {/* Handle loading state */}
        {isLoading ? (
          <div className="text-center text-gray-600">Loading Leadership...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {/* FIX: Map over dynamic executive data */}
            {executives.map((executive, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-lg text-center hover:-translate-y-1 hover:shadow-xl transition duration-300">
                <img
                  src={executive.imageUrl}
                  alt={executive.name}
                  className="w-32 h-32 rounded-full mx-auto mb-5 border-4 border-indigo-200 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-800">{executive.name}</h3>
                <p className="text-indigo-600 font-medium mb-2">
                  {executive.title}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
