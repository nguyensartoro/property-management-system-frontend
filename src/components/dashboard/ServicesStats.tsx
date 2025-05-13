import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Shield, Wifi, Droplet, Zap } from 'lucide-react';

interface ServiceUsage {
  name: string;
  count: number;
  percentage: number;
  icon: React.ReactNode;
  color: string;
}

const ServicesStats: React.FC = () => {
  // Mock data for service usage
  const serviceUsageData: ServiceUsage[] = [
    {
      name: 'Internet',
      count: 42,
      percentage: 84,
      icon: <Wifi size={18} className="text-purple-500" />,
      color: '#9333ea'
    },
    {
      name: 'Electric',
      count: 50,
      percentage: 100,
      icon: <Zap size={18} className="text-yellow-500" />,
      color: '#eab308'
    },
    {
      name: 'Water',
      count: 46,
      percentage: 92,
      icon: <Droplet size={18} className="text-blue-500" />,
      color: '#3b82f6'
    },
    {
      name: 'Security',
      count: 38,
      percentage: 76,
      icon: <Shield size={18} className="text-green-500" />,
      color: '#22c55e'
    },
  ];

  // Chart data
  const chartData = serviceUsageData.map(service => ({
    name: service.name,
    value: service.count,
    color: service.color,
  }));

  // Calculate total units with services
  const totalUnits = 50; // This would come from your data source
  const servicesMostPopular = serviceUsageData.reduce((prev, current) =>
    (prev.count > current.count) ? prev : current
  );

  return (
    <div className="h-full dashboard-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-secondary-900">Services Usage</h3>
        <button className="flex gap-1 items-center text-sm text-primary-500 hover:text-primary-600">
          View Details <ArrowUpRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="flex relative justify-center items-center w-full h-full">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex absolute inset-0 flex-col justify-center items-center pointer-events-none">
              <span className="text-2xl font-bold text-secondary-900">{totalUnits}</span>
              <span className="text-sm text-secondary-500">Total Units</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <p className="mb-3 text-sm text-secondary-500">Most popular service</p>
            <div className="flex gap-2 items-center mb-4">
              {servicesMostPopular.icon}
              <span className="font-medium text-secondary-900">{servicesMostPopular.name}</span>
              <span className="text-sm text-secondary-500">({servicesMostPopular.percentage}% of units)</span>
            </div>
          </div>
          <div className="space-y-3">
            <p className="mb-1 text-sm text-secondary-500">Top services by usage</p>
            {serviceUsageData.map((service, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  {service.icon}
                  <span className="text-secondary-900">{service.name}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${service.percentage}%`,
                        backgroundColor: service.color
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-secondary-500">{service.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesStats;