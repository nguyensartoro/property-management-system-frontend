import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

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
  
  const data = {
    datasets: [
      {
        data: [value, total - value],
        backgroundColor: [color, '#E5E7EB'],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };
  
  return (
    <div className="dashboard-card">
      <h3 className="text-sm font-medium text-secondary-500 mb-4">{title}</h3>
      
      <div className="relative w-full h-40">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-secondary-900">{percentage}%</span>
          <span className="text-xs text-secondary-500">{label}</span>
        </div>
      </div>
    </div>
  );
};

export default CircularChart;