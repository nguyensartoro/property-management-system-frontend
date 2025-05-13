import React from 'react';
import { Plus } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import ContractsList from '../components/contracts/ContractsList';
import ViewModeSwitcher from '../components/shared/ViewModeSwitcher';
import SearchFilterBar from '../components/shared/SearchFilterBar';
import { GET_CONTRACTS, DELETE_CONTRACT, CREATE_CONTRACT, UPDATE_CONTRACT } from '@/providers/ContractProvider';
import { toast } from 'react-hot-toast';
import ContractForm from '../components/contracts/ContractForm';
import Modal from '../components/shared/Modal';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/languageContext';

type SelectOption = { value: string; label: string };

interface Renter {
  id: string;
  name: string;
}

interface Room {
  id: string;
  number: string;
  name: string;
}

interface Contract {
  id: string;
  type: 'LONG_TERM' | 'SHORT_TERM';
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  renter: Renter;
  room: Room;
}

interface ContractFormData {
  id?: string;
  roomId: string;
  room?: Room;
  renterIds: string[];
  renters?: Renter[];
  startDate: string;
  endDate: string;
  contractType: string;
  type?: string;
  status?: string;
  amount: number;
}

const ContractsPage: React.FC = () => {
  const { t } = useLanguage();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [selectedContract, setSelectedContract] = React.useState<Contract | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [contractToDelete, setContractToDelete] = React.useState<Contract | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('All');
  const [filterType, setFilterType] = React.useState<string>('All');
  const [sortBy, setSortBy] = React.useState<string>('startDate');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('list');
  const currentPage = 1; // Fixed page for now since pagination is not yet implemented
  const itemsPerPage = 10;

  // Get URL search params and navigate function
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const shouldOpenAddModal = searchParams.get('openAddModal') === 'true';

  // Check URL parameter and open add modal if needed
  React.useEffect(() => {
    if (shouldOpenAddModal) {
      setIsAddModalOpen(true);
      // Remove the parameter from the URL
      searchParams.delete('openAddModal');
      navigate({ search: searchParams.toString() }, { replace: true });
    }
  }, [shouldOpenAddModal, navigate, searchParams]);

  // Apollo queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_CONTRACTS, {
    variables: {
      page: currentPage,
      limit: itemsPerPage,
      searchText: searchTerm || undefined,
      status: filterStatus === 'All' ? undefined : filterStatus,
      type: filterType === 'All' ? undefined : filterType,
      sortBy: sortBy === 'startDate-asc' ? 'startDate' :
              sortBy === 'startDate-desc' ? 'startDate' :
              sortBy === 'amount-high' ? 'rentAmount' :
              sortBy === 'amount-low' ? 'rentAmount' : undefined,
      sortOrder: sortBy === 'startDate-asc' ? 'asc' :
                sortBy === 'startDate-desc' ? 'desc' :
                sortBy === 'amount-low' ? 'asc' : 'desc',
    },
    fetchPolicy: 'cache-and-network',
  });

  const [deleteContractMutation] = useMutation(DELETE_CONTRACT);
  const [createContractMutation] = useMutation(CREATE_CONTRACT);
  const [updateContractMutation] = useMutation(UPDATE_CONTRACT);

  const closeAllModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setDeleteConfirmOpen(false);
    setSelectedContract(null);
    setContractToDelete(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common.loading')}...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">{t('common.errorLoading')}: {error.message}</div>;
  }

  const contracts = data?.contracts?.nodes || [];

  const statusCount = {
    All: contracts.length,
    ACTIVE: contracts.filter((contract: Contract) => contract.status === 'ACTIVE').length,
    EXPIRED: contracts.filter((contract: Contract) => contract.status === 'EXPIRED').length,
    TERMINATED: contracts.filter((contract: Contract) => contract.status === 'TERMINATED').length,
  };

  const typeCount = {
    All: contracts.length,
    LONG_TERM: contracts.filter((contract: Contract) => contract.type === 'LONG_TERM').length,
    SHORT_TERM: contracts.filter((contract: Contract) => contract.type === 'SHORT_TERM').length,
  };

  const statusOptions: SelectOption[] = [
    { value: 'All', label: `${t('common.all')} (${statusCount.All})` },
    { value: 'ACTIVE', label: `${t('contracts.active')} (${statusCount.ACTIVE})` },
    { value: 'EXPIRED', label: `${t('contracts.expired')} (${statusCount.EXPIRED})` },
    { value: 'TERMINATED', label: `${t('contracts.terminated')} (${statusCount.TERMINATED})` },
  ];

  const typeOptions: SelectOption[] = [
    { value: 'All', label: `${t('common.all')} (${typeCount.All})` },
    { value: 'LONG_TERM', label: `${t('contracts.longTerm')} (${typeCount.LONG_TERM})` },
    { value: 'SHORT_TERM', label: `${t('contracts.shortTerm')} (${typeCount.SHORT_TERM})` },
  ];

  const sortByOptions: SelectOption[] = [
    { value: 'startDate-desc', label: t('common.newest') },
    { value: 'startDate-asc', label: t('common.oldest') },
    { value: 'amount-high', label: t('common.priceHighToLow') },
    { value: 'amount-low', label: t('common.priceLowToHigh') },
  ];

  // CRUD handlers
  const handleAddContract = () => {
    closeAllModals();
    setIsAddModalOpen(true);
  };

  const handleEditContract = (contract: Contract) => {
    closeAllModals();
    setSelectedContract(contract);
    setIsEditModalOpen(true);
  };

  const handleViewContract = (contract: Contract) => {
    closeAllModals();
    setSelectedContract(contract);
    setIsViewModalOpen(true);
  };

  const handleDeleteContract = (contract: Contract) => {
    closeAllModals();
    setContractToDelete(contract);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteContract = async () => {
    if (!contractToDelete) return;
    try {
      await deleteContractMutation({
        variables: { id: contractToDelete.id },
      });

      toast.success(t('contracts.contractDeleted'));
      refetch();
    } catch (error) {
      toast.error(`${t('common.error')}: ${error instanceof Error ? error.message : t('common.unknownError')}`);
    }
    setDeleteConfirmOpen(false);
    setContractToDelete(null);
  };

  const handleContractFormSubmit = async (contractData: ContractFormData) => {
    try {
      if (contractData.id) {
        // Update existing contract
        await updateContractMutation({
          variables: {
            id: contractData.id,
            input: {
              roomId: contractData.roomId,
              renterIds: contractData.renterIds,
              startDate: contractData.startDate,
              endDate: contractData.endDate,
              contractType: contractData.contractType || contractData.type,
              amount: parseFloat(contractData.amount.toString()),
              status: contractData.status || 'ACTIVE',
            },
          },
        });
        toast.success(t('contracts.contractUpdated'));
      } else {
        // Create new contract
        await createContractMutation({
          variables: {
            input: {
              roomId: contractData.roomId,
              renterIds: contractData.renterIds,
              startDate: contractData.startDate,
              endDate: contractData.endDate,
              contractType: contractData.contractType || contractData.type,
              amount: parseFloat(contractData.amount.toString()),
              status: 'ACTIVE',
            },
          },
        });
        toast.success(t('contracts.contractCreated'));
      }
      
      refetch();
      closeAllModals();
    } catch (error) {
      console.error('Contract operation error:', error);
      toast.error(`${t('common.error')}: ${error instanceof Error ? error.message : t('common.unknownError')}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-gray-100">{t('navigation.contracts')}</h2>
          <p className="text-secondary-500 dark:text-gray-400">{t('contracts.manageContracts')}</p>
        </div>
        <button
          onClick={handleAddContract}
          className="flex gap-2 items-center btn btn-primary"
        >
          <Plus size={16} />
          <span>{t('contracts.addContract')}</span>
        </button>
      </div>
      <div className="dashboard-card dark:bg-gray-800 dark:border-gray-700">
        <SearchFilterBar
          searchPlaceholder={t('contracts.searchPlaceholder')}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            {
              type: 'dropdown',
              label: t('contracts.status'),
              value: filterStatus,
              options: statusOptions,
              onChange: setFilterStatus,
            },
            {
              type: 'dropdown',
              label: t('contracts.type'),
              value: filterType,
              options: typeOptions,
              onChange: setFilterType,
            },
            {
              type: 'dropdown',
              label: t('common.sortBy'),
              value: sortBy,
              options: sortByOptions,
              onChange: setSortBy,
            },
          ]}
          rightContent={
            <ViewModeSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />
          }
        />

        {contracts.length > 0 ? (
          <ContractsList
            contracts={contracts}
            viewMode={viewMode}
            onEditContract={handleEditContract}
            onViewContract={handleViewContract}
            onDeleteContract={handleDeleteContract}
          />
        ) : (
          <div className="flex justify-center items-center h-40 text-secondary-500 dark:text-gray-400">
            {t('common.noContractsFound')}
          </div>
        )}
      </div>

      {/* Add Contract Form */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={t('contracts.addContract')}
          size="lg"
        >
          <ContractForm
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleContractFormSubmit}
          />
        </Modal>
      )}

      {/* Edit Contract Form */}
      {isEditModalOpen && selectedContract && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={t('contracts.editContract')}
          size="lg"
        >
          <ContractForm
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleContractFormSubmit}
            editData={selectedContract}
          />
        </Modal>
      )}

      {/* View Contract Modal */}
      {selectedContract && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedContract(null);
          }}
          title={t('contracts.contractDetails')}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-secondary-500">{t('contracts.type')}</p>
                <p className="font-medium">
                  {selectedContract.type === 'LONG_TERM' ? t('contracts.longTerm') : t('contracts.shortTerm')}
                </p>
              </div>

              <div>
                <p className="text-sm text-secondary-500">{t('contracts.status')}</p>
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${selectedContract.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        selectedContract.status === 'EXPIRED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                  >
                    {t(`contracts.${selectedContract.status.toLowerCase()}`)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-secondary-500">{t('contracts.renter')}</p>
                <p className="font-medium">{selectedContract.renter.name}</p>
              </div>

              <div>
                <p className="text-sm text-secondary-500">{t('contracts.room')}</p>
                <p className="font-medium">{selectedContract.room.number} {selectedContract.room.name}</p>
              </div>

              <div>
                <p className="text-sm text-secondary-500">{t('contracts.startDate')}</p>
                <p className="font-medium">{formatDate(selectedContract.startDate)}</p>
              </div>

              <div>
                <p className="text-sm text-secondary-500">{t('contracts.endDate')}</p>
                <p className="font-medium">{formatDate(selectedContract.endDate)}</p>
              </div>

              <div>
                <p className="text-sm text-secondary-500">{t('contracts.amount')}</p>
                <p className="font-medium">${selectedContract.rentAmount}</p>
              </div>

              <div>
                <p className="text-sm text-secondary-500">{t('contracts.deposit')}</p>
                <p className="font-medium">${selectedContract.depositAmount}</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditContract(selectedContract);
                }}
                className="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600"
              >
                {t('contracts.editContract')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-40">
          <div className="p-6 w-full max-w-sm bg-white rounded-lg shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">{t('common.confirmDelete')}</h3>
            <p>{t('contracts.confirmDeleteContract')}</p>
            <div className="flex gap-3 justify-end mt-6">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 text-secondary-700 hover:bg-gray-50"
                onClick={() => { setDeleteConfirmOpen(false); setContractToDelete(null); }}
              >
                {t('common.cancel')}
              </button>
              <button
                className="px-4 py-2 text-white rounded-md bg-danger-500 hover:bg-danger-600"
                onClick={confirmDeleteContract}
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractsPage;