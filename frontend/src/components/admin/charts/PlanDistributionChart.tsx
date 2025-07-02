import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PlanDistributionChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS = ['#4A69E2', '#FFA87A', '#22c55e'];

const PlanDistributionChart: React.FC<PlanDistributionChartProps> = ({ data }) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
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
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlanDistributionChart;