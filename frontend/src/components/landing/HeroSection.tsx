// frontend/src/components/landing/HeroSection.tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const HeroSection = () => {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  // Style for the metallic gradient text effect
  const metallicTextStyle = {
    backgroundImage: 'linear-gradient(to right, #EAEAEA, #D3D9D4, #C0C0C0, #D3D9D4, #EAEAEA)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    textShadow: '1px 1px 10px rgba(0, 0, 0, 0.3)',
  };

  return (
    <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${settings?.heroSection?.backgroundImageUrl || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop"}')`,
          transform: 'scale(1.1)', // Slightly zoom in for blur effect
          filter: 'blur(8px)', // Apply blur
        }}
      ></div>

      {/* Color Overlay */}
      <div className="absolute inset-0 bg-brand-dark opacity-70"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="text-6xl sm:text-7xl lg:text-8xl font-black uppercase tracking-wider"
          style={metallicTextStyle}
        >
          {settings?.heroSection?.title || t('hero.title')}
        </h1>
        <p className="text-lg sm:text-xl text-light-text mt-6 max-w-2xl mx-auto" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
          {settings?.heroSection?.subtitle || t('hero.subtitle')}
        </p>
        <div className="mt-10">
            <Link
              to="/register"
              className="inline-block bg-brand-accent-dark text-dark-text py-4 px-10 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-brand-accent-light hover:text-brand-dark shadow-lg transition-all transform hover:scale-105"
            >
              {t('landing.hero_cta')}
            </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
