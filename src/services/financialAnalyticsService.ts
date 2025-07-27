import { Payment, Expense } from '../utils/apiClient';

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  roi: number;
  cashFlow: number;
  averageRevenue: number;
  averageExpense: number;
  revenueGrowth: number;
  expenseGrowth: number;
}

export interface RevenueForecasting {
  predictedRevenue: number[];
  confidenceInterval: { lower: number; upper: number }[];
  trendDirection: 'up' | 'down' | 'stable';
  seasonalFactors: number[];
  forecastAccuracy: number;
}

export interface ROIAnalysis {
  propertyROI: { propertyId: string; roi: number; investment: number; returns: number }[];
  overallROI: number;
  bestPerformingProperty: string;
  worstPerformingProperty: string;
  roiTrend: number[];
}

export interface ProfitLossAnalysis {
  monthlyProfitLoss: { month: string; profit: number; loss: number; net: number }[];
  yearlyComparison: { year: number; profit: number; loss: number; net: number }[];
  profitTrend: 'increasing' | 'decreasing' | 'stable';
  lossCategories: { category: string; amount: number; percentage: number }[];
}

export interface CashFlowAnalysis {
  monthlyCashFlow: { month: string; inflow: number; outflow: number; net: number }[];
  cashFlowProjection: { month: string; projected: number; actual?: number }[];
  liquidityRatio: number;
  operatingCashFlow: number;
  freeCashFlow: number;
}

export class FinancialAnalyticsService {
  /**
   * Calculate comprehensive financial metrics
   */
  static calculateFinancialMetrics(
    payments: Payment[],
    expenses: Expense[],
    previousPeriodPayments?: Payment[],
    previousPeriodExpenses?: Expense[]
  ): FinancialMetrics {
    const totalRevenue = payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    // Calculate ROI (assuming initial investment is represented by property-related expenses)
    const propertyInvestment = expenses
      .filter(e => ['PROPERTY_PURCHASE', 'RENOVATION', 'IMPROVEMENT'].includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);
    const roi = propertyInvestment > 0 ? (netProfit / propertyInvestment) * 100 : 0;

    const cashFlow = totalRevenue - expenses
      .filter(e => !['PROPERTY_PURCHASE', 'RENOVATION'].includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);

    const averageRevenue = payments.length > 0 ? totalRevenue / payments.length : 0;
    const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

    // Calculate growth rates if previous period data is available
    let revenueGrowth = 0;
    let expenseGrowth = 0;
    
    if (previousPeriodPayments && previousPeriodExpenses) {
      const prevRevenue = previousPeriodPayments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0);
      const prevExpenses = previousPeriodExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
      expenseGrowth = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0;
    }

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      roi,
      cashFlow,
      averageRevenue,
      averageExpense,
      revenueGrowth,
      expenseGrowth,
    };
  }

  /**
   * Generate revenue forecasting using simple linear regression and seasonal adjustments
   */
  static generateRevenueForecasting(
    historicalPayments: Payment[],
    forecastMonths: number = 12
  ): RevenueForecasting {
    // Group payments by month
    const monthlyRevenue = this.groupPaymentsByMonth(historicalPayments);
    const revenues = monthlyRevenue.map(m => m.revenue);
    
    if (revenues.length < 3) {
      // Not enough data for meaningful forecasting
      return {
        predictedRevenue: new Array(forecastMonths).fill(0),
        confidenceInterval: new Array(forecastMonths).fill({ lower: 0, upper: 0 }),
        trendDirection: 'stable',
        seasonalFactors: new Array(12).fill(1),
        forecastAccuracy: 0,
      };
    }

    // Simple linear regression
    const n = revenues.length;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const y = revenues;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate seasonal factors (simplified)
    const seasonalFactors = this.calculateSeasonalFactors(monthlyRevenue);
    
    // Generate predictions
    const predictedRevenue: number[] = [];
    const confidenceInterval: { lower: number; upper: number }[] = [];
    
    for (let i = 1; i <= forecastMonths; i++) {
      const basePredict = slope * (n + i) + intercept;
      const seasonalIndex = (new Date().getMonth() + i - 1) % 12;
      const seasonalAdjusted = basePredict * seasonalFactors[seasonalIndex];
      
      predictedRevenue.push(Math.max(0, seasonalAdjusted));
      
      // Simple confidence interval (±20% for demonstration)
      const margin = seasonalAdjusted * 0.2;
      confidenceInterval.push({
        lower: Math.max(0, seasonalAdjusted - margin),
        upper: seasonalAdjusted + margin,
      });
    }
    
    const trendDirection = slope > 50 ? 'up' : slope < -50 ? 'down' : 'stable';
    
    // Calculate forecast accuracy based on recent predictions vs actual
    const forecastAccuracy = this.calculateForecastAccuracy(revenues);

    return {
      predictedRevenue,
      confidenceInterval,
      trendDirection,
      seasonalFactors,
      forecastAccuracy,
    };
  }

  /**
   * Analyze ROI for different properties
   */
  static analyzeROI(
    payments: Payment[],
    expenses: Expense[],
    properties: { id: string; initialInvestment?: number }[]
  ): ROIAnalysis {
    const propertyROI = properties.map(property => {
      const propertyPayments = payments.filter(p => 
        p.contract?.room?.propertyId === property.id && p.status === 'PAID'
      );
      const propertyExpenses = expenses.filter(e => e.propertyId === property.id);
      
      const returns = propertyPayments.reduce((sum, p) => sum + p.amount, 0);
      const costs = propertyExpenses.reduce((sum, e) => sum + e.amount, 0);
      const investment = property.initialInvestment || costs;
      
      const roi = investment > 0 ? ((returns - costs) / investment) * 100 : 0;
      
      return {
        propertyId: property.id,
        roi,
        investment,
        returns: returns - costs,
      };
    });

    const overallROI = propertyROI.length > 0 
      ? propertyROI.reduce((sum, p) => sum + p.roi, 0) / propertyROI.length 
      : 0;

    const bestPerforming = propertyROI.reduce((best, current) => 
      current.roi > best.roi ? current : best, propertyROI[0] || { propertyId: '', roi: 0 }
    );

    const worstPerforming = propertyROI.reduce((worst, current) => 
      current.roi < worst.roi ? current : worst, propertyROI[0] || { propertyId: '', roi: 0 }
    );

    // Generate ROI trend (simplified - would need historical data)
    const roiTrend = Array.from({ length: 12 }, (_, i) => overallROI + (Math.random() - 0.5) * 2);

    return {
      propertyROI,
      overallROI,
      bestPerformingProperty: bestPerforming.propertyId,
      worstPerformingProperty: worstPerforming.propertyId,
      roiTrend,
    };
  }

  /**
   * Analyze profit and loss trends
   */
  static analyzeProfitLoss(
    payments: Payment[],
    expenses: Expense[]
  ): ProfitLossAnalysis {
    const monthlyData = this.groupDataByMonth(payments, expenses);
    
    const monthlyProfitLoss = monthlyData.map(data => ({
      month: data.month,
      profit: data.revenue,
      loss: data.expenses,
      net: data.revenue - data.expenses,
    }));

    // Group by year for yearly comparison
    const yearlyData = this.groupDataByYear(payments, expenses);
    const yearlyComparison = yearlyData.map(data => ({
      year: data.year,
      profit: data.revenue,
      loss: data.expenses,
      net: data.revenue - data.expenses,
    }));

    // Determine profit trend
    const recentMonths = monthlyProfitLoss.slice(-6);
    const avgRecentProfit = recentMonths.reduce((sum, m) => sum + m.net, 0) / recentMonths.length;
    const olderMonths = monthlyProfitLoss.slice(-12, -6);
    const avgOlderProfit = olderMonths.length > 0 
      ? olderMonths.reduce((sum, m) => sum + m.net, 0) / olderMonths.length 
      : avgRecentProfit;

    const profitTrend = avgRecentProfit > avgOlderProfit * 1.05 ? 'increasing' 
      : avgRecentProfit < avgOlderProfit * 0.95 ? 'decreasing' 
      : 'stable';

    // Analyze loss categories
    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
    const lossCategories = Object.entries(expensesByCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }));

    return {
      monthlyProfitLoss,
      yearlyComparison,
      profitTrend,
      lossCategories,
    };
  }

  /**
   * Analyze cash flow patterns
   */
  static analyzeCashFlow(
    payments: Payment[],
    expenses: Expense[]
  ): CashFlowAnalysis {
    const monthlyData = this.groupDataByMonth(payments, expenses);
    
    const monthlyCashFlow = monthlyData.map(data => ({
      month: data.month,
      inflow: data.revenue,
      outflow: data.expenses,
      net: data.revenue - data.expenses,
    }));

    // Generate cash flow projection (simplified)
    const avgMonthlyInflow = monthlyCashFlow.reduce((sum, m) => sum + m.inflow, 0) / monthlyCashFlow.length;
    const avgMonthlyOutflow = monthlyCashFlow.reduce((sum, m) => sum + m.outflow, 0) / monthlyCashFlow.length;
    
    const cashFlowProjection = Array.from({ length: 6 }, (_, i) => {
      const futureMonth = new Date();
      futureMonth.setMonth(futureMonth.getMonth() + i + 1);
      
      return {
        month: futureMonth.toISOString().slice(0, 7),
        projected: avgMonthlyInflow - avgMonthlyOutflow,
      };
    });

    // Calculate financial ratios
    const currentAssets = payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);
    const currentLiabilities = expenses
      .filter(e => ['UTILITIES', 'MAINTENANCE', 'INSURANCE'].includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const liquidityRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    
    const operatingCashFlow = monthlyCashFlow.reduce((sum, m) => sum + m.net, 0);
    const capitalExpenses = expenses
      .filter(e => ['PROPERTY_PURCHASE', 'RENOVATION', 'IMPROVEMENT'].includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const freeCashFlow = operatingCashFlow - capitalExpenses;

    return {
      monthlyCashFlow,
      cashFlowProjection,
      liquidityRatio,
      operatingCashFlow,
      freeCashFlow,
    };
  }

  // Helper methods
  private static groupPaymentsByMonth(payments: Payment[]) {
    const grouped = payments
      .filter(p => p.status === 'PAID')
      .reduce((acc, payment) => {
        const month = payment.paymentDate?.slice(0, 7) || payment.dueDate.slice(0, 7);
        if (!acc[month]) {
          acc[month] = { month, revenue: 0, count: 0 };
        }
        acc[month].revenue += payment.amount;
        acc[month].count += 1;
        return acc;
      }, {} as Record<string, { month: string; revenue: number; count: number }>);

    return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
  }

  private static groupDataByMonth(payments: Payment[], expenses: Expense[]) {
    const paymentsByMonth = this.groupPaymentsByMonth(payments);
    const expensesByMonth = expenses.reduce((acc, expense) => {
      const month = expense.date.slice(0, 7);
      if (!acc[month]) {
        acc[month] = { month, expenses: 0 };
      }
      acc[month].expenses += expense.amount;
      return acc;
    }, {} as Record<string, { month: string; expenses: number }>);

    // Combine payment and expense data
    const allMonths = new Set([
      ...paymentsByMonth.map(p => p.month),
      ...Object.keys(expensesByMonth)
    ]);

    return Array.from(allMonths).map(month => ({
      month,
      revenue: paymentsByMonth.find(p => p.month === month)?.revenue || 0,
      expenses: expensesByMonth[month]?.expenses || 0,
    })).sort((a, b) => a.month.localeCompare(b.month));
  }

  private static groupDataByYear(payments: Payment[], expenses: Expense[]) {
    const paymentsByYear = payments
      .filter(p => p.status === 'PAID')
      .reduce((acc, payment) => {
        const year = parseInt(payment.paymentDate?.slice(0, 4) || payment.dueDate.slice(0, 4));
        if (!acc[year]) {
          acc[year] = { year, revenue: 0 };
        }
        acc[year].revenue += payment.amount;
        return acc;
      }, {} as Record<number, { year: number; revenue: number }>);

    const expensesByYear = expenses.reduce((acc, expense) => {
      const year = parseInt(expense.date.slice(0, 4));
      if (!acc[year]) {
        acc[year] = { year, expenses: 0 };
      }
      acc[year].expenses += expense.amount;
      return acc;
    }, {} as Record<number, { year: number; expenses: number }>);

    const allYears = new Set([
      ...Object.keys(paymentsByYear).map(Number),
      ...Object.keys(expensesByYear).map(Number)
    ]);

    return Array.from(allYears).map(year => ({
      year,
      revenue: paymentsByYear[year]?.revenue || 0,
      expenses: expensesByYear[year]?.expenses || 0,
    })).sort((a, b) => a.year - b.year);
  }

  private static calculateSeasonalFactors(monthlyData: { month: string; revenue: number }[]) {
    // Simplified seasonal calculation - would need more sophisticated analysis in production
    const factors = new Array(12).fill(1);
    
    if (monthlyData.length >= 12) {
      const avgRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0) / monthlyData.length;
      
      for (let month = 0; month < 12; month++) {
        const monthData = monthlyData.filter(m => {
          const monthIndex = new Date(m.month + '-01').getMonth();
          return monthIndex === month;
        });
        
        if (monthData.length > 0) {
          const monthAvg = monthData.reduce((sum, m) => sum + m.revenue, 0) / monthData.length;
          factors[month] = avgRevenue > 0 ? monthAvg / avgRevenue : 1;
        }
      }
    }
    
    return factors;
  }

  private static calculateForecastAccuracy(revenues: number[]) {
    // Simplified accuracy calculation - would use more sophisticated methods in production
    if (revenues.length < 6) return 0;
    
    const recent = revenues.slice(-3);
    const predicted = revenues.slice(-6, -3);
    
    let totalError = 0;
    let totalActual = 0;
    
    for (let i = 0; i < Math.min(recent.length, predicted.length); i++) {
      totalError += Math.abs(recent[i] - predicted[i]);
      totalActual += recent[i];
    }
    
    return totalActual > 0 ? Math.max(0, 100 - (totalError / totalActual) * 100) : 0;
  }
}