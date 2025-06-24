// frontend/src/components/landing/HeroSection.tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const HeroSection = () => {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  // Inline style for metallic gradient text effect
  const metallicTextStyle = {
    backgroundImage: 'linear-gradient(to right, #F0F0F0, #D3D9D4, #F0F0F0)', // Lightest grey, light accent, lightest grey
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent', // Fallback for browsers not supporting text-fill-color
  };

  return (
    <section className="relative bg-cover bg-center py-32 md:py-48 lg:py-64"
      style={{
        backgroundImage: `url('${settings?.heroSection?.imageUrl || "https://placehold.co/1920x1080/2E3944/FFFFFF?Text=Hero+Image"}')`,
      }}
    >
      {/* Dark overlay to match new theme, minimizing blueish tint */}
      <div className="absolute inset-0 bg-brand-dark opacity-80"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1
          className="text-7xl sm:text-8xl lg:text-9xl font-bold text-dark-text mb-6" // Increased font size
          style={{ ...metallicTextStyle, textShadow: '2px 2px 4px rgba(0,0,0,0.4)' }} // Combined styles
        >
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
