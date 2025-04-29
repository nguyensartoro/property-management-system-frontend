import React, { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { mockContracts } from '../../data/mockData';
import AddContractModal from './AddContractModal';
import ContractDetailsModal from './ContractDetailsModal';
import ContractForm from './ContractForm';
import RenterForm from '../renters/RenterForm';
import ContractsList from './ContractsList';
import { toast } from '../ui/toast';
import ViewModeSwitcher from '../shared/ViewModeSwitcher';

interface Contract {
  id: string;
  roomId: string;
  roomName: string;
  renterIds: string[];
  renterNames: string[];
  startDate: string;
  endDate: string;
  contractType: 'longTerm' | 'shortTerm';
  status: 'active' | 'expired' | 'terminated';
  amount: number;
}

const ContractsPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const handleOpenDetails = (contract: Contract) => {
    if (contract) {
      setSelectedContract(contract);
      setIsDetailsModalOpen(true);
    }
  };
  
  const filteredContracts = mockContracts.filter(contract => 
    contract.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.renterNames.some(name => name && name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const paginatedContracts = filteredContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [rooms] = useState(mockContracts.map(contract => ({ id: contract.id, roomNumber: contract.roomName, status: 'Occupied' })));
  const [renters, setRenters] = useState(mockContracts.map(contract => ({ id: contract.id, name: contract.renterNames[0] || 'Unknown', phone: '123-456-7890' })));
  
  const [isContractFormOpen, setIsContractFormOpen] = useState(false);
  const [isRenterFormOpen, setIsRenterFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const openAddContractForm = () => {
    setIsEditMode(false);
    setSelectedContract(null);
    setIsContractFormOpen(true);
  };

  const openEditContractForm = () => {
    setIsEditMode(true);
    setIsDetailsModalOpen(false);
    setIsContractFormOpen(true);
  };

  const closeContractForm = () => {
    setIsContractFormOpen(false);
    if (isEditMode && selectedContract) {
      setIsDetailsModalOpen(true);
    }
  };

  const openRenterForm = () => {
    setIsRenterFormOpen(true);
  };

  const closeRenterForm = () => {
    setIsRenterFormOpen(false);
  };

  const handleAddRenter = (renterData: any) => {
    if (!renterData) return;
    
    const newRenter = {
      id: renterData.id || `renter-${Date.now()}`,
      name: renterData.name || 'New Renter',
      phone: renterData.phone || 'N/A'
    };
    
    setRenters(prev => [...prev, newRenter]);
  };

  const handleContractSubmit = (contractData: any) => {
    if (!contractData) return;
    
    if (isEditMode) {
      setContracts(prev => 
        prev.map(contract => 
          contract.id === contractData.id ? contractData : contract
        )
      );
      setSelectedContract(contractData);
      
      toast.success("Contract Updated", {
        description: `Contract ${contractData.contractId || contractData.id} has been updated.`
      });
    } else {
      setContracts(prev => [...prev, contractData]);
      
      toast.success("Contract Created", {
        description: `Contract ${contractData.contractId || contractData.id} has been created.`
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Contracts Management</h2>
          <p className="text-secondary-500">Manage all your rental contracts</p>
        </div>
        
        <button 
          onClick={openAddContractForm}
          className="flex gap-2 items-center btn btn-primary"
        >
          <Plus size={16} />
          <span>Add New Contract</span>
        </button>
      </div>
      
      <div className="dashboard-card">
        <div className="flex flex-col gap-4 justify-between mb-6 md:flex-row">
          <div className="relative w-full md:w-64">
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2 pr-4 pl-10 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex gap-2 items-center">
              <Filter size={18} className="text-secondary-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="expires-soon">Expiring Soon</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
              </select>
            </div>
            
            <div className="flex gap-2 items-center ml-2">
              <ViewModeSwitcher 
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </div>
        
        <ContractsList 
          contracts={paginatedContracts}
          viewMode={viewMode}
          onViewContract={handleOpenDetails}
          onEditContract={(contract) => {
            handleOpenDetails(contract);
            setTimeout(() => {
              openEditContractForm();
            }, 100);
          }}
        />
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 border-t border-gray-200 pt-4">
            <div className="text-sm text-secondary-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredContracts.length)} of {filteredContracts.length} contracts
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm 
                    ${currentPage === i + 1 
                      ? 'bg-primary-500 text-white' 
                      : 'text-secondary-700 hover:bg-gray-100'}`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      
      {isAddModalOpen && (
        <AddContractModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}
      
      {isDetailsModalOpen && selectedContract && (
        <ContractDetailsModal 
          isOpen={isDetailsModalOpen} 
          onClose={() => setIsDetailsModalOpen(false)} 
          onEdit={openEditContractForm}
          contract={selectedContract}
        />
      )}

      {/* Contract Form Modal */}
      <ContractForm
        isOpen={isContractFormOpen}
        onClose={closeContractForm}
        onAddRenter={openRenterForm}
        existingContract={isEditMode && selectedContract ? selectedContract : undefined}
        rooms={rooms}
        renters={renters}
        onSubmit={handleContractSubmit}
      />

      {/* Renter Form Modal */}
      <RenterForm 
        isOpen={isRenterFormOpen}
        onClose={closeRenterForm}
        onSubmit={handleAddRenter}
      />
    </div>
  );
};

export default ContractsPage; 