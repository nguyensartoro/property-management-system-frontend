import React from 'react';
import { motion } from 'framer-motion';
import { Service } from '../../types';
import ServiceCard from './ServiceCard';
import { useToastHook } from '../../utils/useToast';

interface ServicesListProps {
  services: Service[];
  viewMode: 'grid' | 'list';
  onViewService: (service: Service) => void;
  onEditService: (service: Service) => void;
}

const ServicesList = ({
  services,
  viewMode,
  onViewService,
  onEditService,
}: ServicesListProps) => {
  const { error } = useToastHook();

  const handleViewService = (service: Service) => {
    if (onViewService) {
      onViewService(service);
    } else {
      error('View functionality not implemented');
    }
  };

  const handleEditService = (service: Service) => {
    if (onEditService) {
      onEditService(service);
    } else {
      error('Edit functionality not implemented');
    }
  };

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service: Service, index: number) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <ServiceCard
              service={service}
              viewMode={viewMode}
              onView={() => handleViewService(service)}
              onEdit={() => handleEditService(service)}
            />
          </motion.div>
        ))}
        
        {services.length === 0 && (
          <div className="col-span-full flex justify-center items-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No services found.</p>
          </div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Fee</th>
            <th>Fee Type</th>
            <th>Description</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service: Service) => (
            <tr key={service.id}>
              <td className="font-medium">{service.name}</td>
              <td>${service.fee}</td>
              <td>{service.feeType}</td>
              <td className="text-secondary-500 truncate max-w-xs">
                {service.information || 'No description available'}
              </td>
              <td className="text-right">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleViewService(service)}
                    className="transition-colors text-secondary-500 hover:text-primary-500"
                    aria-label="View details"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditService(service)}
                    className="transition-colors text-secondary-500 hover:text-primary-500"
                    aria-label="Edit service"
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {services.length === 0 && (
        <div className="flex justify-center items-center p-8 bg-gray-50 rounded-lg my-4">
          <p className="text-gray-500">No services found.</p>
        </div>
      )}
    </div>
  );
};

export default ServicesList;