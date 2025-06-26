import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, AlertCircle } from 'lucide-react';

interface ActionItemWidgetProps {
  title: string;
  items: Array<{
    id: string;
    primaryText: string;
    secondaryText: string;
  }>;
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
          className="text-brand-blue hover:text-brand-blue/80 text-sm font-medium flex items-center gap-1"
        >
          View All <ExternalLink size={14} />
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-app-bg rounded-2xl">
              <div className="flex-1">
                <p className="font-medium text-text-primary text-sm">{item.primaryText}</p>
                <p className="text-text-secondary text-xs mt-1">{item.secondaryText}</p>
              </div>
              {onActionClick && (
                <button
                  onClick={() => onActionClick(item.id)}
                  disabled={isActionLoading && loadingItemId === item.id}
                  className="bg-brand-blue text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
                >
                  {isActionLoading && loadingItemId === item.id ? (
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    actionText
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertCircle size={32} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-secondary text-sm">{emptyText}</p>
        </div>
      )}
    </div>
  );
};

export default ActionItemWidget;