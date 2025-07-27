import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  Building,
  Receipt,
  FileText,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Calculator,
  CreditCard,
  Banknote
} from 'lucide-react';
import { useReportStore } from '../../stores/reportStore';
import { usePropertyStore } from '../../stores/propertyStore';
import { usePaymentStore } from '../../stores/paymentStore';
import { useExpenseStore } from '../../stores/expenseStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { useToast } from '../../hooks/use-toast';

interface FinancialReportsProps {
  className?: string;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  cashFlow: number;
  roi: number;
}

interface PropertyProfitability {
  propertyId: string;
  propertyName: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  occupancyRate: number;
  averageRent: number;
}

interface CashFlowData {
  month: string;
  income: number;
  expenses: number;
  netFlow: number;
  cumulativeFlow: number;
}

interface TaxReportData {
  totalRentalIncome: number;
  deductibleExpenses: number;
  depreciation: number;
  netRentalIncome: number;
  taxableIncome: number;
  estimatedTax: number;
  expensesByCategory: {
    category: string;
    amount: number;
    deductible: boolean;
  }[];
}

const FinancialReports: React.FC<FinancialReportsProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in a real app, this would come from the stores
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalIncome: 125000,
    totalExpenses: 45000,
    netProfit: 80000,
    profitMargin: 64,
    cashFlow: 15000,
    roi: 12.5,
  });

  const [propertyProfitability, setPropertyProfitability] = useState<PropertyProfitability[]>([
    {
      propertyId: '1',
      propertyName: 'Downtown Apartments',
      totalIncome: 75000,
      totalExpenses: 25000,
      netProfit: 50000,
      profitMargin: 66.7,
      occupancyRate: 95,
      averageRent: 1250,
    },
    {
      propertyId: '2',
      propertyName: 'Suburban Complex',
      totalIncome: 50000,
      totalExpenses: 20000,
      netProfit: 30000,
      profitMargin: 60,
      occupancyRate: 88,
      averageRent: 1100,
    },
  ]);

  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([
    { month: 'Jan', income: 10000, expenses: 3500, netFlow: 6500, cumulativeFlow: 6500 },
    { month: 'Feb', income: 10500, expenses: 4000, netFlow: 6500, cumulativeFlow: 13000 },
    { month: 'Mar', income: 11000, expenses: 3800, netFlow: 7200, cumulativeFlow: 20200 },
    { month: 'Apr', income: 10800, expenses: 4200, netFlow: 6600, cumulativeFlow: 26800 },
    { month: 'May', income: 11200, expenses: 3900, netFlow: 7300, cumulativeFlow: 34100 },
    { month: 'Jun', income: 10900, expenses: 4100, netFlow: 6800, cumulativeFlow: 40900 },
  ]);

  const [taxReportData, setTaxReportData] = useState<TaxReportData>({
    totalRentalIncome: 125000,
    deductibleExpenses: 38000,
    depreciation: 12000,
    netRentalIncome: 87000,
    taxableIncome: 75000,
    estimatedTax: 18750,
    expensesByCategory: [
      { category: 'Maintenance', amount: 15000, deductible: true },
      { category: 'Utilities', amount: 8000, deductible: true },
      { category: 'Insurance', amount: 6000, deductible: true },
      { category: 'Property Tax', amount: 9000, deductible: true },
      { category: 'Management Fees', amount: 7000, deductible: false },
    ],
  });

  const { properties, fetchProperties } = usePropertyStore();

  useEffect(() => {
    fetchProperties();
    
    // Set default date range (current year)
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    setDateRange({
      startDate: startOfYear.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    });
  }, [fetchProperties]);

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

  const handleExportReport = (reportType: string) => {
    toast({
      title: "Export Started",
      description: `Exporting ${reportType} report...`,
    });
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${reportType} report has been downloaded`,
      });
    }, 2000);
  };

  const getChangeIndicator = (value: number, isPositive: boolean = true) => {
    const isGood = isPositive ? value > 0 : value < 0;
    return (
      <div className={`flex items-center space-x-1 ${isGood ? 'text-green-600' : 'text-red-600'}`}>
        {isGood ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        <span className="text-xs font-medium">{Math.abs(value)}%</span>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <DollarSign className="h-6 w-6" />
            <span>Financial Reports</span>
          </h2>
          <p className="text-muted-foreground">
            Comprehensive financial analysis and reporting
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="tax">Tax Report</TabsTrigger>
        </TabsList>

        {/* Financial Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(financialSummary.totalIncome)}
                </div>
                {getChangeIndicator(8.5, true)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(financialSummary.totalExpenses)}
                </div>
                {getChangeIndicator(3.2, false)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(financialSummary.netProfit)}
                </div>
                {getChangeIndicator(12.3, true)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(financialSummary.profitMargin)}
                </div>
                {getChangeIndicator(5.1, true)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  financialSummary.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(financialSummary.cashFlow)}
                </div>
                {getChangeIndicator(2.8, true)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROI</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(financialSummary.roi)}
                </div>
                {getChangeIndicator(1.5, true)}
              </CardContent>
            </Card>
          </div>

          {/* Income vs Expenses Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses Trend</CardTitle>
              <CardDescription>Monthly comparison over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                  <p className="text-sm text-muted-foreground">Income vs Expenses over time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Export Financial Overview</CardTitle>
              <CardDescription>Download detailed financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Income Statement')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Income Statement</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Balance Sheet')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Balance Sheet</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Financial Summary')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Financial Summary</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Profitability Tab */}
        <TabsContent value="profitability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Profitability Analysis</CardTitle>
              <CardDescription>
                Detailed profitability breakdown by property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propertyProfitability.map((property) => (
                  <div key={property.propertyId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{property.propertyName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {property.occupancyRate}% occupied • Avg rent: {formatCurrency(property.averageRent)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={property.profitMargin > 50 ? 'default' : 'secondary'}>
                        {formatPercentage(property.profitMargin)} margin
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(property.totalIncome)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Income</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-600">
                          {formatCurrency(property.totalExpenses)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Expenses</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${
                          property.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(property.netProfit)}
                        </div>
                        <div className="text-sm text-muted-foreground">Net Profit</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {formatPercentage(property.profitMargin)}
                        </div>
                        <div className="text-sm text-muted-foreground">Profit Margin</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Profitability</span>
                        <span>{formatPercentage(property.profitMargin)}</span>
                      </div>
                      <Progress value={property.profitMargin} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profitability Comparison</CardTitle>
              <CardDescription>Visual comparison of property performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                  <p className="text-sm text-muted-foreground">Property profitability comparison</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="cashflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
              <CardDescription>
                Monthly cash flow tracking and projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cash Flow Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(cashFlowData.reduce((sum, item) => sum + item.income, 0))}
                    </div>
                    <div className="text-sm text-green-700">Total Inflow</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(cashFlowData.reduce((sum, item) => sum + item.expenses, 0))}
                    </div>
                    <div className="text-sm text-red-700">Total Outflow</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(cashFlowData.reduce((sum, item) => sum + item.netFlow, 0))}
                    </div>
                    <div className="text-sm text-blue-700">Net Flow</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(cashFlowData[cashFlowData.length - 1]?.cumulativeFlow || 0)}
                    </div>
                    <div className="text-sm text-purple-700">Cumulative</div>
                  </div>
                </div>

                {/* Monthly Cash Flow Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Month</th>
                        <th className="text-right p-3 font-medium">Income</th>
                        <th className="text-right p-3 font-medium">Expenses</th>
                        <th className="text-right p-3 font-medium">Net Flow</th>
                        <th className="text-right p-3 font-medium">Cumulative</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashFlowData.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 font-medium">{item.month}</td>
                          <td className="p-3 text-right text-green-600">
                            {formatCurrency(item.income)}
                          </td>
                          <td className="p-3 text-right text-red-600">
                            {formatCurrency(item.expenses)}
                          </td>
                          <td className={`p-3 text-right font-medium ${
                            item.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(item.netFlow)}
                          </td>
                          <td className="p-3 text-right font-medium">
                            {formatCurrency(item.cumulativeFlow)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Visualization</CardTitle>
              <CardDescription>Graphical representation of cash flow trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                  <p className="text-sm text-muted-foreground">Cash flow over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Report Tab */}
        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Report Summary</CardTitle>
              <CardDescription>
                Tax-related financial information for reporting purposes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tax Summary */}
                <div className="space-y-4">
                  <h3 className="font-medium">Tax Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Rental Income:</span>
                      <span className="font-medium">{formatCurrency(taxReportData.totalRentalIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deductible Expenses:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(taxReportData.deductibleExpenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Depreciation:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(taxReportData.depreciation)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Net Rental Income:</span>
                      <span>{formatCurrency(taxReportData.netRentalIncome)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Taxable Income:</span>
                      <span>{formatCurrency(taxReportData.taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg">
                      <span>Estimated Tax (25%):</span>
                      <span className="text-red-600">{formatCurrency(taxReportData.estimatedTax)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductible Expenses */}
                <div className="space-y-4">
                  <h3 className="font-medium">Deductible Expenses</h3>
                  <div className="space-y-2">
                    {taxReportData.expensesByCategory.map((expense, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <span>{expense.category}</span>
                          {expense.deductible && (
                            <Badge variant="outline" className="text-xs">Deductible</Badge>
                          )}
                        </div>
                        <span className={expense.deductible ? 'text-green-600' : 'text-muted-foreground'}>
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Documents</CardTitle>
              <CardDescription>Generate and download tax-related documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Schedule E')}
                  className="flex items-center justify-center space-x-2 h-20"
                >
                  <FileText className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">Schedule E</div>
                    <div className="text-sm text-muted-foreground">Rental Income Report</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Expense Summary')}
                  className="flex items-center justify-center space-x-2 h-20"
                >
                  <Receipt className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">Expense Summary</div>
                    <div className="text-sm text-muted-foreground">Deductible Expenses</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Depreciation Schedule')}
                  className="flex items-center justify-center space-x-2 h-20"
                >
                  <Calculator className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">Depreciation</div>
                    <div className="text-sm text-muted-foreground">Asset Depreciation</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Tax Summary')}
                  className="flex items-center justify-center space-x-2 h-20"
                >
                  <Banknote className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">Tax Summary</div>
                    <div className="text-sm text-muted-foreground">Complete Tax Report</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReports;