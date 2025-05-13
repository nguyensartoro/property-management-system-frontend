import React from 'react';
import { Edit, Trash2, Info } from 'lucide-react';
import { Service } from '../../interface/interfaces';
import ServiceCard from './ServiceCard';
import { toast } from 'react-hot-toast';

interface ServicesListProps {
  services: Service[];
  viewMode: 'grid' | 'list';
  onViewService: (service: Service) => void;
  onEditService: (service: Service) => void;
  onDeleteService: (service: Service) => void;
}

const ServicesList: React.FC<ServicesListProps> = ({
  services,
  viewMode,
  onViewService,
  onEditService,
  onDeleteService,
}: ServicesListProps) => {
  const handleViewService = (service: Service) => {
    if (onViewService) {
      onViewService(service);
    } else {
      toast.error('View functionality not implemented');
    }
  };

  const handleEditService = (service: Service) => {
    if (onEditService) {
      onEditService(service);
    } else {
      toast.error('Edit functionality not implemented');
    }
  };

  const getFeeTypeLabel = (feeType: string): string => {
    switch (feeType) {
      case 'one-time':
        return 'One-time fee';
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      default:
        return feeType;
    }
  };

  if (services.length === 0) {
    return (
      <div className="p-4 text-center text-secondary-500 dark:text-gray-400">
        No services found. Try adjusting your search or filters.
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onView={() => handleViewService(service)}
            onEdit={() => handleEditService(service)}
            onDelete={() => onDeleteService(service)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Fee</th>
            <th>Billing Cycle</th>
            <th>Information</th>
            <th>Phone</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td className="flex items-center gap-3">
                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <span className="material-icons text-secondary-700 dark:text-gray-300">
                    {service.icon || 'help_outline'}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{service.name}</div>
                </div>
              </td>
              <td>${service.fee?.toFixed(2)}</td>
              <td>{getFeeTypeLabel(service.feeType)}</td>
              <td className="max-w-xs truncate">{service.information || 'No description'}</td>
              <td>{service.phone || 'N/A'}</td>
              <td>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleViewService(service)}
                    className="p-1 text-secondary-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                    title="View service details"
                  >
                    <Info size={18} />
                  </button>
                  <button
                    onClick={() => handleEditService(service)}
                    className="p-1 text-secondary-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                    title="Edit service"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteService(service)}
                    className="p-1 text-secondary-700 hover:text-danger-600 dark:text-gray-300 dark:hover:text-danger-400"
                    title="Delete service"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesList;