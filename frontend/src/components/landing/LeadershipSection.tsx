import React from "react";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function LeadershipSection() {
  const { t } = useTranslation();
  const { data: settings, isLoading, isError } = useSiteSettings();

  // FIX: This logic is now more robust.
  // It checks for loading/error states and ensures executives data exists before trying to render.
  // This prevents the page from crashing.
  if (isLoading) {
    return (
      <div className="py-16 md:py-24 text-center text-light-text">
        Loading Leadership...
      </div>
    );
  }

  // Don't render the section at all if there's an error or no executives are defined in the CMS
  if (isError || !settings?.aboutPage?.executives || settings.aboutPage.executives.length === 0) {
    return null;
  }

  const executives = settings.aboutPage.executives;

  return (
    <section id="leadership" className="py-16 md:py-24 bg-light-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark-text mb-4">
            {settings?.leadershipSection?.title || t('leadership.title')}
          </h2>
          <p className="text-lg text-light-text max-w-2xl mx-auto">
            {settings?.leadershipSection?.subtitle || t('leadership.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {executives.map((executive, index) => (
            <div key={index} className="bg-brand-secondary p-6 rounded-xl shadow-lg text-center hover:-translate-y-1 hover:shadow-xl transition duration-300 border border-border-color">
              <img
                src={executive.imageUrl}
                alt={executive.name}
                className="w-32 h-32 rounded-full mx-auto mb-5 border-4 border-border-color object-cover"
              />
              <h3 className="text-xl font-semibold text-dark-text">{executive.name}</h3>
              <p className="text-brand-accent-dark font-medium mb-2">
                {executive.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
