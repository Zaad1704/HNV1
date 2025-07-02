import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, DollarSign, Wrench, Plus, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const QuickActions = () => {
  const actions = [
    {
      icon: Building2,
      label: 'Add Property',
      to: '/dashboard/properties/new',
      color: 'gradient-dark-orange-blue'
    },
    {
      icon: Users,
      label: 'Add Tenant',
      to: '/dashboard/tenants/new',
      color: 'gradient-orange-blue'
    },
    {
      icon: DollarSign,
      label: 'Record Payment',
      to: '/dashboard/payments/new',
      color: 'gradient-dark-orange-blue'
    },
    {
      icon: Wrench,
      label: 'Maintenance',
      to: '/dashboard/maintenance/new',
      color: 'gradient-orange-blue'
    },
    {
      icon: FileText,
      label: 'Add Expense',
      to: '/dashboard/expenses/new',
      color: 'gradient-dark-orange-blue'
    },
    {
      icon: Plus,
      label: 'Quick Add',
      to: '/dashboard/quick-add',
      color: 'gradient-orange-blue'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="app-surface rounded-3xl p-8 border border-app-border"
    >
      <h2 className="text-xl font-bold text-text-primary mb-6">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <Link
            key={action.label}
            to={action.to}
            className={`${action.color} text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:shadow-lg hover:scale-105 transition-all text-center`}
          >
            <action.icon size={24} />
            <span className="text-sm font-semibold">{action.label}</span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;