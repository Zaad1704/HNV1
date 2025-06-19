import React from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';

const AboutPage = () => {
  const { data: settings, isLoading, isError } = useSiteSettings();

  if (isLoading) return <div>Loading...</div>;
  if (isError || !settings) return <div>Error loading content.</div>;

  return (
    <div className="py-20 bg-slate-800 text-white">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center">{settings.aboutPage?.title}</h1>
        <p className="text-slate-400 mt-4 max-w-3xl mx-auto text-center">{settings.aboutPage?.subtitle}</p>
        
        {/* Leadership Section */}
        <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-white">{settings.aboutPage?.teamTitle}</h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-center">{settings.aboutPage?.teamSubtitle}</p>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {settings.aboutPage?.executives.map((exec, index) => (
                    <div key={index} className="text-center">
                        <img src={exec.imageUrl} alt={exec.name} className="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-slate-700"/>
                        <h4 className="text-xl font-bold text-white">{exec.name}</h4>
                        <p className="text-cyan-400">{exec.title}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
export default AboutPage;
