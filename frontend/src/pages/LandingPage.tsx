import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from '../services/i18n'; // Corrected import path

// --- Component ---
const LandingPageContent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  
  const [currency, setCurrency] = useState({ code: 'USD', symbol: '$', rate: 1 });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // --- PWA Installation Logic ---
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
    }
  };
  
  // --- Language & Currency Logic ---
  useEffect(() => {
    const fetchUserLocale = async () => {
        // In a real app, use an IP geolocation API. For now, we simulate.
        const simulatedLocation = 'BD'; // Test with 'BD', 'ES', or 'US'
        let lang = 'en', curr = { code: 'USD', symbol: '$', rate: 1 };

        if (simulatedLocation === 'BD') {
            lang = 'bn';
            curr = { code: 'BDT', symbol: '৳', rate: 117 };
        } else if (simulatedLocation === 'ES') {
            lang = 'es';
            curr = { code: 'EUR', symbol: '€', rate: 0.92 };
        }
        
        // Default to English, then ask to switch if a different locale is detected.
        i18n.changeLanguage('en');
        setCurrency({ code: 'USD', symbol: '$', rate: 1 });

        if (lang !== 'en') {
            if (window.confirm(`We've detected you might be in ${simulatedLocation}. Would you like to switch to your local language?`)) {
                i18n.changeLanguage(lang);
                setCurrency(curr);
            }
        }
    };
    fetchUserLocale();
  }, [i18n]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    if (lng === 'bn') setCurrency({ code: 'BDT', symbol: '৳', rate: 117 });
    else if (lng === 'es') setCurrency({ code: 'EUR', symbol: '€', rate: 0.92 });
    else setCurrency({ code: 'USD', symbol: '$', rate: 1 });
  };
  
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const executives = [
      { name: "Jane Doe", title: "Chief Executive Officer", img: "https://placehold.co/150x150/9333ea/ffffff?text=CEO" },
      { name: "John Smith", title: "Chief Technology Officer", img: "https://placehold.co/150x150/db2777/ffffff?text=CTO" },
      { name: "Alice Brown", title: "Chief Operations Officer", img: "https://placehold.co/150x150/16a34a/ffffff?text=COO" }
  ];

  // The Super Admin will eventually be able to change these URLs from the dashboard.
  const sectionBackgrounds = {
    hero: `url('https://placehold.co/1920x1080/020617/a5b4fc?text=Modern+City')`,
    features: `url('https://placehold.co/1920x1080/020617/6ee7b7?text=Sleek+Interior')`,
    about: `url('https://placehold.co/1920x1080/020617/fb923c?text=Architecture')`,
    pricing: `url('https://placehold.co/1920x1080/020617/f472b6?text=Glass+Building')`,
    cta: `url('https://placehold.co/1920x1080/020617/c084fc?text=Luxury+Living')`,
    contact: `url('https://placehold.co/1920x1080/020617/818cf8?text=Global+Network')`
  };

  return (
    <div className="bg-slate-900 text-slate-200">
      <header className="bg-slate-900/80 backdrop-blur-lg shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="https://placehold.co/40x40/6366f1/ffffff?text=HNV" alt="HNV Logo" className="h-10 w-10 rounded-lg" />
            <span className="text-base sm:text-lg md:text-xl font-bold text-white whitespace-nowrap">HNV Property Management Solutions</span>
          </div>
          <nav className="hidden lg:flex items-center space-x-6">
            <button onClick={() => scrollToSection('features')} className="text-slate-300 hover:text-cyan-400 font-medium transition-colors">{t('header.features')}</button>
            <button onClick={() => scrollToSection('about')} className="text-slate-300 hover:text-cyan-400 font-medium transition-colors">{t('header.about')}</button>
            <button onClick={() => scrollToSection('pricing')} className="text-slate-300 hover:text-cyan-400 font-medium transition-colors">{t('header.pricing')}</button>
            <button onClick={() => scrollToSection('contact')} className="text-slate-300 hover:text-cyan-400 font-medium transition-colors">{t('header.contact')}</button>
          </nav>
          <div className="hidden lg:flex items-center space-x-4">
            {deferredPrompt && (
              <button onClick={handleInstallClick} title="Install App" className="text-slate-300 hover:text-white font-semibold flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              </button>
            )}
            <Link to="/login" className="text-slate-300 font-semibold hover:text-white transition-colors">{t('header.login')}</Link>
            <Link to="/register" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-5 rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all">
              {t('header.getStarted')}
            </Link>
          </div>
          <div className="lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden px-6 pt-2 pb-4 space-y-2 absolute w-full bg-slate-900/95 shadow-xl">
            {/* Mobile Nav Links */}
            <div className="flex items-center justify-between py-2">
               <span className="text-sm font-medium text-slate-400">Language:</span>
               <div className="flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
                    <button onClick={() => changeLanguage('en')} className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'en' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>EN</button>
                    <button onClick={() => changeLanguage('bn')} className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'bn' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>BN</button>
                    <button onClick={() => changeLanguage('es')} className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'es' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>ES</button>
                </div>
            </div>
             {deferredPrompt && (
                <button onClick={handleInstallClick} className="w-full text-left py-2 text-slate-300 hover:text-white font-semibold flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>Install App</span>
                </button>
              )}
            <hr className="my-2 border-slate-700" />
            <Link to="/login" className="block py-2 text-slate-300 font-semibold hover:text-white">{t('header.login')}</Link>
            <Link to="/register" className="block w-full mt-2 text-center bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg">{t('header.getStarted')}</Link>
          </div>
        )}
      </header>

      <main>
        <section style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.8), rgba(2, 6, 23, 0.5)), ${sectionBackgrounds.hero}`}} className="relative bg-cover bg-center text-white py-24 sm:py-40">
          <div className="container mx-auto px-6 text-center sm:text-left relative z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">{t('hero.title')}</h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto sm:mx-0 mb-10">{t('hero.subtitle')}</p>
              <Link to="/register" className="bg-cyan-600 text-white font-bold py-3 px-6 md:py-4 md:px-10 rounded-lg text-base md:text-lg hover:bg-cyan-500 transition-all shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105">
                  {t('hero.cta')}
              </Link>
          </div>
        </section>

        <section id="features" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.features}`}} className="relative bg-cover bg-center py-20 text-white">
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">{t('features.title')}</h2>
              <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{t('features.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700 hover:border-teal-500 transition-all duration-300">
                <h3 className="text-xl font-bold text-teal-400 mb-3">{t('features.card1Title')}</h3>
                <p className="text-slate-300">{t('features.card1Text')}</p>
              </div>
              <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700 hover:border-teal-500 transition-all duration-300">
                <h3 className="text-xl font-bold text-teal-400 mb-3">{t('features.card2Title')}</h3>
                <p className="text-slate-300">{t('features.card2Text')}</p>
              </div>
              <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700 hover:border-teal-500 transition-all duration-300">
                <h3 className="text-xl font-bold text-teal-400 mb-3">{t('features.card3Title')}</h3>
                <p className="text-slate-300">{t('features.card3Text')}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.about}`}} className="relative bg-cover bg-center py-20 text-white">
          <div className="container mx-auto px-6 relative z-10">
               <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold">{t('about.title')}</h2>
                  <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{t('about.subtitle')}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                  <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                      <h3 className="text-2xl font-bold text-orange-400 mb-4">{t('about.missionTitle')}</h3>
                      <p className="mb-8 text-slate-300 leading-relaxed">{t('about.missionText')}</p>
                      <h3 className="text-2xl font-bold text-orange-400 mb-4">{t('about.visionTitle')}</h3>
                      <p className="text-slate-300 leading-relaxed">{t('about.visionText')}</p>
                  </div>
                   <div className="rounded-2xl overflow-hidden shadow-xl">
                      <img src="https://placehold.co/600x400/0c0a09/fb923c?text=Our+Vision" alt="Team Vision" className="w-full h-auto object-cover"/>
                  </div>
              </div>
               <div className="text-center mt-20">
                  <h2 className="text-3xl font-bold">{t('about.teamTitle')}</h2>
                  <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{t('about.teamSubtitle')}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-12 max-w-5xl mx-auto">
                  {executives.map((exec, index) => (
                      <div key={index} className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:scale-105 border border-slate-700">
                          <img src={exec.img} alt={exec.name} className="w-32 h-32 rounded-full mx-auto mb-5 border-4 border-orange-500" />
                          <h3 className="text-xl font-semibold text-white">{exec.name}</h3>
                          <p className="text-orange-400 font-medium">{exec.title}</p>
                      </div>
                  ))}
              </div>
          </div>
        </section>

        <section id="pricing" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.pricing}`}} className="relative bg-cover bg-center py-20 text-white">
          <div className="container mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold">{t('pricing.title')}</h2>
                  <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{t('pricing.subtitle')}</p>
              </div>
              <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                  <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-lg flex flex-col hover:scale-105 hover:border-slate-500 transition-all duration-300">
                      <h3 className="text-2xl font-bold text-slate-300">Free Trial</h3>
                      <p className="text-slate-400 mt-2">Explore basic features and get a feel for the platform.</p>
                      <div className="mt-6"><span className="text-5xl font-extrabold text-white">{currency.symbol}0</span></div>
                      <ul className="space-y-4 mt-8 text-slate-300 flex-grow"><li className="flex items-center"><span className="text-green-400 mr-3">✔</span>1 User</li><li className="flex items-center"><span className="text-green-400 mr-3">✔</span>5 Properties</li><li className="flex items-center"><span className="text-green-400 mr-3">✔</span>10 Tenants</li></ul>
                      <Link to="/register" className="w-full text-center mt-10 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-all">{t('pricing.cta')}</Link>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-md border-2 border-pink-500 rounded-2xl p-8 shadow-2xl flex flex-col scale-105">
                      <h3 className="text-2xl font-bold text-pink-400">{t('pricing.landlordPlan')}</h3>
                      <p className="text-slate-400 mt-2">{t('pricing.landlordDesc')}</p>
                      <div className="mt-6"><span className="text-5xl font-extrabold text-white">{currency.symbol}{Math.round(10 * currency.rate)}</span><span className="text-slate-400"> {t('pricing.perMonth')}</span></div>
                      <ul className="space-y-4 mt-8 text-slate-300 flex-grow"><li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature1')}</li><li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature2')}</li><li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature3')}</li><li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature4')}</li></ul>
                      <Link to="/register" className="w-full text-center mt-10 bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-pink-500/50 transition-all">{t('pricing.cta')}</Link>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-lg flex flex-col hover:scale-105 hover:border-slate-500 transition-all duration-300">
                      <h3 className="text-2xl font-bold text-white">{t('pricing.agentPlan')}</h3>
                      <p className="text-slate-400 mt-2">{t('pricing.agentDesc')}</p>
                      <div className="mt-6"><span className="text-5xl font-extrabold text-white">{currency.symbol}{Math.round(25 * currency.rate)}</span><span className="text-slate-400"> {t('pricing.perMonth')}</span></div>
                      <ul className="space-y-4 mt-8 text-slate-300 flex-grow"><li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature5')}</li><li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature6')}</li><li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature7')}</li><li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature8')}</li></ul>
                      <Link to="/register" className="w-full text-center mt-10 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-all">{t('pricing.cta')}</Link>
                  </div>
              </div>
               <p className="text-center text-xs text-slate-500 mt-4">{t('pricing.disclaimer')}</p>
          </div>
        </section>

        <section style={{backgroundImage: sectionBackgrounds.cta}} className="relative bg-cover bg-center py-20">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
          <div className="container mx-auto px-6 text-center relative z-10">
              <h2 className="text-3xl font-bold text-white">{t('cta.title')}</h2>
              <p className="mt-4 mb-8 text-slate-300 max-w-xl mx-auto">{t('cta.subtitle')}</p>
              <Link to="/register" className="bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-cyan-500 shadow-lg hover:shadow-cyan-500/50">
                  {t('cta.button')}
              </Link>
          </div>
        </section>
      </main>

     <footer id="contact" style={{backgroundImage: sectionBackgrounds.contact}} className="relative bg-cover bg-center text-gray-300 py-16">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"></div>
          <div className="container mx-auto px-6 relative z-10">
               <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-white">{t('contact.title')}</h2>
                  <p className="text-cyan-300 mt-4 max-w-2xl mx-auto">{t('contact.subtitle')}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                  <div className="space-y-8">
                       <div>
                          <h3 className="text-xl font-semibold text-white mb-2">{t('contact.officeTitle')}</h3>
                          <p className="text-slate-400">123 Property Lane, Suite 400<br/>Management City, MC 54321</p>
                      </div>
                       <div>
                          <h3 className="text-xl font-semibold text-white mb-2">{t('contact.phoneTitle')}</h3>
                          <p className="text-slate-400">General: (555) 123-4567<br/>Support: (555) 765-4321</p>
                      </div>
                       <div>
                          <h3 className="text-xl font-semibold text-white mb-2">{t('contact.emailTitle')}</h3>
                          <p className="text-slate-400">info@hnvpropertymanagementsolutions.com<br/>support@hnvpropertymanagementsolutions.com</p>
                      </div>
                  </div>
                  <div>
                      <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-lg border border-slate-700">
                          <h3 className="text-xl font-semibold text-white mb-4">{t('contact.formTitle')}</h3>
                          <form className="space-y-4">
                              <input type="text" placeholder={t('contact.nameLabel')} className="w-full p-3 rounded-md bg-slate-900 text-white border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                              <input type="email" placeholder={t('contact.emailLabel')} className="w-full p-3 rounded-md bg-slate-900 text-white border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                              <input type="text" placeholder={t('contact.subjectLabel')} className="w-full p-3 rounded-md bg-slate-900 text-white border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                              <textarea placeholder={t('contact.messageLabel')} rows="4" className="w-full p-3 rounded-md bg-slate-900 text-white border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"></textarea>
                              <button type="submit" className="w-full py-3 bg-cyan-600 font-semibold rounded-lg hover:bg-cyan-500">{t('contact.submitButton')}</button>
                          </form>
                      </div>
                  </div>
              </div>
          </div>
      </footer>
    </div>
  );
};

// Wrapper component to provide the i18n instance
const AppWrapper = () => (
  <I18nextProvider i18n={i18n}>
    <LandingPageContent />
  </I18nextProvider>
);

export default AppWrapper;
