import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Building, 
  PieChart,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useExpenseStore } from '../../stores/expenseStore';
import { usePropertyStore } from '../../stores/propertyStore';
import { usePaymentStore } from '../../stores/paymentStore';
import { ExpenseCategory, Expense } from '../../utils/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ExpenseSummaryData {
  totalExpenses: number;
  totalCount: number;
  averageExpense: number;
  monthlyExpenses: number;
  yearlyExpenses: number;
  categoryBreakdown: CategorySummary[];
  propertyBreakdown: PropertySummary[];
  monthlyTrend: MonthlyTrend[];
  profitabilityAnalysis: ProfitabilityData[];
}

interface CategorySummary {
  category: ExpenseCategory;
  amount: number;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface PropertySummary {
  propertyId: string;
  propertyName: string;
  totalExpenses: number;
  expenseCount: number;
  averageExpense: number;
  categories: { [key: string]: number };
  profitMargin?: number;
  totalIncome?: number;
}

interface MonthlyTrend {
  month: string;
  expenses: number;
  income: number;
  profit: number;
  profitMargin: number;
}

interface ProfitabilityData {
  propertyId: string;
  propertyName: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  status: 'profitable' | 'break-even' | 'loss';
}

interface ExpenseSummaryProps {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  showProfitability?: boolean;
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
  propertyId,
  startDate,
  endDate,
  showProfitability = true,
}) => {
  const [timeRange, setTimeRange] = useState('6months');
  const [summaryData, setSummaryData] = useState<ExpenseSummaryData | null>(null);

  const { 
    expenses, 
    expenseSummary, 
    expenseTotals,
    fetchExpenses, 
    fetchExpenseSummary 
  } = useExpenseStore();
  
  const { properties, fetchProperties } = usePropertyStore();
  const { payments, fetchPayments } = usePaymentStore();

  useEffect(() => {
    fetchProperties();
    fetchExpenses(1, 1000, { propertyId, startDate, endDate });
    fetchExpenseSummary(propertyId, startDate, endDate);
    if (showProfitability) {
      fetchPayments(1, 1000, { propertyId, startDate, endDate });
    }
  }, [propertyId, startDate, endDate, timeRange]);

  useEffect(() => {
    if (expenses.length > 0) {
      generateSummaryData();
    }
  }, [expenses, payments, properties]);

  const generateSummaryData = () => {
    const filteredExpenses = getFilteredExpenses();
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalCount = filteredExpenses.length;
    const averageExpense = totalCount > 0 ? totalExpenses / totalCount : 0;

    // Calculate monthly and yearly expenses
    const now = new Date();
    const currentMonth = filteredExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear();
    });
    const currentYear = filteredExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === now.getFullYear();
    });

    const monthlyExpenses = currentMonth.reduce((sum, expense) => sum + expense.amount, 0);
    const yearlyExpenses = currentYear.reduce((sum, expense) => sum + expense.amount, 0);

    // Generate category breakdown
    const categoryBreakdown = generateCategoryBreakdown(filteredExpenses, totalExpenses);
    
    // Generate property breakdown
    const propertyBreakdown = generatePropertyBreakdown(filteredExpenses);
    
    // Generate monthly trend
    const monthlyTrend = generateMonthlyTrend(filteredExpenses);
    
    // Generate profitability analysis
    const profitabilityAnalysis = showProfitability ? generateProfitabilityAnalysis() : [];

    setSummaryData({
      totalExpenses,
      totalCount,
      averageExpense,
      monthlyExpenses,
      yearlyExpenses,
      categoryBreakdown,
      propertyBreakdown,
      monthlyTrend,
      profitabilityAnalysis,
    });
  };

  const getFilteredExpenses = (): Expense[] => {
    if (startDate || endDate) {
      return expenses;
    }

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
        return expenses;
    }

    return expenses.filter(expense => new Date(expense.date) >= cutoffDate);
  };

  const generateCategoryBreakdown = (filteredExpenses: Expense[], totalAmount: number): CategorySummary[] => {
    const categoryTotals: { [key: string]: { amount: number; count: number } } = {};

    filteredExpenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = { amount: 0, count: 0 };
      }
      categoryTotals[expense.category].amount += expense.amount;
      categoryTotals[expense.category].count += 1;
    });

    return Object.entries(categoryTotals).map(([category, data]) => ({
      category: category as ExpenseCategory,
      amount: data.amount,
      count: data.count,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      trend: 'stable' as const, // TODO: Calculate actual trend
      trendPercentage: 0, // TODO: Calculate actual trend percentage
    })).sort((a, b) => b.amount - a.amount);
  };

  const generatePropertyBreakdown = (filteredExpenses: Expense[]): PropertySummary[] => {
    const propertyTotals: { [key: string]: PropertySummary } = {};

    filteredExpenses.forEach(expense => {
      const propertyName = expense.property?.name || 'Unknown Property';
      
      if (!propertyTotals[expense.propertyId]) {
        propertyTotals[expense.propertyId] = {
          propertyId: expense.propertyId,
          propertyName,
          totalExpenses: 0,
          expenseCount: 0,
          averageExpense: 0,
          categories: {},
        };
      }
      
      propertyTotals[expense.propertyId].totalExpenses += expense.amount;
      propertyTotals[expense.propertyId].expenseCount += 1;
      
      if (!propertyTotals[expense.propertyId].categories[expense.category]) {
        propertyTotals[expense.propertyId].categories[expense.category] = 0;
      }
      propertyTotals[expense.propertyId].categories[expense.category] += expense.amount;
    });

    // Calculate averages and add income data if available
    return Object.values(propertyTotals).map(property => {
      const averageExpense = property.expenseCount > 0 ? property.totalExpenses / property.expenseCount : 0;
      
      // Calculate income for this property if payments are available
      const propertyPayments = payments.filter(payment => 
        payment.contract?.room?.propertyId === property.propertyId
      );
      const totalIncome = propertyPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const profitMargin = totalIncome > 0 ? ((totalIncome - property.totalExpenses) / totalIncome) * 100 : 0;

      return {
        ...property,
        averageExpense,
        totalIncome,
        profitMargin,
      };
    }).sort((a, b) => b.totalExpenses - a.totalExpenses);
  };

  const generateMonthlyTrend = (filteredExpenses: Expense[]): MonthlyTrend[] => {
    const monthlyData: { [key: string]: MonthlyTrend } = {};

    // Process expenses
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          expenses: 0,
          income: 0,
          profit: 0,
          profitMargin: 0,
        };
      }
      monthlyData[monthKey].expenses += expense.amount;
    });

    // Process payments (income)
    payments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          expenses: 0,
          income: 0,
          profit: 0,
          profitMargin: 0,
        };
      }
      monthlyData[monthKey].income += payment.amount;
    });

    // Calculate profit and profit margin
    Object.values(monthlyData).forEach(data => {
      data.profit = data.income - data.expenses;
      data.profitMargin = data.income > 0 ? (data.profit / data.income) * 100 : 0;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  const generateProfitabilityAnalysis = (): ProfitabilityData[] => {
    const propertyData: { [key: string]: ProfitabilityData } = {};

    // Initialize with properties
    properties.forEach(property => {
      propertyData[property.id] = {
        propertyId: property.id,
        propertyName: property.name,
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        status: 'break-even',
      };
    });

    // Add expenses
    expenses.forEach(expense => {
      if (propertyData[expense.propertyId]) {
        propertyData[expense.propertyId].totalExpenses += expense.amount;
      }
    });

    // Add income from payments
    payments.forEach(payment => {
      const propertyId = payment.contract?.room?.propertyId;
      if (propertyId && propertyData[propertyId]) {
        propertyData[propertyId].totalIncome += payment.amount;
      }
    });

    // Calculate profitability
    return Object.values(propertyData).map(data => {
      const netProfit = data.totalIncome - data.totalExpenses;
      const profitMargin = data.totalIncome > 0 ? (netProfit / data.totalIncome) * 100 : 0;
      
      let status: 'profitable' | 'break-even' | 'loss' = 'break-even';
      if (netProfit > 0) status = 'profitable';
      else if (netProfit < 0) status = 'loss';

      return {
        ...data,
        netProfit,
        profitMargin,
        status,
      };
    }).sort((a, b) => b.netProfit - a.netProfit);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const getCategoryColor = (category: ExpenseCategory) => {
    const colors = {
      [ExpenseCategory.MAINTENANCE]: 'bg-orange-100 text-orange-800',
      [ExpenseCategory.UTILITIES]: 'bg-blue-100 text-blue-800',
      [ExpenseCategory.TAXES]: 'bg-red-100 text-red-800',
      [ExpenseCategory.INSURANCE]: 'bg-green-100 text-green-800',
      [ExpenseCategory.SALARY]: 'bg-purple-100 text-purple-800',
      [ExpenseCategory.SUPPLIES]: 'bg-yellow-100 text-yellow-800',
      [ExpenseCategory.MARKETING]: 'bg-pink-100 text-pink-800',
      [ExpenseCategory.OTHER]: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getProfitabilityIcon = (status: 'profitable' | 'break-even' | 'loss') => {
    switch (status) {
      case 'profitable':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'loss':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-yellow-600" />;
    }
  };

  if (!summaryData) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <Card>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Expense Summary</h2>
          <p className="text-muted-foreground">Detailed analysis of your property expenses</p>
        </div>
        {!startDate && !endDate && (
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryData.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {summaryData.totalCount} expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryData.monthlyExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryData.averageExpense)}</div>
            <p className="text-xs text-muted-foreground">
              Per expense
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.propertyBreakdown.length}</div>
            <p className="text-xs text-muted-foreground">
              With expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>Expense Categories</span>
          </CardTitle>
          <CardDescription>
            Breakdown of expenses by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summaryData.categoryBreakdown.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(category.category)}>
                      {category.category.charAt(0) + category.category.slice(1).toLowerCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {category.count} expenses
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{formatCurrency(category.amount)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({formatPercentage(category.percentage)})
                    </span>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Property Analysis</span>
          </CardTitle>
          <CardDescription>
            Expense breakdown by property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summaryData.propertyBreakdown.map((property, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{property.propertyName}</h3>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(property.totalExpenses)}</div>
                    <div className="text-sm text-muted-foreground">
                      {property.expenseCount} expenses
                    </div>
                  </div>
                </div>
                
                {property.profitMargin !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Profit Margin:</span>
                    <div className="flex items-center space-x-1">
                      {property.profitMargin >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                      )}
                      <span className={property.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatPercentage(property.profitMargin)}
                      </span>
                    </div>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {Object.entries(property.categories).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-muted-foreground truncate">
                        {category.charAt(0) + category.slice(1).toLowerCase()}:
                      </span>
                      <span className="font-medium">{formatCurrency(amount as number)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profitability Analysis */}
      {showProfitability && summaryData.profitabilityAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Profitability Analysis</span>
            </CardTitle>
            <CardDescription>
              Income vs expenses analysis by property
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summaryData.profitabilityAnalysis.map((data, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getProfitabilityIcon(data.status)}
                      <h3 className="font-medium">{data.propertyName}</h3>
                      <Badge 
                        variant={data.status === 'profitable' ? 'default' : data.status === 'loss' ? 'destructive' : 'secondary'}
                      >
                        {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(data.netProfit)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPercentage(data.profitMargin)} margin
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Income:</span>
                      <div className="font-medium text-green-600">{formatCurrency(data.totalIncome)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Expenses:</span>
                      <div className="font-medium text-red-600">{formatCurrency(data.totalExpenses)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpenseSummary;