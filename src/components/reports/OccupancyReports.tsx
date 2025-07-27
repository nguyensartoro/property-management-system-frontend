import React, { useState, useEffect } from 'react';
import {
  Building,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Clock,
  DollarSign,
  Home,
  MapPin,
  Filter,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useReportStore } from '../../stores/reportStore';
import { usePropertyStore } from '../../stores/propertyStore';
import { useRoomStore } from '../../stores/roomStore';
import { useContractStore } from '../../stores/contractStore';
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

interface OccupancyReportsProps {
  className?: string;
}

interface OccupancySummary {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  occupancyRate: number;
  averageVacancyDuration: number;
  totalRevenue: number;
  potentialRevenue: number;
  revenueEfficiency: number;
}

interface PropertyOccupancy {
  propertyId: string;
  propertyName: string;
  address: string;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  occupancyRate: number;
  averageRent: number;
  totalRevenue: number;
  potentialRevenue: number;
  vacancyLoss: number;
  averageVacancyDays: number;
}

interface VacancyAnalysis {
  roomId: string;
  roomNumber: string;
  propertyName: string;
  vacantSince: string;
  daysSinceVacant: number;
  lastRent: number;
  estimatedLoss: number;
  reason: string;
  status: 'available' | 'maintenance' | 'reserved';
}

interface RentalRateComparison {
  propertyId: string;
  propertyName: string;
  averageRent: number;
  marketRate: number;
  variance: number;
  variancePercentage: number;
  recommendation: 'increase' | 'decrease' | 'maintain';
}

interface OccupancyTrend {
  month: string;
  occupancyRate: number;
  totalRooms: number;
  occupiedRooms: number;
  newLeases: number;
  renewals: number;
  terminations: number;
}

const OccupancyReports: React.FC<OccupancyReportsProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Mock data - in a real app, this would come from the stores
  const [occupancySummary, setOccupancySummary] = useState<OccupancySummary>({
    totalRooms: 48,
    occupiedRooms: 42,
    vacantRooms: 6,
    occupancyRate: 87.5,
    averageVacancyDuration: 18,
    totalRevenue: 52500,
    potentialRevenue: 60000,
    revenueEfficiency: 87.5,
  });

  const [propertyOccupancy, setPropertyOccupancy] = useState<PropertyOccupancy[]>([
    {
      propertyId: '1',
      propertyName: 'Downtown Apartments',
      address: '123 Main St, Downtown',
      totalRooms: 24,
      occupiedRooms: 22,
      vacantRooms: 2,
      occupancyRate: 91.7,
      averageRent: 1250,
      totalRevenue: 27500,
      potentialRevenue: 30000,
      vacancyLoss: 2500,
      averageVacancyDays: 12,
    },
    {
      propertyId: '2',
      propertyName: 'Suburban Complex',
      address: '456 Oak Ave, Suburbs',
      totalRooms: 24,
      occupiedRooms: 20,
      vacantRooms: 4,
      occupancyRate: 83.3,
      averageRent: 1100,
      totalRevenue: 22000,
      potentialRevenue: 26400,
      vacancyLoss: 4400,
      averageVacancyDays: 25,
    },
  ]);

  const [vacancyAnalysis, setVacancyAnalysis] = useState<VacancyAnalysis[]>([
    {
      roomId: '1',
      roomNumber: '101',
      propertyName: 'Downtown Apartments',
      vacantSince: '2024-01-15',
      daysSinceVacant: 8,
      lastRent: 1250,
      estimatedLoss: 333,
      reason: 'Tenant moved out',
      status: 'available',
    },
    {
      roomId: '2',
      roomNumber: '205',
      propertyName: 'Downtown Apartments',
      vacantSince: '2024-01-10',
      daysSinceVacant: 13,
      lastRent: 1300,
      estimatedLoss: 563,
      reason: 'Lease expired',
      status: 'available',
    },
    {
      roomId: '3',
      roomNumber: '302',
      propertyName: 'Suburban Complex',
      vacantSince: '2023-12-20',
      daysSinceVacant: 34,
      lastRent: 1100,
      estimatedLoss: 1247,
      reason: 'Maintenance required',
      status: 'maintenance',
    },
  ]);

  const [rentalRateComparison, setRentalRateComparison] = useState<RentalRateComparison[]>([
    {
      propertyId: '1',
      propertyName: 'Downtown Apartments',
      averageRent: 1250,
      marketRate: 1300,
      variance: -50,
      variancePercentage: -3.8,
      recommendation: 'increase',
    },
    {
      propertyId: '2',
      propertyName: 'Suburban Complex',
      averageRent: 1100,
      marketRate: 1050,
      variance: 50,
      variancePercentage: 4.8,
      recommendation: 'maintain',
    },
  ]);

  const [occupancyTrends, setOccupancyTrends] = useState<OccupancyTrend[]>([
    { month: 'Jul', occupancyRate: 85, totalRooms: 48, occupiedRooms: 41, newLeases: 3, renewals: 8, terminations: 2 },
    { month: 'Aug', occupancyRate: 87, totalRooms: 48, occupiedRooms: 42, newLeases: 2, renewals: 6, terminations: 1 },
    { month: 'Sep', occupancyRate: 89, totalRooms: 48, occupiedRooms: 43, newLeases: 4, renewals: 7, terminations: 3 },
    { month: 'Oct', occupancyRate: 86, totalRooms: 48, occupiedRooms: 41, newLeases: 1, renewals: 5, terminations: 3 },
    { month: 'Nov', occupancyRate: 88, totalRooms: 48, occupiedRooms: 42, newLeases: 3, renewals: 9, terminations: 2 },
    { month: 'Dec', occupancyRate: 87, totalRooms: 48, occupiedRooms: 42, newLeases: 2, renewals: 4, terminations: 2 },
  ]);

  const { properties, fetchProperties } = usePropertyStore();

  useEffect(() => {
    fetchProperties();
    
    // Set default date range (last 6 months)
    const today = new Date();
    const sixMonthsAgo = new Date(today.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    setDateRange({
      startDate: sixMonthsAgo.toISOString().split('T')[0],
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysSince = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default">Available</Badge>;
      case 'maintenance':
        return <Badge variant="destructive">Maintenance</Badge>;
      case 'reserved':
        return <Badge variant="secondary">Reserved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'increase':
        return <Badge variant="default" className="bg-green-600">Increase</Badge>;
      case 'decrease':
        return <Badge variant="destructive">Decrease</Badge>;
      case 'maintain':
        return <Badge variant="secondary">Maintain</Badge>;
      default:
        return <Badge variant="outline">{recommendation}</Badge>;
    }
  };

  const handleExportReport = (reportType: string) => {
    toast({
      title: "Export Started",
      description: `Exporting ${reportType} report...`,
    });
    
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${reportType} report has been downloaded`,
      });
    }, 2000);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Building className="h-6 w-6" />
            <span>Occupancy Reports</span>
          </h2>
          <p className="text-muted-foreground">
            Room occupancy analysis and vacancy tracking
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
          <TabsTrigger value="vacancy">Vacancy Analysis</TabsTrigger>
          <TabsTrigger value="rates">Rental Rates</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{occupancySummary.totalRooms}</div>
                <p className="text-xs text-muted-foreground">Across all properties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {occupancySummary.occupiedRooms}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(occupancySummary.occupancyRate)} occupancy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vacant Rooms</CardTitle>
                <Home className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {occupancySummary.vacantRooms}
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg {occupancySummary.averageVacancyDuration} days vacant
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Efficiency</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(occupancySummary.revenueEfficiency)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(occupancySummary.totalRevenue)} of {formatCurrency(occupancySummary.potentialRevenue)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Property Occupancy Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Occupancy by Property</CardTitle>
              <CardDescription>
                Detailed occupancy breakdown for each property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propertyOccupancy.map((property) => (
                  <div key={property.propertyId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{property.propertyName}</h3>
                          <p className="text-sm text-muted-foreground flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{property.address}</span>
                          </p>
                        </div>
                      </div>
                      <Badge variant={property.occupancyRate > 85 ? 'default' : 'secondary'}>
                        {formatPercentage(property.occupancyRate)} occupied
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{property.totalRooms}</div>
                        <div className="text-sm text-muted-foreground">Total Rooms</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">{property.occupiedRooms}</div>
                        <div className="text-sm text-muted-foreground">Occupied</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-600">{property.vacantRooms}</div>
                        <div className="text-sm text-muted-foreground">Vacant</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{formatCurrency(property.averageRent)}</div>
                        <div className="text-sm text-muted-foreground">Avg Rent</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(property.totalRevenue)}
                        </div>
                        <div className="text-sm text-green-700">Current Revenue</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-semibold text-blue-600">
                          {formatCurrency(property.potentialRevenue)}
                        </div>
                        <div className="text-sm text-blue-700">Potential Revenue</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-lg font-semibold text-red-600">
                          {formatCurrency(property.vacancyLoss)}
                        </div>
                        <div className="text-sm text-red-700">Vacancy Loss</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Occupancy Rate</span>
                      <span>{formatPercentage(property.occupancyRate)}</span>
                    </div>
                    <Progress value={property.occupancyRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Occupancy Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Visualization</CardTitle>
              <CardDescription>Visual representation of occupancy data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                  <p className="text-sm text-muted-foreground">Occupancy distribution by property</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vacancy Analysis Tab */}
        <TabsContent value="vacancy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Vacancies</CardTitle>
              <CardDescription>
                Detailed analysis of currently vacant rooms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vacancyAnalysis.map((vacancy) => (
                  <div key={vacancy.roomId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Home className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Room {vacancy.roomNumber}</h3>
                          <p className="text-sm text-muted-foreground">{vacancy.propertyName}</p>
                        </div>
                      </div>
                      {getStatusBadge(vacancy.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Vacant Since:</span>
                        <div className="font-medium">{formatDate(vacancy.vacantSince)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Days Vacant:</span>
                        <div className={`font-medium ${
                          vacancy.daysSinceVacant > 30 ? 'text-red-600' : 
                          vacancy.daysSinceVacant > 14 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {vacancy.daysSinceVacant} days
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Rent:</span>
                        <div className="font-medium">{formatCurrency(vacancy.lastRent)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Estimated Loss:</span>
                        <div className="font-medium text-red-600">{formatCurrency(vacancy.estimatedLoss)}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-muted-foreground">Reason: </span>
                          <span className="text-sm font-medium">{vacancy.reason}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {vacancy.daysSinceVacant > 30 && (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vacancy Duration Analysis</CardTitle>
              <CardDescription>Historical vacancy duration patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                  <p className="text-sm text-muted-foreground">Vacancy duration trends</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rental Rates Tab */}
        <TabsContent value="rates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rental Rate Comparison</CardTitle>
              <CardDescription>
                Compare your rental rates with market rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rentalRateComparison.map((comparison) => (
                  <div key={comparison.propertyId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{comparison.propertyName}</h3>
                          <p className="text-sm text-muted-foreground">Rental rate analysis</p>
                        </div>
                      </div>
                      {getRecommendationBadge(comparison.recommendation)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-semibold text-blue-600">
                          {formatCurrency(comparison.averageRent)}
                        </div>
                        <div className="text-sm text-blue-700">Your Average</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(comparison.marketRate)}
                        </div>
                        <div className="text-sm text-green-700">Market Rate</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className={`text-lg font-semibold ${
                          comparison.variance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {comparison.variance >= 0 ? '+' : ''}{formatCurrency(comparison.variance)}
                        </div>
                        <div className="text-sm text-gray-700">Variance</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className={`text-lg font-semibold ${
                          comparison.variancePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {comparison.variancePercentage >= 0 ? '+' : ''}{formatPercentage(Math.abs(comparison.variancePercentage))}
                        </div>
                        <div className="text-sm text-purple-700">% Difference</div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {comparison.recommendation === 'increase' && (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        )}
                        {comparison.recommendation === 'decrease' && (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        {comparison.recommendation === 'maintain' && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                        <span className="text-sm font-medium">
                          {comparison.recommendation === 'increase' && 'Consider increasing rent to match market rate'}
                          {comparison.recommendation === 'decrease' && 'Consider decreasing rent to improve occupancy'}
                          {comparison.recommendation === 'maintain' && 'Current rates are competitive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Analysis</CardTitle>
              <CardDescription>Rental market trends and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                  <p className="text-sm text-muted-foreground">Market rate trends and comparisons</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Trends</CardTitle>
              <CardDescription>
                Historical occupancy patterns and lease activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Trend Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPercentage(occupancyTrends.reduce((sum, trend) => sum + trend.occupancyRate, 0) / occupancyTrends.length)}
                    </div>
                    <div className="text-sm text-blue-700">Avg Occupancy</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {occupancyTrends.reduce((sum, trend) => sum + trend.newLeases, 0)}
                    </div>
                    <div className="text-sm text-green-700">New Leases</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {occupancyTrends.reduce((sum, trend) => sum + trend.renewals, 0)}
                    </div>
                    <div className="text-sm text-purple-700">Renewals</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {occupancyTrends.reduce((sum, trend) => sum + trend.terminations, 0)}
                    </div>
                    <div className="text-sm text-red-700">Terminations</div>
                  </div>
                </div>

                {/* Monthly Trends Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Month</th>
                        <th className="text-center p-3 font-medium">Occupancy Rate</th>
                        <th className="text-center p-3 font-medium">Occupied</th>
                        <th className="text-center p-3 font-medium">New Leases</th>
                        <th className="text-center p-3 font-medium">Renewals</th>
                        <th className="text-center p-3 font-medium">Terminations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {occupancyTrends.map((trend, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 font-medium">{trend.month}</td>
                          <td className="p-3 text-center">
                            <Badge variant={trend.occupancyRate > 85 ? 'default' : 'secondary'}>
                              {formatPercentage(trend.occupancyRate)}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">{trend.occupiedRooms}/{trend.totalRooms}</td>
                          <td className="p-3 text-center text-green-600 font-medium">{trend.newLeases}</td>
                          <td className="p-3 text-center text-blue-600 font-medium">{trend.renewals}</td>
                          <td className="p-3 text-center text-red-600 font-medium">{trend.terminations}</td>
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
              <CardTitle>Occupancy Trend Visualization</CardTitle>
              <CardDescription>Graphical representation of occupancy trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                  <p className="text-sm text-muted-foreground">Occupancy trends over time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Export Occupancy Reports</CardTitle>
              <CardDescription>Download detailed occupancy analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Occupancy Summary')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Occupancy Summary</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Vacancy Analysis')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Vacancy Analysis</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Rental Rate Report')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Rental Rate Report</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Trend Analysis')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Trend Analysis</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OccupancyReports;