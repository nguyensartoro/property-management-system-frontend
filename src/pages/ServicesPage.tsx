import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import ServicesList from '../components/services/ServicesList';
import ViewModeSwitcher from '../components/shared/ViewModeSwitcher';
import SearchFilterBar from '../components/shared/SearchFilterBar';
import { GET_SERVICES, DELETE_SERVICE } from '@/providers/ServiceProvider';
import Modal from '../components/shared/Modal';
import { useLanguage } from '../utils/languageContext';
import ServicesForm from '@/components/services/ServicesForm';

type FeeType = 'ONE_TIME' | 'MONTHLY' | 'YEARLY';

interface Service {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  fee: number;
  feeType: FeeType;
}

type SelectOption = { value: string; label: string };

const ServicesPage: React.FC = () => {
  const { t } = useLanguage();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<Service | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [serviceToDelete, setServiceToDelete] = React.useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterFeeType, setFilterFeeType] = React.useState<string>('All');
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
  useEffect(() => {
    if (shouldOpenAddModal) {
      setIsAddModalOpen(true);
      // Remove the parameter from the URL
      searchParams.delete('openAddModal');
      navigate({ search: searchParams.toString() }, { replace: true });
    }
  }, [shouldOpenAddModal, navigate, searchParams]);

  const { data, loading, error, refetch } = useQuery(GET_SERVICES, {
    variables: {
      page: currentPage,
      limit: itemsPerPage,
      searchText: searchTerm || undefined,
      sortBy: sortBy === 'name-asc' ? 'name' :
              sortBy === 'name-desc' ? 'name' :
              sortBy === 'fee-high' ? 'fee' :
              sortBy === 'fee-low' ? 'fee' : undefined,
      sortOrder: sortBy === 'name-asc' ? 'asc' :
                 sortBy === 'name-desc' ? 'desc' :
                 sortBy === 'fee-low' ? 'asc' : 'desc',
    },
    fetchPolicy: 'cache-and-network',
  });

  const [deleteServiceMutation] = useMutation(DELETE_SERVICE);

  const closeAllModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setDeleteConfirmOpen(false);
    setSelectedService(null);
    setServiceToDelete(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common.loading')}...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">{t('common.errorLoading')}: {error.message}</div>;
  }

  const services = data?.services?.nodes || [];

  const filteredServices = services.filter((service: Service) => {
    const matchesFeeType = filterFeeType === 'All' ||
      (filterFeeType === 'ONE_TIME' && service.feeType === 'ONE_TIME') ||
      (filterFeeType === 'MONTHLY' && service.feeType === 'MONTHLY') ||
      (filterFeeType === 'YEARLY' && service.feeType === 'YEARLY');
    return matchesFeeType;
  });

  const feeTypeCount = {
    'All': services.length,
    'ONE_TIME': services.filter((service: Service) => service.feeType === 'ONE_TIME').length,
    'MONTHLY': services.filter((service: Service) => service.feeType === 'MONTHLY').length,
    'YEARLY': services.filter((service: Service) => service.feeType === 'YEARLY').length,
  };

  const feeTypeOptions: SelectOption[] = [
    { value: 'All', label: `${t('common.all')} (${feeTypeCount['All']})` },
    { value: 'ONE_TIME', label: `${t('services.oneTime')} (${feeTypeCount['ONE_TIME']})` },
    { value: 'MONTHLY', label: `${t('services.monthly')} (${feeTypeCount['MONTHLY']})` },
    { value: 'YEARLY', label: `${t('services.yearly')} (${feeTypeCount['YEARLY']})` },
  ];

  const sortByOptions: SelectOption[] = [
    { value: 'name-asc', label: t('services.nameAZ') },
    { value: 'name-desc', label: t('services.nameZA') },
    { value: 'fee-high', label: t('services.feeHighToLow') },
    { value: 'fee-low', label: t('services.feeLowToHigh') },
  ];

  // CRUD handlers
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
    setIsViewModalOpen(true);
  };

  const handleDeleteService = (service: Service) => {
    closeAllModals();
    setServiceToDelete(service);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteServiceMutation({
        variables: { id: serviceToDelete.id },
      });

      toast.success(t('services.serviceDeleted').replace('{name}', serviceToDelete.name));
      refetch();
    } catch (error) {
      toast.error(`${t('common.error')}: ${error instanceof Error ? error.message : t('common.unknownError')}`);
    }
    setDeleteConfirmOpen(false);
    setServiceToDelete(null);
  };

  const handleServiceFormSubmit = () => {
    refetch();
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };

  const getFeeTypeLabel = (feeType: FeeType): string => {
    switch (feeType) {
      case 'ONE_TIME':
        return t('services.oneTime');
      case 'MONTHLY':
        return t('services.monthly');
      case 'YEARLY':
        return t('services.yearly');
      default:
        return feeType;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-gray-100">{t('navigation.services')}</h2>
          <p className="text-secondary-500 dark:text-gray-400">{t('services.manageServices')}</p>
        </div>
        <button
          onClick={handleAddService}
          className="flex gap-2 items-center btn btn-primary"
        >
          <Plus size={16} />
          <span>{t('services.addService')}</span>
        </button>
      </div>
      <div className="dashboard-card dark:bg-gray-800 dark:border-gray-700">
        <SearchFilterBar
          searchPlaceholder={t('services.searchPlaceholder')}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            {
              type: 'dropdown',
              label: t('services.feeType'),
              value: filterFeeType,
              options: feeTypeOptions,
              onChange: setFilterFeeType,
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

        {filteredServices.length > 0 ? (
          <ServicesList
            services={filteredServices}
            viewMode={viewMode}
            onViewService={handleViewService}
            onEditService={handleEditService}
            onDeleteService={handleDeleteService}
            getFeeTypeLabel={getFeeTypeLabel}
          />
        ) : (
          <div className="flex justify-center items-center h-40 text-secondary-500 dark:text-gray-400">
            {t('common.noServicesFound')}
          </div>
        )}
      </div>

      {/* Add Service Form */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={t('services.addService')}
          size="lg"
        >
          <ServicesForm
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleServiceFormSubmit}
          />
        </Modal>
      )}

      {/* Edit Service Form */}
      {isEditModalOpen && selectedService && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={t('services.editService')}
          size="lg"
        >
          <ServiceForm
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleServiceFormSubmit}
            editData={selectedService}
          />
        </Modal>
      )}

      {/* View Service Modal */}
      {selectedService && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedService(null);
          }}
          title={t('services.serviceDetails')}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-secondary-500">{t('services.name')}</p>
                <p className="font-medium">{selectedService.name}</p>
              </div>

              <div>
                <p className="text-sm text-secondary-500">{t('services.fee')}</p>
                <p className="font-medium">${selectedService.fee} / {getFeeTypeLabel(selectedService.feeType)}</p>
              </div>

              <div className="col-span-2">
                <p className="text-sm text-secondary-500">{t('services.description')}</p>
                <p className="font-medium">{selectedService.description || t('common.notAvailable')}</p>
              </div>

              <div>
                <p className="text-sm text-secondary-500">{t('services.icon')}</p>
                <p className="font-medium">{selectedService.icon || t('common.notAvailable')}</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditService(selectedService);
                }}
                className="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600"
              >
                {t('services.editService')}
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
            <p>{t('services.confirmDeleteService')} <span className="font-bold">{serviceToDelete?.name}</span>?</p>
            <div className="flex gap-3 justify-end mt-6">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 text-secondary-700 hover:bg-gray-50"
                onClick={() => { setDeleteConfirmOpen(false); setServiceToDelete(null); }}
              >
                {t('common.cancel')}
              </button>
              <button
                className="px-4 py-2 text-white rounded-md bg-danger-500 hover:bg-danger-600"
                onClick={confirmDeleteService}
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

export default ServicesPage;