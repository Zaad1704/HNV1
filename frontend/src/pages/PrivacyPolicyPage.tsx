// frontend/src/pages/PrivacyPolicyPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';

// Static content from the provided text file
const privacyContent = `
**Privacy Policy for HNV Property Management Solutions**

**Last Updated: June 24, 2025**

HNV Property Management Solutions ("HNV," "we," "us," or "our") is committed to protecting your privacy.
This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, services, and software platform (collectively, the "Service").
**1. Information We Collect**

We may collect information about you in a variety of ways:

* **Personal Data**: Personally identifiable information, such as your name, email address, telephone number, and professional role, that you voluntarily provide when you register for the Service.
* **Financial Data**: Data related to your payment method (e.g., valid credit card number, card brand, expiration date) that you provide when subscribing to a paid plan.
All financial information is stored and processed by our secure third-party payment processor.
* **User-Generated Content**: Information you upload to the platform, such as property details, tenant information, lease agreements, financial records, and maintenance requests.
* **Derivative Data**: Information our servers automatically collect, such as your IP address, browser type, operating system, and access times.
**2. Use of Your Information**

We use the information collected to:

* Create and manage your account.
* Provide, operate, and maintain our Service.
* Process your payments and manage your subscriptions.
* Communicate with you, including responding to your comments, questions, and support requests.
* Send you technical notices, updates, security alerts, and administrative messages.
* Monitor and analyze usage and trends to improve your experience and the Service's functionality.
* Comply with legal obligations.
**3. Disclosure of Your Information**

We do not sell your personal information.
We may share your information in the following limited circumstances:

* **With Your Consent**: We may share your information with your consent or at your direction.
* **Third-Party Service Providers**: We may share your information with third parties that perform services for us, including payment processing, data analysis, email delivery, and hosting services.
These service providers are contractually bound to protect your information.
* **Legal Compliance**: We may disclose information if required to do so by law or in the good faith belief that such action is necessary to comply with a legal obligation, protect and defend our rights or property, or prevent fraud.
* **Business Transfers**: We may share or transfer your information in connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business.
**4. Data Security**

We use administrative, technical, and physical security measures to help protect your personal information.
While we have taken reasonable steps to secure the information you provide, no security measures are perfect or impenetrable.

**5. Data Retention**

We will retain your personal information for as long as is necessary to fulfill the purposes outlined in this Privacy Policy unless a longer retention period is required or permitted by law.
**6. Your Data Protection Rights**

Depending on your location, you may have the following rights regarding your personal information:

* The right to access, update, or delete the information we have on you.
* The right of rectification.
* The right to object to our processing of your information.
* The right of restriction.
* The right to data portability.
* The right to withdraw consent.
You can exercise these rights through your account settings or by contacting us directly.

**7. International Data Transfers**

Your information may be transferred to — and maintained on — computers located outside of your state, province, or country where the data protection laws may differ.
**8. Changes to This Privacy Policy**

We may update this Privacy Policy from time to time.
We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
**9. Contact Us**

If you have any questions about this Privacy Policy, please contact us at: **privacy@hnvpm.com**.
`;

const PrivacyPolicyPage = () => {
    const { data: settings, isLoading } = useSiteSettings();

    if (isLoading) return <div className="text-center p-8">Loading...</div>;

    return (
        <div className="bg-light-bg min-h-screen text-dark-text">
            <header className="bg-light-card/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-border-color">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-3">
                        <img src={settings?.logos?.faviconUrl || "/logo-min.png"} alt="HNV Logo" className="h-10 w-10 rounded-lg" width="40" height="40" /> {/* Added width and height */}
                        <span className="text-xl font-bold text-dark-text">{settings?.logos?.companyName || "HNV Property Management"}</span>
                    </Link>
                    <Link to="/login" className="font-semibold text-dark-text hover:text-brand-primary">
                        Portal Log In
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-16">
                <div className="bg-light-card max-w-4xl mx-auto p-8 md:p-12 rounded-xl border border-border-color shadow-sm">
                    <h1 className="text-4xl font-extrabold mb-6">Privacy Policy</h1>
                    <div className="prose prose-lg max-w-none prose-h3:font-bold prose-a:text-brand-primary hover:prose-a:opacity-80"
                        dangerouslySetInnerHTML={{ __html: privacyContent.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicyPage;
