import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PlatformGrowthChart = ({ data }: { data: any[] }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" /> {/* Semantic border color */}
                <XAxis dataKey="name" stroke="var(--light-text)" fontSize={12} /> {/* Semantic text color */}
                <YAxis stroke="var(--light-text)" fontSize={12} allowDecimals={false}/> {/* Semantic text color */}
                <Tooltip wrapperStyle={{ outline: "none", border: "1px solid var(--border-color)", borderRadius: "0.5rem", background: 'var(--light-card)', color: 'var(--dark-text)' }}/> {/* Semantic colors */}
                <Legend />
                <Line type="monotone" dataKey="New Users" stroke="var(--brand-primary)" strokeWidth={2} activeDot={{ r: 6 }} /> {/* Semantic brand color */}
                <Line type="monotone" dataKey="New Organizations" stroke="var(--brand-secondary)" strokeWidth={2} activeDot={{ r: 6 }} /> {/* Semantic brand color */}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default PlatformGrowthChart;
