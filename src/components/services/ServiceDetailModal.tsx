import React from 'react';
import { X, Phone, Edit } from 'lucide-react';
import { Service } from '../../types';
import { motion } from 'framer-motion';
import StatusBadge from '../shared/StatusBadge';
import { useToastHook } from '../../utils/useToast';

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  onEdit: (service: Service) => void;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  isOpen,
  onClose,
  service,
  onEdit,
}) => {
  const toast = useToastHook();

  if (!isOpen || !service) return null;

  const getServiceIcon = (iconName: string) => {
    // Return a simple div with the icon name as we don't have access to dynamic icons
    return (
      <div className="flex justify-center items-center w-6 h-6">
        <span className="text-primary-500" title={iconName}>
          {iconName.charAt(0).toUpperCase() + iconName.slice(1)}
        </span>
      </div>
    );
  };

  const handleEdit = () => {
    onEdit(service);
    toast.info('Edit Service', {
      description: `Editing service: ${service.name}`
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? 'block' : 'hidden'}`}>
      <div className="flex justify-center items-center p-4 min-h-screen">
        <div className="fixed inset-0 transition-opacity bg-black/50" onClick={onClose}></div>

        <motion.div
          className="overflow-hidden relative w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">Service Details</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex gap-4 items-start mb-6">
              <div className="p-3 rounded-full bg-primary-50 dark:bg-gray-700">
                {getServiceIcon(service.icon)}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-secondary-900 dark:text-white">{service.name}</h4>
                <div className="flex items-center mt-1">
                  <span className="font-medium text-secondary-900 dark:text-white">${service.fee}</span>
                  <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">/ {service.feeType}</span>
                  {service.availableRooms && (
                    <div className="ml-3">
                      <StatusBadge status={`${service.availableRooms} rooms`} size="sm" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {/* Information Section */}
              <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                <h5 className="mb-2 font-medium text-secondary-900 dark:text-white">Information</h5>
                <p className="text-secondary-700 dark:text-gray-300">
                  {service.information || 'No additional information available for this service.'}
                </p>
              </div>

              {/* Contact Information */}
              {service.phone && (
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <h5 className="mb-2 font-medium text-secondary-900 dark:text-white">Contact Information</h5>
                  <div className="flex items-center text-secondary-700 dark:text-gray-300">
                    <Phone size={16} className="mr-2 text-primary-500" />
                    <span>{service.phone}</span>
                  </div>
                </div>
              )}

              {/* Usage Statistics - if available */}
              {service.availableRooms && (
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <h5 className="mb-2 font-medium text-secondary-900 dark:text-white">Availability</h5>
                  <p className="text-secondary-700 dark:text-gray-300">
                    This service is available in {service.availableRooms} rooms.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-secondary-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="flex gap-2 items-center px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600"
            >
              <Edit size={16} />
              Edit Service
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ServiceDetailModal;