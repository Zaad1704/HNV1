import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
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
          <h1 className="text-4xl font-extrabold text-white mb-6">Terms and Conditions</h1>
          <p className="text-sm text-slate-400 mb-8">Last Updated: June 11, 2025</p>

          <div className="prose prose-invert prose-lg max-w-none prose-h3:text-yellow-400 prose-h3:font-bold prose-a:text-cyan-400 hover:prose-a:text-cyan-300">
            <p>Welcome to HNV Property Management Solutions ("HNV," "we," "us," or "our"). These Terms and Conditions ("Terms") govern your access to and use of our website, services, and software platform (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy.</p>
            
            <h3>1. Account Registration & Use</h3>
            <p>You must be at least 18 years old to create an account. You are responsible for safeguarding your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.</p>

            <h3>2. Subscriptions and Billing</h3>
            <p>Our Service is offered under various subscription plans. By selecting a paid plan, you agree to pay the applicable fees. All payments are processed by our third-party payment processor, 2Checkout. We reserve the right, at our sole discretion, for Super Admins or Moderators to manually activate, deactivate, or modify the duration of any subscription plan for administrative or support reasons.</p>
            
            <h3>3. User Data & Content</h3>
            <p>You retain all ownership rights to the data you upload to the Service. By using the Service, you grant us a limited license to host, copy, and display Your Content as necessary to provide the Service to you.</p>

            <h3>4. Data Portability & Account Deletion</h3>
            <p>You may request an export of your data or the permanent deletion of your account through your "Settings" page. We reserve the right for a Super Admin or Moderator to enable or disable the self-service account deletion feature for any organization. Once a deletion request is confirmed and processed after a grace period, this action is irreversible.</p>

            <h3>5. Agent Data Syncing</h3>
            <p>The Service may provide features allowing a Super Admin or Moderator to sync or share specific data sets between different Agent accounts. This action will only be performed for administrative or support purposes.</p>

            <h3>6. Limitation of Liability</h3>
            <p>To the maximum extent permitted by law, HNV shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, resulting from your access to or use of the Service.</p>
            
            <h3>7. Changes to Terms</h3>
            <p>We reserve the right to modify these Terms at any time. We will provide notice of any material changes by posting the new Terms on the Service or by sending you an email.</p>

            <h3>8. Contact Information</h3>
            <p>If you have any questions about these Terms, please contact us at: <strong>legal@hnvpropertymanagementsolutions.com</strong>.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
