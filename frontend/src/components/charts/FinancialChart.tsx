import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FinancialData {
    name: string;
    Revenue: number;
    Expenses: number;
}

const FinancialChart: React.FC<{ data: FinancialData[] }> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                    cursor={{fill: 'rgba(71, 85, 105, 0.5)'}}
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }}/>
                <Bar dataKey="Revenue" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f472b6" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default FinancialChart;
