import React, { useState } from 'react';
import { Check, X, Trash2, Mail, Download, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface BulkActionsProps {
  selectedItems: string[];
  totalItems: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  actions: Array<{
    key: string;
    label: string;
    icon: React.ComponentType<any>;
    color: string;
    action: (selectedIds: string[]) => void;
  }>;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedItems,
  totalItems,
  onSelectAll,
  onClearSelection,
  actions
}) => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (actionFn: (ids: string[]) => void) => {
    setIsProcessing(true);
    try {
      await actionFn(selectedItems);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 z-50"
      >
        <div className="app-surface rounded-2xl border border-app-border shadow-app-xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 app-gradient rounded-full flex items-center justify-center">
                <Check size={16} className="text-white" />
              </div>
              <span className="font-semibold text-text-primary">
                {selectedItems.length} of {totalItems} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onSelectAll}
                className="text-sm text-brand-blue hover:text-brand-blue/80 font-medium"
              >
                Select All
              </button>
              <button
                onClick={onClearSelection}
                className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-app-bg"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {actions.map((action) => (
              <button
                key={action.key}
                onClick={() => handleAction(action.action)}
                disabled={isProcessing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${action.color} disabled:opacity-50`}
              >
                <action.icon size={16} />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BulkActions;