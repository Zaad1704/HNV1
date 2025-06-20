import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-light-bg min-h-screen text-dark-text">
       <header className="bg-light-card/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-border-color">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img src="https://placehold.co/40x40/FF7A00/FFFFFF?text=HNV" alt="HNV Logo" className="h-10 w-10 rounded-lg" />
              <span className="text-xl font-bold text-dark-text">HNV Property Solutions</span>
            </Link>
            <Link to="/login" className="font-semibold text-dark-text hover:text-brand-orange">
              Portal Log In
            </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-16">
        <div className="bg-light-card max-w-4xl mx-auto p-8 md:p-12 rounded-xl border border-border-color shadow-sm">
          <h1 className="text-4xl font-extrabold mb-6">Privacy Policy</h1>
          <p className="text-sm text-light-text mb-8">Last Updated: June 21, 2025</p>

          <div className="prose prose-lg max-w-none prose-h3:text-brand-orange prose-h3:font-bold prose-a:text-brand-orange hover:prose-a:opacity-80">
            <p>HNV Property Management Solutions ("HNV," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.</p>
            
            <h3>1. Information We Collect</h3>
            <p>We may collect personally identifiable information, such as your name, email address, and phone number, when you register. We may also collect financial data related to your payment method, which is processed and stored securely by our payment processor, 2Checkout. We also collect derivative data like your IP address and browser type for analytics.</p>

            <h3>2. Use of Your Information</h3>
            <p>We use your information to create and manage your account, process payments, communicate with you, and improve our Service. We do not share your information with third parties except as necessary to provide the Service (e.g., with our payment processor) or as required by law.</p>
            
            <h3>3. Security of Your Information</h3>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the information you provide, please be aware that no security measures are perfect or impenetrable.</p>
            
            <h3>4. Contact Us</h3>
            <p>If you have questions or comments about this Privacy Policy, please contact us at: <strong>privacy@hnvpropertysolutions.com</strong>.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
