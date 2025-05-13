import React from 'react';
import { Plus } from 'lucide-react';
import { useQuery } from '@apollo/client';
import ServicesList from '../components/services/ServicesList';
import ServiceDetailModal from '../components/services/ServiceDetailModal';
import ViewModeSwitcher from '../components/shared/ViewModeSwitcher';
import { Service } from '../interface/interfaces';
import SearchFilterBar from '../components/shared/SearchFilterBar';
import { toast } from 'react-hot-toast';
import ServicesForm from '../components/services/ServicesForm';
import Modal from '../components/shared/Modal';
import { GET_SERVICES, CREATE_SERVICE, UPDATE_SERVICE, DELETE_SERVICE } from '../providers/ServiceProvider';
import { client } from "../providers/apollo";

const ServicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [feeTypeFilter, setFeeTypeFilter] = React.useState<string>('All');
  const [activeFilter, setActiveFilter] = React.useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = React.useState<string>('newest');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('list');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<Service | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [serviceToDelete, setServiceToDelete] = React.useState<Service | null>(null);
  const [currentPage] = React.useState(1);
  const itemsPerPage = 10;

  // Apollo query
  const { data, loading, error, refetch } = useQuery(GET_SERVICES, {
    variables: {
      page: currentPage,
      limit: itemsPerPage,
      active: activeFilter,
      feeType: feeTypeFilter !== 'All' ? feeTypeFilter : undefined,
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

  const closeAllModals = () => {
    setIsDetailsModalOpen(false);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setDeleteConfirmOpen(false);
    setSelectedService(null);
    setServiceToDelete(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading services...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error loading services: {error.message}</div>;
  }

  const services = data?.services?.nodes || [];

  const handleAddService = () => {
    closeAllModals();
    setIsAddModalOpen(true);
  };
  
  const handleEditService = (service: Service) => {
    closeAllModals();
    setSelectedService(service);
    setIsEditModalOpen(true);
  };
  
  const handleViewService = (service: Service) => {
    closeAllModals();
    setSelectedService(service);
    setIsDetailsModalOpen(true);
  };
  
  const handleDeleteService = (service: Service) => {
    closeAllModals();
    setServiceToDelete(service);
    setDeleteConfirmOpen(true);
  };
  
  const handleCreateService = async (serviceData: Omit<Service, 'id'> & { id?: string }) => {
    try {
      await client.mutate({
        mutation: CREATE_SERVICE,
        variables: { 
          input: {
            name: serviceData.name,
            icon: serviceData.icon,
            fee: serviceData.fee,
            feeType: serviceData.feeType,
            description: serviceData.description,
            active: serviceData.active
          } 
        }
      });
      toast.success(`Service ${serviceData.name} created!`);
      refetch();
      closeAllModals();
    } catch (error) {
      toast.error(`Failed to create service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateService = async (serviceData: Omit<Service, 'id'> & { id?: string }) => {
    if (!selectedService?.id) return;
    
    try {
      await client.mutate({
        mutation: UPDATE_SERVICE,
        variables: { 
          id: selectedService.id,
          input: {
            name: serviceData.name,
            icon: serviceData.icon,
            fee: serviceData.fee,
            feeType: serviceData.feeType,
            description: serviceData.description,
            active: serviceData.active
          } 
        }
      });
      toast.success(`Service ${serviceData.name} updated!`);
      refetch();
      closeAllModals();
    } catch (error) {
      toast.error(`Failed to update service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      await client.mutate({
        mutation: DELETE_SERVICE,
        variables: { id: serviceToDelete.id }
      });
      toast.success(`Service ${serviceToDelete.name} deleted!`);
      refetch();
      closeAllModals();
    } catch (error) {
      toast.error(`Failed to delete service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const sortByOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
  ];

  const feeTypeOptions = [
    { value: 'All', label: 'All Fee Types' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'One-time', label: 'One-time' },
  ];

  const activeOptions = [
    { value: 'All', label: 'All Services' },
    { value: 'active', label: 'Active Only' },
    { value: 'inactive', label: 'Inactive Only' },
  ];

  // Handle active filter change
  const handleActiveFilterChange = (value: string) => {
    switch(value) {
      case 'active':
        setActiveFilter(true);
        break;
      case 'inactive':
        setActiveFilter(false);
        break;
      default:
        setActiveFilter(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-gray-100">Services Management</h2>
          <p className="text-secondary-500 dark:text-gray-400">Manage all your property services</p>
        </div>
        <button
          onClick={handleAddService}
          className="flex gap-2 items-center btn btn-primary"
        >
          <Plus size={16} />
          <span>Add New Service</span>
        </button>
      </div>

      <div className="dashboard-card">
        <SearchFilterBar
          searchPlaceholder="Search services..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            {
              label: 'Fee Type',
              value: feeTypeFilter,
              options: feeTypeOptions,
              onChange: setFeeTypeFilter,
            },
            {
              label: 'Status',
              value: activeFilter === true ? 'active' : activeFilter === false ? 'inactive' : 'All',
              options: activeOptions,
              onChange: handleActiveFilterChange,
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
        <ServicesList
          services={services}
          viewMode={viewMode}
          onViewService={handleViewService}
          onEditService={handleEditService}
          onDeleteService={handleDeleteService}
        />
      </div>
      
      {/* Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal
          isOpen={isDetailsModalOpen}
          onClose={() => closeAllModals()}
          service={selectedService}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            handleEditService(selectedService);
          }}
        />
      )}
      
      {/* Add Service Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => closeAllModals()}
          title="Add New Service"
          size="lg"
        >
          <div className="min-w-[680px]">
            <ServicesForm
              onClose={() => closeAllModals()}
              onSubmit={handleCreateService}
            />
          </div>
        </Modal>
      )}
      
      {/* Edit Service Modal */}
      {isEditModalOpen && selectedService && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => closeAllModals()}
          title="Edit Service"
          size="lg"
        >
          <div className="min-w-[680px]">
            <ServicesForm
              service={selectedService}
              onClose={() => closeAllModals()}
              onSubmit={handleUpdateService}
            />
          </div>
        </Modal>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Confirm Delete</h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete the service <span className="font-bold">{serviceToDelete.name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => closeAllModals()}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={confirmDeleteService}
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

export default ServicesPage;