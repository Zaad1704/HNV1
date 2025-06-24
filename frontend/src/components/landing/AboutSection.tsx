import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useTranslation } from 'react-i18next';

export default function AboutSection() {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  return (
    <section id="about" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-4">
            {t('about.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img
              src={settings?.aboutPage?.imageUrl || "https://placehold.co/600x400"}
              alt="HNV Solutions Team"
              className="w-full h-auto object-cover"
            />
          </div>
          <div>
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-indigo-600 mb-3">
                {t('about.mission_title')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('about.mission_statement')}
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-indigo-600 mb-3">
                {t('about.vision_title')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('about.vision_statement')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
