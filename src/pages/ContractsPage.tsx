import React, { useEffect, useState } from 'react';
import { useContractStore } from '../stores/contractStore';
import { useRenterStore } from '../stores/renterStore';
import { useRoomStore } from '../stores/roomStore';
import { useAuthStore } from '../stores/authStore';
import { ContractStatus, ContractType } from '../utils/apiClient';
import { useToast } from '../hooks/use-toast';
import { 
  canManageContracts, 
  canUploadContractDocuments,
  canViewContractDetails,
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
import ContractList from '../components/contracts/ContractList';
import ContractFormModal from '../components/contracts/ContractFormModal';
import { ContractDetailsModal } from '../components/contracts/ContractDetails';
import DocumentUploadModal from '../components/contracts/DocumentUploadModal';

import { Plus, Filter, Download, Upload, AlertCircle, Calendar, FileText, Users, Building } from 'lucide-react';
import { format } from 'date-fns';



// Main component
const ContractsPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  // Get allowed actions for current user
  const allowedActions = getAllowedActions(user, 'contracts');
  
  // Zustand stores
  const {
    contracts,
    selectedContract,
    expiringContracts,
    isLoading,
    error,
    pagination,
    filters,
    fetchContracts,
    fetchContractById,
    fetchExpiringContracts,
    createContract,
    updateContract,
    deleteContract,
    terminateContract,
    renewContract,
    uploadContractDocument,
    setFilters,
    clearFilters,
    clearSelectedContract,
    clearError,
  } = useContractStore();

  const {
    renters,
    fetchRenters,
    isLoading: rentersLoading,
  } = useRenterStore();

  const {
    rooms,
    fetchRooms,
    isLoading: roomsLoading,
  } = useRoomStore();
  
  // Local state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedContractForUpload, setSelectedContractForUpload] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load data on component mount
  useEffect(() => {
    fetchContracts(currentPage, 10, {
      search: searchTerm,
      status: statusFilter,
      contractType: typeFilter,
      sortBy,
      sortOrder,
    });
    fetchRenters(1, 100);
    fetchRooms(1, 100);
    fetchExpiringContracts(30);
  }, [currentPage, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  // Handle search and filters
  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else if (filterType === 'type') {
      setTypeFilter(value);
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
    setTypeFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
    clearFilters();
  };

  // Handle contract operations
  const handleCreateContract = async (formData: any) => {
    try {
      await createContract(formData);
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Contract created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create contract",
        variant: "destructive",
      });
    }
  };

  const handleUpdateContract = async (formData: any) => {
    if (!selectedContract) return;
    
    try {
      await updateContract(selectedContract.id, formData);
      setIsEditModalOpen(false);
      toast({
        title: "Success",
        description: "Contract updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contract",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContract = async (id: string) => {
    if (confirm('Are you sure you want to delete this contract?')) {
      try {
        await deleteContract(id);
        toast({
          title: "Success",
          description: "Contract deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete contract",
          variant: "destructive",
        });
      }
    }
  };

  const handleTerminateContract = async (id: string, reason: string) => {
    try {
      await terminateContract(id, reason);
      toast({
        title: "Success",
        description: "Contract terminated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate contract",
        variant: "destructive",
      });
    }
  };

  const handleRenewContract = async (id: string, newEndDate: string, monthlyRent?: number) => {
    try {
      await renewContract(id, newEndDate, monthlyRent);
      toast({
        title: "Success",
        description: "Contract renewed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to renew contract",
        variant: "destructive",
      });
    }
  };

  const handleDocumentUpload = async (file: File) => {
    if (!selectedContractForUpload) return;
    
    try {
      // In a real implementation, you would upload the file to a storage service
      // and get back a URL. For now, we'll simulate this.
      const documentPath = `/uploads/contracts/${selectedContractForUpload}/${file.name}`;
      await uploadContractDocument(selectedContractForUpload, documentPath);
      setIsUploadModalOpen(false);
      setSelectedContractForUpload(null);
      toast({
        title: "Success",
        description: "Contract document uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload contract document",
        variant: "destructive",
      });
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    clearSelectedContract();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (contract: any) => {
    fetchContractById(contract.id);
    setIsEditModalOpen(true);
  };

  const openViewModal = (contract: any) => {
    fetchContractById(contract.id);
    setIsViewModalOpen(true);
  };

  const openUploadModal = (contractId: string) => {
    setSelectedContractForUpload(contractId);
    setIsUploadModalOpen(true);
  };

  // Utility functions
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: ContractStatus) => {
    const variants = {
      [ContractStatus.ACTIVE]: 'default',
      [ContractStatus.DRAFT]: 'secondary',
      [ContractStatus.EXPIRED]: 'destructive',
      [ContractStatus.TERMINATED]: 'outline',
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const getContractTypeBadge = (type: ContractType) => {
    return (
      <Badge variant="outline">
        {type === ContractType.LONG_TERM ? 'Long Term' : 'Short Term'}
      </Badge>
    );
  };
  
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Contract Management"
        description="Manage rental contracts, track agreements, and handle contract lifecycle"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClearFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
            <RoleGuard allowedRoles={['ADMIN']}>
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" />
                New Contract
              </Button>
            </RoleGuard>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.totalItems || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts.filter(c => c.status === ContractStatus.ACTIVE).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {expiringContracts.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${contracts
                .filter(c => c.status === ContractStatus.ACTIVE)
                .reduce((sum, c) => sum + c.monthlyRent, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchPlaceholder="Search contracts by renter name, room number..."
        onSearch={handleSearch}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: '', label: 'All Status' },
              { value: ContractStatus.ACTIVE, label: 'Active' },
              { value: ContractStatus.DRAFT, label: 'Draft' },
              { value: ContractStatus.EXPIRED, label: 'Expired' },
              { value: ContractStatus.TERMINATED, label: 'Terminated' },
            ],
            value: statusFilter,
            onChange: (value) => handleFilterChange('status', value),
          },
          {
            key: 'type',
            label: 'Type',
            options: [
              { value: '', label: 'All Types' },
              { value: ContractType.LONG_TERM, label: 'Long Term' },
              { value: ContractType.SHORT_TERM, label: 'Short Term' },
            ],
            value: typeFilter,
            onChange: (value) => handleFilterChange('type', value),
          },
        ]}
      />

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p>Error loading contracts: {error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiring Contracts Alert */}
      {expiringContracts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Contracts Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringContracts.slice(0, 3).map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <p className="font-medium">{contract.renter?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Room {contract.room?.number} • Expires {formatDate(contract.endDate)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRenewContract(contract.id, 
                      new Date(new Date(contract.endDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                      contract.monthlyRent
                    )}
                  >
                    Renew
                  </Button>
                </div>
              ))}
              {expiringContracts.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  And {expiringContracts.length - 3} more contracts expiring soon...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contracts List */}
      <ContractList
        contracts={contracts}
        isLoading={isLoading}
        onView={openViewModal}
        onEdit={openEditModal}
        onDelete={handleDeleteContract}
        onTerminate={handleTerminateContract}
        onUploadDocument={openUploadModal}
        onSort={handleSortChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        pagination={pagination}
        onPageChange={setCurrentPage}
        currentPage={currentPage}
      />

      {/* Modals */}
      <ContractFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateContract}
        title="Create New Contract"
        rooms={rooms}
        renters={renters}
        isLoading={isLoading || roomsLoading || rentersLoading}
      />

      <ContractFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateContract}
        title="Edit Contract"
        contract={selectedContract}
        rooms={rooms}
        renters={renters}
        isLoading={isLoading || roomsLoading || rentersLoading}
      />

      <ContractDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        contract={selectedContract}
        onEdit={() => {
          setIsViewModalOpen(false);
          setIsEditModalOpen(true);
        }}
        onTerminate={handleTerminateContract}
        onRenew={handleRenewContract}
      />

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedContractForUpload(null);
        }}
        onUpload={handleDocumentUpload}
        title="Upload Contract Document"
      />
    </div>
  );
};

export default ContractsPage; 