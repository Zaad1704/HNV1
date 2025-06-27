import React from 'react';
import { Plus, Users, Building2, CreditCard, Wrench, FileText, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const { t } = useTranslation();

  const actions = [
    {
      icon: Building2,
      label: 'Add Property',
      description: 'Add new property',
      color: 'from-blue-500 to-blue-600',
      action: () => {/* Open modal */}
    },
    {
      icon: Users,
      label: 'Add Tenant',
      description: 'Register new tenant',
      color: 'from-green-500 to-green-600',
      action: () => {/* Open modal */}
    },
    {
      icon: CreditCard,
      label: 'Record Payment',
      description: 'Log rent payment',
      color: 'from-purple-500 to-purple-600',
      action: () => {/* Open modal */}
    },
    {
      icon: Wrench,
      label: 'Maintenance',
      description: 'Create request',
      color: 'from-orange-500 to-orange-600',
      action: () => {/* Open modal */}
    },
    {
      icon: FileText,
      label: 'Generate Report',
      description: 'Financial report',
      color: 'from-indigo-500 to-indigo-600',
      action: () => {/* Open modal */}
    },
    {
      icon: MessageSquare,
      label: 'Send Message',
      description: 'Contact tenant',
      color: 'from-pink-500 to-pink-600',
      action: () => {/* Open modal */}
    }
  ];

  return (
    <div className="app-surface rounded-3xl p-6 border border-app-border">
      <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-3">
        <div className="w-8 h-8 app-gradient rounded-lg flex items-center justify-center">
          <Plus size={16} className="text-white" />
        </div>
        Quick Actions
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={action.action}
            className="group p-4 rounded-2xl bg-app-bg hover:bg-app-border transition-all duration-300 text-left touch-feedback"
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon size={20} className="text-white" />
            </div>
            <h3 className="font-semibold text-text-primary text-sm mb-1">
              {action.label}
            </h3>
            <p className="text-xs text-text-secondary">
              {action.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;