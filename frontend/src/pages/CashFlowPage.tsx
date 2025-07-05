import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const CashFlowPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Cash Flow</h1>
        <p className="text-text-secondary mt-1">Track income and expenses</p>
      </div>

      <div className="text-center py-16">
        <div className="w-24 h-24 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
          <TrendingUp size={48} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold text-text-primary mb-2">Cash Flow Coming Soon</h3>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          Cash flow tracking and analysis features are being developed.
        </p>
      </div>
    </motion.div>
  );
};

export default CashFlowPage;