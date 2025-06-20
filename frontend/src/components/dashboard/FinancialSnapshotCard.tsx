// frontend/src/components/dashboard/FinancialSnapshotCard.tsx

import React from 'react';

const FinancialSnapshotCard = ({ title, value, icon, currency = '' }) => {
    return (
        <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-400">{title}</p>
                <p className="text-3xl font-bold text-white mt-2">
                    {currency}{typeof value === 'number' ? value.toLocaleString() : value}
                </p>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                {icon}
            </div>
        </div>
    );
};

export default FinancialSnapshotCard;
