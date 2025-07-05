import React from 'react';
import { CheckSquare, X } from 'lucide-react';

interface BulkAction {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
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
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <CheckSquare size={20} className="text-blue-600" />
          <span className="font-medium text-gray-900 dark:text-white">
            {selectedItems.length} of {totalItems} selected
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onSelectAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Select All
          </button>
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Clear
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <button
              key={action.key}
              onClick={() => action.action(selectedItems)}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${action.color}`}
            >
              <action.icon size={16} />
              {action.label}
            </button>
          ))}
        </div>
        
        <button
          onClick={onClearSelection}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default BulkActions;