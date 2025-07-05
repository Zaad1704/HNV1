import React, { useState, useRef, useEffect } from 'react';
import { Building2, Users, DollarSign, Settings, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useDragControls } from 'framer-motion';

const FloatingQuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

  const quickActions = [
    { icon: Building2, label: 'Add Property', to: '/dashboard/properties/new', color: 'gradient-dark-orange-blue' },
    { icon: Users, label: 'Manage Tenants', to: '/dashboard/tenants', color: 'gradient-orange-blue' },
    { icon: DollarSign, label: 'View Payments', to: '/dashboard/payments', color: 'gradient-dark-orange-blue' },
    { icon: Settings, label: 'Settings', to: '/dashboard/settings', color: 'gradient-orange-blue' }
  ];

  useEffect(() => {
    // Set initial position to bottom left
    setPosition({ x: 100, y: window.innerHeight - 100 });
  }, []);

  if (!isOpen) {
    return (
      <motion.div
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none z-30"
      >
        <motion.button
          drag
          dragControls={dragControls}
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          whileDrag={{ scale: 1.1 }}
          onClick={() => setIsOpen(true)}
          className="absolute bg-gradient-to-r from-orange-500 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 pointer-events-auto cursor-move"
          style={{ 
            left: position.x - 32, 
            top: position.y - 32,
            touchAction: 'none'
          }}
          onDragEnd={(event, info) => {
            setPosition({
              x: Math.max(32, Math.min(window.innerWidth - 32, position.x + info.offset.x)),
              y: Math.max(32, Math.min(window.innerHeight - 32, position.y + info.offset.y))
            });
          }}
          aria-label="Open quick actions (draggable)"
        >
          <Plus size={24} />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-app-surface rounded-3xl max-w-2xl w-full p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Quick Actions</h2>
              <p className="text-text-secondary">Frequently used actions</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-app-bg transition-colors"
            aria-label="Close quick actions"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={action.label}
              to={action.to}
              onClick={() => setIsOpen(false)}
              className={`${action.color} text-white p-6 rounded-2xl flex flex-col items-center gap-3 hover:shadow-lg hover:scale-105 transition-all`}
            >
              <action.icon size={32} />
              <span className="text-lg font-semibold text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FloatingQuickActions;