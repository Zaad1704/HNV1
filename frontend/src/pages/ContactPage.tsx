import React from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';

const ContactPage = () => {
  const { data: settings, isLoading, isError } = useSiteSettings();

  if (isLoading) return <div>Loading...</div>;
  if (isError || !settings) return <div>Error loading content.</div>;
  
  return (
    <div className="py-20 bg-slate-800 text-white">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center">{settings.contactPage?.title}</h1>
        <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-center">{settings.contactPage?.subtitle}</p>

        <div className="mt-16 grid md:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-slate-900/70 p-8 rounded-xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-6">{settings.contactPage?.formTitle}</h3>
                <form className="space-y-4">
                    {/* Form fields here */}
                </form>
            </div>
            {/* Addresses */}
            <div className="space-y-8">
                {settings.contactPage?.addresses.map((addr, index) => (
                    <div key={index}>
                        <h4 className="text-xl font-bold text-cyan-400">{addr.locationName}</h4>
                        <p className="text-slate-300 mt-2">{addr.fullAddress}</p>
                        <p className="text-slate-300">{addr.phone}</p>
                        <p className="text-slate-300">{addr.email}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
export default ContactPage;
