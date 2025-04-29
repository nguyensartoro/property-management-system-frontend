import React, { useState } from 'react';
import { monthlyData, statistics } from '../../data/mockData';
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
import CircularChart from '../shared/CircularChart';

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

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6months');
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
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
  
  const data = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: monthlyData.map(item => item.revenue),
        backgroundColor: 'rgba(155, 135, 245, 0.6)',
        borderColor: 'rgba(155, 135, 245, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: monthlyData.map(item => item.expense),
        backgroundColor: 'rgba(255, 107, 107, 0.6)',
        borderColor: 'rgba(255, 107, 107, 1)',
        borderWidth: 1,
      },
      {
        label: 'Profit',
        data: monthlyData.map(item => item.profit),
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  // Occupancy Rate data
  const occupancyRateData = {
    labels: ['Occupied', 'Available'],
    datasets: [
      {
        data: [statistics.occupiedUnits, statistics.totalUnits - statistics.occupiedUnits],
        backgroundColor: ['#9b87f5', '#E5E7EB'],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };
  
  const doughnutOptions = {
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
  
  const occupancyRate = Math.round((statistics.occupiedUnits / statistics.totalUnits) * 100);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Analytics & Reporting</h2>
          <p className="text-secondary-500">Track your rental business performance</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
        >
          <option value="30days">Last 30 Days</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 dashboard-card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Occupancy Rate</h3>
          <div className="relative h-40">
            <Doughnut data={occupancyRateData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-secondary-900">{occupancyRate}%</span>
              <span className="text-xs text-secondary-500">Occupied</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-secondary-500">Total Units</p>
              <p className="text-xl font-bold text-secondary-900">{statistics.totalUnits}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-secondary-500">Occupied Units</p>
              <p className="text-xl font-bold text-secondary-900">{statistics.occupiedUnits}</p>
            </div>
          </div>
        </div>
        
        <div className="col-span-3 dashboard-card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Income Overview</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-secondary-500">Total Revenue</p>
              <p className="text-xl font-bold text-secondary-900">${monthlyData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-secondary-500">Total Expenses</p>
              <p className="text-xl font-bold text-secondary-900">${monthlyData.reduce((acc, curr) => acc + curr.expense, 0).toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-secondary-500">Total Profit</p>
              <p className="text-xl font-bold text-secondary-900">${monthlyData.reduce((acc, curr) => acc + curr.profit, 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="h-64">
            <Bar options={options} data={data} />
          </div>
        </div>
      </div>
      
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Financial Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Income Overview</h3>
            <div className="flex justify-center">
              <CircularChart 
                title="" 
                value={statistics.occupiedUnits} 
                total={statistics.totalUnits} 
                color="#4caf50" 
                label="Occupancy Rate"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-secondary-500">Monthly Income</p>
                <p className="text-2xl font-bold text-secondary-900">${statistics.monthlyIncome}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-secondary-500">Overdue</p>
                <p className="text-2xl font-bold text-danger-400">${statistics.overduePayments}</p>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Units Status</h3>
            <div className="h-40 flex justify-center">
              <CircularChart 
                title="" 
                value={statistics.availableUnits} 
                total={statistics.totalUnits} 
                color="#f59e0b" 
                label="Availability"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-secondary-500">Total Units</p>
                <p className="text-2xl font-bold text-secondary-900">{statistics.totalUnits}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-secondary-500">Total Renters</p>
                <p className="text-2xl font-bold text-secondary-900">{statistics.totalRenters}</p>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Revenue Distribution</h3>
            <div className="h-40 flex justify-center">
              <CircularChart 
                title="" 
                value={75} 
                total={100} 
                color="#9b87f5" 
                label="From Rent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-secondary-500">From Rent</p>
                <p className="text-2xl font-bold text-secondary-900">75%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-secondary-500">From Services</p>
                <p className="text-2xl font-bold text-secondary-900">25%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Occupancy Trends</h3>
          <div className="border-t border-gray-200 pt-4">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500">Month</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500">Rate</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-secondary-900">January</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">83%</td>
                  <td className="px-4 py-3 text-sm text-success-400">+2.1%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-secondary-900">February</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">85%</td>
                  <td className="px-4 py-3 text-sm text-success-400">+1.8%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-secondary-900">March</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">82%</td>
                  <td className="px-4 py-3 text-sm text-danger-400">-3.5%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-secondary-900">April</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">87%</td>
                  <td className="px-4 py-3 text-sm text-success-400">+5.1%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-secondary-900">May</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">90%</td>
                  <td className="px-4 py-3 text-sm text-success-400">+3.4%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-secondary-900">June</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">89%</td>
                  <td className="px-4 py-3 text-sm text-danger-400">-1.1%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Top Performing Rooms</h3>
          <div className="border-t border-gray-200 pt-4">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500">Room</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500">Revenue</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-secondary-900">Room 201</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">$1,200</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">92%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-secondary-900">Room 203</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">$850</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">88%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-secondary-900">Room 103</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">$750</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">85%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-secondary-900">Room 202</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">$700</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">79%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-secondary-900">Room 101</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">$550</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">76%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-secondary-900">Room 102</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">$525</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">72%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;