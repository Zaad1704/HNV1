import React from "react";
import Trans from "../Trans"; // Existing static Trans component
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation'; // NEW: Import useDynamicTranslation

export default function AboutSection() {
  const { data: settings } = useSiteSettings();

  // NEW: Translate dynamic content from settings
  const { translatedText: translatedTitle } = useDynamicTranslation(settings?.aboutPage?.title || 'About ProManage Solutions');
  const { translatedText: translatedSubtitle } = useDynamicTranslation(settings?.aboutPage?.subtitle || 'We are dedicated to simplifying property management for owners, agents, and tenants.');
  const { translatedText: translatedMissionTitle } = useDynamicTranslation(settings?.aboutPage?.missionTitle || 'Our Mission');
  const { translatedText: translatedMissionStatement } = useDynamicTranslation(settings?.aboutPage?.missionStatement || 'To provide innovative and user-friendly technology solutions that empower property managers to achieve operational excellence, enhance tenant satisfaction, and maximize profitability. We strive to be the trusted partner in transforming the complexities of property management into streamlined, efficient processes.');
  const { translatedText: translatedVisionTitle } = useDynamicTranslation(settings?.aboutPage?.visionTitle || 'Our Vision');
  const { translatedText: translatedVisionStatement } = useDynamicTranslation(settings?.aboutPage?.visionStatement || 'To be the leading global platform for property management, recognized for our commitment to customer success, continuous innovation, and the creation of thriving communities. We envision a future where managing properties is effortless, transparent, and accessible to everyone, everywhere.');
  const { translatedText: translatedTeamTitle } = useDynamicTranslation(settings?.aboutPage?.teamTitle || 'Meet Our Leadership');
  const { translatedText: translatedTeamSubtitle } = useDynamicTranslation(settings?.aboutPage?.teamSubtitle || 'The driving force behind our commitment to excellence.');


  return (
    <section id="aboutPage" className="py-16 md:py-24 bg-white dark:bg-dark-bg"> {/* Added dark mode class */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-4 dark:text-dark-text-dark"> {/* Added dark mode class */}
            {translatedTitle} {/* NEW: Use translated title */}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-light-text-dark"> {/* Added dark mode class */}
            {translatedSubtitle} {/* NEW: Use translated subtitle */}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img
              src={settings?.aboutPage?.imageUrl || "https://placehold.co/600x400/A5B4FC/FFFFFF?text=Our+Team+Working"} // Use image from settings
              alt="Team Collaboration"
              className="w-full h-auto object-cover"
            />
          </div>
          <div>
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-indigo-600 mb-3 dark:text-brand-primary"> {/* Added dark mode class */}
                {translatedMissionTitle} {/* NEW: Use translated mission title */}
              </h3>
              <p className="text-gray-700 leading-relaxed dark:text-light-text-dark"> {/* Added dark mode class */}
                {translatedMissionStatement} {/* NEW: Use translated mission statement */}
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-indigo-600 mb-3 dark:text-brand-primary"> {/* Added dark mode class */}
                {translatedVisionTitle} {/* NEW: Use translated vision title */}
              </h3>
              <p className="text-gray-700 leading-relaxed dark:text-light-text-dark"> {/* Added dark mode class */}
                {translatedVisionStatement} {/* NEW: Use translated vision statement */}
              </p>
            </div>
          </div>
        </div>
        {/* Leadership Section - if integrated directly, translate executive names/titles here too */}
        <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-dark-text dark:text-dark-text-dark">{translatedTeamTitle}</h2> {/* Added dark mode class */}
            <p className="text-light-text mt-4 max-w-2xl mx-auto text-center dark:text-light-text-dark">{translatedTeamSubtitle}</p> {/* Added dark mode class */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {settings?.aboutPage?.executives?.map((exec, index) => {
                    // Translate executive name and title
                    const { translatedText: translatedExecName } = useDynamicTranslation(exec.name);
                    const { translatedText: translatedExecTitle } = useDynamicTranslation(exec.title);
                    return (
                        <div key={index} className="text-center bg-gray-50 p-6 rounded-xl shadow-lg dark:bg-dark-card dark:border dark:border-border-color-dark"> {/* Added dark mode classes */}
                            <img src={exec.imageUrl} alt={exec.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-slate-700 dark:border-border-color-dark"/> {/* Added dark mode class */}
                            <h4 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">{translatedExecName}</h4> {/* Added dark mode class */}
                            <p className="text-cyan-400 dark:text-brand-secondary">{translatedExecTitle}</p> {/* Added dark mode class */}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </section>
  );
}
