import React from 'react';
import { Trash2, Edit, Eye } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { useToastHook } from '../../utils/useToast';
import { Service } from '../../types';

interface ServiceCardProps {
  service: Service;
  onEdit?: (serviceId: string) => void;
  onView?: (serviceId: string) => void;
  viewMode: 'grid' | 'list';
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onEdit, 
  onView, 
  viewMode 
}) => {
  const [confirmDelete, setConfirmDelete] = React.useState<boolean>(false);
  const toast = useToastHook();

  const handleDelete = (): void => {
    // Simulating deletion success
    setConfirmDelete(false);
    
    toast.success('Service Deleted', {
      description: `${service.name} has been deleted successfully.`
    });
  };

  const confirmationButtons = confirmDelete ? (
    <div className="flex gap-2 mt-2">
      <button
        onClick={handleDelete}
        className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs"
      >
        Confirm
      </button>
      <button
        onClick={() => setConfirmDelete(false)}
        className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-xs"
      >
        Cancel
      </button>
    </div>
  ) : null;

  const iconSize = viewMode === 'grid' ? 18 : 16;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{service.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{service.information || 'No description available'}</p>
          
          <div className="flex flex-col gap-1 mt-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Fee:</span>
              <span className="font-medium">${service.fee}</span>
              <span className="text-xs text-gray-500">/ {service.feeType}</span>
            </div>
            
            {service.availableRooms && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Available in:</span>
                <StatusBadge status={`${service.availableRooms} rooms`} size="sm" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            {onView && (
              <button 
                onClick={() => onView(service.id)} 
                className="text-gray-500 hover:text-blue-500 transition-colors"
                aria-label="View service details"
              >
                <Eye size={iconSize} />
              </button>
            )}
            
            {onEdit && (
              <button 
                onClick={() => onEdit(service.id)} 
                className="text-gray-500 hover:text-green-500 transition-colors"
                aria-label="Edit service"
              >
                <Edit size={iconSize} />
              </button>
            )}
            
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-gray-500 hover:text-red-500 transition-colors"
              aria-label="Delete service"
            >
              <Trash2 size={iconSize} />
            </button>
          </div>
          
          {confirmationButtons}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;