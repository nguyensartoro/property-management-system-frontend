import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { 
  Zap, 
  Droplets, 
  Wifi, 
  Brush, 
  Wrench, 
  Package,
  Smartphone
} from 'lucide-react';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const serviceIconOptions = [
  { value: 'zap', label: 'Electric', icon: <Zap size={20} /> },
  { value: 'droplets', label: 'Water', icon: <Droplets size={20} /> },
  { value: 'wifi', label: 'Internet', icon: <Wifi size={20} /> },
  { value: 'brush', label: 'Cleaning', icon: <Brush size={20} /> },
  { value: 'wrench', label: 'Maintenance', icon: <Wrench size={20} /> },
  { value: 'package', label: 'Other', icon: <Package size={20} /> },
];

const AddServiceModal: React.FC<AddServiceModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('zap');
  const [fee, setFee] = useState('');
  const [feeType, setFeeType] = useState<'Monthly' | 'One-time'>('Monthly');
  const [information, setInformation] = useState('');
  const [phone, setPhone] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally save the data
    console.log({
      name,
      icon,
      fee: parseFloat(fee),
      feeType,
      information,
      phone
    });
    
    // Reset form and close modal
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setName('');
    setIcon('zap');
    setFee('');
    setFeeType('Monthly');
    setInformation('');
    setPhone('');
  };
  
  return (
    <Modal isOpen={isOpen} title="Add New Service" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
              Service Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="e.g. Electric, Water, Internet"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Icon *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {serviceIconOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setIcon(option.value)}
                  className={`flex items-center gap-2 p-3 rounded-md border ${
                    icon === option.value
                      ? 'border-primary-400 bg-primary-50 text-primary-600'
                      : 'border-gray-200 hover:bg-gray-50 text-secondary-700'
                  }`}
                >
                  <div className="text-current">{option.icon}</div>
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fee" className="block text-sm font-medium text-secondary-700 mb-1">
                Fee Amount (USD) *
              </label>
              <input
                id="fee"
                type="number"
                min="0"
                step="0.01"
                required
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                placeholder="e.g. 50"
              />
            </div>
            
            <div>
              <label htmlFor="feeType" className="block text-sm font-medium text-secondary-700 mb-1">
                Fee Type *
              </label>
              <select
                id="feeType"
                required
                value={feeType}
                onChange={(e) => setFeeType(e.target.value as 'Monthly' | 'One-time')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="Monthly">Monthly</option>
                <option value="One-time">One-time</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="information" className="block text-sm font-medium text-secondary-700 mb-1">
              Information
            </label>
            <textarea
              id="information"
              rows={3}
              value={information}
              onChange={(e) => setInformation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="Service description or additional details"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-1">
              Contact Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Smartphone size={16} className="text-secondary-400" />
              </div>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                placeholder="e.g. 555-123-4567"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-secondary-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Add Service
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddServiceModal;