import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PlatformGrowthChartProps {
  data: Array<{
    name: string;
    'New Users': number;
    'New Organizations': number;
  }>;
}

const PlatformGrowthChart: React.FC<PlatformGrowthChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No growth data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="New Users" 
          stroke="#3B82F6" 
          strokeWidth={2}
          dot={{ fill: '#3B82F6' }}
        />
        <Line 
          type="monotone" 
          dataKey="New Organizations" 
          stroke="#10B981" 
          strokeWidth={2}
          dot={{ fill: '#10B981' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PlatformGrowthChart;