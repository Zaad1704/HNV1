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
                        <Link to={link.url} className="text-light-text dark:text-light-text-dark hover:text-brand-accent-light transition-colors duration-150">
                            {link.text}
                        </Link>
                    ) : (
                        <a href={link.url} className="text-light-text dark:text-light-text-dark hover:text-brand-accent-light transition-colors duration-150" target="_blank" rel="noopener noreferrer">
                            {link.text}
                        </a>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <footer className="bg-brand-dark border-t border-border-color/20 dark:border-border-color-dark/20 transition-colors duration-300">
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
                    {/* Organization Info */}
                    <div className="sm:col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center space-x-3 mb-4">
                            <img src={settings.logos?.footerLogoUrl || "/logo-min.png"} alt="Company Logo" className="h-8" width="32" height="32" />
                            <span className="text-xl font-bold text-dark-text dark:text-dark-text-dark">{settings.logos?.companyName}</span>
                        </Link>
                        <p className="text-light-text dark:text-light-text-dark text-sm max-w-xs">{settings.footer.description}</p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-dark-text dark:text-dark-text-dark mb-4 uppercase tracking-wider">{t('footer.quick_links')}</h3>
                        {renderLinks(settings.footer.quickLinks)}
                    </div>
                    
                    {/* Legal Links */}
                    <div>
                        <h3 className="font-bold text-dark-text dark:text-dark-text-dark mb-4 uppercase tracking-wider">{t('footer.legal_links')}</h3>
                        {renderLinks(settings.footer.legalLinks)}
                    </div>
                    
                    {/* Social Links */}
                    <div>
                        <h3 className="font-bold text-dark-text dark:text-dark-text-dark mb-4 uppercase tracking-wider">{t('footer.social_links')}</h3>
                        {renderLinks(settings.footer.socialLinks)}
                    </div>
                </div>
                <div className="mt-16 border-t border-border-color/20 dark:border-border-color-dark/20 pt-8 text-center text-sm text-light-text/50 dark:text-light-text-dark/50">
                    <p>&copy; {new Date().getFullYear()} {settings.footer.copyrightText}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
