import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface CircularChartProps {
  title: string;
  value: number;
  total: number;
  color: string;
  label: string;
}

const CircularChart: React.FC<CircularChartProps> = ({ 
  title, 
  value, 
  total, 
  color,
  label 
}) => {
  const percentage = Math.round((value / total) * 100);
  const data = [
    { name: label, value },
    { name: 'Other', value: total - value },
  ];
  const COLORS = [color, '#E5E7EB'];

  return (
    <div className="dashboard-card">
      <h3 className="text-sm font-medium text-secondary-500 mb-4">{title}</h3>
      <div className="relative w-full h-40">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              startAngle={90}
              endAngle={-270}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-secondary-900">{percentage}%</span>
          <span className="text-xs text-secondary-500">{label}</span>
        </div>
      </div>
    </div>
  );
};

export default CircularChart;