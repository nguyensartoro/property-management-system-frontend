'use client'

import React from 'react';

const RevenueChart: React.FC = () => {
  // Mock data - would be replaced with real API data
  const monthlyData = [
    { month: 'Jan', revenue: 7800 },
    { month: 'Feb', revenue: 7900 },
    { month: 'Mar', revenue: 7850 },
    { month: 'Apr', revenue: 8100 },
    { month: 'May', revenue: 8250 },
    { month: 'Jun', revenue: 8400 },
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const percentChange = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Monthly Revenue</h3>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            ${currentMonth.revenue.toLocaleString()}
          </span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            This month
          </span>
        </div>
        <div className={`text-sm ${percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}% from last month
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="relative h-60">
        <div className="absolute inset-0 flex items-end justify-between">
          {monthlyData.map((data, index) => (
            <div key={data.month} className="flex flex-col items-center w-1/6">
              <div 
                className="w-10 bg-primary transition-all duration-300 ease-in-out"
                style={{ 
                  height: `${(data.revenue / maxRevenue) * 80}%`,
                  opacity: index === monthlyData.length - 1 ? 1 : 0.7
                }}
              />
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">{data.month}</span>
            </div>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>${maxRevenue.toLocaleString()}</span>
          <span>${(maxRevenue * 0.75).toFixed(0).toLocaleString()}</span>
          <span>${(maxRevenue * 0.5).toFixed(0).toLocaleString()}</span>
          <span>${(maxRevenue * 0.25).toFixed(0).toLocaleString()}</span>
          <span>$0</span>
        </div>
      </div>
    </div>
  );
}

export default RevenueChart; 