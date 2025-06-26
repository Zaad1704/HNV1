import React from 'react';
import { motion } from 'framer-motion';

interface Executive {
  name: string;
  position: string;
  bio: string;
  imageUrl?: string;
}

const LeadershipSection = () => {
  const executives: Executive[] = [
    {
      name: 'John Smith',
      position: 'CEO & Founder',
      bio: 'Over 15 years of experience in property management and technology.',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Sarah Johnson',
      position: 'CTO',
      bio: 'Former tech lead at major real estate platforms with expertise in scalable systems.',
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Michael Chen',
      position: 'Head of Product',
      bio: 'Product strategist focused on user experience and customer success.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ];

  return (
    <section className="py-20 bg-app-surface">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-text-primary mb-4">
            Meet Our Leadership
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Our experienced team is dedicated to revolutionizing property management.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {executives.map((executive: Executive, index: number) => (
            <motion.div
              key={executive.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                {executive.imageUrl ? (
                  <img
                    src={executive.imageUrl}
                    alt={executive.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full app-gradient flex items-center justify-center text-white text-2xl font-bold">
                    {executive.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-1">
                {executive.name}
              </h3>
              <p className="text-brand-blue font-medium mb-3">
                {executive.position}
              </p>
              <p className="text-text-secondary">
                {executive.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;