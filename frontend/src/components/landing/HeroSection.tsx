import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const HeroSection = () => {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  return (
    // Use the custom gradient from tailwind.config.js combined with the background image
    <section
      className="relative py-20 md:py-32 flex items-center justify-center text-center overflow-hidden transition-colors duration-300
                 bg-gradient-blue-orange from-brand-primary to-brand-secondary dark:from-brand-dark dark:to-dark-card"
      style={{ backgroundImage: `url(${settings?.heroSection?.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-brand-dark/50 dark:bg-black/40 z-0"></div> {/* Overlay for text readability */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white" // Text color white for contrast on gradient
        >
          {settings?.heroSection?.title || t('landing.hero_title')}
        </h1>
        <p className="text-lg sm:text-xl text-white/90 mt-6 max-w-3xl mx-auto"> {/* Text color slightly transparent white */}
          {settings?.heroSection?.subtitle || t('landing.hero_subtitle')}
        </p>
        <div className="mt-10">
            <Link
              to="/register"
              className="inline-block bg-brand-accent-dark text-brand-dark py-4 px-10 rounded-lg font-bold text-lg hover:bg-brand-accent-dark/90 shadow-xl transition-all transform hover:scale-105" // Updated CTA button
            >
              {settings?.heroSection?.ctaText || t('landing.hero_cta')}
            </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
