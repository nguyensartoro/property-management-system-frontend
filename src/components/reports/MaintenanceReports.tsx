import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  User,
  Building,
  Filter,
  Download,
  Eye,
  AlertCircle,
  Timer,
  Target,
  Activity
} from 'lucide-react';
import { useReportStore } from '../../stores/reportStore';
import { usePropertyStore } from '../../stores/propertyStore';
import { useMaintenanceStore } from '../../stores/maintenanceStore';
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

interface MaintenanceReportsProps {
  className?: string;
}

interface MaintenanceSummary {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completionRate: number;
  averageResolutionTime: number;
  totalCost: number;
  averageCost: number;
}

interface CategoryAnalysis {
  category: string;
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  averageResolutionTime: number;
  totalCost: number;
  completionRate: number;
}

interface PriorityAnalysis {
  priority: string;
  count: number;
  percentage: number;
  averageResolutionTime: number;
  completionRate: number;
}

interface ResolutionTimeAnalysis {
  timeRange: string;
  count: number;
  percentage: number;
  category: string;
}

interface CostAnalysis {
  category: string;
  totalCost: number;
  averageCost: number;
  requestCount: number;
  costPerRequest: number;
}

interface MaintenanceTrend {
  month: string;
  totalRequests: number;
  completedRequests: number;
  averageResolutionTime: number;
  totalCost: number;
  completionRate: number;
}

interface PreventiveSchedule {
  id: string;
  title: string;
  propertyName: string;
  frequency: string;
  lastCompleted: string;
  nextDue: string;
  status: 'due' | 'overdue' | 'upcoming';
  estimatedCost: number;
}

const MaintenanceReports: React.FC<MaintenanceReportsProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Mock data - in a real app, this would come from the stores
  const [maintenanceSummary, setMaintenanceSummary] = useState<MaintenanceSummary>({
    totalRequests: 156,
    completedRequests: 132,
    pendingRequests: 18,
    inProgressRequests: 6,
    completionRate: 84.6,
    averageResolutionTime: 3.2,
    totalCost: 28500,
    averageCost: 183,
  });

  const [categoryAnalysis, setCategoryAnalysis] = useState<CategoryAnalysis[]>([
    {
      category: 'PLUMBING',
      totalRequests: 45,
      completedRequests: 40,
      pendingRequests: 3,
      inProgressRequests: 2,
      averageResolutionTime: 2.8,
      totalCost: 8500,
      completionRate: 88.9,
    },
    {
      category: 'ELECTRICAL',
      totalRequests: 32,
      completedRequests: 28,
      pendingRequests: 3,
      inProgressRequests: 1,
      averageResolutionTime: 4.1,
      totalCost: 7200,
      completionRate: 87.5,
    },
    {
      category: 'HVAC',
      totalRequests: 28,
      completedRequests: 24,
      pendingRequests: 3,
      inProgressRequests: 1,
      averageResolutionTime: 5.2,
      totalCost: 6800,
      completionRate: 85.7,
    },
    {
      category: 'APPLIANCES',
      totalRequests: 25,
      completedRequests: 22,
      pendingRequests: 2,
      inProgressRequests: 1,
      averageResolutionTime: 2.1,
      totalCost: 3200,
      completionRate: 88.0,
    },
    {
      category: 'OTHER',
      totalRequests: 26,
      completedRequests: 18,
      pendingRequests: 7,
      inProgressRequests: 1,
      averageResolutionTime: 3.8,
      totalCost: 2800,
      completionRate: 69.2,
    },
  ]);

  const [priorityAnalysis, setPriorityAnalysis] = useState<PriorityAnalysis[]>([
    {
      priority: 'URGENT',
      count: 12,
      percentage: 7.7,
      averageResolutionTime: 0.8,
      completionRate: 100,
    },
    {
      priority: 'HIGH',
      count: 34,
      percentage: 21.8,
      averageResolutionTime: 1.5,
      completionRate: 94.1,
    },
    {
      priority: 'MEDIUM',
      count: 78,
      percentage: 50.0,
      averageResolutionTime: 3.2,
      completionRate: 85.9,
    },
    {
      priority: 'LOW',
      count: 32,
      percentage: 20.5,
      averageResolutionTime: 6.8,
      completionRate: 75.0,
    },
  ]);

  const [resolutionTimeAnalysis, setResolutionTimeAnalysis] = useState<ResolutionTimeAnalysis[]>([
    { timeRange: '< 1 day', count: 45, percentage: 28.8, category: 'Excellent' },
    { timeRange: '1-3 days', count: 62, percentage: 39.7, category: 'Good' },
    { timeRange: '4-7 days', count: 32, percentage: 20.5, category: 'Average' },
    { timeRange: '1-2 weeks', count: 12, percentage: 7.7, category: 'Poor' },
    { timeRange: '> 2 weeks', count: 5, percentage: 3.2, category: 'Critical' },
  ]);

  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis[]>([
    {
      category: 'PLUMBING',
      totalCost: 8500,
      averageCost: 189,
      requestCount: 45,
      costPerRequest: 189,
    },
    {
      category: 'ELECTRICAL',
      totalCost: 7200,
      averageCost: 225,
      requestCount: 32,
      costPerRequest: 225,
    },
    {
      category: 'HVAC',
      totalCost: 6800,
      averageCost: 243,
      requestCount: 28,
      costPerRequest: 243,
    },
    {
      category: 'APPLIANCES',
      totalCost: 3200,
      averageCost: 128,
      requestCount: 25,
      costPerRequest: 128,
    },
    {
      category: 'OTHER',
      totalCost: 2800,
      averageCost: 108,
      requestCount: 26,
      costPerRequest: 108,
    },
  ]);

  const [maintenanceTrends, setMaintenanceTrends] = useState<MaintenanceTrend[]>([
    { month: 'Jul', totalRequests: 22, completedRequests: 20, averageResolutionTime: 3.1, totalCost: 4200, completionRate: 90.9 },
    { month: 'Aug', totalRequests: 28, completedRequests: 24, averageResolutionTime: 3.5, totalCost: 5100, completionRate: 85.7 },
    { month: 'Sep', totalRequests: 25, completedRequests: 22, averageResolutionTime: 2.8, totalCost: 4800, completionRate: 88.0 },
    { month: 'Oct', totalRequests: 31, completedRequests: 26, averageResolutionTime: 3.8, totalCost: 5800, completionRate: 83.9 },
    { month: 'Nov', totalRequests: 26, completedRequests: 22, averageResolutionTime: 3.2, totalCost: 4300, completionRate: 84.6 },
    { month: 'Dec', totalRequests: 24, completedRequests: 18, averageResolutionTime: 2.9, totalCost: 4300, completionRate: 75.0 },
  ]);

  const [preventiveSchedule, setPreventiveSchedule] = useState<PreventiveSchedule[]>([
    {
      id: '1',
      title: 'HVAC Filter Replacement',
      propertyName: 'Downtown Apartments',
      frequency: 'Monthly',
      lastCompleted: '2023-12-15',
      nextDue: '2024-01-15',
      status: 'overdue',
      estimatedCost: 150,
    },
    {
      id: '2',
      title: 'Fire Extinguisher Inspection',
      propertyName: 'Suburban Complex',
      frequency: 'Quarterly',
      lastCompleted: '2023-10-01',
      nextDue: '2024-01-01',
      status: 'overdue',
      estimatedCost: 200,
    },
    {
      id: '3',
      title: 'Elevator Maintenance',
      propertyName: 'Downtown Apartments',
      frequency: 'Monthly',
      lastCompleted: '2024-01-10',
      nextDue: '2024-02-10',
      status: 'upcoming',
      estimatedCost: 500,
    },
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

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="default" className="bg-orange-600">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'due':
        return <Badge variant="default">Due</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getResolutionCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'average':
        return 'text-yellow-600';
      case 'poor':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
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
            <Wrench className="h-6 w-6" />
            <span>Maintenance Reports</span>
          </h2>
          <p className="text-muted-foreground">
            Maintenance request analytics and performance tracking
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
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="preventive">Preventive</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{maintenanceSummary.totalRequests}</div>
                <p className="text-xs text-muted-foreground">All time requests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {maintenanceSummary.completedRequests}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(maintenanceSummary.completionRate)} completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {maintenanceSummary.averageResolutionTime} days
                </div>
                <p className="text-xs text-muted-foreground">Average time to complete</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(maintenanceSummary.totalCost)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(maintenanceSummary.averageCost)} avg per request
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {maintenanceSummary.pendingRequests}
                </div>
                <Progress 
                  value={(maintenanceSummary.pendingRequests / maintenanceSummary.totalRequests) * 100} 
                  className="h-2 mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {maintenanceSummary.inProgressRequests}
                </div>
                <Progress 
                  value={(maintenanceSummary.inProgressRequests / maintenanceSummary.totalRequests) * 100} 
                  className="h-2 mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(maintenanceSummary.completionRate)}
                </div>
                <Progress value={maintenanceSummary.completionRate} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Requests by Category</CardTitle>
              <CardDescription>
                Maintenance request distribution by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryAnalysis.map((category) => (
                  <div key={category.category} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Wrench className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium capitalize">{category.category.toLowerCase()}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category.totalRequests} total requests
                          </p>
                        </div>
                      </div>
                      <Badge variant={category.completionRate > 85 ? 'default' : 'secondary'}>
                        {formatPercentage(category.completionRate)} completed
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">{category.completedRequests}</div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-yellow-600">{category.pendingRequests}</div>
                        <div className="text-sm text-muted-foreground">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">{category.inProgressRequests}</div>
                        <div className="text-sm text-muted-foreground">In Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{category.averageResolutionTime} days</div>
                        <div className="text-sm text-muted-foreground">Avg Resolution</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Completion Rate</span>
                      <span>{formatPercentage(category.completionRate)}</span>
                    </div>
                    <Progress value={category.completionRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trends Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Request Trends</CardTitle>
              <CardDescription>Monthly maintenance request trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                  <p className="text-sm text-muted-foreground">Maintenance request trends over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {/* Priority Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Analysis</CardTitle>
              <CardDescription>
                Request distribution and performance by priority level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priorityAnalysis.map((priority) => (
                  <div key={priority.priority} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="flex items-center space-x-2">
                            {getPriorityBadge(priority.priority)}
                            <span className="font-medium">{priority.count} requests</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatPercentage(priority.percentage)} of total requests
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {priority.averageResolutionTime} days
                        </div>
                        <div className="text-sm text-muted-foreground">Avg resolution</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Completion Rate</span>
                      <span>{formatPercentage(priority.completionRate)}</span>
                    </div>
                    <Progress value={priority.completionRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resolution Time Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Resolution Time Analysis</CardTitle>
              <CardDescription>
                Distribution of resolution times across all requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resolutionTimeAnalysis.map((timeRange, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">{timeRange.timeRange}</span>
                        <div className={`text-sm ${getResolutionCategoryColor(timeRange.category)}`}>
                          {timeRange.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{timeRange.count} requests</div>
                      <div className="text-sm text-muted-foreground">
                        {formatPercentage(timeRange.percentage)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance Trends</CardTitle>
              <CardDescription>
                Historical maintenance performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Month</th>
                      <th className="text-center p-3 font-medium">Total</th>
                      <th className="text-center p-3 font-medium">Completed</th>
                      <th className="text-center p-3 font-medium">Completion Rate</th>
                      <th className="text-center p-3 font-medium">Avg Resolution</th>
                      <th className="text-center p-3 font-medium">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceTrends.map((trend, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3 font-medium">{trend.month}</td>
                        <td className="p-3 text-center">{trend.totalRequests}</td>
                        <td className="p-3 text-center text-green-600">{trend.completedRequests}</td>
                        <td className="p-3 text-center">
                          <Badge variant={trend.completionRate > 85 ? 'default' : 'secondary'}>
                            {formatPercentage(trend.completionRate)}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">{trend.averageResolutionTime} days</td>
                        <td className="p-3 text-center font-medium">
                          {formatCurrency(trend.totalCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Analysis Tab */}
        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis by Category</CardTitle>
              <CardDescription>
                Maintenance costs breakdown by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costAnalysis.map((cost) => (
                  <div key={cost.category} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium capitalize">{cost.category.toLowerCase()}</h3>
                          <p className="text-sm text-muted-foreground">
                            {cost.requestCount} requests
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {formatCurrency(cost.totalCost)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total cost</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-semibold text-blue-600">
                          {formatCurrency(cost.averageCost)}
                        </div>
                        <div className="text-sm text-blue-700">Average Cost</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-semibold text-green-600">
                          {cost.requestCount}
                        </div>
                        <div className="text-sm text-green-700">Total Requests</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-semibold text-purple-600">
                          {formatCurrency(cost.costPerRequest)}
                        </div>
                        <div className="text-sm text-purple-700">Cost per Request</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Distribution</CardTitle>
              <CardDescription>Visual representation of maintenance costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                  <p className="text-sm text-muted-foreground">Cost distribution by category</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Trends</CardTitle>
              <CardDescription>Monthly maintenance cost trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                  <p className="text-sm text-muted-foreground">Cost trends over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preventive Maintenance Tab */}
        <TabsContent value="preventive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preventive Maintenance Schedule</CardTitle>
              <CardDescription>
                Scheduled maintenance tasks and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preventiveSchedule.map((schedule) => (
                  <div key={schedule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{schedule.title}</h3>
                          <p className="text-sm text-muted-foreground flex items-center space-x-1">
                            <Building className="h-3 w-3" />
                            <span>{schedule.propertyName}</span>
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(schedule.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Frequency:</span>
                        <div className="font-medium">{schedule.frequency}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Completed:</span>
                        <div className="font-medium">{formatDate(schedule.lastCompleted)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Next Due:</span>
                        <div className={`font-medium ${
                          schedule.status === 'overdue' ? 'text-red-600' : 
                          schedule.status === 'due' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {formatDate(schedule.nextDue)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Est. Cost:</span>
                        <div className="font-medium">{formatCurrency(schedule.estimatedCost)}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t flex justify-end">
                      <Button variant="outline" size="sm">
                        Schedule Task
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preventive vs Reactive Maintenance</CardTitle>
              <CardDescription>
                Comparison of preventive and reactive maintenance costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatCurrency(8500)}
                  </div>
                  <div className="text-sm text-green-700 mb-1">Preventive Maintenance</div>
                  <div className="text-xs text-muted-foreground">30% of total costs</div>
                </div>
                <div className="text-center p-6 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {formatCurrency(20000)}
                  </div>
                  <div className="text-sm text-red-700 mb-1">Reactive Maintenance</div>
                  <div className="text-xs text-muted-foreground">70% of total costs</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Recommendation</span>
                </div>
                <p className="text-sm text-blue-700">
                  Increasing preventive maintenance by 20% could reduce reactive maintenance costs by up to 40%, 
                  resulting in overall cost savings of approximately {formatCurrency(6000)} annually.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Export Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Export Maintenance Reports</CardTitle>
              <CardDescription>Download detailed maintenance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Maintenance Summary')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Maintenance Summary</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Resolution Analysis')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Resolution Analysis</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Cost Analysis')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Cost Analysis</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Preventive Schedule')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Preventive Schedule</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaintenanceReports;