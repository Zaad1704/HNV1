import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const HeroSection = () => {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  return (
    // Use the main light background as the base for the hero section
    <section className="relative bg-light-bg dark:bg-dark-bg py-20 md:py-32 flex items-center justify-center text-center overflow-hidden">
      {/* Optional: A subtle background pattern or image can be used if desired */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-dark-text dark:text-dark-text-dark"
        >
          {settings?.heroSection?.title || t('hero.title')}
        </h1>
        <p className="text-lg sm:text-xl text-light-text dark:text-light-text-dark mt-6 max-w-3xl mx-auto">
          {settings?.heroSection?.subtitle || t('hero.subtitle')}
        </p>
        <div className="mt-10">
            <Link
              to="/register"
              className="inline-block bg-brand-primary text-white py-4 px-10 rounded-lg font-bold text-lg hover:bg-opacity-90 shadow-lg transition-all transform hover:scale-105"
            >
              {t('landing.hero_cta')}
            </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
