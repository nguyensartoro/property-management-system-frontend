import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useToastHook } from '../../utils/useToast';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({ isOpen, onClose }) => {
  const toast = useToastHook();
  const [roomData, setRoomData] = useState({
    roomNumber: '',
    type: 'Single',
    price: '',
    status: 'Available',
    rentalTerm: 'Monthly',
    services: [] as string[],
    floor: '',
    size: '',
  });

  const availableServices = [
    'Wi-Fi',
    'Air Conditioning',
    'TV',
    'Kitchen',
    'Laundry',
    'Parking',
    'Housekeeping',
    'Utilities Included',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRoomData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceToggle = (service: string) => {
    setRoomData((prev) => {
      const services = [...prev.services];
      
      if (services.includes(service)) {
        return {
          ...prev,
          services: services.filter(s => s !== service),
        };
      } else {
        return {
          ...prev,
          services: [...services, service],
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to an API
    toast.success('Room Added', {
      description: `Room ${roomData.roomNumber} has been created successfully.`
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-secondary-900">Add New Room</h3>
          <button
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="roomNumber">
                Room Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="roomNumber"
                name="roomNumber"
                value={roomData.roomNumber}
                onChange={handleInputChange}
                required
                placeholder="e.g. A101"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="type">
                Room Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={roomData.type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Suite">Suite</option>
                <option value="Studio">Studio</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="floor">
                Floor
              </label>
              <input
                type="text"
                id="floor"
                name="floor"
                value={roomData.floor}
                onChange={handleInputChange}
                placeholder="e.g. 1st, 2nd, 3rd"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="size">
                Size (sqft)
              </label>
              <input
                type="number"
                id="size"
                name="size"
                value={roomData.size}
                onChange={handleInputChange}
                placeholder="e.g. 500"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="price">
                Price ($/month) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={roomData.price}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="e.g. 1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="status">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={roomData.status}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="rentalTerm">
                Rental Term <span className="text-red-500">*</span>
              </label>
              <select
                id="rentalTerm"
                name="rentalTerm"
                value={roomData.rentalTerm}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Services
            </label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {availableServices.map(service => (
                <div key={service} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`service-${service}`}
                    checked={roomData.services.includes(service)}
                    onChange={() => handleServiceToggle(service)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-400 border-gray-300 rounded"
                  />
                  <label htmlFor={`service-${service}`} className="ml-2 text-sm text-secondary-700">
                    {service}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-secondary-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              Add Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal; 