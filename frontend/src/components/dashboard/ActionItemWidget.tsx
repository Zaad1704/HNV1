// frontend/src/components/dashboard/ActionItemWidget.tsx

import React from 'react';
import { Link } from 'react-router-dom';

// Define props to accept onActionClick as a function
interface ActionItemWidgetProps {
  title: string;
  items: {
    id: string;
    primaryText: string;
    secondaryText: string;
  }[];
  actionText: string;
  emptyText: string;
  linkTo: string; // The original link if they want to navigate to the list page
  onActionClick?: (itemId: string) => void; // NEW PROP: Function to call on action button click
  isActionLoading?: boolean; // NEW PROP: To show loading state on action button
  loadingItemId?: string | null; // NEW PROP: To identify which item is loading
}

const ActionItemWidget: React.FC<ActionItemWidgetProps> = ({ 
    title, items, actionText, emptyText, linkTo, 
    onActionClick, isActionLoading = false, loadingItemId = null 
}) => {
    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-border-color dark:border-border-color-dark shadow-sm h-full transition-all duration-200">
            <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark mb-4">{title}</h2>
            {items && items.length > 0 ? (
                <ul className="space-y-4">
                    {items.map(item => (
                        <li key={item.id} className="bg-light-bg dark:bg-dark-bg/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center border border-border-color dark:border-border-color-dark gap-2 sm:gap-4 transition-all duration-150">
                            <div className="flex-grow">
                                <p className="font-semibold text-dark-text dark:text-dark-text-dark">{item.primaryText}</p>
                                <p className="text-sm text-light-text dark:text-light-text-dark">{item.secondaryText}</p>
                            </div>
                            {onActionClick ? ( // Render button if onActionClick is provided
                                <button
                                    onClick={() => onActionClick(item.id)}
                                    className="bg-brand-primary text-dark-text font-bold text-xs py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    disabled={isActionLoading && loadingItemId === item.id}
                                >
                                    {isActionLoading && loadingItemId === item.id ? 'Sending...' : actionText}
                                </button>
                            ) : ( // Fallback to Link if no specific action
                                <Link to={linkTo} className="bg-brand-primary text-dark-text font-bold text-xs py-2 px-4 rounded-lg hover:opacity-90 transition-colors duration-200">
                                    {actionText}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-light-text dark:text-light-text-dark text-center py-8">{emptyText}</p>
            )}
        </div>
    );
};

export default ActionItemWidget;
