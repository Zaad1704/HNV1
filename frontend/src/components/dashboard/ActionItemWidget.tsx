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
        <div className="bg-light-card p-6 rounded-xl border border-border-color shadow-sm h-full"> {/* bg-light-card is now dark */}
            <h2 className="text-xl font-bold text-dark-text mb-4">{title}</h2> {/* text-dark-text is now light */}
            {items && items.length > 0 ? (
                <ul className="space-y-4">
                    {items.map(item => (
                        <li key={item.id} className="bg-brand-secondary p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center border border-border-color gap-2 sm:gap-4"> {/* bg-light-bg --> bg-brand-secondary, border-border-color is new */}
                            <div className="flex-grow">
                                <p className="font-semibold text-dark-text">{item.primaryText}</p> {/* text-dark-text is now light */}
                                <p className="text-sm text-light-text">{item.secondaryText}</p> {/* text-light-text is now light */}
                            </div>
                            {onActionClick ? ( // Render button if onActionClick is provided
                                <button
                                    onClick={() => onActionClick(item.id)}
                                    className="bg-brand-primary text-dark-text font-bold text-xs py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" // bg-brand-orange --> bg-brand-primary, text-white --> text-dark-text
                                    disabled={isActionLoading && loadingItemId === item.id}
                                >
                                    {isActionLoading && loadingItemId === item.id ? 'Sending...' : actionText}
                                </button>
                            ) : ( // Fallback to Link if no specific action
                                <Link to={linkTo} className="bg-brand-primary text-dark-text font-bold text-xs py-2 px-4 rounded-lg hover:opacity-90"> {/* bg-brand-orange --> bg-brand-primary, text-white --> text-dark-text */}
                                    {actionText}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-light-text text-center py-8">{emptyText}</p> {/* text-light-text is now light */}
            )}
        </div>
    );
};

export default ActionItemWidget;
