import React, { useState } from 'react';
import { Plus, Building, Users, CreditCard, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingQuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Building, label: 'Add Property', href: '/dashboard/properties?action=add', color: 'bg-blue-500' },
    { icon: Users, label: 'Add Tenant', href: '/dashboard/tenants?action=add', color: 'bg-green-500' },
    { icon: CreditCard, label: 'Record Payment', href: '/dashboard/payments?action=add', color: 'bg-purple-500' },
    { icon: Wrench, label: 'Maintenance', href: '/dashboard/maintenance?action=add', color: 'bg-orange-500' },
  ];

  return (
    <div className="fixed bottom-24 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={action.href}
                  className={`${action.color} hover:opacity-90 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all`}
                  onClick={() => setIsOpen(false)}
                >
                  <action.icon size={20} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all transform ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default FloatingQuickActions;