import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-slate-900 min-h-screen text-slate-300">
      <header className="bg-slate-800/50 backdrop-blur-md shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img src="https://placehold.co/40x40/f59e0b/0f172a?text=HNV" alt="HNV Logo" className="h-10 w-10 rounded-lg" />
              <span className="text-xl font-bold text-white">HNV Property Management Solutions</span>
            </Link>
            <Link to="/login" className="font-semibold text-white hover:text-yellow-400">
              Portal Log In
            </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-16">
        <div className="bg-slate-800/70 p-8 md:p-12 rounded-2xl border border-slate-700">
          <h1 className="text-4xl font-extrabold text-white mb-6">Privacy Policy</h1>
          <p className="text-sm text-slate-400 mb-8">Last Updated: June 11, 2025</p>

          <div className="prose prose-invert prose-lg max-w-none prose-h3:text-yellow-400 prose-h3:font-bold prose-a:text-cyan-400 hover:prose-a:text-cyan-300">
            <p>HNV Property Management Solutions ("HNV," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.</p>
            
            <h3>1. Information We Collect</h3>
            <p>We may collect personally identifiable information, such as your name, email address, and phone number, when you register. We may also collect financial data related to your payment method, which is processed and stored securely by our payment processor, 2Checkout. We also collect derivative data like your IP address and browser type for analytics.</p>

            <h3>2. Use of Your Information</h3>
            <p>We use your information to create and manage your account, process payments, communicate with you, and improve our Service. We do not share your information with third parties except as necessary to provide the Service (e.g., with our payment processor) or as required by law.</p>
            
            <h3>3. Security of Your Information</h3>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the information you provide, please be aware that no security measures are perfect or impenetrable.</p>

            <h3>4. Your Rights Regarding Your Information</h3>
            <p>You may review or change your account information at any time. As detailed in our Terms and Conditions, you may also request an export of your data or the permanent deletion of your account. If you are a resident of a region with specific data protection rights (like GDPR), we will take reasonable steps to allow you to exercise those rights.</p>
            
            <h3>5. Contact Us</h3>
            <p>If you have questions or comments about this Privacy Policy, please contact us at: <strong>privacy@hnvpropertymanagementsolutions.com</strong>.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
