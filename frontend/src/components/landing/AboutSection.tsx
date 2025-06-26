// frontend/src/components/landing/AboutSection.tsx
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useTranslation } from 'react-i18next';

export default function AboutSection() {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  return (
    <section id="about" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28"> {/* Added padding for consistency */}
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-dark-text dark:text-dark-text-dark">
          {t('about.title')}
        </h2>
        <p className="text-lg text-light-text dark:text-light-text-dark max-w-2xl mx-auto">
          {t('about.subtitle')}
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="rounded-lg overflow-hidden shadow-xl border border-border-color dark:border-border-color-dark transition-all duration-200">
          <img
            src={settings?.aboutPage?.imageUrl || "https://placehold.co/600x400"}
            alt="HNV Solutions Team"
            className="w-full h-auto object-cover"
          />
        </div>
        <div>
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-brand-primary dark:text-brand-secondary mb-3 transition-colors">
              {t('about.mission_title')}
            </h3>
            <p className="text-light-text dark:text-light-text-dark leading-relaxed">
              {t('about.mission_statement')}
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-brand-primary dark:text-brand-secondary mb-3 transition-colors">
              {t('about.vision_title')}
            </h3>
            <p className="text-light-text dark:text-light-text-dark leading-relaxed">
              {t('about.vision_statement')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
