import React, { useEffect, useState } from 'react';
import { usePaymentStore } from '../../stores/paymentStore';
import { useExpenseStore } from '../../stores/expenseStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';

interface FinancialOverviewProps {
  className?: string;
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ className }) => {
  const { 
    analytics: paymentAnalytics, 
    overduePayments,
    fetchPaymentAnalytics, 
    fetchOverduePayments 
  } = usePaymentStore();
  
  const { 
    expenseTotals, 
    fetchExpenseSummary 
  } = useExpenseStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        setIsLoading(true);
        
        // Get current month date range
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const startDate = startOfMonth.toISOString().split('T')[0];
        const endDate = endOfMonth.toISOString().split('T')[0];

        await Promise.all([
          fetchPaymentAnalytics(undefined, startDate, endDate),
          fetchOverduePayments(),
          fetchExpenseSummary(undefined, startDate, endDate)
        ]);
      } catch (error) {
        console.error('Error loading financial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFinancialData();
  }, [fetchPaymentAnalytics, fetchOverduePayments, fetchExpenseSummary]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalIncome = paymentAnalytics?.summary.paidAmount || 0;
  const totalExpenses = expenseTotals?.totalAmount || 0;
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0;
  
  const pendingPayments = paymentAnalytics?.summary.pendingAmount || 0;
  const overdueAmount = paymentAnalytics?.summary.overdueAmount || 0;
  const overdueCount = overduePayments.length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Income</p>
                <p className="text-2xl font-bold text-green-700">
                  ${totalIncome.toLocaleString()}
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

          <div className={`p-4 rounded-lg ${netProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  Net Profit
                </p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  ${netProfit.toLocaleString()}
                </p>
              </div>
              {netProfit >= 0 ? (
                <TrendingUp className="h-8 w-8 text-blue-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-orange-500" />
              )}
            </div>
          </div>
        </div>

        {/* Profitability Indicator */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Profit Margin</span>
            <Badge variant={profitMargin >= 20 ? 'default' : profitMargin >= 10 ? 'secondary' : 'destructive'}>
              {profitMargin.toFixed(1)}%
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                profitMargin >= 20 ? 'bg-green-500' : 
                profitMargin >= 10 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(Math.max(profitMargin, 0), 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Payment Status Summary */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Payment Status</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending Payments</p>
                <p className="text-lg font-semibold text-yellow-700">
                  ${pendingPayments.toLocaleString()}
                </p>
              </div>
              <Badge variant="secondary">
                {paymentAnalytics?.breakdowns.byStatus.PENDING || 0}
              </Badge>
            </div>

            {overdueCount > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-red-600">Overdue Payments</p>
                  <p className="text-lg font-semibold text-red-700">
                    ${overdueAmount.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive">{overdueCount}</Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial Trends */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Financial Trends</h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Payment:</span>
              <span className="font-medium">
                ${(paymentAnalytics?.summary.averageAmount || 0).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Average Expense:</span>
              <span className="font-medium">
                ${(expenseTotals?.averageAmount || 0).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Total Payments:</span>
              <span className="font-medium">
                {paymentAnalytics?.summary.totalCount || 0}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Total Expenses:</span>
              <span className="font-medium">
                {expenseTotals?.totalCount || 0}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialOverview;