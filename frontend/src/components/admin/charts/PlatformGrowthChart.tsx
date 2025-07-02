import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PlatformGrowthChartProps {
  data: Array<{
    name: string;
    'New Users': number;
    'New Organizations': number;
  }>;
}

const PlatformGrowthChart: React.FC<PlatformGrowthChartProps> = ({ data }) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
          <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
          <YAxis stroke="var(--text-secondary)" fontSize={12} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--app-surface)',
              border: '1px solid var(--app-border)',
              borderRadius: '12px',
              color: 'var(--text-primary)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="New Users" 
            stroke="#4A69E2" 
            strokeWidth={3}
            dot={{ fill: '#4A69E2', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="New Organizations" 
            stroke="#FFA87A" 
            strokeWidth={3}
            dot={{ fill: '#FFA87A', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlatformGrowthChart;