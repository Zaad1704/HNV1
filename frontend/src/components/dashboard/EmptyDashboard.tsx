import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Plus } from 'lucide-react';

const EmptyDashboard = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-20 h-20 app-gradient rounded-full flex items-center justify-center mx-auto mb-6">
          <Building2 size={32} className="text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          Welcome to Your Dashboard!
        </h2>
        
        <p className="text-text-secondary mb-8">
          You're all set up! Start by adding your first property to begin managing your real estate portfolio.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/dashboard/properties"
            className="w-full btn-gradient py-3 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Your First Property
          </Link>
          
          <Link
            to="/dashboard/settings"
            className="w-full border border-app-border py-3 px-6 rounded-2xl font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            Configure Settings
          </Link>
        </div>
        
        <div className="mt-8 p-4 bg-app-surface rounded-2xl border border-app-border">
          <h3 className="font-semibold text-text-primary mb-2">Quick Start Tips:</h3>
          <ul className="text-sm text-text-secondary space-y-1 text-left">
            <li>• Add properties to track your portfolio</li>
            <li>• Invite tenants to manage payments</li>
            <li>• Set up maintenance tracking</li>
            <li>• Configure automated reminders</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmptyDashboard;