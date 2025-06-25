// frontend/src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { data: settings, isLoading } = useSiteSettings();
    const { t } = useTranslation();

    if (isLoading || !settings?.footer) return null;

    const renderLinks = (links: { text: string; url: string }[] = []) => (
        <ul className="space-y-2">
            {links.map(link => (
                <li key={link.text}>
                    {link.url.startsWith('/') ? (
                        <Link to={link.url} className="text-light-text dark:text-light-text-dark hover:text-brand-primary dark:hover:text-brand-secondary transition-colors duration-150">
                            {link.text}
                        </Link>
                    ) : (
                        <a href={link.url} className="text-light-text dark:text-light-text-dark hover:text-brand-primary dark:hover:text-brand-secondary transition-colors duration-150" target="_blank" rel="noopener noreferrer">
                            {link.text}
                        </a>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <footer className="bg-light-card dark:bg-dark-card text-light-text dark:text-light-text-dark py-12 mt-12 transition-colors duration-300 border-t border-border-color dark:border-border-color-dark">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark mb-3">
                  {settings.logos?.companyName || 'ProManage Solutions'}
                </h3>
                <p className="text-sm">{settings.footer.description}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark mb-3">{t('footer.quick_links')}</h3>
                {renderLinks(settings.footer.quickLinks)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark mb-3">{t('footer.newsletter_title', 'Newsletter')}</h3>
                <p className="text-sm mb-3">{t('footer.newsletter_subtitle', 'Stay updated with our latest news and offers.')}</p>
                <form className="flex">
                  <input type="email" className="w-full px-3 py-2.5 rounded-l-lg text-dark-text dark:text-dark-text-dark bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors text-sm"
                    placeholder="Enter your email" />
                  <button type="submit" className="bg-brand-primary hover:bg-opacity-90 text-white px-4 py-2.5 rounded-r-lg font-semibold text-sm transition-colors">
                    {t('footer.subscribe', 'Subscribe')}
                  </button>
                </form>
              </div>
            </div>
            <div className="border-t border-border-color dark:border-border-color-dark pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
              <p>&copy; {new Date().getFullYear()} {settings.footer.copyrightText}</p>
              <Link to="/login" className="text-light-text dark:text-light-text-dark hover:text-brand-primary dark:hover:text-brand-secondary transition-colors mt-4 md:mt-0">
                {t('footer.portal_login', 'Portal Login')}
              </Link>
            </div>
          </div>
        </footer>
    );
};

export default Footer;
