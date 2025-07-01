import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface ActionItem {
  id: string;
  primaryText: string;
  secondaryText: string;
}

interface ActionItemWidgetProps {
  title: string;
  items: ActionItem[];
  actionText: string;
  emptyText: string;
  linkTo: string;
  onActionClick?: (itemId: string) => void;
  isActionLoading?: boolean;
  loadingItemId?: string | null;
}

const ActionItemWidget: React.FC<ActionItemWidgetProps> = ({
  title,
  items,
  actionText,
  emptyText,
  linkTo,
  onActionClick,
  isActionLoading,
  loadingItemId
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <Link
          to={linkTo}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
        >
          View All
          <ExternalLink size={14} />
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-app-bg rounded-2xl"
            >
              <div>
                <p className="font-medium text-text-primary">{item.primaryText}</p>
                <p className="text-sm text-text-secondary">{item.secondaryText}</p>
              </div>
              {onActionClick && (
                <button
                  onClick={() => onActionClick(item.id)}
                  disabled={isActionLoading && loadingItemId === item.id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isActionLoading && loadingItemId === item.id ? 'Loading...' : actionText}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-text-secondary">{emptyText}</p>
        </div>
      )}
    </div>
  );
};

export default ActionItemWidget;