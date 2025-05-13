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
    return <div className="flex justify-center items-center h-64">Loading renters...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error loading renters: {error.message}</div>;
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
    { value: 'All', label: `All (${statusCount.All})` },
    { value: 'Active', label: `Active (${statusCount.Active})` },
    { value: 'Inactive', label: `Inactive (${statusCount.Inactive})` },
  ];

  const sortByOptions: SelectOption[] = [
    { value: 'name-asc', label: 'Name: A-Z' },
    { value: 'name-desc', label: 'Name: Z-A' },
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
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
      const { data } = await deleteRenterMutation({
        variables: { id: renterToDelete.id },
      });
      
      toast.success(`Renter ${renterToDelete.name} deleted!`);
      refetch();
    } catch (error) {
      toast.error(`Failed to delete renter: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          <h2 className="text-2xl font-bold text-secondary-900">Renters Management</h2>
          <p className="text-secondary-500">Manage all your renters</p>
        </div>
        <button
          onClick={handleAddRenter}
          className="flex gap-2 items-center btn btn-primary"
        >
          <Plus size={16} />
          <span>Add New Renter</span>
        </button>
      </div>
      <div className="dashboard-card">
        <SearchFilterBar
          searchPlaceholder="Search by name, email, or phone..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            {
              label: 'Status',
              value: filterStatus,
              options: statusOptions,
              onChange: setFilterStatus,
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
        <RentersList
          renters={filteredRenters}
          viewMode={viewMode}
          onEditRenter={handleEditRenter}
          onViewRenter={handleViewRenter}
          onDeleteRenter={handleDeleteRenter}
        />
      </div>
      
      {/* Add Renter Form */}
      <RenterForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleRenterFormSubmit}
        closeOtherModals={closeAllModals}
      />
      
      {/* Edit Renter Form */}
      {selectedRenter && (
        <RenterForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRenter(null);
          }}
          onSubmit={handleRenterFormSubmit}
          editData={selectedRenter}
          closeOtherModals={closeAllModals}
        />
      )}
      
      {/* View Renter Modal */}
      {selectedRenter && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedRenter(null);
          }}
          title="Renter Details"
          size="md"
        >
          <div className="space-y-4 min-w-[680px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-500">Name</p>
                <p className="font-medium">{selectedRenter.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-secondary-500">Email</p>
                <p className="font-medium">{selectedRenter.email || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm text-secondary-500">Phone</p>
                <p className="font-medium">{selectedRenter.phone || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm text-secondary-500">Emergency Contact</p>
                <p className="font-medium">{selectedRenter.emergencyContact || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm text-secondary-500">Identity Number</p>
                <p className="font-medium">{selectedRenter.identityNumber || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm text-secondary-500">Room</p>
                <p className="font-medium">
                  {selectedRenter.roomId ? 
                    `${selectedRenter.room?.number || ''} ${selectedRenter.room?.name || ''}` : 
                    'No room assigned'}
                </p>
              </div>

              {selectedRenter.documents && selectedRenter.documents.length > 0 && (
                <div className="col-span-2">
                  <p className="text-sm text-secondary-500 mb-2">Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRenter.documents.map((doc) => (
                      <div key={doc.id} className="p-2 border rounded">
                        <p className="text-xs">{doc.name}</p>
                        <p className="text-xs text-secondary-500">{doc.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false); 
                  handleEditRenter(selectedRenter);
                }}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
              >
                Edit Renter
              </button>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete renter <span className="font-bold">{renterToDelete?.name}</span>?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 text-secondary-700 hover:bg-gray-50"
                onClick={() => { setDeleteConfirmOpen(false); setRenterToDelete(null); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white rounded-md bg-danger-500 hover:bg-danger-600"
                onClick={confirmDeleteRenter}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentersPage;