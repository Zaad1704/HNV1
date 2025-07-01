import React from 'react';
import { CheckSquare, Square } from 'lucide-react';

interface BulkAction {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  action: (ids: string[]) => void;
}

interface BulkActionsProps {
  selectedItems: string[];
  totalItems: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  actions: BulkAction[];
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedItems,
  totalItems,
  onSelectAll,
  onClearSelection,
  actions
}) => {
  if (selectedItems.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={selectedItems.length === totalItems ? onClearSelection : onSelectAll}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {selectedItems.length === totalItems ? (
              <CheckSquare size={20} className="text-blue-600" />
            ) : (
              <Square size={20} className="text-gray-400" />
            )}
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedItems.length} selected
          </span>
        </div>
        
        <div className="flex gap-2">
          {actions.map((action) => (
            <button
              key={action.key}
              onClick={() => action.action(selectedItems)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${action.color}`}
            >
              <action.icon size={16} />
              {action.label}
            </button>
          ))}
        </div>
        
        <button
          onClick={onClearSelection}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default BulkActions;