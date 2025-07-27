import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Wrench, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Target,
  BarChart3
} from 'lucide-react';
import { useMaintenanceStore } from '../../stores/maintenanceStore';
import { useExpenseStore } from '../../stores/expenseStore';
import { usePropertyStore } from '../../stores/propertyStore';
import { 
  MaintenanceAnalyticsService,
  MaintenanceMetrics,
  MaintenanceCostTracking,
  VendorPerformance,
  PredictiveAnalytics,
  MaintenanceEfficiency
} from '../../services/maintenanceAnalyticsService';
import {
  LineChart,
  Line,
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
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';

interface MaintenanceAnalyticsDashboardProps {
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const MaintenanceAnalyticsDashboard: React.FC<MaintenanceAnalyticsDashboardProps> = ({
  className,
}) => {
  // Helper method to calculate trends
  const calculateTrend = (data: any[], field: string): 'increasing' | 'decreasing' | 'stable' => {
    if (data.length < 2) return 'stable';
    
    const recent = data.slice(-3).reduce((sum, item) => sum + (item[field] || 0), 0) / 3;
    const older = data.slice(-6, -3).reduce((sum, item) => sum + (item[field] || 0), 0) / 3;
    
    if (recent > older * 1.1) return 'increasing';
    if (recent < older * 0.9) return 'decreasing';
    return 'stable';
  };
  const { maintenanceRequests, fetchMaintenanceRequests } = useMaintenanceStore();
  const { expenses, fetchExpenses } = useExpenseStore();
  const { properties, fetchProperties } = usePropertyStore();

  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<MaintenanceMetrics | null>(null);
  const [costTracking, setCostTracking] = useState<MaintenanceCostTracking | null>(null);
  const [vendorPerformance, setVendorPerformance] = useState<VendorPerformance | null>(null);
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<PredictiveAnalytics | null>(null);
  const [efficiency, setEfficiency] = useState<MaintenanceEfficiency | null>(null);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch advanced analytics from backend
      const analyticsData = await MaintenanceAnalyticsService.fetchMaintenanceAnalytics();
      
      // Transform backend data to component format
      const transformedMetrics: MaintenanceMetrics = {
        totalRequests: analyticsData.currentMetrics.totalRequests,
        completedRequests: analyticsData.currentMetrics.completedRequests,
        pendingRequests: analyticsData.currentMetrics.pendingRequests,
        averageResolutionTime: 3.5, // Would be calculated from backend
        totalMaintenanceCost: analyticsData.currentMetrics.totalMaintenanceCost,
        averageCostPerRequest: analyticsData.currentMetrics.averageCostPerRequest,
        requestTrend: this.calculateTrend(analyticsData.costTracking.monthlySpending, 'requestCount'),
        costTrend: this.calculateTrend(analyticsData.costTracking.monthlySpending, 'amount'),
      };
      setMetrics(transformedMetrics);

      // Transform cost tracking data
      const transformedCostTracking: MaintenanceCostTracking = {
        monthlySpending: analyticsData.costTracking.monthlySpending,
        categoryBreakdown: analyticsData.costTracking.categoryBreakdown,
        propertyComparison: [], // Mock data - would come from backend
        costTrends: Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return {
            period: date.toISOString().slice(0, 7),
            preventive: Math.random() * 1000,
            reactive: Math.random() * 2000,
            emergency: Math.random() * 500,
          };
        }).reverse(),
      };
      setCostTracking(transformedCostTracking);

      // Transform vendor performance data
      const transformedVendorPerformance: VendorPerformance = {
        vendorMetrics: analyticsData.vendorPerformance.vendorMetrics,
        topPerformers: analyticsData.vendorPerformance.topPerformers,
        underPerformers: analyticsData.vendorPerformance.underPerformers,
        costEfficiencyRanking: analyticsData.vendorPerformance.vendorMetrics.map((v: any) => ({
          vendorId: v.vendorId,
          costEfficiency: v.qualityScore / v.averageCost,
        })),
        reliabilityRanking: analyticsData.vendorPerformance.vendorMetrics.map((v: any) => ({
          vendorId: v.vendorId,
          reliability: (v.onTimePercentage + v.averageRating * 20) / 2,
        })),
      };
      setVendorPerformance(transformedVendorPerformance);

      // Transform predictive analytics data
      const transformedPredictiveAnalytics: PredictiveAnalytics = {
        maintenanceForecasting: analyticsData.predictiveAnalytics.maintenanceForecasting.map((f: any) => ({
          ...f,
          riskFactors: ['Seasonal patterns', 'Equipment age', 'Usage patterns']
        })),
        equipmentLifecycle: [], // Mock data - would be enhanced in backend
        preventiveRecommendations: [], // Mock data - would be enhanced in backend
        riskAssessment: [], // Mock data - would be enhanced in backend
      };
      setPredictiveAnalytics(transformedPredictiveAnalytics);

      // Mock efficiency data
      const mockEfficiency: MaintenanceEfficiency = {
        responseTimeMetrics: [
          { category: 'PLUMBING', averageResponseTime: 2.5, targetResponseTime: 4, performance: 'excellent' },
          { category: 'ELECTRICAL', averageResponseTime: 1.8, targetResponseTime: 2, performance: 'good' },
          { category: 'HVAC', averageResponseTime: 6.2, targetResponseTime: 8, performance: 'good' },
          { category: 'APPLIANCES', averageResponseTime: 8.5, targetResponseTime: 12, performance: 'good' },
        ],
        resolutionMetrics: [
          { category: 'PLUMBING', averageResolutionTime: 2.1, firstTimeFixRate: 85, escalationRate: 8 },
          { category: 'ELECTRICAL', averageResolutionTime: 1.5, firstTimeFixRate: 92, escalationRate: 5 },
          { category: 'HVAC', averageResolutionTime: 3.8, firstTimeFixRate: 78, escalationRate: 12 },
          { category: 'APPLIANCES', averageResolutionTime: 4.2, firstTimeFixRate: 82, escalationRate: 10 },
        ],
        costEfficiency: [
          { category: 'PLUMBING', averageCost: 180, benchmarkCost: 200, efficiency: 'above_benchmark' },
          { category: 'ELECTRICAL', averageCost: 165, benchmarkCost: 150, efficiency: 'below_benchmark' },
          { category: 'HVAC', averageCost: 285, benchmarkCost: 300, efficiency: 'above_benchmark' },
          { category: 'APPLIANCES', averageCost: 220, benchmarkCost: 250, efficiency: 'above_benchmark' },
        ],
        tenantSatisfaction: [
          { category: 'PLUMBING', averageRating: 4.2, responseRate: 75, commonComplaints: ['Slow response', 'Messy work'] },
          { category: 'ELECTRICAL', averageRating: 4.5, responseRate: 82, commonComplaints: ['Safety concerns'] },
          { category: 'HVAC', averageRating: 3.8, responseRate: 68, commonComplaints: ['Temporary fixes', 'Noise'] },
          { category: 'APPLIANCES', averageRating: 4.0, responseRate: 71, commonComplaints: ['Long wait times'] },
        ],
      };
      setEfficiency(mockEfficiency);

    } catch (error) {
      console.error('Error loading maintenance analytics:', error);
      // Fallback to local calculation if backend fails
      await Promise.all([
        fetchMaintenanceRequests(1, 1000),
        fetchExpenses(1, 1000),
        fetchProperties(),
      ]);

      const maintenanceExpenses = expenses.filter(e => e.category === 'MAINTENANCE');
      const calculatedMetrics = MaintenanceAnalyticsService.calculateMaintenanceMetrics(
        maintenanceRequests,
        maintenanceExpenses
      );
      setMetrics(calculatedMetrics);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const handleExportData = () => {
    console.log('Exporting maintenance analytics data...');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Maintenance Analytics Dashboard
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
              <Wrench className="w-5 h-5" />
              Maintenance Analytics Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
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
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {metrics.totalRequests}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {metrics.requestTrend === 'increasing' ? (
                      <TrendingUp className="w-3 h-3 text-red-600" />
                    ) : metrics.requestTrend === 'decreasing' ? (
                      <TrendingDown className="w-3 h-3 text-green-600" />
                    ) : (
                      <Target className="w-3 h-3 text-gray-600" />
                    )}
                    <span className={`text-xs ${
                      metrics.requestTrend === 'increasing' ? 'text-red-600' : 
                      metrics.requestTrend === 'decreasing' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {metrics.requestTrend}
                    </span>
                  </div>
                </div>
                <Wrench className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-700">
                    {metrics.completedRequests}
                  </p>
                  <Badge variant="default" className="mt-1">
                    {metrics.totalRequests > 0 ? 
                      ((metrics.completedRequests / metrics.totalRequests) * 100).toFixed(0) : 0
                    }% rate
                  </Badge>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {metrics.pendingRequests}
                  </p>
                  <Badge variant={metrics.pendingRequests === 0 ? 'default' : metrics.pendingRequests <= 5 ? 'secondary' : 'destructive'} className="mt-1">
                    {metrics.pendingRequests === 0 ? 'Clear' : metrics.pendingRequests <= 5 ? 'Normal' : 'High'}
                  </Badge>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {metrics.averageResolutionTime.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">days</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cost Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Maintenance Cost</p>
                  <p className="text-2xl font-bold text-red-700">
                    ${metrics.totalMaintenanceCost.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {metrics.costTrend === 'increasing' ? (
                      <TrendingUp className="w-3 h-3 text-red-600" />
                    ) : metrics.costTrend === 'decreasing' ? (
                      <TrendingDown className="w-3 h-3 text-green-600" />
                    ) : (
                      <Target className="w-3 h-3 text-gray-600" />
                    )}
                    <span className={`text-xs ${
                      metrics.costTrend === 'increasing' ? 'text-red-600' : 
                      metrics.costTrend === 'decreasing' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {metrics.costTrend}
                    </span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Cost per Request</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ${metrics.averageCostPerRequest.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">per request</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="costs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Cost Tracking
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Vendor Performance
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Predictive
          </TabsTrigger>
          <TabsTrigger value="efficiency" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Efficiency
          </TabsTrigger>
        </TabsList>

        <TabsContent value="costs" className="space-y-4">
          {costTracking && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Spending Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={costTracking.monthlySpending}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="amount" fill="#8884d8" name="Amount ($)" />
                      <Line type="monotone" dataKey="requestCount" stroke="#ff7300" name="Request Count" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={costTracking.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {costTracking.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Property Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={costTracking.propertyComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="propertyId" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalCost" fill="#82ca9d" name="Total Cost ($)" />
                      <Bar dataKey="avgCostPerUnit" fill="#8884d8" name="Cost per Unit ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Trends by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={costTracking.costTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="preventive" stackId="1" stroke="#8884d8" fill="#8884d8" name="Preventive" />
                      <Area type="monotone" dataKey="reactive" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Reactive" />
                      <Area type="monotone" dataKey="emergency" stackId="1" stroke="#ffc658" fill="#ffc658" name="Emergency" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          {vendorPerformance && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vendorPerformance.vendorMetrics.slice(0, 5).map(vendor => (
                      <div key={vendor.vendorId} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{vendor.vendorName}</span>
                          <Badge variant={vendor.qualityScore > 80 ? 'default' : vendor.qualityScore > 60 ? 'secondary' : 'destructive'}>
                            {vendor.qualityScore.toFixed(0)} score
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>Jobs: {vendor.totalJobs}</div>
                          <div>Completed: {vendor.completedJobs}</div>
                          <div>Avg Cost: ${vendor.averageCost.toFixed(0)}</div>
                          <div>On Time: {vendor.onTimePercentage.toFixed(0)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Rankings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Top Performers</h4>
                    <div className="space-y-1">
                      {vendorPerformance.topPerformers.map(vendorId => {
                        const vendor = vendorPerformance.vendorMetrics.find(v => v.vendorId === vendorId);
                        return (
                          <div key={vendorId} className="flex items-center justify-between p-2 bg-green-50 rounded">
                            <span className="text-sm">{vendor?.vendorName}</span>
                            <Badge variant="default">{vendor?.qualityScore.toFixed(0)}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Needs Improvement</h4>
                    <div className="space-y-1">
                      {vendorPerformance.underPerformers.map(vendorId => {
                        const vendor = vendorPerformance.vendorMetrics.find(v => v.vendorId === vendorId);
                        return (
                          <div key={vendorId} className="flex items-center justify-between p-2 bg-red-50 rounded">
                            <span className="text-sm">{vendor?.vendorName}</span>
                            <Badge variant="destructive">{vendor?.qualityScore.toFixed(0)}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          {predictiveAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Forecasting</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={predictiveAnalytics.maintenanceForecasting}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="predictedRequests" fill="#8884d8" name="Predicted Requests" />
                      <Line type="monotone" dataKey="predictedCost" stroke="#ff7300" name="Predicted Cost ($)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictiveAnalytics.riskAssessment.slice(0, 4).map((risk, index) => (
                      <div key={risk.propertyId} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Property {index + 1}</span>
                          <Badge variant={
                            risk.riskScore > 70 ? 'destructive' : 
                            risk.riskScore > 40 ? 'secondary' : 'default'
                          }>
                            {risk.riskScore}% risk
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          {risk.riskFactors.slice(0, 2).map(factor => (
                            <div key={factor}>• {factor}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Preventive Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {predictiveAnalytics.preventiveRecommendations.slice(0, 4).map((rec, index) => (
                      <div key={rec.propertyId} className="space-y-2">
                        <h4 className="font-medium">Property {index + 1}</h4>
                        {rec.recommendations.slice(0, 2).map(recommendation => (
                          <div key={recommendation.type} className="p-2 border rounded">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{recommendation.type}</span>
                              <Badge variant={
                                recommendation.priority === 'high' ? 'destructive' :
                                recommendation.priority === 'medium' ? 'secondary' : 'default'
                              }>
                                {recommendation.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">{recommendation.description}</p>
                            <div className="flex justify-between text-xs mt-1">
                              <span>Cost: ${recommendation.estimatedCost}</span>
                              <span className="text-green-600">Save: ${recommendation.potentialSavings}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          {efficiency && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {efficiency.responseTimeMetrics.map(metric => (
                      <div key={metric.category} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{metric.category}</span>
                          <div className="text-xs text-gray-600">
                            Target: {metric.targetResponseTime}h
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{metric.averageResponseTime.toFixed(1)}h</div>
                          <Badge variant={
                            metric.performance === 'excellent' ? 'default' :
                            metric.performance === 'good' ? 'secondary' : 'destructive'
                          }>
                            {metric.performance}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resolution Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {efficiency.resolutionMetrics.map(metric => (
                      <div key={metric.category} className="p-2 border rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{metric.category}</span>
                          <span className="text-sm">{metric.averageResolutionTime.toFixed(1)} days</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>First-time fix: {metric.firstTimeFixRate.toFixed(0)}%</div>
                          <div>Escalation: {metric.escalationRate.toFixed(0)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {efficiency.costEfficiency.map(metric => (
                      <div key={metric.category} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{metric.category}</span>
                          <div className="text-xs text-gray-600">
                            Benchmark: ${metric.benchmarkCost}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">${metric.averageCost.toFixed(0)}</div>
                          <Badge variant={
                            metric.efficiency === 'above_benchmark' ? 'default' :
                            metric.efficiency === 'at_benchmark' ? 'secondary' : 'destructive'
                          }>
                            {metric.efficiency.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tenant Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {efficiency.tenantSatisfaction.map(metric => (
                      <div key={metric.category} className="p-2 border rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{metric.category}</span>
                          <div className="text-right">
                            <div className="text-sm">{metric.averageRating.toFixed(1)}/5</div>
                            <div className="text-xs text-gray-600">{metric.responseRate.toFixed(0)}% response</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          Common issues: {metric.commonComplaints.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaintenanceAnalyticsDashboard;