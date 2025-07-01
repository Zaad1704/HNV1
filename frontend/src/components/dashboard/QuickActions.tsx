import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Building2, CreditCard, FileText } from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Add Property',
      description: 'Add a new property to your portfolio',
      icon: Building2,
      to: '/dashboard/properties',
      color: 'bg-blue-500'
    },
    {
      title: 'Add Tenant',
      description: 'Register a new tenant',
      icon: Users,
      to: '/dashboard/tenants',
      color: 'bg-green-500'
    },
    {
      title: 'Record Payment',
      description: 'Log a rent payment',
      icon: CreditCard,
      to: '/dashboard/payments',
      color: 'bg-purple-500'
    },
    {
      title: 'Generate Report',
      description: 'Create financial reports',
      icon: FileText,
      to: '/dashboard/reports',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="app-surface rounded-3xl p-8 border border-app-border">
      <h2 className="text-xl font-bold text-text-primary mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link
            key={action.title}
            to={action.to}
            className="flex flex-col items-center p-6 bg-app-bg rounded-2xl hover:bg-app-surface hover:shadow-app transition-all duration-300 group"
          >
            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon size={20} className="text-white" />
            </div>
            <h3 className="font-semibold text-text-primary text-center mb-1">
              {action.title}
            </h3>
            <p className="text-sm text-text-secondary text-center">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;