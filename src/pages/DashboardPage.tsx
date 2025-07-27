import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/authStore';
import { usePropertyStore } from '../stores/propertyStore';
import { useRoomStore } from '../stores/roomStore';
import { useRenterStore } from '../stores/renterStore';
import { useContractStore } from '../stores/contractStore';
import { usePaymentStore } from '../stores/paymentStore';
import { useMaintenanceStore } from '../stores/maintenanceStore';
import DashboardActionShortcuts from '../components/dashboard/DashboardActionShortcuts';
import FinancialOverview from '../components/dashboard/FinancialOverview';
import FinancialAnalyticsDashboard from '../components/analytics/FinancialAnalyticsDashboard';
import OccupancyAnalyticsDashboard from '../components/analytics/OccupancyAnalyticsDashboard';
import MaintenanceAnalyticsDashboard from '../components/analytics/MaintenanceAnalyticsDashboard';
import CreatePropertyModal from '../components/properties/CreatePropertyModal';
import CreateRoomModal from '../components/rooms/CreateRoomModal';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Calendar, DollarSign, Home, AlertTriangle, CheckCircle, Clock, Wrench, Plus } from 'lucide-react';

// Admin Dashboard Component
const AdminDashboard: React.FC = () => {
  const { properties } = usePropertyStore();
  const { rooms } = useRoomStore();
  const { renters } = useRenterStore();
  const { maintenanceRequests, urgentRequests, fetchMaintenanceRequests, fetchUrgentMaintenanceRequests } = useMaintenanceStore();
  const { contracts, fetchContracts } = useContractStore();
  const navigate = useNavigate();
  
  const [showCreatePropertyModal, setShowCreatePropertyModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  // Load maintenance and contract data on mount
  useEffect(() => {
    fetchMaintenanceRequests(1, 50);
    fetchUrgentMaintenanceRequests();
    fetchContracts(1, 100);
  }, [fetchMaintenanceRequests, fetchUrgentMaintenanceRequests, fetchContracts]);
  
  // Calculate statistics
  const totalProperties = properties.length;
  const totalRooms = rooms.length;
  const totalRenters = renters.length;
  
  // Calculate occupancy rate
  const occupiedRooms = rooms.filter(room => room.status === 'OCCUPIED').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  // Calculate monthly revenue (simplified)
  const monthlyRevenue = rooms
    .filter(room => room.status === 'OCCUPIED')
    .reduce((total, room) => total + room.price, 0);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Property Management Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <DashboardCard 
            title="Properties" 
            value={totalProperties.toString()} 
            description="Total properties managed" 
            icon="🏠" 
          />
          
          <DashboardCard 
            title="Occupancy" 
            value={`${occupancyRate}%`} 
            description="Current occupancy rate" 
            icon="📊" 
          />
          
          <DashboardCard 
            title="Revenue" 
            value={`${monthlyRevenue.toFixed(2)}`} 
            description="Monthly revenue" 
            icon="💰" 
          />
        </div>
        
        {/* Financial Overview */}
        <div className="mt-8">
          <FinancialOverview />
        </div>

        {/* Financial Analytics Dashboard */}
        <div className="mt-8">
          <FinancialAnalyticsDashboard />
        </div>

        {/* Occupancy Analytics Dashboard */}
        <div className="mt-8">
          <OccupancyAnalyticsDashboard />
        </div>

        {/* Maintenance Analytics Dashboard */}
        <div className="mt-8">
          <MaintenanceAnalyticsDashboard />
        </div>

        {/* Maintenance Overview */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="w-5 h-5" />
                <span>Maintenance Overview</span>
                {urgentRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {urgentRequests.length} Urgent
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Maintenance Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-700">
                        {maintenanceRequests.filter(r => r.status === 'SUBMITTED').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">In Progress</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {maintenanceRequests.filter(r => r.status === 'IN_PROGRESS').length}
                      </p>
                    </div>
                    <Wrench className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Completed</p>
                      <p className="text-2xl font-bold text-green-700">
                        {maintenanceRequests.filter(r => r.status === 'COMPLETED').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Urgent</p>
                      <p className="text-2xl font-bold text-red-700">
                        {urgentRequests.length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Priority Request Highlighting */}
              {urgentRequests.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="font-medium text-red-800">Urgent Requests Requiring Attention</h4>
                  </div>
                  <div className="space-y-2">
                    {urgentRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <p className="text-sm font-medium">{request.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Room {request.room?.number} - {request.renter?.name}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="destructive" className="text-xs">
                            {request.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {urgentRequests.length > 3 && (
                      <p className="text-sm text-red-600 text-center">
                        +{urgentRequests.length - 3} more urgent requests
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Maintenance Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Request Trends</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Requests:</span>
                      <span className="font-medium">{maintenanceRequests.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completion Rate:</span>
                      <span className="font-medium">
                        {maintenanceRequests.length > 0 
                          ? Math.round((maintenanceRequests.filter(r => r.status === 'COMPLETED').length / maintenanceRequests.length) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Resolution Time:</span>
                      <span className="font-medium">
                        {(() => {
                          const completedRequests = maintenanceRequests.filter(r => r.status === 'COMPLETED' && r.completedAt);
                          if (completedRequests.length === 0) return 'N/A';
                          
                          const avgDays = completedRequests.reduce((acc, req) => {
                            const submitted = new Date(req.submittedAt);
                            const completed = new Date(req.completedAt!);
                            const days = Math.ceil((completed.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
                            return acc + days;
                          }, 0) / completedRequests.length;
                          
                          return `${Math.round(avgDays)} days`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Cost Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maintenance Expenses:</span>
                      <span className="font-medium">
                        ${(() => {
                          // This would typically come from expense store filtered by maintenance category
                          // For now, we'll show a placeholder
                          return '2,450';
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Cost per Request:</span>
                      <span className="font-medium">
                        ${(() => {
                          const completedCount = maintenanceRequests.filter(r => r.status === 'COMPLETED').length;
                          if (completedCount === 0) return '0';
                          return Math.round(2450 / completedCount);
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Budget:</span>
                      <span className="font-medium">$5,000</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t pt-4 flex flex-wrap gap-2">
                <Button
                  onClick={() => navigate('/maintenance')}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  View All Requests
                </Button>
                
                {urgentRequests.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/maintenance?priority=urgent')}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Handle Urgent ({urgentRequests.length})
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/maintenance/reports')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Maintenance Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contract Overview */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Contract Overview</span>
                {(() => {
                  const expiringContracts = contracts.filter(contract => {
                    if (!contract.endDate || contract.status !== 'ACTIVE') return false;
                    const today = new Date();
                    const expirationDate = new Date(contract.endDate);
                    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
                  });
                  return expiringContracts.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {expiringContracts.length} Expiring Soon
                    </Badge>
                  );
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contract Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Active</p>
                      <p className="text-2xl font-bold text-green-700">
                        {contracts.filter(c => c.status === 'ACTIVE').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Expiring Soon</p>
                      <p className="text-2xl font-bold text-yellow-700">
                        {(() => {
                          const today = new Date();
                          return contracts.filter(contract => {
                            if (!contract.endDate || contract.status !== 'ACTIVE') return false;
                            const expirationDate = new Date(contract.endDate);
                            const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
                          }).length;
                        })()}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Expired</p>
                      <p className="text-2xl font-bold text-red-700">
                        {contracts.filter(c => c.status === 'EXPIRED').length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {contracts.length}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Expiring Contracts Alert */}
              {(() => {
                const today = new Date();
                const expiringContracts = contracts.filter(contract => {
                  if (!contract.endDate || contract.status !== 'ACTIVE') return false;
                  const expirationDate = new Date(contract.endDate);
                  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
                });

                return expiringContracts.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800">Contracts Expiring Soon</h4>
                    </div>
                    <div className="space-y-2">
                      {expiringContracts.slice(0, 3).map((contract) => {
                        const expirationDate = new Date(contract.endDate!);
                        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <div key={contract.id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div>
                              <p className="text-sm font-medium">
                                {contract.renter?.name} - Room {contract.room?.number}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Expires: {format(expirationDate, 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {daysUntilExpiration} days
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                ${contract.monthlyRent}/mo
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                      {expiringContracts.length > 3 && (
                        <p className="text-sm text-yellow-600 text-center">
                          +{expiringContracts.length - 3} more contracts expiring soon
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Contract Renewal Reminders */}
              {(() => {
                const today = new Date();
                const renewalCandidates = contracts.filter(contract => {
                  if (!contract.endDate || contract.status !== 'ACTIVE') return false;
                  const expirationDate = new Date(contract.endDate);
                  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return daysUntilExpiration <= 60 && daysUntilExpiration > 30;
                });

                return renewalCandidates.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-blue-800">Renewal Opportunities</h4>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">
                      {renewalCandidates.length} contracts are eligible for renewal discussions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {renewalCandidates.slice(0, 5).map((contract) => (
                        <Badge key={contract.id} variant="outline" className="text-xs">
                          {contract.renter?.name} - Room {contract.room?.number}
                        </Badge>
                      ))}
                      {renewalCandidates.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{renewalCandidates.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Occupancy Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Occupancy Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupancy Rate:</span>
                      <span className="font-medium">
                        {totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupied Rooms:</span>
                      <span className="font-medium">{occupiedRooms} / {totalRooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vacant Rooms:</span>
                      <span className="font-medium">{totalRooms - occupiedRooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contract Renewal Rate:</span>
                      <span className="font-medium">
                        {(() => {
                          const renewedContracts = contracts.filter(c => c.renewalDate).length;
                          const totalExpired = contracts.filter(c => c.status === 'EXPIRED' || c.renewalDate).length;
                          return totalExpired > 0 ? Math.round((renewedContracts / totalExpired) * 100) : 0;
                        })()}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Revenue Impact</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Revenue:</span>
                      <span className="font-medium">
                        ${contracts
                          .filter(c => c.status === 'ACTIVE')
                          .reduce((sum, c) => sum + c.monthlyRent, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Rent:</span>
                      <span className="font-medium">
                        ${(() => {
                          const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
                          if (activeContracts.length === 0) return '0';
                          const avgRent = activeContracts.reduce((sum, c) => sum + c.monthlyRent, 0) / activeContracts.length;
                          return Math.round(avgRent).toLocaleString();
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Security Deposits:</span>
                      <span className="font-medium">
                        ${contracts
                          .filter(c => c.status === 'ACTIVE')
                          .reduce((sum, c) => sum + (c.securityDeposit || 0), 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Potential Revenue:</span>
                      <span className="font-medium">
                        ${(() => {
                          const vacantRooms = totalRooms - occupiedRooms;
                          const avgRent = rooms.length > 0 ? rooms.reduce((sum, r) => sum + r.price, 0) / rooms.length : 0;
                          return Math.round(vacantRooms * avgRent).toLocaleString();
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t pt-4 flex flex-wrap gap-2">
                <Button
                  onClick={() => navigate('/contracts')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View All Contracts
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/contracts?status=expiring')}
                  className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Handle Expiring
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/contracts/new')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Contract
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/reports?type=occupancy')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Occupancy Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Recent Activities</h3>
            <div className="space-y-3">
              <ActivityItem 
                icon="🔑" 
                title="New Renter" 
                description="John Doe has been assigned to Room 101" 
                time="2 hours ago" 
              />
              <ActivityItem 
                icon="📝" 
                title="Contract Signed" 
                description="New contract for Room 205" 
                time="Yesterday" 
              />
              <ActivityItem 
                icon="🔧" 
                title="Maintenance Request" 
                description="Room 304 reported a plumbing issue" 
                time="2 days ago" 
              />
            </div>
          </div>
          
          <DashboardActionShortcuts 
            onCreateProperty={() => setShowCreatePropertyModal(true)}
            onCreateRoom={() => setShowCreateRoomModal(true)}
            onCreateRenter={() => navigate('/renters/new')}
            onCreateContract={() => navigate('/contracts/new')}
          />
        </div>
      </div>
      
      {/* Modals */}
      <CreatePropertyModal 
        isOpen={showCreatePropertyModal}
        onClose={() => setShowCreatePropertyModal(false)}
        onSuccess={() => {
          setShowCreatePropertyModal(false);
          navigate('/properties');
        }}
      />
      
      <CreateRoomModal 
        isOpen={showCreateRoomModal}
        onClose={() => setShowCreateRoomModal(false)}
        onSuccess={() => {
          setShowCreateRoomModal(false);
          navigate('/rooms');
        }}
      />
    </div>
  );
};

// Renter Dashboard Component
const RenterDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { contracts, fetchContractsByRenter } = useContractStore();
  const { payments, fetchPaymentsByContract } = usePaymentStore();
  const { maintenanceRequests, fetchMaintenanceRequestsByRenter } = useMaintenanceStore();
  const navigate = useNavigate();
  
  // Get current renter's active contract
  const activeContract = contracts.find(contract => 
    contract.renterId === user?.id && contract.status === 'ACTIVE'
  );
  
  // Get payments for the active contract
  const contractPayments = activeContract 
    ? payments.filter(payment => payment.contractId === activeContract.id)
    : [];
    
  // Get maintenance requests for the current renter
  const renterMaintenanceRequests = user?.id 
    ? maintenanceRequests.filter(request => request.renterId === user.id)
    : [];
  
  // Get contract expiration status
  const getExpirationStatus = (endDate: string) => {
    const today = new Date();
    const expiration = new Date(endDate);
    const daysUntilExpiration = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) {
      return { status: 'expired', message: 'Contract has expired', color: 'destructive', days: Math.abs(daysUntilExpiration) };
    } else if (daysUntilExpiration <= 30) {
      return { status: 'expiring', message: `Expires in ${daysUntilExpiration} days`, color: 'warning', days: daysUntilExpiration };
    } else {
      return { status: 'active', message: `${daysUntilExpiration} days remaining`, color: 'default', days: daysUntilExpiration };
    }
  };
  
  // Get payment information
  const getPaymentInfo = () => {
    if (!activeContract || contractPayments.length === 0) {
      return {
        nextPaymentDue: null,
        lastPayment: null,
        paymentStatus: 'unknown',
        outstandingBalance: 0,
        paymentMethod: 'Not set'
      };
    }

    const sortedPayments = [...contractPayments].sort((a, b) => 
      new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );

    const today = new Date();
    const upcomingPayments = sortedPayments.filter(p => 
      new Date(p.dueDate) >= today && p.status === 'PENDING'
    );
    const completedPayments = sortedPayments.filter(p => p.status === 'PAID');
    const overduePayments = sortedPayments.filter(p => 
      new Date(p.dueDate) < today && p.status !== 'PAID'
    );

    const nextPayment = upcomingPayments[0];
    const lastPayment = completedPayments[0];
    const outstandingBalance = overduePayments.reduce((sum, p) => sum + p.amount, 0);

    let paymentStatus = 'current';
    if (overduePayments.length > 0) {
      paymentStatus = 'overdue';
    } else if (nextPayment && new Date(nextPayment.dueDate).getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      paymentStatus = 'due_soon';
    }

    return {
      nextPaymentDue: nextPayment,
      lastPayment,
      paymentStatus,
      outstandingBalance,
      paymentMethod: lastPayment?.method || 'Not set',
      overdueCount: overduePayments.length,
      totalPaid: completedPayments.reduce((sum, p) => sum + p.amount, 0)
    };
  };

  // Fetch contracts and payments on mount
  useEffect(() => {
    if (user?.id) {
      fetchContractsByRenter(user.id);
    }
  }, [user?.id, fetchContractsByRenter]);

  useEffect(() => {
    if (activeContract?.id) {
      fetchPaymentsByContract(activeContract.id);
    }
  }, [activeContract?.id, fetchPaymentsByContract]);

  useEffect(() => {
    if (user?.id) {
      fetchMaintenanceRequestsByRenter(user.id);
    }
  }, [user?.id, fetchMaintenanceRequestsByRenter]);
  
  const expirationInfo = activeContract ? getExpirationStatus(activeContract.endDate) : null;
  const paymentInfo = getPaymentInfo();
  
  // Get maintenance request summary
  const getMaintenanceInfo = () => {
    const pendingRequests = renterMaintenanceRequests.filter(r => r.status === 'SUBMITTED');
    const inProgressRequests = renterMaintenanceRequests.filter(r => r.status === 'IN_PROGRESS');
    const completedRequests = renterMaintenanceRequests.filter(r => r.status === 'COMPLETED');
    const urgentRequests = renterMaintenanceRequests.filter(r => r.priority === 'URGENT' && r.status !== 'COMPLETED');
    
    return {
      total: renterMaintenanceRequests.length,
      pending: pendingRequests.length,
      inProgress: inProgressRequests.length,
      completed: completedRequests.length,
      urgent: urgentRequests.length,
      recent: renterMaintenanceRequests
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 3)
    };
  };
  
  const maintenanceInfo = getMaintenanceInfo();
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'Renter'}!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your rental information and contract details.
          </p>
        </div>
        
        <div className="flex flex-col space-y-2">
          {expirationInfo?.status === 'expiring' && (
            <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Contract expires soon!
              </span>
            </div>
          )}
          
          {paymentInfo.paymentStatus === 'overdue' && (
            <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                {paymentInfo.overdueCount} overdue payment{paymentInfo.overdueCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {paymentInfo.paymentStatus === 'due_soon' && (
            <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Payment due soon
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Contract Information */}
      {activeContract ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Current Contract</span>
              <Badge 
                variant={expirationInfo?.color as any}
                className="ml-auto"
              >
                {activeContract.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Home className="w-4 h-4" />
                  <span>Room Details</span>
                </div>
                <div>
                  <p className="font-medium">Room {activeContract.room?.number || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">
                    {activeContract.room?.property?.name || 'Unknown Property'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activeContract.room?.property?.address || 'No address'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>Financial Terms</span>
                </div>
                <div>
                  <p className="font-medium">${activeContract.monthlyRent}/month</p>
                  <p className="text-sm text-muted-foreground">
                    Security Deposit: ${activeContract.securityDeposit || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Type: {activeContract.contractType || 'Standard'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Contract Period</span>
                </div>
                <div>
                  <p className="font-medium">
                    {format(new Date(activeContract.startDate), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    to {format(new Date(activeContract.endDate), 'MMM dd, yyyy')}
                  </p>
                  <p className={`text-sm font-medium ${
                    expirationInfo?.status === 'expired' ? 'text-red-600' :
                    expirationInfo?.status === 'expiring' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {expirationInfo?.message}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4" />
                  <span>Contract Status</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    {activeContract.status === 'ACTIVE' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className="font-medium">{activeContract.status}</span>
                  </div>
                  {activeContract.documentPath && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open(activeContract.documentPath, '_blank')}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      View Contract
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Contract Terms */}
            {activeContract.terms && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Contract Terms</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {activeContract.terms}
                </p>
              </div>
            )}

            {/* Contract Actions */}
            <div className="border-t pt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/contracts/${activeContract.id}`)}
              >
                <FileText className="w-4 h-4 mr-2" />
                View Full Contract
              </Button>
              
              {expirationInfo?.days && expirationInfo.days <= 60 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/contracts/${activeContract.id}/renew`)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Request Renewal
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/payments')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                View Payments
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Contract</h3>
            <p className="text-muted-foreground text-center mb-6">
              You don't have an active contract at the moment. Please contact management for assistance.
            </p>
            <Button onClick={() => navigate('/contact')}>
              Contact Management
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment Information */}
      {activeContract && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Payment Information</span>
              <Badge 
                variant={
                  paymentInfo.paymentStatus === 'overdue' ? 'destructive' :
                  paymentInfo.paymentStatus === 'due_soon' ? 'secondary' :
                  'default'
                }
                className="ml-auto"
              >
                {paymentInfo.paymentStatus === 'overdue' ? 'Overdue' :
                 paymentInfo.paymentStatus === 'due_soon' ? 'Due Soon' :
                 'Current'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Next Payment Due */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Next Payment</span>
                </div>
                <div>
                  {paymentInfo.nextPaymentDue ? (
                    <>
                      <p className="font-medium">
                        ${paymentInfo.nextPaymentDue.amount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Due: {format(new Date(paymentInfo.nextPaymentDue.dueDate), 'MMM dd, yyyy')}
                      </p>
                      <p className={`text-sm font-medium ${
                        paymentInfo.paymentStatus === 'due_soon' ? 'text-yellow-600' : 'text-muted-foreground'
                      }`}>
                        {Math.ceil((new Date(paymentInfo.nextPaymentDue.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No upcoming payments</p>
                  )}
                </div>
              </div>

              {/* Last Payment */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4" />
                  <span>Last Payment</span>
                </div>
                <div>
                  {paymentInfo.lastPayment ? (
                    <>
                      <p className="font-medium">
                        ${paymentInfo.lastPayment.amount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Paid: {format(new Date(paymentInfo.lastPayment.paymentDate || paymentInfo.lastPayment.dueDate), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        {paymentInfo.lastPayment.method}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No payments yet</p>
                  )}
                </div>
              </div>

              {/* Outstanding Balance */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Outstanding</span>
                </div>
                <div>
                  <p className={`font-medium ${
                    paymentInfo.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ${paymentInfo.outstandingBalance.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {paymentInfo.outstandingBalance > 0 
                      ? `${paymentInfo.overdueCount} overdue payment${paymentInfo.overdueCount > 1 ? 's' : ''}`
                      : 'All payments current'
                    }
                  </p>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>Total Paid</span>
                </div>
                <div>
                  <p className="font-medium">
                    ${paymentInfo.totalPaid?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {contractPayments.filter(p => p.status === 'PAID').length} payments
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Method: {paymentInfo.paymentMethod}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Actions */}
            <div className="border-t pt-4 flex flex-wrap gap-2">
              {paymentInfo.nextPaymentDue && (
                <Button
                  onClick={() => navigate(`/payments/${paymentInfo.nextPaymentDue.id}/pay`)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay ${paymentInfo.nextPaymentDue.amount}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/payments')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Payment History
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/payments/methods')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Payment Methods
              </Button>
              
              {paymentInfo.outstandingBalance > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/payments/overdue')}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  View Overdue
                </Button>
              )}
            </div>

            {/* Recent Payments */}
            {contractPayments.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Recent Payments</h4>
                <div className="space-y-2">
                  {contractPayments
                    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                    .slice(0, 3)
                    .map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            payment.status === 'PAID' ? 'bg-green-500' :
                            payment.status === 'OVERDUE' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium">${payment.amount}</p>
                            <p className="text-xs text-muted-foreground">
                              Due: {format(new Date(payment.dueDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={
                            payment.status === 'PAID' ? 'default' :
                            payment.status === 'OVERDUE' ? 'destructive' :
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Maintenance Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="w-5 h-5" />
            <span>Maintenance Requests</span>
            {maintenanceInfo.urgent > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {maintenanceInfo.urgent} Urgent
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Pending</span>
              </div>
              <div>
                <p className="font-medium text-yellow-600">{maintenanceInfo.pending}</p>
                <p className="text-sm text-muted-foreground">Awaiting review</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Wrench className="w-4 h-4" />
                <span>In Progress</span>
              </div>
              <div>
                <p className="font-medium text-blue-600">{maintenanceInfo.inProgress}</p>
                <p className="text-sm text-muted-foreground">Being worked on</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4" />
                <span>Completed</span>
              </div>
              <div>
                <p className="font-medium text-green-600">{maintenanceInfo.completed}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4" />
                <span>Urgent</span>
              </div>
              <div>
                <p className={`font-medium ${maintenanceInfo.urgent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {maintenanceInfo.urgent}
                </p>
                <p className="text-sm text-muted-foreground">
                  {maintenanceInfo.urgent > 0 ? 'Need attention' : 'None urgent'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Maintenance Requests */}
          {maintenanceInfo.recent.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Recent Requests</h4>
              <div className="space-y-2">
                {maintenanceInfo.recent.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        request.status === 'COMPLETED' ? 'bg-green-500' :
                        request.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                        request.priority === 'URGENT' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{request.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(request.submittedAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {request.priority === 'URGENT' && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                      <Badge 
                        variant={
                          request.status === 'COMPLETED' ? 'default' :
                          request.status === 'IN_PROGRESS' ? 'secondary' :
                          'outline'
                        }
                        className="text-xs"
                      >
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Actions */}
          <div className="border-t pt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => navigate('/maintenance/new')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit Request
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/maintenance')}
            >
              <Wrench className="w-4 h-4 mr-2" />
              View All Requests
            </Button>
            
            {maintenanceInfo.urgent > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/maintenance?priority=urgent')}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                View Urgent ({maintenanceInfo.urgent})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/payments')}>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-medium">Payments</h3>
            <p className="text-sm text-muted-foreground">View payment history</p>
            {paymentInfo.paymentStatus === 'overdue' && (
              <Badge variant="destructive" className="mt-1">
                {paymentInfo.overdueCount} Overdue
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/maintenance')}>
          <CardContent className="p-4 text-center">
            <Wrench className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <h3 className="font-medium">Maintenance</h3>
            <p className="text-sm text-muted-foreground">Submit requests</p>
            {maintenanceInfo.urgent > 0 && (
              <Badge variant="destructive" className="mt-1">
                {maintenanceInfo.urgent} Urgent
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/documents')}>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-medium">Documents</h3>
            <p className="text-sm text-muted-foreground">Access your files</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/contact')}>
          <CardContent className="p-4 text-center">
            <Home className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-medium">Contact</h3>
            <p className="text-sm text-muted-foreground">Reach management</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Payment Received</p>
                <p className="text-sm text-muted-foreground">Monthly rent payment processed successfully</p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Contract Updated</p>
                <p className="text-sm text-muted-foreground">Contract terms have been updated</p>
                <p className="text-xs text-muted-foreground">1 week ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Maintenance Completed</p>
                <p className="text-sm text-muted-foreground">Plumbing issue in bathroom resolved</p>
                <p className="text-xs text-muted-foreground">2 weeks ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Dashboard Component
const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { fetchProperties } = usePropertyStore();
  const { fetchRooms } = useRoomStore();
  const { fetchRenters } = useRenterStore();
  
  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchProperties();
      fetchRooms();
      fetchRenters();
    }
  }, [isAuthenticated, user?.role, fetchProperties, fetchRooms, fetchRenters]);
  
  // Show appropriate dashboard based on user role
  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }
  
  return user?.role === 'ADMIN' ? <AdminDashboard /> : <RenterDashboard />;
};

// Helper Components
interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, description, icon }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

interface ActivityItemProps {
  icon: string;
  title: string;
  description: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ icon, title, description, time }) => {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
        <span>{icon}</span>
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-800">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
};

interface InfoItemProps {
  label: string;
  value: string;
  status?: 'success' | 'warning' | 'error';
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };
  
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className={`font-medium ${status ? getStatusColor() : 'text-gray-900'}`}>{value}</span>
    </div>
  );
};

export default DashboardPage;