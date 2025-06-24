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
                <li key={link.url}>
                    {link.url.startsWith('/') ? (
                        <Link to={link.url} className="text-light-text hover:text-brand-primary transition-colors"> {/* text-light-text now maps to light color */}
                            {link.text}
                        </Link>
                    ) : (
                        <a href={link.url} className="text-light-text hover:text-brand-primary transition-colors" target="_blank" rel="noopener noreferrer"> {/* text-light-text now maps to light color */}
                            {link.text}
                        </a>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <footer className="bg-brand-dark border-t border-slate-800"> {/* bg-brand-dark is the new dark color */}
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="sm:col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center space-x-3 mb-4">
                            {/* FIX: Removed filter classes that made the logo invisible */}
                            <img src={settings.logos?.footerLogoUrl || "/logo-min.png"} alt="Company Logo" className="h-8" width="32" height="32" />
                            <span className="text-xl font-bold text-dark-text">{settings.logos?.companyName}</span> {/* text-dark-text now maps to light color */}
                        </Link>
                        <p className="text-light-text text-sm max-w-xs">{settings.footer.description}</p> {/* text-light-text now maps to light color */}
                    </div>

                    <div>
                        <h3 className="font-bold text-dark-text mb-4">{t('footer.quick_links')}</h3> {/* text-dark-text now maps to light color */}
                        {renderLinks(settings.footer.quickLinks)}
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-dark-text mb-4">{t('footer.legal_links')}</h3> {/* text-dark-text now maps to light color */}
                        {renderLinks(settings.footer.legalLinks)}
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-dark-text mb-4">{t('footer.social_links')}</h3> {/* text-dark-text now maps to light color */}
                        {renderLinks(settings.footer.socialLinks)}
                    </div>
                </div>
                <div className="mt-16 border-t border-slate-700 pt-8 text-center text-sm text-light-text"> {/* text-light-text now maps to light color */}
                    <p>&copy; {new Date().getFullYear()} {settings.footer.copyrightText}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
