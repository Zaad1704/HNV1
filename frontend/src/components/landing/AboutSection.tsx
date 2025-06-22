import React from "react";
import Trans from "../Trans";
import { useSiteSettings } from '../../hooks/useSiteSettings';
// Removed: import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';

export default function AboutSection() {
  const { data: settings } = useSiteSettings();

  // Removed: useDynamicTranslation calls

  return (
    <section id="aboutPage" className="py-16 md:py-24 bg-white dark:bg-dark-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-4 dark:text-dark-text-dark">
            {settings?.aboutPage?.title || 'About ProManage Solutions'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-light-text-dark">
            {settings?.aboutPage?.subtitle || 'We are dedicated to simplifying property management for owners, agents, and tenants.'}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img
              src={settings?.aboutPage?.imageUrl || "https://placehold.co/600x400/A5B4FC/FFFFFF?text=Our+Team+Working"}
              alt="Team Collaboration"
              className="w-full h-auto object-cover"
            />
          </div>
          <div>
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-indigo-600 mb-3 dark:text-brand-primary">
                {settings?.aboutPage?.missionTitle || 'Our Mission'}
              </h3>
              <p className="text-gray-700 leading-relaxed dark:text-light-text-dark">
                {settings?.aboutPage?.missionStatement || 'To provide innovative and user-friendly technology solutions that empower property managers to achieve operational excellence, enhance tenant satisfaction, and maximize profitability. We strive to be the trusted partner in transforming the complexities of property management into streamlined, efficient processes.'}
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-indigo-600 mb-3 dark:text-brand-primary">
                {settings?.aboutPage?.visionTitle || 'Our Vision'}
              </h3>
              <p className="text-gray-700 leading-relaxed dark:text-light-text-dark">
                {settings?.aboutPage?.visionStatement || 'To be the leading global platform for property management, recognized for our commitment to customer success, continuous innovation, and the creation of thriving communities. We envision a future where managing properties is effortless, transparent, and accessible to everyone, everywhere.'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-dark-text dark:text-dark-text-dark">{settings?.aboutPage?.teamTitle || 'Meet Our Leadership'}</h2>
            <p className="text-light-text mt-4 max-w-2xl mx-auto text-center dark:text-light-text-dark">{settings?.aboutPage?.teamSubtitle || 'The driving force behind our commitment to excellence.'}</p>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {settings?.aboutPage?.executives?.map((exec, index) => {
                    // Removed useDynamicTranslation here
                    return (
                        <div key={index} className="text-center bg-gray-50 p-6 rounded-xl shadow-lg dark:bg-dark-card dark:border dark:border-border-color-dark">
                            <img src={exec.imageUrl} alt={exec.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-slate-700 dark:border-border-color-dark"/>
                            <h4 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">{exec.name}</h4>
                            <p className="text-cyan-400 dark:text-brand-secondary">{exec.title}</p>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </section>
  );
}
