// frontend/src/components/dashboard/FinancialSnapshotCard.tsx

import React from 'react';

const FinancialSnapshotCard = ({ title, value, icon, currency = '' }) => {
    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-border-color dark:border-border-color-dark shadow-sm flex items-start justify-between transition-all duration-200">
            <div>
                <p className="text-sm font-medium text-light-text dark:text-light-text-dark">{title}</p>
                <p className="text-3xl font-bold text-dark-text dark:text-dark-text-dark mt-2">
                    {currency}{typeof value === 'number' ? value.toLocaleString() : value}
                </p>
            </div>
            <div className="bg-light-bg dark:bg-dark-bg/50 p-3 rounded-lg border border-border-color dark:border-border-color-dark transition-colors duration-200">
                {icon}
            </div>
        </div>
    );
};

export default FinancialSnapshotCard;
