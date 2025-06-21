// frontend/src/components/Navbar.tsx
import React, { useState } from 'react'; // Keep useState, for now, not removing it completely just in case it's used elsewhere
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
// import { useScrollSpy } from '../hooks/useScrollSpy'; // No longer needed for Navbar mobile
import { ArrowRight } from 'lucide-react'; // Removed Menu, X

const Navbar = () => {
  const { data: settings } = useSiteSettings();
  // const [isMenuOpen, setIsMenuOpen] = useState(false); // No longer needed for mobile hamburger

  // Nav links for desktop (and potentially public routes like Terms/Privacy that don't have sections)
  const navLinks = [
    { name: 'Features', href: '/#featuresPage' }, // Changed to full path for robustness
    { name: 'About', href: '/#aboutPage' },
    { name: 'Pricing', href: '/#pricingSection' },
    { name: 'Contact', href: '/#contact' },
  ];
  
  // const sectionIds = navLinks.map(link => link.href.substring(1)); // No longer used for Navbar's active state
  // const activeId = useScrollSpy(sectionIds, 150);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    if (href.startsWith('/#')) { // Only apply smooth scroll for section links
        e.preventDefault();
        const targetId = href.substring(2); // Remove '/#'
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
    // setIsMenuOpen(false); // No longer needed
  };

  const NavLinksContent = () => ( // Simplified, removed isMobile prop
    <>
      {navLinks.map((link) => {
        // Active state for desktop can still be based on scroll spy or simple path match
        // For simplicity, removed dynamic active class for desktop to match new mobile design philosophy
        return (
          <a
            key={link.name}
            href={link.href}
            onClick={(e) => handleScroll(e, link.href)}
            className={`font-medium transition-colors rounded-md px-3 py-2 text-gray-300 hover:text-white`}
          >
            {link.name}
          </a>
        );
      })}
    </>
  );

  return (
    <header className="bg-brand-dark/80 backdrop-blur-lg shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <a href="/" className="flex items-center space-x-3">
          <img src={settings?.logos?.navbarLogoUrl || "/logo-min.png"} alt="Company Logo" className="h-10" />
          <span className="text-xl font-bold text-white sm:inline">
            {settings?.logos?.companyName || 'HNV Solutions'}
          </span>
        </a>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-2">
          <NavLinksContent />
        </nav>
        
        {/* Desktop Auth Links */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link to="/login" className="font-semibold text-white hover:text-gray-300">Portal Log In</Link>
          <Link to="/register" className="flex items-center gap-2 font-bold text-brand-dark bg-white hover:bg-gray-200 py-2 px-5 rounded-lg">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile-specific Header Links (simplified) */}
        {/* These will be visible on mobile where the bottom nav is used */}
        <div className="lg:hidden flex items-center space-x-4">
            <Link to="/login" className="font-semibold text-white hover:text-gray-300 text-sm">Log In</Link>
            <Link to="/register" className="font-bold text-brand-dark bg-white hover:bg-gray-200 py-1.5 px-3 rounded-lg text-sm">
                Sign Up
            </Link>
        </div>
      </div>
      
      {/* Mobile Hamburger Menu (Removed, replaced by PublicBottomNavBar) */}
      {/* {isMenuOpen && ( ... )} */}
    </header>
  );
};

export default Navbar;
