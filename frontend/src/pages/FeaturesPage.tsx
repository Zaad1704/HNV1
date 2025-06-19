import React from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { CheckCircle } from 'lucide-react'; // Example icon

const FeaturesPage = () => {
  const { data: settings, isLoading, isError } = useSiteSettings();

  if (isLoading) return <div>Loading...</div>;
  if (isError || !settings) return <div>Error loading content.</div>;
  
  return (
    <div className="py-20 bg-slate-800 text-white">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold">{settings.featuresPage?.title}</h1>
        <p className="text-slate-400 mt-4 max-w-2xl mx-auto">{settings.featuresPage?.subtitle}</p>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {settings.featuresPage?.features.map((feature, index) => (
            <div key={index} className="bg-slate-900/70 p-8 rounded-xl border border-slate-700">
              <CheckCircle className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default FeaturesPage;
