import React, { useState } from "react";
import { useQuery } from '@apollo/client';
import { GET_ANALYTICS_DATA } from '../providers/AnalyticsProvider';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';
import { AlertCircle } from 'lucide-react';

// Define types for analytics data
interface MonthlyData {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
}

interface Statistics {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalRenters: number;
  monthlyIncome: number;
  overduePayments: number;
}

interface AnalyticsData {
  monthlyData: MonthlyData[];
  statistics: Statistics;
  occupancyTrends: { month: string; rate: number; growth: number }[];
  topRooms: { room: string; revenue: number; occupancy: number }[];
}

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6months');
  
  // Fetch data from API
  const { data, loading, error } = useQuery(GET_ANALYTICS_DATA, {
    variables: { timeRange },
    fetchPolicy: 'cache-and-network'
  });
  
  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="text-secondary-500">Loading analytics data...</p>
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4 text-red-500">
          <AlertCircle size={48} />
          <p>Error loading analytics data: {error.message}</p>
        </div>
      </div>
    );
  }
  
  const analyticsData: AnalyticsData = data?.analytics || {
    monthlyData: [],
    statistics: {
      totalRooms: 0,
      occupiedRooms: 0,
      availableRooms: 0,
      totalRenters: 0,
      monthlyIncome: 0,
      overduePayments: 0
    },
    occupancyTrends: [],
    topRooms: []
  };
  
  const { monthlyData, statistics, occupancyTrends, topRooms } = analyticsData;
  
  // Prepare data for recharts
  const pieData = [
    { name: 'Occupied', value: statistics.occupiedRooms, fill: '#6366f1' },
    { name: 'Available', value: statistics.totalRooms - statistics.occupiedRooms, fill: '#e5e7eb' }
  ];
  
  const lineData = occupancyTrends.map(item => ({
    name: item.month,
    occupancy: item.rate,
    growth: item.growth
  }));
  
  const occupancyRate = statistics.totalRooms > 0 
    ? Math.round((statistics.occupiedRooms / statistics.totalRooms) * 100) 
    : 0;

  const COLORS = ['#6366f1', '#e5e7eb'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Analytics & Reporting</h2>
          <p className="text-secondary-500">Track your rental business performance</p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
        >
          <option value="30days">Last 30 Days</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="col-span-1 dashboard-card">
          <h3 className="mb-4 text-lg font-semibold text-secondary-900">Occupancy Rate</h3>
          <div className="relative" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} rooms`, 'Rooms']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex absolute inset-0 flex-col justify-center items-center pointer-events-none">
              <span className="text-3xl font-bold text-secondary-900">{occupancyRate}%</span>
              <span className="text-xs text-secondary-500">Occupied</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <p className="text-sm text-secondary-500">Total Rooms</p>
              <p className="text-xl font-bold text-secondary-900">{statistics.totalRooms}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-secondary-500">Occupied Rooms</p>
              <p className="text-xl font-bold text-secondary-900">{statistics.occupiedRooms}</p>
            </div>
          </div>
        </div>

        <div className="col-span-3 dashboard-card">
          <h3 className="mb-4 text-lg font-semibold text-secondary-900">Income Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 text-center bg-green-50 rounded-lg">
              <p className="text-sm text-secondary-500">Total Revenue</p>
              <p className="text-xl font-bold text-secondary-900">
                ${monthlyData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 text-center bg-red-50 rounded-lg">
              <p className="text-sm text-secondary-500">Total Expenses</p>
              <p className="text-xl font-bold text-secondary-900">
                ${monthlyData.reduce((acc, curr) => acc + curr.expense, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 text-center bg-blue-50 rounded-lg">
              <p className="text-sm text-secondary-500">Total Profit</p>
              <p className="text-xl font-bold text-secondary-900">
                ${monthlyData.reduce((acc, curr) => acc + curr.profit, 0).toLocaleString()}
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={monthlyData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${value}`, '']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="dashboard-card">
          <h3 className="mb-4 text-lg font-semibold text-secondary-900">Occupancy Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={lineData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                `${value}${name === 'occupancy' ? '%' : ''}`, 
                name === 'occupancy' ? 'Occupancy Rate' : 'Growth'
              ]}/>
              <Legend />
              <Line 
                type="monotone" 
                dataKey="occupancy" 
                name="Occupancy Rate" 
                stroke="#6366f1" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="growth" 
                name="Month-over-month Growth" 
                stroke="#10b981" 
                strokeDasharray="5 5" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card">
          <h3 className="mb-4 text-lg font-semibold text-secondary-900">Top Performing Rooms</h3>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Revenue</th>
                  <th>Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {topRooms.map((room, index) => (
                  <tr key={index}>
                    <td>{room.room}</td>
                    <td>${room.revenue.toLocaleString()}</td>
                    <td>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary-500 h-2.5 rounded-full"
                          style={{ width: `${room.occupancy}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-secondary-600 ml-1">{room.occupancy}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h3 className="mb-4 text-lg font-semibold text-secondary-900">Business Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-secondary-500">Total Renters</p>
            <p className="text-2xl font-bold text-secondary-900">{statistics.totalRenters}</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-secondary-500">Monthly Income</p>
            <p className="text-2xl font-bold text-secondary-900">${statistics.monthlyIncome.toLocaleString()}</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-secondary-500">Occupancy Rate</p>
            <p className="text-2xl font-bold text-secondary-900">{occupancyRate}%</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-secondary-500">Overdue Payments</p>
            <p className="text-2xl font-bold text-red-500">{statistics.overduePayments}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;