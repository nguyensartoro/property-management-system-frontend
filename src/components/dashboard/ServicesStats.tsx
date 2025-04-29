import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { ArrowUpRight, Shield, WifiIcon, Droplets, Zap } from 'lucide-react';
import { Service } from '../../types';
import { services } from '../../data/mockData';

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
      icon: <WifiIcon size={18} className="text-purple-500" />,
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
      icon: <Droplets size={18} className="text-blue-500" />,
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
  const chartData = {
    labels: serviceUsageData.map(service => service.name),
    datasets: [
      {
        data: serviceUsageData.map(service => service.count),
        backgroundColor: serviceUsageData.map(service => service.color),
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} units (${percentage}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  // Calculate total units with services
  const totalUnits = 50; // This would come from your data source
  const servicesMostPopular = serviceUsageData.reduce((prev, current) => 
    (prev.count > current.count) ? prev : current
  );

  return (
    <div className="dashboard-card h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-secondary-900">Services Usage</h3>
        <button className="text-primary-500 hover:text-primary-600 text-sm flex items-center gap-1">
          View Details <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="relative w-full h-full flex items-center justify-center">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-secondary-900">{totalUnits}</span>
              <span className="text-sm text-secondary-500">Total Units</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <p className="text-secondary-500 text-sm mb-3">Most popular service</p>
            <div className="flex items-center gap-2 mb-4">
              {servicesMostPopular.icon}
              <span className="font-medium text-secondary-900">{servicesMostPopular.name}</span>
              <span className="text-sm text-secondary-500">({servicesMostPopular.percentage}% of units)</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-secondary-500 text-sm mb-1">Top services by usage</p>
            {serviceUsageData.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {service.icon}
                  <span className="text-secondary-900">{service.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
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