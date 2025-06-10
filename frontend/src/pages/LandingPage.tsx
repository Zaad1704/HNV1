import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // A helper function for smooth scrolling
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-slate-50 text-slate-800">
      {/* Header & Navigation */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="https://placehold.co/40x40/4338ca/ffffff?text=HNV" alt="HNV Logo" className="h-10 w-10 rounded-lg" />
            <span className="text-2xl font-bold text-indigo-800">HNV Properties</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-indigo-600">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-indigo-600">Pricing</button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-600 hover:text-indigo-600">Contact</button>
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-gray-600 font-semibold hover:text-indigo-600">Portal Log In</Link>
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg transition-transform transform hover:scale-105">
              Get Started
            </Link>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden px-6 pt-2 pb-4 space-y-2">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-gray-600 hover:text-indigo-600">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="block w-full text-left py-2 text-gray-600 hover:text-indigo-600">Pricing</button>
            <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 text-gray-600 hover:text-indigo-600">Contact</button>
            <hr className="my-2" />
            <Link to="/login" className="block py-2 text-gray-600 font-semibold hover:text-indigo-600">Portal Log In</Link>
            <Link to="/register" className="block w-full mt-2 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">Get Started</Link>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-indigo-50 text-slate-800 py-24 sm:py-32">
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-indigo-900">The All-in-One Platform for Modern Property Management</h1>
                <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10">Automate tasks, track finances, and manage tenants with ease. HNV provides the tools you need to scale your property business efficiently.</p>
                <Link to="/register" className="bg-indigo-600 text-white font-bold py-4 px-10 rounded-lg text-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 shadow-lg">
                    Start Your Free Trial
                </Link>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Powerful Tools for Every Role</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">From individual landlords to large agencies, our platform is designed to fit your needs.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="bg-slate-50 p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105">
                <h3 className="text-xl font-bold text-indigo-800 mb-3">Centralized Dashboard</h3>
                <p>View properties, tenants, and payments at a glance. Get a clear overview of your entire portfolio's performance.</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105">
                <h3 className="text-xl font-bold text-indigo-800 mb-3">Secure Document Storage</h3>
                <p>Upload and manage lease agreements, tenant IDs, and other important documents in one secure, accessible location.</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105">
                <h3 className="text-xl font-bold text-indigo-800 mb-3">Audit Trails & Security</h3>
                <p>Track every important action with a detailed audit log. Your data is secure with our multi-tenant architecture.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Choose Your Plan</h2>
                    <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Simple, transparent pricing to help you grow. No hidden fees.</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-10 max-w-4xl mx-auto items-stretch">
                    <div className="bg-white border-2 border-indigo-600 rounded-2xl p-8 shadow-2xl flex flex-col">
                        <h3 className="text-2xl font-bold text-indigo-800">Landlord Plan</h3>
                        <p className="text-gray-500 mt-2">Perfect for property owners managing their own portfolio.</p>
                        <div className="mt-6">
                            <span className="text-5xl font-extrabold text-gray-800">$10</span>
                            <span className="text-gray-500"> / month</span>
                        </div>
                        <ul className="space-y-4 mt-8 text-slate-700 flex-grow">
                            <li className="flex items-center"><span className="text-green-500 mr-3">✔</span>Manage up to 20 Tenants</li>
                            <li className="flex items-center"><span className="text-green-500 mr-3">✔</span>Invite 1 Agent User</li>
                            <li className="flex items-center"><span className="text-green-500 mr-3">✔</span>Full Property & Payment Tracking</li>
                            <li className="flex items-center"><span className="text-green-500 mr-3">✔</span>Basic Reporting</li>
                        </ul>
                        <Link to="/register" className="w-full text-center mt-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg">Choose Landlord Plan</Link>
                    </div>
                    <div className="bg-white border rounded-2xl p-8 shadow-lg flex flex-col">
                        <h3 className="text-2xl font-bold text-gray-800">Agent Plan</h3>
                        <p className="text-gray-500 mt-2">For professional agents managing properties for multiple owners.</p>
                        <div className="mt-6">
                            <span className="text-5xl font-extrabold text-gray-800">$25</span>
                            <span className="text-gray-500"> / month</span>
                        </div>
                        <ul className="space-y-4 mt-8 text-slate-700 flex-grow">
                            <li className="flex items-center"><span className="text-green-500 mr-3">✔</span>Manage up to 50 Tenants</li>
                            <li className="flex items-center"><span className="text-green-500 mr-3">✔</span>Invite Unlimited Landlords</li>
                            <li className="flex items-center"><span className="text-green-500 mr-3">✔</span>Advanced Reporting & Analytics</li>
                            <li className="flex items-center"><span className="text-green-500 mr-3">✔</span>Priority Support</li>
                        </ul>
                         <Link to="/register" className="w-full text-center mt-10 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg">Choose Agent Plan</Link>
                    </div>
                </div>
                 <p className="text-center text-xs text-gray-500 mt-4">Subscription and billing are managed securely through our payment partner, 2Checkout.</p>
            </div>
        </section>

        {/* Contact Section */}
        <footer id="contact" className="bg-gray-800 text-gray-300 py-12">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
                <p className="text-indigo-200 max-w-xl mx-auto">Let's build the future of property management together.</p>
                <div className="mt-8">
                    <Link to="/register" className="bg-white text-indigo-700 font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-100 shadow-lg">Create Your Account</Link>
                </div>
            </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
