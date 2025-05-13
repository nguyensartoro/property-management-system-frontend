import React from 'react';
import { Plus } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import RentersList from '../components/renters/RentersList';
import ViewModeSwitcher from '../components/shared/ViewModeSwitcher';
import SearchFilterBar from '../components/shared/SearchFilterBar';
import { GET_RENTERS, DELETE_RENTER } from '@/providers/RenterProvider';
import { toast } from 'react-hot-toast';
import RenterForm from '../components/renters/RenterForm';
import Modal from '../components/shared/Modal';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/languageContext';

type SelectOption = { value: string; label: string };

interface Renter {
  id: string;
  name: string;
  email: string;
  phone: string;
  roomId?: string;
  avatar?: string;
  emergencyContact?: string;
  identityNumber?: string;
  room?: {
    id: string;
    number: string;
    name: string;
  };
  documents?: { id: string; name: string; type: string }[];
}

const RentersPage: React.FC = () => {
  const { t } = useLanguage();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [selectedRenter, setSelectedRenter] = React.useState<Renter | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [renterToDelete, setRenterToDelete] = React.useState<Renter | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('All');
  const [sortBy, setSortBy] = React.useState<string>('name');
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

  // Apollo query
  const { data, loading, error, refetch } = useQuery(GET_RENTERS, {
    variables: {
      page: currentPage,
      limit: itemsPerPage,
      searchText: searchTerm || undefined,
      sortBy: sortBy === 'name-asc' ? 'name' :
              sortBy === 'name-desc' ? 'name' :
              sortBy === 'newest' ? 'createdAt' :
              sortBy === 'oldest' ? 'createdAt' : undefined,
      sortOrder: sortBy === 'name-asc' ? 'asc' :
                sortBy === 'name-desc' ? 'desc' :
                sortBy === 'oldest' ? 'asc' : 'desc',
    },
    fetchPolicy: 'cache-and-network',
  });

  const [deleteRenterMutation] = useMutation(DELETE_RENTER);

  const closeAllModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setDeleteConfirmOpen(false);
    setSelectedRenter(null);
    setRenterToDelete(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common.loading')}...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">{t('common.errorLoading')}: {error.message}</div>;
  }

  const renters = data?.renters?.nodes || [];

  const filteredRenters = renters.filter((renter: Renter) => {
    const matchesStatus = filterStatus === 'All' ||
      (filterStatus === 'Active' && renter.roomId) ||
      (filterStatus === 'Inactive' && !renter.roomId);
    return matchesStatus;
  });

  const statusCount = {
    All: renters.length,
    Active: renters.filter((renter: Renter) => renter.roomId).length,
    Inactive: renters.filter((renter: Renter) => !renter.roomId).length,
  };

  const statusOptions: SelectOption[] = [
    { value: 'All', label: `${t('common.all')} (${statusCount.All})` },
    { value: 'Active', label: `${t('common.active')} (${statusCount.Active})` },
    { value: 'Inactive', label: `${t('common.inactive')} (${statusCount.Inactive})` },
  ];

  const sortByOptions: SelectOption[] = [
    { value: 'name-asc', label: t('renters.nameAZ') },
    { value: 'name-desc', label: t('renters.nameZA') },
    { value: 'newest', label: t('common.newest') },
    { value: 'oldest', label: t('common.oldest') },
  ];

  // CRUD handlers
  const handleAddRenter = () => {
    closeAllModals();
    setIsAddModalOpen(true);
  };

  const handleEditRenter = (renter: Renter) => {
    closeAllModals();
    setSelectedRenter(renter);
    setIsEditModalOpen(true);
  };

  const handleViewRenter = (renter: Renter) => {
    closeAllModals();
    setSelectedRenter(renter);
    setIsViewModalOpen(true);
  };

  const handleDeleteRenter = (renter: Renter) => {
    closeAllModals();
    setRenterToDelete(renter);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteRenter = async () => {
    if (!renterToDelete) return;
    try {
      await deleteRenterMutation({
        variables: { id: renterToDelete.id },
      });

      toast.success(t('renters.renterDeleted').replace('{name}', renterToDelete.name));
      refetch();
    } catch (error) {
      toast.error(`${t('common.error')}: ${error instanceof Error ? error.message : t('common.unknownError')}`);
    }
    setDeleteConfirmOpen(false);
    setRenterToDelete(null);
  };

  const handleRenterFormSubmit = () => {
    refetch();
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-gray-100">{t('navigation.renters')}</h2>
          <p className="text-secondary-500 dark:text-gray-400">{t('renters.manageRenters')}</p>
        </div>
        <button
          onClick={handleAddRenter}
          className="flex gap-2 items-center btn btn-primary"
        >
          <Plus size={16} />
          <span>{t('renters.addRenter')}</span>
        </button>
      </div>
      <div className="dashboard-card dark:bg-gray-800 dark:border-gray-700">
        <SearchFilterBar
          searchPlaceholder={t('renters.searchPlaceholder')}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            {
              type: 'dropdown',
              label: t('common.status'),
              value: filterStatus,
              options: statusOptions,
              onChange: setFilterStatus,
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

        {filteredRenters.length > 0 ? (
          <RentersList
            renters={filteredRenters}
            viewMode={viewMode}
            onEditRenter={handleEditRenter}
            onViewRenter={handleViewRenter}
            onDeleteRenter={handleDeleteRenter}
          />
        ) : (
          <div className="flex justify-center items-center h-40 text-secondary-500 dark:text-gray-400">
            {t('common.noRentersFound')}
          </div>
        )}
      </div>

      {/* Add Renter Form */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={t('renters.addRenter')}
          size="lg"
        >
          <RenterForm
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleRenterFormSubmit}
          />
        </Modal>
      )}

      {/* Edit Renter Form */}
      {isEditModalOpen && selectedRenter && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={t('renters.editRenter')}
          size="lg"
        >
          <RenterForm
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleRenterFormSubmit}
            editData={selectedRenter}
          />
        </Modal>
      )}

      {/* View Renter Modal */}
      {selectedRenter && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedRenter(null);
          }}
          title={t('renters.renterDetails')}
          size="md"
        >
          <div className="space-y-4 min-w-[680px]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-secondary-500">{t('renters.name')}</p>
                <p className="font-medium">{selectedRenter.name}</p>
              </div>

              <div>
                <p className="text-sm text-secondary-500">{t('renters.email')}</p>
                <p className="font-medium">{selectedRenter.email || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-secondary-500">{t('renters.phone')}</p>
                <p className="font-medium">{selectedRenter.phone || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-secondary-500">{t('renters.emergencyContact')}</p>
                <p className="font-medium">{selectedRenter.emergencyContact || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-secondary-500">{t('renters.identityNumber')}</p>
                <p className="font-medium">{selectedRenter.identityNumber || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-secondary-500">{t('renters.room')}</p>
                <p className="font-medium">
                  {selectedRenter.roomId ?
                    `${selectedRenter.room?.number || ''} ${selectedRenter.room?.name || ''}` :
                    t('renters.noRoom')}
                </p>
              </div>

              {selectedRenter.documents && selectedRenter.documents.length > 0 && (
                <div className="col-span-2">
                  <p className="mb-2 text-sm text-secondary-500">{t('renters.documents')}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRenter.documents.map((doc: { id: string; name: string; type: string }) => (
                      <div key={doc.id} className="p-2 rounded border">
                        <p className="text-xs">{doc.name}</p>
                        <p className="text-xs text-secondary-500">{doc.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditRenter(selectedRenter);
                }}
                className="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600"
              >
                {t('renters.editRenter')}
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
            <p>{t('renters.confirmDeleteRenter')} <span className="font-bold">{renterToDelete?.name}</span>?</p>
            <div className="flex gap-3 justify-end mt-6">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 text-secondary-700 hover:bg-gray-50"
                onClick={() => { setDeleteConfirmOpen(false); setRenterToDelete(null); }}
              >
                {t('common.cancel')}
              </button>
              <button
                className="px-4 py-2 text-white rounded-md bg-danger-500 hover:bg-danger-600"
                onClick={confirmDeleteRenter}
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

export default RentersPage;