import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../stores/propertyStore';
import PropertyList from '../components/properties/PropertyList';
import { PageHeader } from '../components/shared/PageHeader';
import { SearchFilterBar } from '../components/shared/SearchFilterBar';
import { useToast } from '../hooks/use-toast';
import CreatePropertyModal from '../components/properties/CreatePropertyModal';
import { Plus } from 'lucide-react';

const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get property store
  const { 
    properties, 
    isLoading, 
    error, 
    pagination,
    fetchProperties,
    createProperty,
    deleteProperty
  } = usePropertyStore();

  // State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch properties on mount and when dependencies change
  useEffect(() => {
    fetchProperties(currentPage, itemsPerPage, searchTerm);
  }, [fetchProperties, currentPage, itemsPerPage, searchTerm]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle property creation
  const handleCreateProperty = async (propertyData: { name: string; address: string }) => {
    try {
      await createProperty(propertyData);
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Property created successfully",
      });
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: "Error",
        description: "Failed to create property",
        variant: "destructive",
      });
    }
  };

  // Handle property deletion
  const handleDeleteProperty = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(id);
        toast({
          title: "Success",
          description: "Property deleted successfully",
        });
      } catch (error) {
        console.error('Error deleting property:', error);
        toast({
          title: "Error",
          description: "Failed to delete property",
          variant: "destructive",
        });
      }
    }
  };

  // Handle view property details
  const handleViewProperty = (id: string) => {
    navigate(`/properties/${id}`);
  };

  // Handle edit property
  const handleEditProperty = (id: string) => {
    navigate(`/properties/${id}/edit`);
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <PageHeader
        title="Properties"
        description="Manage your rental properties"
        actions={[
          {
            label: 'Add Property',
            onClick: () => setIsCreateModalOpen(true),
            variant: 'primary',
            icon: <Plus className="w-4 h-4" />
          },
        ]}
      />

      <SearchFilterBar
        onSearch={handleSearch}
        placeholder="Search properties..."
        filters={[]} // No specific filters for properties yet
      />

      {error && (
        <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 rounded border border-red-400" role="alert">
          <p>Error loading properties: {error}</p>
        </div>
      )}

      <PropertyList
        properties={properties}
        loading={isLoading}
        onDelete={handleDeleteProperty}
        onEdit={handleEditProperty}
        onView={handleViewProperty}
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-5">
          <nav className="inline-flex relative z-0 -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {Array.from({ length: pagination.totalPages }).map((_, index) => (
              <button
                key={index}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === index + 1
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </nav>
        </div>
      )}

      <CreatePropertyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProperty}
      />
    </div>
  );
};

export default PropertiesPage;