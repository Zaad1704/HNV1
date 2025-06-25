// frontend/src/components/landing/HeroSection.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const HeroSection = () => {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <section className="relative py-20 md:py-32 flex items-center justify-center text-center overflow-hidden bg-light-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
        >
          {/* Main Hero Card */}
          <motion.div 
            className="card primary-card-gradient rounded-3xl p-8 sm:col-span-2 lg:col-span-2 lg:row-span-2 flex flex-col justify-between"
            variants={cardVariants}
            custom={0}
          >
            <div>
              <div className="w-12 h-12 bg-white/25 rounded-full mb-4"></div>
              <h1 className="text-5xl font-bold text-white leading-tight">
                {settings?.heroSection?.title || t('landing.hero_title')}
              </h1>
              <p className="text-white/80 mt-4 max-w-sm">
                {settings?.heroSection?.subtitle || t('landing.hero_subtitle')}
              </p>
            </div>
            <Link to="/register" className="btn-light font-bold py-3 px-6 rounded-lg mt-8 self-start text-sm">
                {settings?.heroSection?.ctaText || t('landing.hero_cta')}
            </Link>
          </motion.div>

          {/* Other cards from the Yartee design */}
          <motion.div className="card neutral-glass rounded-3xl p-6 flex flex-col" variants={cardVariants} custom={1}>
            <div className="w-full h-24 bg-white/50 rounded-xl mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800">Herre</h2>
            <p className="text-gray-500 text-sm mt-2 flex-grow">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.</p>
          </motion.div>

          <motion.div className="card neutral-glass rounded-3xl p-6 flex flex-col" variants={cardVariants} custom={2}>
            <h2 className="text-2xl font-bold text-gray-800">Adcure Aoticles</h2>
            <p className="text-gray-500 text-sm mt-2 flex-grow">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <button className="btn-dark font-semibold py-2 px-5 rounded-lg mt-4 self-start text-sm">Call Natin</button>
          </motion.div>
          
          <motion.div className="card secondary-card-gradient rounded-3xl p-6" style={{ transform: 'rotate(-4deg)'}} variants={cardVariants} custom={3}>
            <div className="w-10 h-10 bg-white/25 rounded-full mb-3"></div>
            <h2 className="text-xl font-bold text-white">Spoder Noot</h2>
            <p className="text-white/80 text-sm mt-1">Lorem ipsum dolor sit amet.</p>
          </motion.div>

          <motion.div className="card neutral-glass rounded-3xl p-6 flex flex-col justify-center items-center text-center" variants={cardVariants} custom={4}>
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-primary-card-gradient">
                Here Greant
            </h2>
          </motion.div>
          
          <motion.div className="card neutral-glass rounded-3xl p-6 sm:col-span-2" variants={cardVariants} custom={5}>
            <h3 className="text-gray-500 font-semibold text-sm">Blog</h3>
            <h2 className="text-2xl font-bold mt-1 text-gray-800">Featured Articles</h2>
            <div className="mt-4 flex flex-col sm:flex-row gap-6 items-center">
                <img src="https://images.unsplash.com/photo-1521119989659-a83eee488004?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max" className="rounded-xl w-full sm:w-32 h-32 object-cover" alt="Blog post image"/>
                <div className="flex-1">
                    <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                    <a href="#" className="text-blue-600 font-semibold mt-2 inline-block hover:underline text-sm">Read more &rarr;</a>
                </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
