import React, { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TrendingUp, TrendingDown, Minus, PieChart, BarChart3, LineChart } from 'lucide-react';
import { ProfitLossAnalysis } from '../../services/financialAnalyticsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ProfitLossTrendsProps {
  data: ProfitLossAnalysis;
  className?: string;
}

const ProfitLossTrends: React.FC<ProfitLossTrendsProps> = ({
  data,
  className,
}) => {
  const [viewType, setViewType] = useState<'monthly' | 'yearly'>('monthly');

  // Prepare monthly profit/loss data
  const monthlyData = {
    labels: data.monthlyProfitLoss.map(item => {
      const date = new Date(item.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Revenue',
        data: data.monthlyProfitLoss.map(item => item.profit),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Expenses',
        data: data.monthlyProfitLoss.map(item => item.loss),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Net Profit',
        data: data.monthlyProfitLoss.map(item => item.net),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Prepare yearly comparison data
  const yearlyData = {
    labels: data.yearlyComparison.map(item => item.year.toString()),
    datasets: [
      {
        label: 'Revenue',
        data: data.yearlyComparison.map(item => item.profit),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: data.yearlyComparison.map(item => item.loss),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
      {
        label: 'Net Profit',
        data: data.yearlyComparison.map(item => item.net),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare expense categories data
  const expenseCategoriesData = {
    labels: data.lossCategories.map(cat => cat.category.replace('_', ' ')),
    datasets: [
      {
        data: data.lossCategories.map(cat => cat.amount),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(52, 211, 153, 0.8)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(251, 191, 36)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
          'rgb(245, 101, 101)',
          'rgb(52, 211, 153)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Period',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Amount ($)',
        },
        ticks: {
          callback: (value: any) => `$${value.toLocaleString()}`,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Year',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Amount ($)',
        },
        ticks: {
          callback: (value: any) => `$${value.toLocaleString()}`,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const category = data.lossCategories[context.dataIndex];
            return `${context.label}: $${category.amount.toLocaleString()} (${category.percentage.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  const getTrendIcon = () => {
    switch (data.profitTrend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (data.profitTrend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const currentMonthData = data.monthlyProfitLoss[data.monthlyProfitLoss.length - 1];
  const totalRevenue = data.monthlyProfitLoss.reduce((sum, item) => sum + item.profit, 0);
  const totalExpenses = data.monthlyProfitLoss.reduce((sum, item) => sum + item.loss, 0);
  const totalNetProfit = totalRevenue - totalExpenses;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Profit & Loss Trends
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {data.profitTrend === 'increasing' ? 'Growing' : 
               data.profitTrend === 'decreasing' ? 'Declining' : 'Stable'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-700">
                  ${totalExpenses.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${totalNetProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${totalNetProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  Net Profit
                </p>
                <p className={`text-2xl font-bold ${totalNetProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  ${totalNetProfit.toLocaleString()}
                </p>
              </div>
              <Badge variant={totalNetProfit >= 0 ? 'default' : 'destructive'}>
                {((totalNetProfit / totalRevenue) * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Yearly
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Expenses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">Monthly Profit & Loss Trends</h4>
              <div className="flex gap-2">
                <Button
                  variant={viewType === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewType('monthly')}
                >
                  Monthly
                </Button>
                <Button
                  variant={viewType === 'yearly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewType('yearly')}
                >
                  Yearly
                </Button>
              </div>
            </div>
            <div className="h-80">
              <Line data={monthlyData} options={lineChartOptions} />
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <h4 className="font-medium text-gray-900">Year-over-Year Comparison</h4>
            <div className="h-80">
              <Bar data={yearlyData} options={barChartOptions} />
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <h4 className="font-medium text-gray-900">Expense Categories Breakdown</h4>
            <div className="h-80">
              <Doughnut data={expenseCategoriesData} options={doughnutOptions} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Performance */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Recent Performance</h4>
          {currentMonthData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Current Month Revenue</p>
                  <p className="font-semibold text-green-600">
                    ${currentMonthData.profit.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Current Month Expenses</p>
                  <p className="font-semibold text-red-600">
                    ${currentMonthData.loss.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Current Month Net</p>
                  <p className={`font-semibold ${currentMonthData.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    ${currentMonthData.net.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Expense Categories */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Top Expense Categories</h4>
          <div className="space-y-2">
            {data.lossCategories
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full`} style={{
                      backgroundColor: expenseCategoriesData.datasets[0].backgroundColor[index]
                    }} />
                    <span className="font-medium">
                      {category.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${category.amount.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs">
                      {category.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Financial Insights</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              • Your profit trend is currently {data.profitTrend}, 
              {data.profitTrend === 'increasing' ? ' which is excellent for business growth.' :
               data.profitTrend === 'decreasing' ? ' consider reviewing expenses and revenue strategies.' :
               ' maintaining consistent performance.'}
            </p>
            <p>
              • Your largest expense category is {data.lossCategories[0]?.category.replace('_', ' ')} 
              at {data.lossCategories[0]?.percentage.toFixed(1)}% of total expenses.
            </p>
            <p>
              • Overall profit margin is {((totalNetProfit / totalRevenue) * 100).toFixed(1)}%
              {totalNetProfit / totalRevenue > 0.2 ? ', which is excellent.' :
               totalNetProfit / totalRevenue > 0.1 ? ', which is good.' :
               ', consider optimizing expenses.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitLossTrends;