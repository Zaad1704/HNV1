// frontend/src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const Footer = () => {
    const { data: settings, isLoading } = useSiteSettings();

    if (isLoading || !settings) return null; // Don't render footer if settings are not loaded

    return (
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <img src={settings.logos?.footerLogoUrl} alt="Logo" className="h-8 mb-4"/>
                        <p className="max-w-md">{settings.footer?.description}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {settings.footer?.quickLinks.map(link => (
                                <li key={link.url}><Link to={link.url} className="hover:text-cyan-400">{link.text}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-4">Follow Us</h3>
                         <ul className="space-y-2">
                            {settings.footer?.socialLinks.map(link => (
                                <li key={link.text}><a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">{link.text}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} {settings.footer?.copyrightText}</p>
                </div>
            </div>
        </footer>
    );
};
export default Footer;
