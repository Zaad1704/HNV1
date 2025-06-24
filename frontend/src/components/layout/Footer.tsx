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
                        <Link to={link.url} className="text-gray-300 hover:text-brand-primary transition-colors"> {/* Changed text-slate-400 to text-gray-300 */}
                            {link.text}
                        </Link>
                    ) : (
                        <a href={link.url} className="text-gray-300 hover:text-brand-primary transition-colors" target="_blank" rel="noopener noreferrer"> {/* Changed text-slate-400 to text-gray-300 */}
                            {link.text}
                        </a>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <footer className="bg-brand-dark border-t border-slate-800">
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="sm:col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center space-x-3 mb-4">
                            {/* FIX: Removed filter classes that made the logo invisible */}
                            <img src={settings.logos?.footerLogoUrl || "/logo-min.png"} alt="Company Logo" className="h-8" width="32" height="32" />
                            <span className="text-xl font-bold text-white">{settings.logos?.companyName}</span>
                        </Link>
                        <p className="text-gray-300 text-sm max-w-xs">{settings.footer.description}</p> {/* Changed text-slate-400 to text-gray-300 */}
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-4">{t('footer.quick_links')}</h3>
                        {renderLinks(settings.footer.quickLinks)}
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-white mb-4">{t('footer.legal_links')}</h3>
                        {renderLinks(settings.footer.legalLinks)}
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-white mb-4">{t('footer.social_links')}</h3>
                        {renderLinks(settings.footer.socialLinks)}
                    </div>
                </div>
                <div className="mt-16 border-t border-slate-700 pt-8 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} {settings.footer.copyrightText}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
