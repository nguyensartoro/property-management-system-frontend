import React from 'react';
import { Plus } from 'lucide-react';
import { useQuery } from '@apollo/client';
import AddContractModal from '@/components/contracts/AddContractModal';
import ViewModeSwitcher from '../components/shared/ViewModeSwitcher';
import SearchFilterBar from '../components/shared/SearchFilterBar';
import { GET_CONTRACTS } from '@/providers/ContractProvider';
import ContractsList from '@/components/contracts/ContractsList';
import ContractDetailsModal from '@/components/contracts/ContractDetailsModal';

// Define Contract type to avoid using 'any'
interface Contract {
  id: string;
  roomId: string;
  roomName?: {
    number?: string;
  };
  renterIds: string[];
  renterNames: string[];
  startDate: string;
  endDate: string;
  contractType: string;
  status: string;
  amount: number;
}

const ContractsPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [selectedContract, setSelectedContract] = React.useState<Contract | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('All');
  const [sortBy, setSortBy] = React.useState<string>('newest');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = React.useState(1);

  // Apollo query
  const { data, loading, error } = useQuery(GET_CONTRACTS, {
    variables: {
      page: currentPage,
      limit: itemsPerPage,
      status: filterStatus !== 'All' ? filterStatus : undefined,
      sortBy: sortBy === 'newest' ? 'createdAt' : sortBy === 'amount-high' ? 'amount' : sortBy === 'amount-low' ? 'amount' : undefined,
      sortOrder: sortBy === 'amount-low' ? 'asc' : sortBy === 'amount-high' ? 'desc' : 'desc',
    },
    fetchPolicy: 'cache-and-network',
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading contracts...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error loading contracts: {error.message}</div>;
  }

  const contracts = data?.contracts?.nodes || [];

  // Filtering and searching (client-side for search)
  const filteredContracts = contracts.filter((contract: Contract) => {
    const matchesSearch = (contract.roomName?.number?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (Array.isArray(contract.renterNames) && contract.renterNames.some((name: string) => name && name.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesSearch;
  });

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const statusOptions = [
    { value: 'All', label: 'All' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'TERMINATED', label: 'Terminated' },
  ];

  const sortByOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'amount-high', label: 'Amount: High to Low' },
    { value: 'amount-low', label: 'Amount: Low to High' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Contracts Management</h2>
          <p className="text-secondary-500">Manage all your rental contracts</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex gap-2 items-center btn btn-primary"
        >
          <Plus size={16} />
          <span>Add New Contract</span>
        </button>
      </div>
      <div className="dashboard-card">
        <SearchFilterBar
          searchPlaceholder="Search by room or renter name..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            {
              label: 'Status',
              value: filterStatus,
              options: statusOptions,
              onChange: handleStatusChange,
            },
            {
              label: 'Sort By',
              value: sortBy,
              options: sortByOptions,
              onChange: setSortBy,
            },
          ]}
          rightContent={
            <ViewModeSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />
          }
        />
        <ContractsList
          contracts={filteredContracts}
          viewMode={viewMode}
          onViewContract={(contract: Contract) => {
            setSelectedContract(contract);
            setIsDetailsModalOpen(true);
          }}
        />
      </div>
      <AddContractModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <ContractDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        contract={selectedContract}
      />
    </div>
  );
};

export default ContractsPage;