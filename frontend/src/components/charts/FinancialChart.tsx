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
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                    cursor={{fill: 'rgba(229, 231, 235, 0.5)'}}
                    contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }}/>
                <Bar dataKey="Revenue" fill="#7091E6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ADBBDA" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default FinancialChart;
