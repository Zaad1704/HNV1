// frontend/src/components/layout/Navbar.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Globe, Sun, Moon, Search } from 'lucide-react';
import { useLang } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { data: settings } = useSiteSettings();
  const { lang, setLang, getNextToggleLanguage } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1);

    if (location.pathname !== '/') {
        navigate(`/${href}`);
    } else {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
  };

  return (
    <header className="bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md sticky top-0 z-50 border-b border-border-color/50 dark:border-border-color-dark/50 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Window Controls */}
        <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-red-400"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-yellow-400"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-green-400"></div>
        </div>
        
        {/* Centered Company Name */}
        <div className="flex-grow flex justify-center items-center">
            <Link to="/" className="text-lg font-bold text-dark-text dark:text-dark-text-dark">
                {settings?.logos?.companyName || 'Yartee'}
            </Link>
        </div>

        {/* Right Aligned Actions */}
        <div className="flex items-center gap-4 text-gray-500">
            <Search className="w-5 h-5 cursor-pointer hover:text-gray-900" />
            <span className="font-semibold text-sm cursor-pointer hover:text-gray-900">
                Hext
            </span>
            <img 
                src="https://placehold.co/32x32/CBD5E0/4A5568?text=A" 
                alt="User Avatar" 
                className="rounded-full cursor-pointer"
            />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
