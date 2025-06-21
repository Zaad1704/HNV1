// frontend/src/pages/TermsPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings'; // Import useSiteSettings

const TermsPage = () => {
  const { data: settings, isLoading, isError } = useSiteSettings();

  if (isLoading) return <div className="text-center p-8">Loading Terms...</div>;
  if (isError || !settings?.termsPageContent) return <div className="text-red-500 text-center p-8">Error loading terms and conditions.</div>;

  return (
    <div className="bg-light-bg min-h-screen text-dark-text">
      <header className="bg-light-card/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-border-color">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img src={settings.logos?.faviconUrl || "https://placehold.co/40x40/FF7A00/FFFFFF?text=HNV"} alt="HNV Logo" className="h-10 w-10 rounded-lg" />
              <span className="text-xl font-bold text-dark-text">{settings.logos?.companyName || "HNV Property Management Solutions"}</span>
            </Link>
            <Link to="/login" className="font-semibold text-dark-text hover:text-brand-orange">
              Portal Log In
            </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        <div className="bg-light-card max-w-4xl mx-auto p-8 md:p-12 rounded-xl border border-border-color shadow-sm">
          <h1 className="text-4xl font-extrabold mb-6">{settings.termsPageContent.title}</h1>
          <p className="text-sm text-light-text mb-8">Last Updated: {settings.termsPageContent.lastUpdated}</p>

          <div className="prose prose-lg max-w-none prose-h3:text-brand-orange prose-h3:font-bold prose-a:text-brand-orange hover:prose-a:opacity-80"
               dangerouslySetInnerHTML={{ __html: settings.termsPageContent.content }}>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
