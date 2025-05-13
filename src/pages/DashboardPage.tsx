import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useLanguage } from '../utils/languageContext';

const DashboardPage: React.FC = () => {
  const [activeChartIndex, setActiveChartIndex] = React.useState(0);
  const { t } = useLanguage();

  // Sample data for charts (replace with real data as needed)
  const barData = [
    { name: t('months.jan'), revenue: 4000 },
    { name: t('months.feb'), revenue: 3000 },
    { name: t('months.mar'), revenue: 5000 },
    { name: t('months.apr'), revenue: 4000 },
    { name: t('months.may'), revenue: 6000 },
    { name: t('months.jun'), revenue: 7000 },
  ];
  const pieData = [
    { name: t('roomStatus.occupied'), value: 60 },
    { name: t('roomStatus.available'), value: 30 },
    { name: t('roomStatus.maintenance'), value: 10 },
  ];
  const COLORS = ['#34d399', '#60a5fa', '#fbbf24'];
  const lineData = [
    { name: t('months.jan'), contracts: 10 },
    { name: t('months.feb'), contracts: 12 },
    { name: t('months.mar'), contracts: 8 },
    { name: t('months.apr'), contracts: 15 },
    { name: t('months.may'), contracts: 9 },
    { name: t('months.jun'), contracts: 14 },
  ];

  const chartTypes = [
    { key: 'bar', title: t('dashboard.revenue'), component: (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={barData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#34d399" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ) },
    { key: 'pie', title: t('dashboard.occupancy'), component: (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ) },
    { key: 'line', title: t('dashboard.contracts'), component: (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={lineData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="contracts" stroke="#60a5fa" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    ) },
  ];

  const activeChart = chartTypes[activeChartIndex];

  const nextChart = () => setActiveChartIndex((prev: number) => (prev + 1) % chartTypes.length);
  const prevChart = () => setActiveChartIndex((prev: number) => (prev - 1 + chartTypes.length) % chartTypes.length);

  return (
    <div className="dashboard-page">
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">{activeChart.title}</h3>
          <div className="flex gap-2">
            <button onClick={prevChart} className="btn btn-secondary">{t('common.prev')}</button>
            <button onClick={nextChart} className="btn btn-secondary">{t('common.next')}</button>
          </div>
        </div>
        {activeChart.component}
      </div>
      {/* ...rest of dashboard... */}
    </div>
  );
};

export default DashboardPage;