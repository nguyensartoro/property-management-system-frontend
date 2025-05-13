import React from 'react';
import { Edit, Check, X, Zap, Droplets, Wifi, Brush, Wrench, Shield, Scissors, Tv, Truck, Trash2, Settings, ShowerHead, Fan, Heart } from 'lucide-react';
import Modal from '../shared/Modal';
import { Service } from '../../interface/interfaces';

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  onEdit: (service: Service) => void;
}

// Map of service icon names to their corresponding components
const serviceIconMap = {
  'electricity': <Zap size={24} className="text-primary-500" />,
  'water': <Droplets size={24} className="text-primary-500" />,
  'internet': <Wifi size={24} className="text-primary-500" />,
  'cleaning': <Brush size={24} className="text-primary-500" />,
  'maintenance': <Wrench size={24} className="text-primary-500" />,
  'security': <Shield size={24} className="text-primary-500" />,
  'laundry': <Scissors size={24} className="text-primary-500" />,
  'tv': <Tv size={24} className="text-primary-500" />,
  'garbage': <Trash2 size={24} className="text-primary-500" />,
  'shower': <ShowerHead size={24} className="text-primary-500" />,
  'fan': <Fan size={24} className="text-primary-500" />,
  'health': <Heart size={24} className="text-primary-500" />,
  'moving': <Truck size={24} className="text-primary-500" />,
  'other': <Settings size={24} className="text-primary-500" />,
  
  // Legacy icon names for backward compatibility
  'zap': <Zap size={24} className="text-primary-500" />,
  'droplets': <Droplets size={24} className="text-primary-500" />,
  'wifi': <Wifi size={24} className="text-primary-500" />,
  'brush': <Brush size={24} className="text-primary-500" />,
  'wrench': <Wrench size={24} className="text-primary-500" />,
  'shield': <Shield size={24} className="text-primary-500" />,
  'scissors': <Scissors size={24} className="text-primary-500" />,
  'trash-2': <Trash2 size={24} className="text-primary-500" />,
  'truck': <Truck size={24} className="text-primary-500" />
};

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = (props: ServiceDetailModalProps) => {
  const { isOpen, onClose, service, onEdit } = props;

  if (!isOpen || !service) return null;

  const getServiceIcon = (iconName: string) => {
    // Return the icon if it exists in the map, otherwise return a default icon
    return serviceIconMap[iconName] || <Settings size={24} className="text-primary-500" />;
  };

  const handleEdit = () => {
    onEdit(service);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Service Details" size="md">
      <div className="p-6 min-w-[680px]">
        <div className="flex gap-4 items-start mb-6">
          <div className="p-3 rounded-full bg-primary-50 dark:bg-gray-700">
            {getServiceIcon(service.icon)}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-secondary-900 dark:text-white">{service.name}</h4>
            <div className="flex items-center mt-1">
              <span className="font-medium text-secondary-900 dark:text-white">${service.fee}</span>
              <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">/ {service.feeType}</span>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Status:</span>
              {service.active ? (
                <span className="flex items-center text-green-500">
                  <Check size={16} className="mr-1" /> Active
                </span>
              ) : (
                <span className="flex items-center text-red-500">
                  <X size={16} className="mr-1" /> Inactive
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
            <h5 className="mb-2 font-medium text-secondary-900 dark:text-white">Description</h5>
            <p className="text-secondary-700 dark:text-gray-300">
              {service.description || 'No description available for this service.'}
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-4 mt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-secondary-700 hover:bg-gray-50"
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
      </div>
    </Modal>
  );
};

export default ServiceDetailModal;