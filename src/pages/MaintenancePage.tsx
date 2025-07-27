import React, { useState, useEffect } from 'react';
import { useMaintenanceStore } from '../stores/maintenanceStore';
import { useAuthStore } from '../stores/authStore';
import { MaintenanceRequest, MaintenanceStatus, MaintenancePriority, MaintenanceCategory } from '../utils/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MaintenanceBoard } from '../components/maintenance/MaintenanceBoard';
import { MaintenanceForm } from '../components/maintenance/MaintenanceForm';
import { MaintenanceDetails } from '../components/maintenance/MaintenanceDetails';
import ApiErrorDisplay from '../components/ui/ApiErrorDisplay';
import {
  Plus,
  Search,
  Filter,
  Download,
  BarChart3,
  AlertTriangle,
  Clock,
  CheckCircle,
  Settings,
  Calendar,
  TrendingUp,
  Users,
  MapPin,
  Wrench
} from 'lucide-react';

interface MaintenanceStats {
  total: number;
  submitted: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  urgent: number;
  avgResolutionTime: number;
  completionRate: number;
}

export const MaintenancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('board');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Store hooks
  const {
    maintenanceRequests,
    urgentRequests,
    isLoading,
    error,
    pagination,
    filters,
    fetchMaintenanceRequests,
    fetchUrgentMaintenanceRequests,
    createMaintenanceRequest,
    updateMaintenanceRequest,
    deleteMaintenanceRequest,
    assignMaintenanceRequest,
    completeMaintenanceRequest,
    setFilters,
    clearError,
  } = useMaintenanceStore();

  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  // Load data on mount
  useEffect(() => {
    fetchMaintenanceRequests(1, 50);
    fetchUrgentMaintenanceRequests();
  }, [fetchMaintenanceRequests, fetchUrgentMaintenanceRequests]);

  // Apply filters when they change
  useEffect(() => {
    const newFilters = {
      search: searchTerm,
      status: statusFilter,
      priority: priorityFilter,
      category: categoryFilter,
    };
    setFilters(newFilters);
    fetchMaintenanceRequests(1, 50, newFilters);
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter, setFilters, fetchMaintenanceRequests]);

  // Calculate statistics
  const calculateStats = (): MaintenanceStats => {
    const total = maintenanceRequests.length;
    const submitted = maintenanceRequests.filter(r => r.status === MaintenanceStatus.SUBMITTED).length;
    const inProgress = maintenanceRequests.filter(r => r.status === MaintenanceStatus.IN_PROGRESS).length;
    const completed = maintenanceRequests.filter(r => r.status === MaintenanceStatus.COMPLETED).length;
    const cancelled = maintenanceRequests.filter(r => r.status === MaintenanceStatus.CANCELLED).length;
    const urgent = maintenanceRequests.filter(r => r.priority === MaintenancePriority.URGENT).length;

    // Calculate average resolution time (in days)
    const completedRequests = maintenanceRequests.filter(r => r.status === MaintenanceStatus.COMPLETED && r.completedAt);
    const avgResolutionTime = completedRequests.length > 0
      ? completedRequests.reduce((acc, req) => {
          const submitted = new Date(req.submittedAt);
          const completed = new Date(req.completedAt!);
          const days = Math.ceil((completed.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
          return acc + days;
        }, 0) / completedRequests.length
      : 0;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      submitted,
      inProgress,
      completed,
      cancelled,
      urgent,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
    };
  };

  const stats = calculateStats();

  // Handle status change
  const handleStatusChange = async (requestId: string, newStatus: MaintenanceStatus) => {
    try {
      if (newStatus === MaintenanceStatus.COMPLETED) {
        await completeMaintenanceRequest(requestId);
      } else {
        await updateMaintenanceRequest(requestId, { status: newStatus });
      }
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  // Handle request creation
  const handleCreateRequest = async (data: any) => {
    try {
      await createMaintenanceRequest(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  // Handle request click
  const handleRequestClick = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
  };

  // Handle assign request
  const handleAssignRequest = async (requestId: string) => {
    // In a real implementation, you would show an assignment dialog
    // For now, we'll assign to the current user if they're an admin
    if (isAdmin && user) {
      try {
        await assignMaintenanceRequest(requestId, user.name || user.email);
      } catch (error) {
        console.error('Error assigning request:', error);
      }
    }
  };

  // Handle edit request
  const handleEditRequest = (requestId: string) => {
    const request = maintenanceRequests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      // In a real implementation, you would open an edit dialog
    }
  };

  // Handle delete request
  const handleDeleteRequest = async (requestId: string) => {
    if (window.confirm('Are you sure you want to delete this maintenance request?')) {
      try {
        await deleteMaintenanceRequest(requestId);
      } catch (error) {
        console.error('Error deleting request:', error);
      }
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Maintenance Management</h1>
          <p className="text-muted-foreground">
            Track and manage maintenance requests across all properties
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Maintenance Request</DialogTitle>
              </DialogHeader>
              <MaintenanceForm
                onSubmit={handleCreateRequest}
                onCancel={() => setIsCreateDialogOpen(false)}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ApiErrorDisplay
          error={error}
          onRetry={() => fetchMaintenanceRequests()}
          onDismiss={clearError}
        />
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Wrench className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgent Requests</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold">{stats.avgResolutionTime}d</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.completionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {Object.values(MaintenanceStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                {Object.values(MaintenancePriority).map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {Object.values(MaintenanceCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchTerm || statusFilter || priorityFilter || categoryFilter) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="board">Board View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="space-y-4">
          <MaintenanceBoard
            requests={maintenanceRequests}
            onStatusChange={handleStatusChange}
            onRequestClick={handleRequestClick}
            onAssignRequest={handleAssignRequest}
            onEditRequest={handleEditRequest}
            onDeleteRequest={handleDeleteRequest}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Request</th>
                      <th className="text-left p-4">Renter</th>
                      <th className="text-left p-4">Room</th>
                      <th className="text-left p-4">Priority</th>
                      <th className="text-left p-4">Category</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Submitted</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRequests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{request.title}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {request.description}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{request.renter?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>Room {request.room?.number || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              request.priority === MaintenancePriority.URGENT
                                ? 'destructive'
                                : request.priority === MaintenancePriority.HIGH
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {request.priority}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{request.category}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              request.status === MaintenanceStatus.COMPLETED
                                ? 'default'
                                : request.status === MaintenanceStatus.IN_PROGRESS
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {request.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(request.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRequestClick(request)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Status Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Submitted</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-600 h-2 rounded-full"
                          style={{ width: `${(stats.submitted / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.submitted}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>In Progress</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.inProgress}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completed</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.completed}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Priority Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.values(MaintenancePriority).map((priority) => {
                    const count = maintenanceRequests.filter(r => r.priority === priority).length;
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={priority} className="flex justify-between items-center">
                        <span>{priority}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                priority === MaintenancePriority.URGENT
                                  ? 'bg-red-600'
                                  : priority === MaintenancePriority.HIGH
                                  ? 'bg-orange-600'
                                  : priority === MaintenancePriority.MEDIUM
                                  ? 'bg-yellow-600'
                                  : 'bg-green-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Request Details Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Maintenance Request Details</DialogTitle>
            </DialogHeader>
            <MaintenanceDetails
              request={selectedRequest}
              onClose={() => setSelectedRequest(null)}
              onStatusChange={handleStatusChange}
              onAssign={handleAssignRequest}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MaintenancePage;