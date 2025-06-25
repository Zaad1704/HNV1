// frontend/src/pages/DashboardPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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

const DashboardPage = () => {
  return (
    <motion.main 
      className="p-6 pt-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          className="card bg-primary-card-gradient rounded-3xl p-8 sm:col-span-2 lg:col-span-2 lg:row-span-2 flex flex-col justify-between"
          variants={cardVariants}
          custom={0}
          initial="hidden"
          animate="visible"
        >
          <div>
            <div className="w-12 h-12 bg-white/25 rounded-full mb-4"></div>
            <h1 className="text-5xl font-bold text-white leading-tight">Dashboard</h1>
            <p className="text-white/80 mt-4 max-w-sm">Welcome to your property management hub. Access all your tools and insights from here.</p>
          </div>
          <Link to="/dashboard/properties" className="btn-light font-bold py-3 px-6 rounded-lg mt-8 self-start text-sm">
            View Properties
          </Link>
        </motion.div>

        <motion.div className="card neutral-glass rounded-3xl p-6 flex flex-col" variants={cardVariants} custom={1} initial="hidden" animate="visible">
          <div className="w-full h-24 bg-white/50 rounded-xl mb-4 flex items-center justify-center">
            {/* Chart or Stat Placeholder */}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Key Metrics</h2>
          <p className="text-gray-500 text-sm mt-2 flex-grow">A quick overview of your portfolio's performance.</p>
        </motion.div>

        <motion.div className="card neutral-glass rounded-3xl p-6 flex flex-col" variants={cardVariants} custom={2} initial="hidden" animate="visible">
          <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
          <p className="text-gray-500 text-sm mt-2 flex-grow">See the latest tenant payments and maintenance requests.</p>
          <Link to="/dashboard/audit-log" className="btn-dark font-semibold py-2 px-5 rounded-lg mt-4 self-start text-sm">View Log</Link>
        </motion.div>
        
        <motion.div className="card bg-secondary-card-gradient rounded-3xl p-6" style={{ transform: 'rotate(-4deg)'}} variants={cardVariants} custom={3} initial="hidden" animate="visible">
          <div className="w-10 h-10 bg-white/25 rounded-full mb-3"></div>
          <h2 className="text-xl font-bold text-white">Quick Links</h2>
          <p className="text-white/80 text-sm mt-1">Jump to your most used pages.</p>
        </motion.div>

        <motion.div className="card neutral-glass rounded-3xl p-6 flex flex-col justify-center items-center text-center" variants={cardVariants} custom={4} initial="hidden" animate="visible">
          <h2 className="text-3xl font-extrabold gradient-text">
              HNV Platform
          </h2>
        </motion.div>
        
        <motion.div className="card neutral-glass rounded-3xl p-6 sm:col-span-2" variants={cardVariants} custom={5} initial="hidden" animate="visible">
          <h3 className="text-gray-500 font-semibold text-sm">Announcements</h3>
          <h2 className="text-2xl font-bold mt-1 text-gray-800">Platform Updates</h2>
          <div className="mt-4 flex flex-col sm:flex-row gap-6 items-center">
              <img src="https://images.unsplash.com/photo-1521119989659-a83eee488004?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max" className="rounded-xl w-full sm:w-32 h-32 object-cover" alt="Update image"/>
              <div className="flex-1">
                  <p className="text-gray-600 text-sm">We've just launched new features to help you streamline your workflow. Check out the latest updates and let us know what you think!</p>
                  <a href="#" className="text-blue-600 font-semibold mt-2 inline-block hover:underline text-sm">Read more &rarr;</a>
              </div>
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
};

export default DashboardPage;
```

### **File 4: `frontend/src/components/layout/DashboardLayout.tsx`**

This file is now updated to act as the main "app window" for the dashboard, matching the desktop application style from your design.


```typescript
// frontend/src/components/layout/DashboardLayout.tsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AnimatePresence } from 'framer-motion';

const DashboardLayout = () => {
    const { user } = useAuthStore();

    return (
        <div className="p-4 sm:p-8 flex items-center justify-center w-full min-h-screen">
            {/* Desktop App Window Container */}
            <div className="app-window w-full max-w-7xl mx-auto bg-light-card rounded-3xl shadow-2xl border border-border-color overflow-hidden flex flex-col">
                {/* App Header */}
                <header className="flex-shrink-0 flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-red-400"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-yellow-400"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-green-400"></div>
                    </div>
                    <div className="font-bold text-lg text-gray-700">
                        <Link to="/dashboard">HNV Dashboard</Link>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500">
                        {/* You can add back search, settings, etc. here */}
                        <span className="font-semibold text-sm cursor-pointer hover:text-gray-900">
                            {user?.name}
                        </span>
                        <img 
                            src={`https://placehold.co/32x32/CBD5E0/4A5568?text=${user?.name?.charAt(0)}`}
                            alt="User Avatar"
                            className="rounded-full cursor-pointer"
                        />
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto">
                     <AnimatePresence mode="wait">
                        <Outlet />
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
