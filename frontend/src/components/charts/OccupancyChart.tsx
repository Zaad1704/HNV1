import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OccupancyData {
    name: string;
    "New Tenants": number;
}

const OccupancyChart: React.FC<{ data: OccupancyData[] }> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <LineChart
                data={data}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                    contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                    }}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }}/>
                <Line type="monotone" dataKey="New Tenants" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default OccupancyChart;
