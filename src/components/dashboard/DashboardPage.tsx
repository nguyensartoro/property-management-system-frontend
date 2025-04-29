import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  Home,
  MoreHorizontal,
  Users,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import MetricCard from '../shared/MetricCard';
import { statistics, notifications, tasks } from '../../data/mockData';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage: React.FC = () => {
  const [activeChartIndex, setActiveChartIndex] = useState(0);

  const charts = [
    {
      title: 'Total Profit',
      key: 'profit',
      color: 'rgba(76, 175, 80, 0.6)'
    },
    {
      title: 'Total Expenses',
      key: 'expenses',
      color: 'rgba(255, 107, 107, 0.6)'
    },
    {
      title: 'Total Revenue',
      key: 'revenue',
      color: 'rgba(155, 135, 245, 0.6)'
    },
    {
      title: 'New Bookings',
      key: 'bookings',
      color: 'rgba(54, 162, 235, 0.6)'
    },
    {
      title: 'Check-in',
      key: 'checkin',
      color: 'rgba(75, 192, 192, 0.6)'
    },
    {
      title: 'Check-out',
      key: 'checkout',
      color: 'rgba(255, 159, 64, 0.6)'
    }
  ];

  const nextChart = () => {
    setActiveChartIndex((prevIndex) => (prevIndex + 1) % charts.length);
  };

  const prevChart = () => {
    setActiveChartIndex((prevIndex) => (prevIndex - 1 + charts.length) % charts.length);
  };

  // Sample data for different charts
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const chartData = {
    profit: {
      labels: months,
      datasets: [
        {
          label: 'Profit',
          data: [3400, 4200, 4500, 4600, 4800, 5200],
          backgroundColor: 'rgba(76, 175, 80, 0.6)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 2,
          tension: 0.3
        }
      ]
    },
    expenses: {
      labels: months,
      datasets: [
        {
          label: 'Expenses',
          data: [1800, 2100, 2300, 2500, 2700, 2600],
          backgroundColor: 'rgba(255, 107, 107, 0.6)',
          borderColor: 'rgba(255, 107, 107, 1)',
          borderWidth: 2,
          tension: 0.3
        }
      ]
    },
    revenue: {
      labels: months,
      datasets: [
        {
          label: 'Revenue',
          data: [5200, 6300, 6800, 7100, 7500, 7800],
          backgroundColor: 'rgba(155, 135, 245, 0.6)',
          borderColor: 'rgba(155, 135, 245, 1)',
          borderWidth: 2,
          tension: 0.3
        }
      ]
    },
    bookings: {
      labels: months,
      datasets: [
        {
          label: 'New Bookings',
          data: [120, 150, 180, 210, 240, 270],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          tension: 0.3
        }
      ]
    },
    checkin: {
      labels: months,
      datasets: [
        {
          label: 'Check-in',
          data: [110, 140, 170, 190, 220, 250],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          tension: 0.3
        }
      ]
    },
    checkout: {
      labels: months,
      datasets: [
        {
          label: 'Check-out',
          data: [90, 120, 150, 170, 190, 220],
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 2,
          tension: 0.3
        }
      ]
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const activeChart = charts[activeChartIndex];

  const pieData = {
    labels: ['Occupied', 'Available', 'Reserved', 'Maintenance'],
    datasets: [
      {
        data: [statistics.occupiedUnits, statistics.availableUnits, 1, 1],
        backgroundColor: [
          'rgba(76, 175, 80, 0.6)',
          'rgba(155, 135, 245, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 107, 107, 0.6)'
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(155, 135, 245, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 107, 107, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 10
          }
        }
      }
    },
  };

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="dashboard-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">{activeChart.title}</h3>
          <div className="flex gap-2 items-center">
            <button
              onClick={prevChart}
              className="p-1.5 rounded-full hover:bg-gray-100 text-secondary-500"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={nextChart}
              className="p-1.5 rounded-full hover:bg-gray-100 text-secondary-500"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="h-64">
          <Line
            data={chartData[activeChart.key as keyof typeof chartData]}
            options={chartOptions}
          />
        </div>
      </div>

      {/* Middle section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 dashboard-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-secondary-900">Statistics</h3>
            <select className="border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-white">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Last 90 days</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <MetricCard
              title="Total Units"
              value={statistics.totalUnits.toString()}
              icon={<Home size={24} className="text-primary-400" />}
            />

            <MetricCard
              title="Occupied"
              value={statistics.occupiedUnits.toString()}
              icon={<Home size={24} className="text-success-400" />}
            />

            <MetricCard
              title="Available"
              value={statistics.availableUnits.toString()}
              icon={<Home size={24} className="text-warning-400" />}
            />

            <MetricCard
              title="Total Renters"
              value={statistics.totalRenters.toString()}
              icon={<Users size={24} className="text-primary-600" />}
            />
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">Units Status</h3>
            <button className="text-secondary-500 hover:text-secondary-700">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="h-48">
            <Doughnut data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">
              Notifications
            </h3>
            <button className="text-sm font-medium text-primary-400 hover:text-primary-600">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {notifications.slice(0, 4).map((notification) => (
              <div key={notification.id} className="flex items-start p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3
                  ${notification.type === 'info' ? 'bg-primary-100 text-primary-600' :
                    notification.type === 'success' ? 'bg-success-400/10 text-success-500' :
                    notification.type === 'error' ? 'bg-danger-400/10 text-danger-400' :
                    'bg-warning-400/10 text-warning-400'}`}>
                  <span className="text-lg font-bold">
                    {notification.type === 'info' ? 'i' :
                      notification.type === 'success' ? '✓' :
                      notification.type === 'error' ? '!' : '⚠'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-semibold text-secondary-900">{notification.title}</h4>
                    <span className="text-xs text-secondary-500">{notification.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-secondary-600">{notification.description}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">
              Upcoming Tasks
            </h3>
            <button className="text-sm font-medium text-primary-400 hover:text-primary-600">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={task.completed}
                  className="w-5 h-5 rounded-md border-gray-300 text-primary-600 focus:ring-primary-500"
                  readOnly
                />
                <div className="flex-1 ml-3">
                  <h4 className={`text-sm font-medium ${task.completed ? 'text-secondary-400 line-through' : 'text-secondary-900'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center mt-1">
                    <Calendar size={14} className="mr-1 text-secondary-500" />
                    <span className="text-xs text-secondary-500">{task.date}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={14} className="text-secondary-500" />
                  <span className="text-xs text-secondary-500">10:00 AM</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;