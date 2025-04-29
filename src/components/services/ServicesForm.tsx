import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Service } from '../../types';
import { useToastHook } from '../../utils/useToast';

interface ServicesFormProps {
  service?: Service;
  onClose: () => void;
  onSubmit: (service: Omit<Service, 'id'> & { id?: string }) => void;
}

const iconOptions = [
  'zap', 'droplets', 'wifi', 'brush', 'wrench', 'shield', 'scissors', 
  'tv', 'truck', 'trash-2', 'phone', 'trash', 'coffee'
];

const feeTypeOptions = ['Monthly', 'One-time'];

const ServicesForm: React.FC<ServicesFormProps> = ({ 
  service, 
  onClose, 
  onSubmit 
}) => {
  const { error } = useToastHook();
  const [formData, setFormData] = useState<Omit<Service, 'id'> & { id?: string }>({
    name: '',
    icon: 'zap',
    fee: 0,
    feeType: 'Monthly',
    information: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (service) {
      setFormData({ ...service });
    }
  }, [service]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for fee which should be a number
    if (name === 'fee') {
      const numValue = parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field when user edits
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }
    
    if (formData.fee <= 0) {
      newErrors.fee = 'Fee must be greater than 0';
    }
    
    if (!formData.feeType) {
      newErrors.feeType = 'Fee type is required';
    }
    
    if (!formData.icon) {
      newErrors.icon = 'Icon is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    } else {
      error('Please fix the errors in the form');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-xl w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {service ? 'Edit Service' : 'Add New Service'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Service Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Icon Selection */}
          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icon*
            </label>
            <select
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.icon ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            >
              {iconOptions.map((icon) => (
                <option key={icon} value={icon}>
                  {icon.charAt(0).toUpperCase() + icon.slice(1)}
                </option>
              ))}
            </select>
            {errors.icon && <p className="mt-1 text-sm text-red-500">{errors.icon}</p>}
          </div>

          {/* Fee */}
          <div>
            <label htmlFor="fee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fee* ($)
            </label>
            <input
              type="number"
              id="fee"
              name="fee"
              value={formData.fee}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.fee ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.fee && <p className="mt-1 text-sm text-red-500">{errors.fee}</p>}
          </div>

          {/* Fee Type */}
          <div>
            <label htmlFor="feeType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fee Type*
            </label>
            <select
              id="feeType"
              name="feeType"
              value={formData.feeType}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.feeType ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            >
              {feeTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.feeType && <p className="mt-1 text-sm text-red-500">{errors.feeType}</p>}
          </div>

          {/* Information */}
          <div>
            <label htmlFor="information" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="information"
              name="information"
              value={formData.information || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="555-123-4567"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {service ? 'Update Service' : 'Add Service'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServicesForm; 