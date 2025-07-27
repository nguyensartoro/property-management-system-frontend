import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { Calendar, TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';
import { useExpenseStore } from '../../stores/expenseStore';
import { usePropertyStore } from '../../stores/propertyStore';
import { ExpenseCategory, Expense } from '../../utils/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ChartData {
  name: string;
  value: number;
  amount: number;
  count: number;
  color?: string;
}

interface TimeSeriesData {
  date: string;
  amount: number;
  count: number;
  month: string;
  year: number;
}

interface PropertyExpenseData {
  property: string;
  amount: number;
  count: number;
  categories: { [key: string]: number };
}

const CATEGORY_COLORS = {
  [ExpenseCategory.MAINTENANCE]: '#f97316',
  [ExpenseCategory.UTILITIES]: '#3b82f6',
  [ExpenseCategory.TAXES]: '#ef4444',
  [ExpenseCategory.INSURANCE]: '#10b981',
  [ExpenseCategory.SALARY]: '#8b5cf6',
  [ExpenseCategory.SUPPLIES]: '#f59e0b',
  [ExpenseCategory.MARKETING]: '#ec4899',
  [ExpenseCategory.OTHER]: '#6b7280',
};

const CHART_TYPES = {
  CATEGORY: 'category',
  TIMELINE: 'timeline',
  PROPERTY: 'property',
  TREND: 'trend',
} as const;

type ChartType = typeof CHART_TYPES[keyof typeof CHART_TYPES];

interface ExpenseChartProps {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  height?: number;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({
  propertyId,
  startDate,
  endDate,
  height = 400,
}) => {
  const [chartType, setChartType] = useState<ChartType>(CHART_TYPES.CATEGORY);
  const [timeRange, setTimeRange] = useState('6months');

  const { expenses, fetchExpenses } = useExpenseStore();
  const { properties } = usePropertyStore();

  useEffect(() => {
    const filters = {
      propertyId,
      startDate,
      endDate,
    };
    fetchExpenses(1, 1000, filters); // Get all expenses for analysis
  }, [propertyId, startDate, endDate]);

  // Filter expenses based on time range
  const getFilteredExpenses = (): Expense[] => {
    let filteredExpenses = expenses;

    if (!startDate && !endDate) {
      const now = new Date();
      let cutoffDate = new Date();

      switch (timeRange) {
        case '1month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case '1year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          return filteredExpenses;
      }

      filteredExpenses = expenses.filter(expense => 
        new Date(expense.date) >= cutoffDate
      );
    }

    return filteredExpenses;
  };

  // Generate category breakdown data
  const getCategoryData = (): ChartData[] => {
    const filteredExpenses = getFilteredExpenses();
    const categoryTotals: { [key: string]: { amount: number; count: number } } = {};

    filteredExpenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = { amount: 0, count: 0 };
      }
      categoryTotals[expense.category].amount += expense.amount;
      categoryTotals[expense.category].count += 1;
    });

    return Object.entries(categoryTotals).map(([category, data]) => ({
      name: category.charAt(0) + category.slice(1).toLowerCase(),
      value: data.amount,
      amount: data.amount,
      count: data.count,
      color: CATEGORY_COLORS[category as ExpenseCategory],
    })).sort((a, b) => b.value - a.value);
  };

  // Generate timeline data
  const getTimelineData = (): TimeSeriesData[] => {
    const filteredExpenses = getFilteredExpenses();
    const monthlyTotals: { [key: string]: { amount: number; count: number } } = {};

    filteredExpenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = { amount: 0, count: 0 };
      }
      monthlyTotals[monthKey].amount += expense.amount;
      monthlyTotals[monthKey].count += 1;
    });

    return Object.entries(monthlyTotals)
      .map(([key, data]) => ({
        date: key,
        amount: data.amount,
        count: data.count,
        month: new Date(key + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        year: parseInt(key.split('-')[0]),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Generate property comparison data
  const getPropertyData = (): PropertyExpenseData[] => {
    const filteredExpenses = getFilteredExpenses();
    const propertyTotals: { [key: string]: PropertyExpenseData } = {};

    filteredExpenses.forEach(expense => {
      const propertyName = expense.property?.name || 'Unknown Property';
      
      if (!propertyTotals[propertyName]) {
        propertyTotals[propertyName] = {
          property: propertyName,
          amount: 0,
          count: 0,
          categories: {},
        };
      }
      
      propertyTotals[propertyName].amount += expense.amount;
      propertyTotals[propertyName].count += 1;
      
      if (!propertyTotals[propertyName].categories[expense.category]) {
        propertyTotals[propertyName].categories[expense.category] = 0;
      }
      propertyTotals[propertyName].categories[expense.category] += expense.amount;
    });

    return Object.values(propertyTotals).sort((a, b) => b.amount - a.amount);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
              {entry.payload.count && (
                <span className="text-muted-foreground ml-2">
                  ({entry.payload.count} expenses)
                </span>
              )}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderCategoryChart = () => {
    const data = getCategoryData();
    
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No expense data available
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <ResponsiveContainer width="50%" height={height}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            <ResponsiveContainer width="50%" height={height}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.name}</span>
              <Badge variant="secondary">{formatCurrency(item.value)}</Badge>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTimelineChart = () => {
    const data = getTimelineData();
    
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No timeline data available
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#3b82f6" 
            fill="#3b82f6" 
            fillOpacity={0.3}
            name="Amount"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderPropertyChart = () => {
    const data = getPropertyData();
    
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No property data available
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={formatCurrency} />
          <YAxis type="category" dataKey="property" width={120} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="amount" fill="#10b981" name="Total Expenses" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderTrendChart = () => {
    const data = getTimelineData();
    
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No trend data available
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Amount"
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#f97316" 
            strokeWidth={2}
            name="Count"
            yAxisId="right"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const getChartIcon = (type: ChartType) => {
    switch (type) {
      case CHART_TYPES.CATEGORY:
        return <PieChartIcon className="h-4 w-4" />;
      case CHART_TYPES.TIMELINE:
        return <Activity className="h-4 w-4" />;
      case CHART_TYPES.PROPERTY:
        return <BarChart3 className="h-4 w-4" />;
      case CHART_TYPES.TREND:
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case CHART_TYPES.CATEGORY:
        return renderCategoryChart();
      case CHART_TYPES.TIMELINE:
        return renderTimelineChart();
      case CHART_TYPES.PROPERTY:
        return renderPropertyChart();
      case CHART_TYPES.TREND:
        return renderTrendChart();
      default:
        return renderCategoryChart();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              {getChartIcon(chartType)}
              <span>Expense Analytics</span>
            </CardTitle>
            <CardDescription>
              Visual analysis of your property expenses
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CHART_TYPES.CATEGORY}>By Category</SelectItem>
                <SelectItem value={CHART_TYPES.TIMELINE}>Timeline</SelectItem>
                <SelectItem value={CHART_TYPES.PROPERTY}>By Property</SelectItem>
                <SelectItem value={CHART_TYPES.TREND}>Trends</SelectItem>
              </SelectContent>
            </Select>
            
            {!startDate && !endDate && (
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ExpenseChart;