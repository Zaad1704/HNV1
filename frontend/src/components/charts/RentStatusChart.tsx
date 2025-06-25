import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RentStatusData {
    name: string;
    value: number;
}

const COLORS = ['var(--green-500)', 'var(--brand-orange)']; // Green for Paid, Orange for Overdue (Using CSS variables)

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
                    fill="#8884d8" // This can be default, as Cell override it
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--light-card)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--dark-text)' }}/> {/* Semantic colors */}
                <Legend wrapperStyle={{ fontSize: '14px', color: 'var(--dark-text)' }}/> {/* Semantic text color */}
            </PieChart>
        </ResponsiveContainer>
    );
};

export default RentStatusChart;
