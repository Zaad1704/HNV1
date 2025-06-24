import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useTranslation } from 'react-i18next';

export default function AboutSection() {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  return (
    <section id="aboutPage" className="py-16 md:py-24 bg-white dark:bg-dark-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-4 dark:text-dark-text-dark">
            {t('about.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-light-text-dark">
            {t('about.subtitle')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img
              src={settings?.aboutPage?.imageUrl || "https://placehold.co/600x400/A5B4FC/FFFFFF?text=HNV+Solutions"}
              alt="Team Collaboration"
              className="w-full h-auto object-cover"
            />
          </div>
          <div>
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-indigo-600 mb-3 dark:text-brand-primary">
                {t('about.mission_title')}
              </h3>
              <p className="text-gray-700 leading-relaxed dark:text-light-text-dark">
                {t('about.mission_statement')}
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-indigo-600 mb-3 dark:text-brand-primary">
                {t('about.vision_title')}
              </h3>
              <p className="text-gray-700 leading-relaxed dark:text-light-text-dark">
                {t('about.vision_statement')}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-dark-text dark:text-dark-text-dark">
            {t('about.team_title')}
          </h2>
          <p className="text-light-text mt-4 max-w-2xl mx-auto text-center dark:text-light-text-dark">
            {t('about.team_subtitle')}
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {settings?.aboutPage?.executives?.map((exec, index) => (
              <div key={index} className="bg-light-card dark:bg-dark-card rounded-xl shadow-md p-8 flex flex-col items-center">
                <img
                  src={exec.imageUrl || "https://placehold.co/160x160/64748B/FFFFFF?text=Exec"}
                  alt={exec.name}
                  className="w-24 h-24 rounded-full object-cover mb-4"
                />
                <h4 className="text-lg font-bold text-dark-text dark:text-dark-text-dark">{exec.name}</h4>
                <span className="text-brand-primary font-semibold mb-2">{exec.title}</span>
                <p className="text-sm text-gray-500 dark:text-light-text-dark text-center">{exec.bio || ''}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
