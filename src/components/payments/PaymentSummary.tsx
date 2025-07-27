import React, { useMemo } from 'react';
import { Payment, PaymentStatus, PaymentMethod } from '../../utils/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  PieChart,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Banknote,
  Building2
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  isSameMonth,
  parseISO
} from 'date-fns';

interface PaymentSummaryProps {
  payments: Payment[];
  analytics?: {
    summary: {
      totalAmount: number;
      totalCount: number;
      paidAmount: number;
      pendingAmount: number;
      overdueAmount: number;
      averageAmount: number;
    };
    breakdowns: {
      byStatus: Record<string, number>;
      byMethod: Record<string, number>;
    };
  } | null;
  timeRange?: 'month' | 'quarter' | 'year' | 'all';
  showTrends?: boolean;
}

interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  payments,
  analytics,
  timeRange = 'month',
  showTrends = true,
}) => {
  // Calculate trends
  const trends = useMemo(() => {
    if (!showTrends || payments.length === 0) return null;

    const now = new Date();
    const currentPeriodStart = startOfMonth(now);
    const currentPeriodEnd = endOfMonth(now);
    const previousPeriodStart = startOfMonth(subMonths(now, 1));
    const previousPeriodEnd = endOfMonth(subMonths(now, 1));

    const currentPayments = payments.filter(p => {
      const paymentDate = parseISO(p.paymentDate || p.dueDate);
      return paymentDate >= currentPeriodStart && paymentDate <= currentPeriodEnd;
    });

    const previousPayments = payments.filter(p => {
      const paymentDate = parseISO(p.paymentDate || p.dueDate);
      return paymentDate >= previousPeriodStart && paymentDate <= previousPeriodEnd;
    });

    const calculateTrend = (current: number, previous: number): TrendData => {
      const change = current - previous;
      const changePercent = previous > 0 ? (change / previous) * 100 : 0;
      return {
        current,
        previous,
        change,
        changePercent,
        isPositive: change >= 0,
      };
    };

    return {
      totalAmount: calculateTrend(
        currentPayments.reduce((sum, p) => sum + p.amount, 0),
        previousPayments.reduce((sum, p) => sum + p.amount, 0)
      ),
      paidAmount: calculateTrend(
        currentPayments.filter(p => p.status === PaymentStatus.PAID).reduce((sum, p) => sum + p.amount, 0),
        previousPayments.filter(p => p.status === PaymentStatus.PAID).reduce((sum, p) => sum + p.amount, 0)
      ),
      paymentCount: calculateTrend(
        currentPayments.length,
        previousPayments.length
      ),
    };
  }, [payments, showTrends]);

  // Calculate collection rate
  const collectionRate = useMemo(() => {
    if (!analytics) return 0;
    const { paidAmount, totalAmount } = analytics.summary;
    return totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  }, [analytics]);

  // Calculate payment method distribution
  const methodDistribution = useMemo(() => {
    if (!analytics) return [];
    
    const total = Object.values(analytics.breakdowns.byMethod).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(analytics.breakdowns.byMethod).map(([method, count]) => ({
      method: method as PaymentMethod,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }, [analytics]);

  // Calculate status distribution
  const statusDistribution = useMemo(() => {
    if (!analytics) return [];
    
    const total = Object.values(analytics.breakdowns.byStatus).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(analytics.breakdowns.byStatus).map(([status, count]) => ({
      status: status as PaymentStatus,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }, [analytics]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Get status icon and color
  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
      case PaymentStatus.PENDING:
        return { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case PaymentStatus.OVERDUE:
        return { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' };
      case PaymentStatus.PARTIAL:
        return { icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-100' };
      default:
        return { icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Get method icon
  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return Banknote;
      case PaymentMethod.BANK_TRANSFER:
        return Building2;
      case PaymentMethod.CREDIT_CARD:
        return CreditCard;
      default:
        return DollarSign;
    }
  };

  if (!analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Amount */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.summary.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.totalCount} payments
            </p>
            {trends && (
              <div className="flex items-center mt-2">
                {trends.totalAmount.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={`text-xs ${trends.totalAmount.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(Math.abs(trends.totalAmount.changePercent))} from last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paid Amount */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(analytics.summary.paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.breakdowns.byStatus.PAID || 0} payments
            </p>
            {trends && (
              <div className="flex items-center mt-2">
                {trends.paidAmount.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={`text-xs ${trends.paidAmount.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(Math.abs(trends.paidAmount.changePercent))} from last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Amount */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(analytics.summary.pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.breakdowns.byStatus.PENDING || 0} payments
            </p>
          </CardContent>
        </Card>

        {/* Overdue Amount */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(analytics.summary.overdueAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.breakdowns.byStatus.OVERDUE || 0} payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Collection Rate and Average Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Collection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{formatPercent(collectionRate)}</span>
                <Badge variant={collectionRate >= 80 ? "default" : collectionRate >= 60 ? "secondary" : "destructive"}>
                  {collectionRate >= 80 ? "Excellent" : collectionRate >= 60 ? "Good" : "Needs Attention"}
                </Badge>
              </div>
              <Progress value={collectionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {formatCurrency(analytics.summary.paidAmount)} of {formatCurrency(analytics.summary.totalAmount)} collected
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Average Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.summary.averageAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Across {analytics.summary.totalCount} payments
            </p>
            {trends && (
              <div className="flex items-center mt-2">
                {trends.paymentCount.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={`text-xs ${trends.paymentCount.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(trends.paymentCount.change)} payments from last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status and Method Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusDistribution.map(({ status, count, percentage }) => {
                const config = getStatusConfig(status);
                const Icon = config.icon;
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${config.bgColor}`}>
                        <Icon className={`h-3 w-3 ${config.color}`} />
                      </div>
                      <span className="text-sm font-medium capitalize">
                        {status.toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatPercent(percentage)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {methodDistribution.map(({ method, count, percentage }) => {
                const Icon = getMethodIcon(method);
                
                return (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {method.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatPercent(percentage)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Financial Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {formatPercent(collectionRate)}
              </div>
              <p className="text-xs text-muted-foreground">Collection Rate</p>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold">
                {analytics.summary.overdueAmount > 0 
                  ? formatPercent((analytics.summary.overdueAmount / analytics.summary.totalAmount) * 100)
                  : "0%"
                }
              </div>
              <p className="text-xs text-muted-foreground">Overdue Rate</p>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold">
                {formatCurrency(analytics.summary.averageAmount)}
              </div>
              <p className="text-xs text-muted-foreground">Avg Payment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSummary;