import * as React from 'react';
import { Zap, Droplets, Wifi, Brush, Wrench, Shield, Scissors, Tv, Truck, Trash2, Settings, ShowerHead, Fan, Heart } from 'lucide-react';
import { Service } from '../../interface/interfaces';
import { toast } from 'react-hot-toast';
import Select, { SelectOption } from '../shared/Select';

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

// Convert service icons to select options
const serviceIconOptions: SelectOption[] = serviceIcons.map(icon => ({
  value: icon.name,
  label: icon.name.charAt(0).toUpperCase() + icon.name.slice(1)
}));

// Fee type options
const feeTypeOptions: SelectOption[] = [
  { value: 'ONE_TIME', label: 'One-time' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
];

const ServicesForm: React.FC<ServicesFormProps> = ({ 
  service, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = React.useState<Omit<Service, 'id'> & { id?: string }>({
    name: '',
    icon: 'electricity',
    fee: 0,
    feeType: 'ONE_TIME',
    description: '',
    active: true,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [selectedIconDetails, setSelectedIconDetails] = React.useState<ServiceIcon | null>(null);

  React.useEffect(() => {
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
    <form onSubmit={handleSubmit} className="space-y-4">
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
          className={`w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-vietnam focus:ring-2 dark:focus:ring-primary-500 ${
            errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
          }`}
          placeholder="e.g., Electricity, Water, Internet"
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Icon Selection */}
      <div>
        <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Service Icon*
        </label>
        <div className="mb-2">
          <Select
            label=""
            id="icon"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            options={serviceIconOptions}
            className={errors.icon ? 'border-red-500 focus:ring-red-500' : ''}
          />
          {errors.icon && <p className="mt-1 text-sm text-red-500">{errors.icon}</p>}
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
        <Select
          label=""
          id="feeType"
          name="feeType"
          value={formData.feeType}
          onChange={handleChange}
          options={feeTypeOptions}
          className={errors.feeType ? 'border-red-500 focus:ring-red-500' : ''}
        />
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
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          rows={3}
          placeholder="Service description..."
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
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Active (available for selection)
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-md border border-gray-300 text-secondary-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default ServicesForm; 