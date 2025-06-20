// frontend/src/components/dashboard/ActionItemWidget.tsx

import React from 'react';
import { Link } from 'react-router-dom';

const ActionItemWidget = ({ title, items, actionText, emptyText, linkTo }) => {
    return (
        <div className="bg-light-card p-6 rounded-xl border border-border-color shadow-sm h-full">
            <h2 className="text-xl font-bold text-dark-text mb-4">{title}</h2>
            {items && items.length > 0 ? (
                <ul className="space-y-4">
                    {items.map(item => (
                        <li key={item.id} className="bg-light-bg p-4 rounded-lg flex justify-between items-center border border-border-color">
                            <div>
                                <p className="font-semibold text-dark-text">{item.primaryText}</p>
                                <p className="text-sm text-light-text">{item.secondaryText}</p>
                            </div>
                            <Link to={linkTo} className="bg-brand-orange text-white font-bold text-xs py-2 px-4 rounded-lg hover:opacity-90">
                                {actionText}
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-light-text text-center py-8">{emptyText}</p>
            )}
        </div>
    );
};

export default ActionItemWidget;
