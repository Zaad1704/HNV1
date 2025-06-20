// frontend/src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { ArrowRight, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { data: settings } = useSiteSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  const sectionIds = navLinks.map(link => link.href.substring(1));
  const activeId = useScrollSpy(sectionIds, 150);

  const NavLinksContent = ({ isMobile = false }) => (
    <>
      {navLinks.map((link) => {
        const isActive = activeId === link.href.substring(1);
        return (
          <a
            key={link.name}
            href={link.href}
            onClick={() => setIsMenuOpen(false)}
            className={`font-medium transition-colors rounded-md ${
              isMobile 
                ? 'block w-full text-left py-2' 
                : 'px-3 py-2'
            } ${
              isActive
                ? 'text-slate-900 bg-yellow-400'
                : 'text-slate-300 hover:text-yellow-400'
            }`}
          >
            {link.name}
          </a>
        );
      })}
    </>
  );

  return (
    <header className="bg-slate-900/80 backdrop-blur-lg shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <a href="#hero" className="flex items-center space-x-3">
          <img src={settings?.logos?.navbarLogoUrl} alt="Company Logo" className="h-10"/>
          {/* REMOVED 'hidden' class to make it always visible */}
          <span className="text-xl font-bold text-white sm:inline">
            {settings?.logos?.companyName || 'HNV Solutions'}
          </span>
        </a>
        
        <nav className="hidden lg:flex items-center space-x-6">
          <NavLinksContent />
        </nav>
        
        <div className="hidden lg:flex items-center space-x-4">
          <Link to="/login" className="font-semibold text-white hover:text-yellow-400">Portal Log In</Link>
          <Link to="/register" className="font-bold text-slate-900 bg-yellow-500 hover:bg-yellow-400 py-2 px-5 rounded-lg">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>

        <div className="lg:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <nav className="lg:hidden px-6 pt-2 pb-4 space-y-2 absolute w-full bg-slate-900 shadow-xl">
          <NavLinksContent isMobile={true} />
          <hr className="my-2 border-slate-700" />
          <Link to="/login" className="block py-2 text-slate-300 font-semibold hover:text-white">Portal Log In</Link>
          <Link to="/register" className="block w-full mt-2 text-center bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold py-2 px-4 rounded-lg">Get Started</Link>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
