// frontend/src/components/landing/HeroSection.tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const HeroSection = () => {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  return (
    <section className="relative bg-cover bg-center py-32 md:py-48 lg:py-64"
      style={{
        backgroundImage: `url('${settings?.heroSection?.imageUrl || "https://placehold.co/1920x1080/2E3944/FFFFFF?Text=Hero+Image"}')`,
      }}
    >
      {/* Greenish overlay with slightly increased image visibility (reduced opacity) */}
      <div className="absolute inset-0 bg-brand-primary opacity-60"></div> {/* Changed opacity-70 to opacity-60 */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-dark-text mb-6" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
          {settings?.heroSection?.title || t('hero.title')}
        </h1>
        <p className="text-lg sm:text-xl text-light-text mb-10 max-w-xl mx-auto" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
          {settings?.heroSection?.subtitle || t('hero.subtitle')}
        </p>
        <div className="space-x-4">
          {settings?.heroSection?.primaryButtonText && settings?.heroSection?.primaryButtonLink && (
            <Link
              to={settings.heroSection.primaryButtonLink}
              className="inline-block bg-brand-accent-dark text-dark-text py-3 px-8 rounded-full font-semibold hover:bg-brand-accent-light transition-colors"
            >
              {settings.heroSection.primaryButtonText}
            </Link>
          )}
          {settings?.heroSection?.secondaryButtonText && settings?.heroSection?.secondaryButtonLink && (
            <Link
              to={settings.heroSection.secondaryButtonLink}
              className="inline-block bg-transparent border border-brand-accent-dark text-brand-accent-dark py-3 px-8 rounded-full font-semibold hover:bg-brand-accent-dark hover:text-dark-text transition-colors"
            >
              {settings.heroSection.secondaryButtonText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
