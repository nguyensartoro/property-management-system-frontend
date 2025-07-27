import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Target,
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react';
import { usePaymentStore } from '../../stores/paymentStore';
import { useExpenseStore } from '../../stores/expenseStore';
import { usePropertyStore } from '../../stores/propertyStore';
import { 
  FinancialAnalyticsService,
  FinancialMetrics,
  RevenueForecasting as RevenueForecastingData,
  ROIAnalysis as ROIAnalysisData,
  ProfitLossAnalysis,
  CashFlowAnalysis
} from '../../services/financialAnalyticsService';
import RevenueForecasting from './RevenueForecasting';
import ROIAnalysis from './ROIAnalysis';
import ProfitLossTrends from './ProfitLossTrends';

interface FinancialAnalyticsDashboardProps {
  className?: string;
}

const FinancialAnalyticsDashboard: React.FC<FinancialAnalyticsDashboardProps> = ({
  className,
}) => {
  const { payments, fetchPayments } = usePaymentStore();
  const { expenses, fetchExpenses } = useExpenseStore();
  const { properties, fetchProperties } = usePropertyStore();

  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'3m' | '6m' | '1y' | 'all'>('6m');
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [revenueForecasting, setRevenueForecasting] = useState<RevenueForecastingData | null>(null);
  const [roiAnalysis, setROIAnalysis] = useState<ROIAnalysisData | null>(null);
  const [profitLossAnalysis, setProfitLossAnalysis] = useState<ProfitLossAnalysis | null>(null);
  const [cashFlowAnalysis, setCashFlowAnalysis] = useState<CashFlowAnalysis | null>(null);

  // Calculate date range for filtering
  const getDateRange = (range: string) => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '3m':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setFullYear(endDate.getFullYear() - 5); // All data
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Load base data
      await Promise.all([
        fetchPayments(1, 1000), // Get all payments
        fetchExpenses(1, 1000), // Get all expenses
        fetchProperties(),
      ]);

      // Filter data by date range
      const { startDate, endDate } = getDateRange(dateRange);
      const filteredPayments = payments.filter(p => {
        const paymentDate = p.paymentDate || p.dueDate;
        return paymentDate >= startDate && paymentDate <= endDate;
      });
      
      const filteredExpenses = expenses.filter(e => 
        e.date >= startDate && e.date <= endDate
      );

      // Calculate financial metrics
      const calculatedMetrics = FinancialAnalyticsService.calculateFinancialMetrics(
        filteredPayments,
        filteredExpenses
      );
      setMetrics(calculatedMetrics);

      // Generate revenue forecasting
      const forecasting = FinancialAnalyticsService.generateRevenueForecasting(
        filteredPayments,
        12
      );
      setRevenueForecasting(forecasting);

      // Analyze ROI
      const propertiesWithInvestment = properties.map(p => ({
        id: p.id,
        initialInvestment: 100000, // This would come from property data in real implementation
      }));
      
      const roi = FinancialAnalyticsService.analyzeROI(
        filteredPayments,
        filteredExpenses,
        propertiesWithInvestment
      );
      setROIAnalysis(roi);

      // Analyze profit/loss trends
      const profitLoss = FinancialAnalyticsService.analyzeProfitLoss(
        filteredPayments,
        filteredExpenses
      );
      setProfitLossAnalysis(profitLoss);

      // Analyze cash flow
      const cashFlow = FinancialAnalyticsService.analyzeCashFlow(
        filteredPayments,
        filteredExpenses
      );
      setCashFlowAnalysis(cashFlow);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const handleExportData = () => {
    // This would implement data export functionality
    console.log('Exporting analytics data...');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Financial Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Financial Analytics Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="3m">Last 3 Months</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">Last Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadAnalyticsData}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${metrics.totalRevenue.toLocaleString()}
                  </p>
                  {metrics.revenueGrowth !== 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {metrics.revenueGrowth > 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                      <span className={`text-xs ${metrics.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(metrics.revenueGrowth).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    ${metrics.netProfit.toLocaleString()}
                  </p>
                  <Badge variant={metrics.profitMargin > 20 ? 'default' : metrics.profitMargin > 10 ? 'secondary' : 'destructive'} className="mt-1">
                    {metrics.profitMargin.toFixed(1)}% margin
                  </Badge>
                </div>
                <TrendingUp className={`h-8 w-8 ${metrics.netProfit >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ROI</p>
                  <p className={`text-2xl font-bold ${metrics.roi >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
                    {metrics.roi.toFixed(1)}%
                  </p>
                  <Badge variant={metrics.roi > 15 ? 'default' : metrics.roi > 5 ? 'secondary' : 'destructive'} className="mt-1">
                    {metrics.roi > 15 ? 'Excellent' : metrics.roi > 5 ? 'Good' : 'Poor'}
                  </Badge>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cash Flow</p>
                  <p className={`text-2xl font-bold ${metrics.cashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ${metrics.cashFlow.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Avg: ${metrics.averageRevenue.toLocaleString()}
                  </p>
                </div>
                <BarChart3 className={`h-8 w-8 ${metrics.cashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="forecasting" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecasting" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Revenue Forecasting
          </TabsTrigger>
          <TabsTrigger value="roi" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            ROI Analysis
          </TabsTrigger>
          <TabsTrigger value="profitloss" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Profit & Loss
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecasting" className="space-y-4">
          {revenueForecasting && (
            <RevenueForecasting 
              data={revenueForecasting}
              historicalData={(() => {
                const monthlyRevenue = payments
                  .filter(p => p.status === 'PAID')
                  .reduce((acc, payment) => {
                    const month = payment.paymentDate?.slice(0, 7) || payment.dueDate.slice(0, 7);
                    if (!acc[month]) {
                      acc[month] = { month, revenue: 0 };
                    }
                    acc[month].revenue += payment.amount;
                    return acc;
                  }, {} as Record<string, { month: string; revenue: number }>);
                
                return Object.values(monthlyRevenue).sort((a, b) => a.month.localeCompare(b.month));
              })()}
            />
          )}
        </TabsContent>

        <TabsContent value="roi" className="space-y-4">
          {roiAnalysis && (
            <ROIAnalysis 
              data={roiAnalysis}
              propertyNames={properties.reduce((acc, p) => {
                acc[p.id] = p.name;
                return acc;
              }, {} as Record<string, string>)}
            />
          )}
        </TabsContent>

        <TabsContent value="profitloss" className="space-y-4">
          {profitLossAnalysis && (
            <ProfitLossTrends data={profitLossAnalysis} />
          )}
        </TabsContent>
      </Tabs>

      {/* Cash Flow Summary */}
      {cashFlowAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Cash Flow Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Operating Cash Flow</p>
                    <p className="text-xl font-bold text-blue-700">
                      ${cashFlowAnalysis.operatingCashFlow.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Free Cash Flow</p>
                    <p className="text-xl font-bold text-green-700">
                      ${cashFlowAnalysis.freeCashFlow.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Liquidity Ratio</p>
                    <p className="text-xl font-bold text-purple-700">
                      {cashFlowAnalysis.liquidityRatio.toFixed(2)}
                    </p>
                  </div>
                  <Badge variant={cashFlowAnalysis.liquidityRatio > 2 ? 'default' : cashFlowAnalysis.liquidityRatio > 1 ? 'secondary' : 'destructive'}>
                    {cashFlowAnalysis.liquidityRatio > 2 ? 'Strong' : cashFlowAnalysis.liquidityRatio > 1 ? 'Good' : 'Weak'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialAnalyticsDashboard;