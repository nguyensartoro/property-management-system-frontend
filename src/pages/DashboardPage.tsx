import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useLanguage } from '../utils/languageContext';
import {
  CalendarDays,
  DollarSign,
  Home,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Percent,
  ArrowUp,
  ArrowDown,
  Wrench,
  User,
  FileText
} from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend,
  ArcElement,
  PointElement,
  LineElement
);

const DashboardPage: React.FC = () => {
  const [activeChartIndex, setActiveChartIndex] = React.useState(0);
  const { t, language } = useLanguage();

  // Sample data for charts (replace with real data as needed)
  const months = [
    t('months.jan'),
    t('months.feb'),
    t('months.mar'),
    t('months.apr'),
    t('months.may'),
    t('months.jun')
  ];

  const revenueData = [4000, 3000, 5000, 4000, 6000, 7000];
  const contractsData = [10, 12, 8, 15, 9, 14];
  const occupancyData = [60, 30, 10];
  const occupancyLabels = [
    t('roomStatus.occupied'),
    t('roomStatus.available'),
    t('roomStatus.maintenance')
  ];

  const COLORS = ['#34d399', '#60a5fa', '#fbbf24'];
  const BORDER_COLORS = ['#22c55e', '#3b82f6', '#f59e0b'];

  // Mock dashboard data
  const dashboardStats = [
    {
      title: t('dashboard.totalRooms'),
      value: '24',
      icon: Home,
      color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    },
    {
      title: t('dashboard.occupiedRooms'),
      value: '18',
      icon: Users,
      color: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
      percentage: '75%',
    },
    {
      title: t('dashboard.monthlyRevenue'),
      value: '$7,200',
      icon: DollarSign,
      color: 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400',
      change: '+12%',
    },
    {
      title: t('dashboard.occupancyRate'),
      value: '75%',
      icon: Percent,
      color: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
    },
  ];

  // Additional stats for new row
  const additionalStats = [
    {
      title: t('dashboard.vacantRooms'),
      value: '6',
      icon: Home,
      color: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    },
    {
      title: t('dashboard.maintenanceNeeded'),
      value: '3',
      icon: Wrench,
      color: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400',
    },
    {
      title: t('dashboard.totalRenters'),
      value: '22',
      icon: User,
      color: 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400',
    },
    {
      title: t('dashboard.activeContracts'),
      value: '20',
      icon: FileText,
      color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    },
  ];

  // Mock recent payments
  const recentPayments = [
    { id: 1, renter: 'John Smith', room: '101', amount: '$800', date: '2023-06-01', status: 'paid' },
    { id: 2, renter: 'Maria Garcia', room: '205', amount: '$950', date: '2023-06-02', status: 'paid' },
    { id: 3, renter: 'David Lee', room: '304', amount: '$750', date: '2023-06-05', status: 'pending' },
    { id: 4, renter: 'Sarah Johnson', room: '102', amount: '$850', date: '2023-06-07', status: 'overdue' },
  ];

  // Mock upcoming events
  const upcomingEvents = [
    { id: 1, title: t('dashboard.contractExpiration'), description: 'Room 103 - Alex Johnson', date: '2023-06-15' },
    { id: 2, title: t('dashboard.maintenance'), description: 'Room 207 - Plumbing repair', date: '2023-06-12' },
    { id: 3, title: t('dashboard.newRenter'), description: 'Room 302 - Move-in', date: '2023-06-10' },
    { id: 4, title: t('dashboard.rentDue'), description: 'Room 105 - Payment reminder', date: '2023-06-18' },
  ];

  // Bar chart config
  const barChartData = {
    labels: months,
    datasets: [
      {
        label: t('dashboard.revenue'),
        data: revenueData,
        backgroundColor: '#34d399',
        borderRadius: 8,
        barThickness: 30,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1f2937'
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1f2937'
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1f2937'
        }
      },
    },
  };

  // Pie chart config
  const pieChartData = {
    labels: occupancyLabels,
    datasets: [
      {
        data: occupancyData,
        backgroundColor: COLORS,
        borderColor: BORDER_COLORS,
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1f2937'
        }
      },
      title: {
        display: false,
      },
    },
  };

  // Line chart config
  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: t('dashboard.contracts'),
        data: contractsData,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.2)',
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#60a5fa',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1f2937'
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1f2937'
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1f2937'
        }
      },
    },
  };

  const chartTypes = [
    {
      key: 'bar',
      title: t('dashboard.revenue'),
      component: (
        <div className="h-64">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      )
    },
    {
      key: 'pie',
      title: t('dashboard.occupancy'),
      component: (
        <div className="h-64">
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      )
    },
    {
      key: 'line',
      title: t('dashboard.contracts'),
      component: (
        <div className="h-64">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      )
    },
  ];

  const activeChart = chartTypes[activeChartIndex];

  const nextChart = () => setActiveChartIndex((prev: number) => (prev + 1) % chartTypes.length);
  const prevChart = () => setActiveChartIndex((prev: number) => (prev - 1 + chartTypes.length) % chartTypes.length);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6 dashboard-page">
      {/* Stats Cards - First Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="flex items-start p-6 bg-white rounded-lg shadow-sm card dark:bg-gray-800">
            <div className={`p-2 rounded-full mr-4 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500 dark:text-gray-400">{stat.title}</h3>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-semibold text-secondary-900 dark:text-white">{stat.value}</span>
                {stat.change && (
                  <span className="ml-2 text-xs font-medium text-green-600 dark:text-green-400">
                    {stat.change}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Cards - Second Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {additionalStats.map((stat, index) => (
          <div key={index} className="flex items-start p-6 bg-white rounded-lg shadow-sm card dark:bg-gray-800">
            <div className={`p-2 rounded-full mr-4 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500 dark:text-gray-400">{stat.title}</h3>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-semibold text-secondary-900 dark:text-white">{stat.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Charts */}
        <div className="col-span-2 p-6 bg-white rounded-lg shadow-sm card dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">{activeChart.title}</h2>

            <div className="flex space-x-2">
              <button
                onClick={prevChart}
                className="p-1 text-secondary-400 hover:text-secondary-700 dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextChart}
                className="p-1 text-secondary-400 hover:text-secondary-700 dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          {activeChart.component}
        </div>

        {/* Recent Activity */}
        <div className="p-6 bg-white rounded-lg shadow-sm card dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-secondary-900 dark:text-white">
            {t('dashboard.upcomingEvents')}
          </h2>

          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-secondary-900 dark:text-white">{event.title}</h3>
                      <p className="text-sm text-secondary-500 dark:text-gray-400">{event.description}</p>
                    </div>
                    <span className="text-xs whitespace-nowrap text-secondary-500 dark:text-gray-400">
                      {formatDate(event.date)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-secondary-500 dark:text-gray-400">
                {t('dashboard.noUpcomingEvents')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="p-6 bg-white rounded-lg shadow-sm card dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-secondary-900 dark:text-white">
          {t('dashboard.recentPayments')}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 text-secondary-700 dark:text-gray-400 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">{t('renters.name')}</th>
                <th className="px-4 py-3">{t('rooms.roomNumber')}</th>
                <th className="px-4 py-3">{t('dashboard.amount')}</th>
                <th className="px-4 py-3">{t('dashboard.date')}</th>
                <th className="px-4 py-3 rounded-tr-lg">{t('dashboard.status')}</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  >
                    <td className="px-4 py-3 font-medium text-secondary-900 dark:text-white">
                      {payment.renter}
                    </td>
                    <td className="px-4 py-3 text-secondary-500 dark:text-gray-400">
                      {payment.room}
                    </td>
                    <td className="px-4 py-3 font-medium text-secondary-900 dark:text-white">
                      {payment.amount}
                    </td>
                    <td className="px-4 py-3 text-secondary-500 dark:text-gray-400">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        payment.status === 'paid'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {payment.status === 'paid'
                          ? t('paymentStatus.paid')
                          : payment.status === 'pending'
                          ? t('paymentStatus.pending')
                          : t('paymentStatus.overdue')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-secondary-500 dark:text-gray-400">
                    {t('dashboard.noRecentPayments')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;