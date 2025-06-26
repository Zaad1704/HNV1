import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface RentStatusChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS = ['#22c55e', '#ef4444'];

const RentStatusChart: React.FC<RentStatusChartProps> = ({ data }) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--app-surface)',
              border: '1px solid var(--app-border)',
              borderRadius: '12px',
              color: 'var(--text-primary)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 flex justify-center gap-4">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></div>
            <span className="text-sm text-text-secondary">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RentStatusChart;
