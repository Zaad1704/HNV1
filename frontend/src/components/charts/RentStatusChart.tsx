import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RentStatusData {
    name: string;
    value: number;
}

const COLORS = ['#22c55e', '#ef4444']; // Green for Paid, Red for Overdue

const RentStatusChart: React.FC<{ data: RentStatusData[] }> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '14px' }}/>
            </PieChart>
        </ResponsiveContainer>
    );
};

export default RentStatusChart;
