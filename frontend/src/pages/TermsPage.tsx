import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="bg-light-bg min-h-screen text-dark-text">
      <header className="bg-light-card/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-border-color">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img src="https://placehold.co/40x40/FF7A00/FFFFFF?text=HNV" alt="HNV Logo" className="h-10 w-10 rounded-lg" />
              <span className="text-xl font-bold text-dark-text">HNV Property Managment Solutions</span>
            </Link>
            <Link to="/login" className="font-semibold text-dark-text hover:text-brand-orange">
              Portal Log In
            </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-16">
        <div className="bg-light-card max-w-4xl mx-auto p-8 md:p-12 rounded-xl border border-border-color shadow-sm">
          <h1 className="text-4xl font-extrabold mb-6">Terms and Conditions</h1>
          <p className="text-sm text-light-text mb-8">Last Updated: June 21, 2025</p>

          <div className="prose prose-lg max-w-none prose-h3:text-brand-orange prose-h3:font-bold prose-a:text-brand-orange hover:prose-a:opacity-80">
            <p>Welcome to HNV Property Management Solutions ("HNV," "we," "us," or "our"). These Terms and Conditions ("Terms") govern your access to and use of our website, services, and software platform (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy.</p>
            
            <h3>1. Account Registration & Use</h3>
            <p>You must be at least 18 years old to create an account. You are responsible for safeguarding your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.</p>

            <h3>2. Subscriptions and Billing</h3>
            <p>Our Service is offered under various subscription plans. By selecting a paid plan, you agree to pay the applicable fees. All payments are processed by our third-party payment processor, 2Checkout.</p>
            
            <h3>3. User Data & Content</h3>
            <p>You retain all ownership rights to the data you upload to the Service. By using the Service, you grant us a limited license to host, copy, and display Your Content as necessary to provide the Service to you.</p>

            <h3>4. Limitation of Liability</h3>
            <p>To the maximum extent permitted by law, HNV shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, resulting from your access to or use of the Service.</p>
            
            <h3>5. Changes to Terms</h3>
            <p>We reserve the right to modify these Terms at any time. We will provide notice of any material changes by posting the new Terms on the Service or by sending you an email.</p>

            <h3>6. Contact Information</h3>
            <p>If you have any questions about these Terms, please contact us at: <strong>legal@hnvpropertysolutions.com</strong>.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
