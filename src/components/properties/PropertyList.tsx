import React from 'react';
import { Property } from '../../utils/apiClient';
import { Edit, Eye, Trash2, Home } from 'lucide-react';

interface PropertyListProps {
  properties: Property[];
  loading: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  loading,
  onDelete,
  onEdit,
  onView,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="flex justify-end space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="flex justify-center mb-4">
          <Home className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-500 mb-4">
          You haven't added any properties yet. Add your first property to get started.
        </p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => {}}
        >
          Add Property
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {properties.map((property) => (
        <div
          key={property.id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-1">{property.name}</h3>
            <p className="text-gray-500 text-sm mb-3">{property.address}</p>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {property._count?.rooms || 0} rooms
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onView(property.id)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  title="View details"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onEdit(property.id)}
                  className="p-1 text-gray-500 hover:text-amber-600 transition-colors"
                  title="Edit property"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(property.id)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  title="Delete property"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropertyList;