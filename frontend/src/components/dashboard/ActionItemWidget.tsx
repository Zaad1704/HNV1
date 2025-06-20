// frontend/src/components/dashboard/ActionItemWidget.tsx

import React from 'react';
import { Link } from 'react-router-dom';

const ActionItemWidget = ({ title, items, actionText, emptyText, linkTo }) => {
    return (
        <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700 h-full">
            <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
            {items && items.length > 0 ? (
                <ul className="space-y-4">
                    {items.map(item => (
                        <li key={item.id} className="bg-slate-900 p-4 rounded-lg flex justify-between items-center border border-slate-700">
                            <div>
                                <p className="font-semibold text-white">{item.primaryText}</p>
                                <p className="text-sm text-slate-400">{item.secondaryText}</p>
                            </div>
                            <Link to={linkTo} className="bg-cyan-600 text-white font-bold text-xs py-2 px-4 rounded-lg hover:bg-cyan-500">
                                {actionText}
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-slate-500 text-center py-8">{emptyText}</p>
            )}
        </div>
    );
};

export default ActionItemWidget;
