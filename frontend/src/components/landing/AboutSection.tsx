// frontend/src/components/landing/AboutSection.tsx
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useTranslation } from 'react-i18next';

export default function AboutSection() {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  return (
    <section id="about" className="py-16 md:py-24 bg-light-bg"> {/* Changed bg-white to bg-light-bg */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark-text mb-4"> {/* Changed text-indigo-700 to text-dark-text */}
            {t('about.title')}
          </h2>
          <p className="text-lg text-light-text max-w-2xl mx-auto"> {/* Changed text-gray-600 to text-light-text */}
            {t('about.subtitle')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="rounded-lg overflow-hidden shadow-xl border border-border-color"> {/* Added border for dark theme */}
            <img
              src={settings?.aboutPage?.imageUrl || "https://placehold.co/600x400"}
              alt="HNV Solutions Team"
              className="w-full h-auto object-cover"
            />
          </div>
          <div>
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-brand-primary mb-3"> {/* Changed text-indigo-600 to text-brand-primary */}
                {t('about.mission_title')}
              </h3>
              <p className="text-light-text leading-relaxed"> {/* Changed text-gray-700 to text-light-text */}
                {t('about.mission_statement')}
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-brand-primary mb-3"> {/* Changed text-indigo-600 to text-brand-primary */}
                {t('about.vision_title')}
              </h3>
              <p className="text-light-text leading-relaxed"> {/* Changed text-gray-700 to text-light-text */}
                {t('about.vision_statement')}
              </p>
            </div>
          </div>
        </div>

        {/* Executive Team Section - Added this block */}
        {settings?.aboutPage?.executives && settings.aboutPage.executives.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-dark-text">{settings.aboutPage.teamTitle || t('leadership.title')}</h2>
            <p className="text-light-text mt-4 max-w-2xl mx-auto text-center">{settings.aboutPage.teamSubtitle || t('leadership.subtitle')}</p>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {settings.aboutPage.executives.map((exec, index) => (
                <div key={index} className="text-center bg-light-card p-8 rounded-xl border border-border-color"> {/* Updated background and border */}
                  <img src={exec.imageUrl} alt={exec.name} className="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-brand-primary"/> {/* Updated border color */}
                  <h4 className="text-xl font-bold text-dark-text">{exec.name}</h4> {/* Updated text color */}
                  <p className="text-brand-primary">{exec.title}</p> {/* Updated text color */}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
