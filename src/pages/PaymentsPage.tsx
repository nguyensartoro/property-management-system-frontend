import React, { useEffect, useState } from 'react';
import { usePaymentStore } from '../stores/paymentStore';
import { useContractStore } from '../stores/contractStore';
import { useAuthStore } from '../stores/authStore';
import { PaymentStatus, PaymentMethod } from '../utils/apiClient';
import { useToast } from '../hooks/use-toast';
import { 
  canManagePayments, 
  canRecordPayments,
  canViewPaymentAnalytics,
  canExportPaymentData,
  getAllowedActions
} from '../utils/roleBasedAccess';
import { RoleGuard } from '../components/auth/RoleGuard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchFilterBar } from '../components/shared/SearchFilterBar';
import { PageHeader } from '../components/shared/PageHeader';
import PaymentForm from '../components/payments/PaymentForm';
import PaymentCalendar from '../components/payments/PaymentCalendar';
import PaymentSummary from '../components/payments/PaymentSummary';

import { 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Banknote,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';

// Payment status badge component
const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return { variant: 'default' as const, icon: CheckCircle, className: 'bg-green-100 text-green-800' };
      case PaymentStatus.PENDING:
        return { variant: 'secondary' as const, icon: Clock, className: 'bg-yellow-100 text-yellow-800' };
      case PaymentStatus.OVERDUE:
        return { variant: 'destructive' as const, icon: AlertCircle, className: 'bg-red-100 text-red-800' };
      case PaymentStatus.PARTIAL:
        return { variant: 'outline' as const, icon: XCircle, className: 'bg-orange-100 text-orange-800' };
      default:
        return { variant: 'secondary' as const, icon: Clock, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </Badge>
  );
};

// Payment method badge component
const PaymentMethodBadge: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  const getMethodConfig = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return { icon: Banknote, className: 'bg-green-100 text-green-800' };
      case PaymentMethod.BANK_TRANSFER:
        return { icon: Building2, className: 'bg-blue-100 text-blue-800' };
      case PaymentMethod.CREDIT_CARD:
        return { icon: CreditCard, className: 'bg-purple-100 text-purple-800' };
      default:
        return { icon: DollarSign, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const config = getMethodConfig(method);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {method.replace('_', ' ')}
    </Badge>
  );
};

// Main component
const PaymentsPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  // Get allowed actions for current user
  const allowedActions = getAllowedActions(user, 'payments');
  
  // Zustand stores
  const {
    payments,
    selectedPayment,
    overduePayments,
    analytics,
    isLoading,
    error,
    pagination,
    filters,
    fetchPayments,
    fetchPaymentById,
    fetchOverduePayments,
    fetchPaymentAnalytics,
    createPayment,
    updatePayment,
    deletePayment,
    recordPayment,
    generateRecurringPayments,
    bulkUpdatePaymentStatus,
    setFilters,
    clearFilters,
    clearSelectedPayment,
    clearError,
  } = usePaymentStore();

  const {
    contracts,
    fetchContracts,
    isLoading: contractsLoading,
  } = useContractStore();
  
  // Local state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedPaymentForRecord, setSelectedPaymentForRecord] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'calendar' | 'analytics'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [contractFilter, setContractFilter] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  // Load data on component mount
  useEffect(() => {
    fetchPayments(currentPage, 10, {
      search: searchTerm,
      status: statusFilter,
      method: methodFilter,
      contractId: contractFilter,
      sortBy,
      sortOrder,
    });
    fetchContracts(1, 100);
    fetchOverduePayments();
    fetchPaymentAnalytics();
  }, [currentPage, searchTerm, statusFilter, methodFilter, contractFilter, sortBy, sortOrder]);

  // Handle search and filters
  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else if (filterType === 'method') {
      setMethodFilter(value);
    } else if (filterType === 'contract') {
      setContractFilter(value);
    }
    setCurrentPage(1);
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setMethodFilter('');
    setContractFilter('');
    setSortBy('dueDate');
    setSortOrder('desc');
    setCurrentPage(1);
    clearFilters();
  };

  // Handle payment operations
  const handleCreatePayment = async (formData: any) => {
    try {
      await createPayment(formData);
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Payment created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payment",
        variant: "destructive",
      });
    }
  };

  const handleRecordPayment = async (paymentId: string, data: any) => {
    try {
      await recordPayment(paymentId, data.paymentDate, data.method, data.receiptPath, data.notes);
      setIsRecordModalOpen(false);
      setSelectedPaymentForRecord(null);
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusUpdate = async (status: PaymentStatus) => {
    if (selectedPayments.length === 0) {
      toast({
        title: "Warning",
        description: "Please select payments to update",
        variant: "destructive",
      });
      return;
    }

    try {
      await bulkUpdatePaymentStatus(selectedPayments, status);
      setSelectedPayments([]);
      toast({
        title: "Success",
        description: `${selectedPayments.length} payments updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payments",
        variant: "destructive",
      });
    }
  };

  const handleGenerateRecurringPayments = async (contractId: string, months: number = 12) => {
    try {
      const result = await generateRecurringPayments(contractId, months);
      toast({
        title: "Success",
        description: `Generated ${result.createdCount} recurring payments`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate recurring payments",
        variant: "destructive",
      });
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle payment selection
  const handlePaymentSelection = (paymentId: string, selected: boolean) => {
    if (selected) {
      setSelectedPayments([...selectedPayments, paymentId]);
    } else {
      setSelectedPayments(selectedPayments.filter(id => id !== paymentId));
    }
  };

  const handleSelectAllPayments = (selected: boolean) => {
    if (selected) {
      setSelectedPayments(payments.map(p => p.id));
    } else {
      setSelectedPayments([]);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Clear error on mount
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, []);

  if (isLoading && payments.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Payment Management"
          description="Track and manage rental payments, view analytics, and handle overdue payments"
          action={
            <div className="flex gap-2">
              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  Table
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar
                </Button>
                <Button
                  variant={viewMode === 'analytics' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('analytics')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </div>
              <RoleGuard allowedRoles={['ADMIN']}>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              </RoleGuard>
            </div>
          }
        />

        {/* Analytics Summary - Always show basic metrics */}
        {viewMode !== 'analytics' && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.summary.paidAmount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.breakdowns.byStatus.PAID || 0} payments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
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
        )}

        {/* Overdue Payments Alert */}
        {overduePayments.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Overdue Payments ({overduePayments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overduePayments.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center text-sm">
                    <span>
                      {payment.contract?.renter?.name} - {payment.contract?.room?.number}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatCurrency(payment.amount)}</span>
                      <span className="text-red-600">
                        Due: {format(new Date(payment.dueDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                ))}
                {overduePayments.length > 3 && (
                  <p className="text-sm text-muted-foreground">
                    And {overduePayments.length - 3} more overdue payments...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters - Only show for table view */}
        {viewMode === 'table' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <SearchFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    placeholder="Search payments by renter name, room number, or amount..."
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value={PaymentStatus.PAID}>Paid</SelectItem>
                      <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={PaymentStatus.OVERDUE}>Overdue</SelectItem>
                      <SelectItem value={PaymentStatus.PARTIAL}>Partial</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={methodFilter} onValueChange={(value) => handleFilterChange('method', value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Methods</SelectItem>
                      <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                      <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                      <SelectItem value={PaymentMethod.CREDIT_CARD}>Credit Card</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={contractFilter} onValueChange={(value) => handleFilterChange('contract', value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Contract" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Contracts</SelectItem>
                      {contracts.map((contract) => (
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.renter?.name} - {contract.room?.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={handleClearFilters}>
                    <Filter className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk Actions - Only show for table view */}
        {viewMode === 'table' && selectedPayments.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedPayments.length} payment(s) selected
                </span>
                <div className="flex gap-2">
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusUpdate(PaymentStatus.PAID)}
                    >
                      Mark as Paid
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusUpdate(PaymentStatus.PENDING)}
                    >
                      Mark as Pending
                    </Button>
                  </RoleGuard>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPayments([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Area */}
        {viewMode === 'analytics' && (
          <PaymentSummary 
            payments={payments} 
            analytics={analytics}
            showTrends={true}
          />
        )}

        {viewMode === 'calendar' && (
          <PaymentCalendar
            payments={payments}
            onPaymentClick={(payment) => {
              setSelectedPaymentForRecord(payment.id);
              setIsRecordModalOpen(true);
            }}
            onQuickRecord={(payment) => {
              setSelectedPaymentForRecord(payment.id);
              setIsRecordModalOpen(true);
            }}
            isLoading={isLoading}
          />
        )}

        {/* Payments Table */}
        {viewMode === 'table' && (
          <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Payments</CardTitle>
              <div className="flex gap-2">
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </RoleGuard>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No payments found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter || methodFilter || contractFilter
                    ? "No payments match your current filters."
                    : "Get started by recording your first payment."}
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground border-b pb-2">
                  <input
                    type="checkbox"
                    checked={selectedPayments.length === payments.length}
                    onChange={(e) => handleSelectAllPayments(e.target.checked)}
                    className="rounded"
                  />
                  <div className="flex-1 grid grid-cols-12 gap-4">
                    <div className="col-span-2 cursor-pointer" onClick={() => handleSortChange('dueDate')}>
                      Due Date {sortBy === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </div>
                    <div className="col-span-2">Renter</div>
                    <div className="col-span-1">Room</div>
                    <div className="col-span-2 cursor-pointer" onClick={() => handleSortChange('amount')}>
                      Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Method</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                </div>

                {/* Table Rows */}
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center space-x-2 py-3 border-b last:border-b-0">
                    <input
                      type="checkbox"
                      checked={selectedPayments.includes(payment.id)}
                      onChange={(e) => handlePaymentSelection(payment.id, e.target.checked)}
                      className="rounded"
                    />
                    <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                        <div className="font-medium">
                          {format(new Date(payment.dueDate), 'MMM dd, yyyy')}
                        </div>
                        {payment.paymentDate && (
                          <div className="text-sm text-muted-foreground">
                            Paid: {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                      <div className="col-span-2">
                        <div className="font-medium">{payment.contract?.renter?.name}</div>
                        <div className="text-sm text-muted-foreground">{payment.contract?.renter?.phone}</div>
                      </div>
                      <div className="col-span-1">
                        <div className="font-medium">{payment.contract?.room?.number}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.contract?.room?.property?.name}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="font-medium">{formatCurrency(payment.amount)}</div>
                        {payment.notes && (
                          <div className="text-sm text-muted-foreground truncate">{payment.notes}</div>
                        )}
                      </div>
                      <div className="col-span-2">
                        <PaymentStatusBadge status={payment.status} />
                      </div>
                      <div className="col-span-2">
                        <PaymentMethodBadge method={payment.method} />
                      </div>
                      <div className="col-span-1">
                        <div className="flex gap-1">
                          <RoleGuard allowedRoles={['ADMIN']}>
                            {payment.status !== PaymentStatus.PAID && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPaymentForRecord(payment.id);
                                  setIsRecordModalOpen(true);
                                }}
                              >
                                Record
                              </Button>
                            )}
                          </RoleGuard>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Pagination - Only show for table view */}
        {viewMode === 'table' && pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              disabled={!pagination.hasPreviousPage}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            
            {[...Array(pagination.totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            
            <Button
              variant="outline"
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Create Payment Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Payment</DialogTitle>
            <DialogDescription>
              Create a new payment record for a rental contract
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            contracts={contracts}
            onSubmit={handleCreatePayment}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isLoading}
            mode="create"
          />
        </DialogContent>
      </Dialog>

      {/* Record Payment Modal */}
      <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Mark this payment as received and record payment details
            </DialogDescription>
          </DialogHeader>
          {selectedPaymentForRecord && (
            <PaymentForm
              payment={payments.find(p => p.id === selectedPaymentForRecord)}
              contracts={contracts}
              onSubmit={(data) => handleRecordPayment(selectedPaymentForRecord, data)}
              onCancel={() => {
                setIsRecordModalOpen(false);
                setSelectedPaymentForRecord(null);
              }}
              isLoading={isLoading}
              mode="record"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsPage;