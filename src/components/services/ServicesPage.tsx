import React from 'react';
import { Plus, Filter, Search, Tag } from 'lucide-react';
import ServicesList from './ServicesList';
import ServiceDetailModal from './ServiceDetailModal';
import AddServiceModal from './AddServiceModal';
import ServiceCategoriesPanel from './ServiceCategoriesPanel';
import { services } from '../../data/mockData';
import ViewModeSwitcher from '../shared/ViewModeSwitcher';
import { useToastHook } from '../../utils/useToast';
import { Service } from '../../types';

const ServicesPage = () => {
  const toast = useToastHook();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<string>('newest');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [servicesList] = React.useState<Service[]>(services);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isCategoriesPanelOpen, setIsCategoriesPanelOpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<Service | null>(null);
  
  // Filter and sort logic
  const filteredServices = servicesList.filter((service: Service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (service.information && service.information.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });
  
  // Sort services
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    if (sortBy === 'oldest') return a.id.localeCompare(b.id);
    // Default: newest first
    return b.id.localeCompare(a.id);
  });
  
  const handleAddService = () => {
    setIsAddModalOpen(true);
    toast.info('Add Service', {
      description: 'Opening service creation form'
    });
  };

  const handleViewService = (service: Service) => {
    setSelectedService(service);
    setIsDetailsModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    toast.info('Edit Service', {
      description: `Editing service: ${service.name}`
    });
    // Implementation for edit functionality would go here
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedService(null);
  };

  const handleToggleCategoriesPanel = () => {
    setIsCategoriesPanelOpen(!isCategoriesPanelOpen);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Services Management</h2>
          <p className="text-secondary-500">Manage all your property services</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleToggleCategoriesPanel}
            className="flex gap-2 items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            aria-label="Manage categories"
          >
            <Tag size={16} />
            <span>Categories</span>
          </button>
          <button 
            onClick={handleAddService}
            className="flex gap-2 items-center btn btn-primary"
          >
            <Plus size={16} />
            <span>Add New Service</span>
          </button>
        </div>
      </div>
      
      <div className="dashboard-card">
        <div className="flex flex-col gap-4 justify-between mb-6 md:flex-row">
          <div className="relative w-full md:w-64">
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search services..."
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
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
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
        
        <ServicesList
          services={sortedServices}
          viewMode={viewMode}
          onViewService={handleViewService}
          onEditService={handleEditService}
        />
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          service={selectedService}
          onEdit={handleEditService}
        />
      )}
      
      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Service Categories Panel */}
      <ServiceCategoriesPanel
        expanded={isCategoriesPanelOpen}
        onClose={() => setIsCategoriesPanelOpen(false)}
      />
    </div>
  );
};

export default ServicesPage;