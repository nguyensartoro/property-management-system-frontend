import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  BarChart3, 
  Home, 
  Wrench, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Target,
  Activity
} from 'lucide-react';
import OccupancyAnalyticsDashboard from '../components/analytics/OccupancyAnalyticsDashboard';
import MaintenanceAnalyticsDashboard from '../components/analytics/MaintenanceAnalyticsDashboard';
import FinancialAnalyticsDashboard from '../components/analytics/FinancialAnalyticsDashboard';
import { OccupancyAnalyticsService } from '../services/occupancyAnalyticsService';
import { MaintenanceAnalyticsService } from '../services/maintenanceAnalyticsService';

const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<unknown>(null);

  const loadOverviewData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch data from both analytics services
      const [occupancyData, maintenanceData] = await Promise.all([
        OccupancyAnalyticsService.fetchOccupancyAnalytics(),
        MaintenanceAnalyticsService.fetchMaintenanceAnalytics()
      ]);

      setOverviewData({
        occupancy: occupancyData,
        maintenance: maintenanceData
      });
    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOverviewData();
  }, []);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await loadOverviewData();
    setIsRefreshing(false);
  };

  const handleExportAll = () => {
    console.log('Exporting all analytics data...');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into your property management performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
          <Button
            variant="outline"
            onClick={handleExportAll}
          >
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Occupancy
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {overviewData?.occupancy?.currentMetrics?.currentOccupancyRate?.toFixed(1) || '0.0'}%
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {overviewData?.occupancy?.currentMetrics?.occupancyTrend === 'increasing' ? (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        ) : overviewData?.occupancy?.currentMetrics?.occupancyTrend === 'decreasing' ? (
                          <TrendingDown className="w-3 h-3 text-red-600" />
                        ) : (
                          <Target className="w-3 h-3 text-gray-600" />
                        )}
                        <span className={`text-xs ${
                          overviewData?.occupancy?.currentMetrics?.occupancyTrend === 'increasing' ? 'text-green-600' : 
                          overviewData?.occupancy?.currentMetrics?.occupancyTrend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {overviewData?.occupancy?.currentMetrics?.occupancyTrend || 'stable'}
                        </span>
                      </div>
                    </div>
                    <Home className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Maintenance</p>
                      <p className="text-2xl font-bold text-orange-700">
                        {overviewData?.maintenance?.currentMetrics?.pendingRequests || 0}
                      </p>
                      <Badge variant={
                        (overviewData?.maintenance?.currentMetrics?.pendingRequests || 0) === 0 ? 'default' : 
                        (overviewData?.maintenance?.currentMetrics?.pendingRequests || 0) <= 5 ? 'secondary' : 'destructive'
                      } className="mt-1">
                        {(overviewData?.maintenance?.currentMetrics?.pendingRequests || 0) === 0 ? 'Clear' : 
                         (overviewData?.maintenance?.currentMetrics?.pendingRequests || 0) <= 5 ? 'Normal' : 'High'}
                      </Badge>
                    </div>
                    <Wrench className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Maintenance Cost</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${(overviewData?.maintenance?.currentMetrics?.totalMaintenanceCost || 0).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Activity className="w-3 h-3 text-blue-600" />
                        <span className="text-xs text-blue-600">
                          ${(overviewData?.maintenance?.currentMetrics?.averageCostPerRequest || 0).toFixed(0)} avg
                        </span>
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Vacant Units</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {overviewData?.occupancy?.currentMetrics?.vacantUnits || 0}
                      </p>
                      <Badge variant={
                        (overviewData?.occupancy?.currentMetrics?.vacantUnits || 0) === 0 ? 'default' : 
                        (overviewData?.occupancy?.currentMetrics?.vacantUnits || 0) <= 2 ? 'secondary' : 'destructive'
                      } className="mt-1">
                        {(overviewData?.occupancy?.currentMetrics?.vacantUnits || 0) === 0 ? 'Full' : 
                         (overviewData?.occupancy?.currentMetrics?.vacantUnits || 0) <= 2 ? 'Low' : 'High'}
                      </Badge>
                    </div>
                    <Users className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Insights */}
          {!isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Attention Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* High Risk Vacancy Units */}
                  {overviewData?.occupancy?.insights?.highRiskUnits?.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-orange-800">
                          {overviewData.occupancy.insights.highRiskUnits.length} High Risk Units
                        </p>
                        <p className="text-sm text-orange-600">Vacancy risk over 60%</p>
                      </div>
                      <Badge variant="destructive">High Priority</Badge>
                    </div>
                  )}
                  
                  {/* Pending Maintenance */}
                  {(overviewData?.maintenance?.currentMetrics?.pendingRequests || 0) > 5 && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-800">
                          {overviewData.maintenance.currentMetrics.pendingRequests} Pending Maintenance
                        </p>
                        <p className="text-sm text-yellow-600">Above normal levels</p>
                      </div>
                      <Badge variant="secondary">Medium Priority</Badge>
                    </div>
                  )}
                  
                  {/* Vacant Units */}
                  {(overviewData?.occupancy?.currentMetrics?.vacantUnits || 0) > 0 && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-800">
                          {overviewData.occupancy.currentMetrics.vacantUnits} Vacant Units
                        </p>
                        <p className="text-sm text-blue-600">Ready for marketing</p>
                      </div>
                      <Badge variant="default">Action Needed</Badge>
                    </div>
                  )}

                  {/* Show message if no issues */}
                  {(!overviewData?.occupancy?.insights?.highRiskUnits?.length && 
                    (overviewData?.maintenance?.currentMetrics?.pendingRequests || 0) <= 5 && 
                    (overviewData?.occupancy?.currentMetrics?.vacantUnits || 0) === 0) && (
                    <div className="flex items-center justify-center p-6 bg-green-50 rounded-lg">
                      <div className="text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="font-medium text-green-800">All Systems Running Smoothly</p>
                        <p className="text-sm text-green-600">No immediate attention required</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Occupancy Performance */}
                  {(overviewData?.occupancy?.currentMetrics?.currentOccupancyRate || 0) >= 85 && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">Occupancy Target Met</p>
                        <p className="text-sm text-green-600">
                          {overviewData.occupancy.currentMetrics.currentOccupancyRate.toFixed(1)}% occupancy rate
                        </p>
                      </div>
                      <Badge variant="default">Success</Badge>
                    </div>
                  )}
                  
                  {/* Maintenance Efficiency */}
                  {(overviewData?.maintenance?.currentMetrics?.completedRequests || 0) > 0 && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-800">Maintenance Progress</p>
                        <p className="text-sm text-blue-600">
                          {overviewData.maintenance.currentMetrics.completedRequests} requests completed
                        </p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  )}
                  
                  {/* Seasonal Performance */}
                  {overviewData?.occupancy?.insights?.bestPerformingSeasons?.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium text-purple-800">Seasonal Strength</p>
                        <p className="text-sm text-purple-600">
                          Best in {overviewData.occupancy.insights.bestPerformingSeasons[0]}
                        </p>
                      </div>
                      <Badge variant="default">Insight</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Events & Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Property Inspection</span>
                    <Badge variant="outline">Tomorrow</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Building A - Annual inspection</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Lease Renewal</span>
                    <Badge variant="outline">3 days</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Unit 205 - Contract renewal</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Vendor Meeting</span>
                    <Badge variant="outline">1 week</Badge>
                  </div>
                  <p className="text-sm text-gray-600">HVAC maintenance planning</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy">
          <OccupancyAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;