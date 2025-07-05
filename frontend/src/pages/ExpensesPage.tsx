import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Plus } from 'lucide-react';

const ExpensesPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Expenses</h1>
          <p className="text-text-secondary mt-1">Track property expenses and costs</p>
        </div>
        <button className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold">
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      <div className="text-center py-16">
        <div className="w-24 h-24 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
          <DollarSign size={48} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold text-text-primary mb-2">Expense Tracking Coming Soon</h3>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          Expense management and reporting features are being developed.
        </p>
      </div>
    </motion.div>
  );
};

export default ExpensesPage;