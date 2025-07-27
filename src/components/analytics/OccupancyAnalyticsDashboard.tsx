import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Home, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  Target,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useContractStore } from '../../stores/contractStore';
import { useRoomStore } from '../../stores/roomStore';
import { usePropertyStore } from '../../stores/propertyStore';
import { 
  OccupancyAnalyticsService,
  OccupancyMetrics,
  SeasonalPatterns,
  OccupancyForecasting,
  MarketComparison
} from '../../services/occupancyAnalyticsService';
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
  Area
} from 'recharts';

interface OccupancyAnalyticsDashboardProps {
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const OccupancyAnalyticsDashboard: React.FC<OccupancyAnalyticsDashboardProps> = ({
  className,
}) => {
  const { contracts, fetchContracts } = useContractStore();
  const { rooms, fetchRooms } = useRoomStore();
  const { properties, fetchProperties } = usePropertyStore();

  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<OccupancyMetrics | null>(null);
  const [seasonalPatterns, setSeasonalPatterns] = useState<SeasonalPatterns | null>(null);
  const [forecasting, setForecasting] = useState<OccupancyForecasting | null>(null);
  const [marketComparison, setMarketComparison] = useState<MarketComparison | null>(null);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch advanced analytics from backend
      const analyticsData = await OccupancyAnalyticsService.fetchOccupancyAnalytics();
      
      // Transform backend data to component format
      const transformedMetrics: OccupancyMetrics = {
        currentOccupancyRate: analyticsData.currentMetrics.currentOccupancyRate,
        averageOccupancyRate: analyticsData.currentMetrics.averageOccupancyRate,
        totalUnits: analyticsData.currentMetrics.totalUnits,
        occupiedUnits: analyticsData.currentMetrics.occupiedUnits,
        vacantUnits: analyticsData.currentMetrics.vacantUnits,
        occupancyTrend: analyticsData.currentMetrics.occupancyTrend || 'stable',
        turnoverRate: analyticsData.trends.turnoverData?.slice(-1)[0]?.turnoverRate || 15,
        averageLeaseLength: 12, // Would be calculated from contract data
      };
      setMetrics(transformedMetrics);

      // Transform seasonal patterns
      const transformedPatterns: SeasonalPatterns = {
        monthlyOccupancy: analyticsData.trends.monthlyOccupancy,
        seasonalTrends: analyticsData.trends.seasonalTrends,
        bestPerformingMonths: analyticsData.insights?.bestPerformingSeasons || ['Summer', 'Spring'],
        worstPerformingMonths: analyticsData.trends.seasonalTrends
          ?.sort((a: any, b: any) => a.avgOccupancy - b.avgOccupancy)
          ?.slice(0, 2)
          ?.map((s: any) => s.season) || ['Winter', 'Fall'],
        seasonalFactors: analyticsData.trends.monthlyOccupancy.map((m: any) => m.occupancyRate / 100),
      };
      setSeasonalPatterns(transformedPatterns);

      // Transform forecasting data
      const transformedForecasting: OccupancyForecasting = {
        predictedOccupancy: analyticsData.forecasting.predictedOccupancy,
        demandPrediction: Array.from({ length: 6 }, (_, i) => ({
          month: analyticsData.forecasting.predictedOccupancy[i]?.month || '',
          expectedDemand: Math.floor(Math.random() * 10) + 5,
          marketFactors: ['Seasonal demand', 'Market trends']
        })),
        vacancyRisk: analyticsData.forecasting.vacancyRisk,
        optimalPricing: analyticsData.forecasting.vacancyRisk.map((risk: any) => ({
          roomId: risk.roomId,
          suggestedRent: 1200 + Math.random() * 400,
          marketRate: 1300,
          occupancyImpact: Math.random() * 20 - 10
        })),
      };
      setForecasting(transformedForecasting);

      // Mock market comparison data
      const mockMarketComparison: MarketComparison = {
        marketOccupancyRate: 85,
        competitorAnalysis: [
          { competitor: 'Property A', occupancyRate: 88, avgRent: 1150 },
          { competitor: 'Property B', occupancyRate: 82, avgRent: 1300 },
          { competitor: 'Property C', occupancyRate: 90, avgRent: 1100 },
        ],
        marketPosition: transformedMetrics.currentOccupancyRate > 85 ? 'above_market' : 'at_market',
        pricingRecommendations: transformedForecasting.optimalPricing.map(p => ({
          roomId: p.roomId,
          currentRent: p.suggestedRent - 100,
          marketRent: p.marketRate,
          recommendation: 'Consider market adjustment'
        })),
      };
      setMarketComparison(mockMarketComparison);

    } catch (error) {
      console.error('Error loading occupancy analytics:', error);
      // Fallback to local calculation if backend fails
      await Promise.all([
        fetchContracts(1, 1000),
        fetchRooms(1, 1000),
        fetchProperties(),
      ]);

      const calculatedMetrics = OccupancyAnalyticsService.calculateOccupancyMetrics(
        contracts,
        rooms,
        properties
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
    console.log('Exporting occupancy analytics data...');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Occupancy Analytics Dashboard
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
              <Home className="w-5 h-5" />
              Occupancy Analytics Dashboard
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
                  <p className="text-sm font-medium text-gray-600">Current Occupancy</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {metrics.currentOccupancyRate.toFixed(1)}%
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {metrics.occupancyTrend === 'increasing' ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : metrics.occupancyTrend === 'decreasing' ? (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    ) : (
                      <Target className="w-3 h-3 text-gray-600" />
                    )}
                    <span className={`text-xs ${
                      metrics.occupancyTrend === 'increasing' ? 'text-green-600' : 
                      metrics.occupancyTrend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metrics.occupancyTrend}
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
                  <p className="text-sm font-medium text-gray-600">Occupied Units</p>
                  <p className="text-2xl font-bold text-green-700">
                    {metrics.occupiedUnits}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    of {metrics.totalUnits} total
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vacant Units</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {metrics.vacantUnits}
                  </p>
                  <Badge variant={metrics.vacantUnits === 0 ? 'default' : metrics.vacantUnits <= 2 ? 'secondary' : 'destructive'} className="mt-1">
                    {metrics.vacantUnits === 0 ? 'Full' : metrics.vacantUnits <= 2 ? 'Low' : 'High'}
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
                  <p className="text-sm font-medium text-gray-600">Turnover Rate</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {metrics.turnoverRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Avg lease: {metrics.averageLeaseLength.toFixed(1)}mo
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Seasonal
          </TabsTrigger>
          <TabsTrigger value="forecasting" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Forecasting
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Market
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          {seasonalPatterns && (
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={seasonalPatterns.monthlyOccupancy}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="occupancyRate" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Occupancy Rate (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="unitsOccupied" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Units Occupied"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          {seasonalPatterns && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={seasonalPatterns.seasonalTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="season" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgOccupancy" fill="#8884d8" name="Avg Occupancy (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Best Performing Months</h4>
                    <div className="flex flex-wrap gap-2">
                      {seasonalPatterns.bestPerformingMonths.map(month => (
                        <Badge key={month} variant="default">{month}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Challenging Months</h4>
                    <div className="flex flex-wrap gap-2">
                      {seasonalPatterns.worstPerformingMonths.map(month => (
                        <Badge key={month} variant="destructive">{month}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          {forecasting && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Occupancy Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={forecasting.predictedOccupancy}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="predicted" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.3}
                        name="Predicted Occupancy (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Demand Prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={forecasting.demandPrediction}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="expectedDemand" fill="#82ca9d" name="Expected Demand" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Vacancy Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {forecasting.vacancyRisk.slice(0, 6).map((risk, index) => (
                      <div key={risk.roomId} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Room {index + 1}</span>
                          <Badge variant={
                            risk.riskScore > 70 ? 'destructive' : 
                            risk.riskScore > 40 ? 'secondary' : 'default'
                          }>
                            {risk.riskScore.toFixed(0)}% risk
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          {risk.factors.slice(0, 2).map(factor => (
                            <div key={factor}>• {factor}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          {marketComparison && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Market Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Your Occupancy Rate</span>
                      <Badge variant="default">
                        {metrics?.currentOccupancyRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Market Average</span>
                      <Badge variant="secondary">
                        {marketComparison.marketOccupancyRate}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Market Position</span>
                      <Badge variant={
                        marketComparison.marketPosition === 'above_market' ? 'default' :
                        marketComparison.marketPosition === 'at_market' ? 'secondary' : 'destructive'
                      }>
                        {marketComparison.marketPosition.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Competitor Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketComparison.competitorAnalysis.map(competitor => (
                      <div key={competitor.competitor} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{competitor.competitor}</span>
                        <div className="text-right">
                          <div className="text-sm">{competitor.occupancyRate}% occupied</div>
                          <div className="text-xs text-gray-500">${competitor.avgRent}/mo</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Pricing Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {marketComparison.pricingRecommendations.slice(0, 4).map((rec, index) => (
                      <div key={rec.roomId} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Room {index + 1}</span>
                          <div className="text-right">
                            <div className="text-sm">${rec.currentRent}/mo</div>
                            <div className="text-xs text-gray-500">Market: ${rec.marketRent}</div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">{rec.recommendation}</p>
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

export default OccupancyAnalyticsDashboard;