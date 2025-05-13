import React, { useState, useEffect } from 'react';
import { X, Zap, Droplets, Wifi, Brush, Wrench, Shield, Scissors, Tv, Truck, Trash2, Settings, ShowerHead, Fan, Heart } from 'lucide-react';
import { Service } from '../../interface/interfaces';
import { toast } from 'react-hot-toast';

interface ServicesFormProps {
  service?: Service;
  onClose: () => void;
  onSubmit: (service: Omit<Service, 'id'> & { id?: string }) => void;
}

interface ServiceIcon {
  name: string;
  icon: React.ReactNode;
  description: string;
}

// Define service icons with descriptions
const serviceIcons: ServiceIcon[] = [
  { name: 'electricity', icon: <Zap size={20} className="text-primary-500" />, description: 'Electricity service' },
  { name: 'water', icon: <Droplets size={20} className="text-primary-500" />, description: 'Water service' },
  { name: 'internet', icon: <Wifi size={20} className="text-primary-500" />, description: 'Internet/WiFi service' },
  { name: 'cleaning', icon: <Brush size={20} className="text-primary-500" />, description: 'Cleaning service' },
  { name: 'maintenance', icon: <Wrench size={20} className="text-primary-500" />, description: 'Maintenance service' },
  { name: 'security', icon: <Shield size={20} className="text-primary-500" />, description: 'Security service' },
  { name: 'laundry', icon: <Scissors size={20} className="text-primary-500" />, description: 'Laundry service' },
  { name: 'tv', icon: <Tv size={20} className="text-primary-500" />, description: 'TV/Cable service' },
  { name: 'garbage', icon: <Trash2 size={20} className="text-primary-500" />, description: 'Garbage collection' },
  { name: 'shower', icon: <ShowerHead size={20} className="text-primary-500" />, description: 'Hot water service' },
  { name: 'fan', icon: <Fan size={20} className="text-primary-500" />, description: 'Air conditioning' },
  { name: 'health', icon: <Heart size={20} className="text-primary-500" />, description: 'Health service' },
  { name: 'moving', icon: <Truck size={20} className="text-primary-500" />, description: 'Moving service' },
  { name: 'other', icon: <Settings size={20} className="text-primary-500" />, description: 'Other services' },
];

// Reusable dropdown with icons
interface IconDropdownProps {
  id: string;
  value: string;
  options: ServiceIcon[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  className?: string;
}

const IconDropdown: React.FC<IconDropdownProps> = ({ 
  id, 
  value, 
  options, 
  onChange, 
  error, 
  className = '' 
}) => {
  return (
    <div className="relative">
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border rounded-md appearance-none pr-10 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
        } ${className}`}
      >
        {options.map((option) => (
          <option key={option.name} value={option.name}>
            {option.name.charAt(0).toUpperCase() + option.name.slice(1)}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

const ServicesForm: React.FC<ServicesFormProps> = ({ 
  service, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<Omit<Service, 'id'> & { id?: string }>({
    name: '',
    icon: 'electricity',
    fee: 0,
    feeType: 'Monthly',
    description: '',
    active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedIconDetails, setSelectedIconDetails] = useState<ServiceIcon | null>(null);

  useEffect(() => {
    if (service) {
      setFormData({ ...service });
      const foundIcon = serviceIcons.find(icon => icon.name === service.icon);
      setSelectedIconDetails(foundIcon || null);
    } else {
      // Default to electricity for new services
      setSelectedIconDetails(serviceIcons[0]);
    }
  }, [service]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Special handling for fee which should be a number
    if (name === 'fee') {
      const numValue = parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } 
    // Handle checkbox for active status
    else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    }
    // Handle icon selection
    else if (name === 'icon') {
      setFormData(prev => ({ ...prev, [name]: value }));
      const foundIcon = serviceIcons.find(icon => icon.name === value);
      setSelectedIconDetails(foundIcon || null);
    }
    else {
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
      toast.error('Please fix the errors in the form');
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
              Service Icon*
            </label>
            <div className="mb-2">
              <IconDropdown
                id="icon"
                value={formData.icon}
                options={serviceIcons}
                onChange={handleChange}
                error={errors.icon}
              />
            </div>
            
            {/* Preview the selected icon */}
            {selectedIconDetails && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                {selectedIconDetails.icon}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedIconDetails.name.charAt(0).toUpperCase() + selectedIconDetails.name.slice(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedIconDetails.description}
                  </p>
                </div>
              </div>
            )}
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
              <option value="Monthly">Monthly</option>
              <option value="One-time">One-time</option>
            </select>
            {errors.feeType && <p className="mt-1 text-sm text-red-500">{errors.feeType}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Active (available for selection)
            </label>
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