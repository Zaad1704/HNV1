// frontend/src/components/dashboard/FinancialSnapshotCard.tsx

import React from 'react';

const FinancialSnapshotCard = ({ title, value, icon, currency = '' }) => {
    return (
        <div className="bg-light-card p-6 rounded-xl border border-border-color shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-light-text">{title}</p>
                <p className="text-3xl font-bold text-dark-text mt-2">
                    {currency}{typeof value === 'number' ? value.toLocaleString() : value}
                </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg border border-border-color">
                {icon}
            </div>
        </div>
    );
};

export default FinancialSnapshotCard;
