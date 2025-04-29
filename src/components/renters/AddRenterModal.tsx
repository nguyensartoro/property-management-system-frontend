import React, { useState } from 'react';
import { Calendar, Upload } from 'lucide-react';
import Modal from '../shared/Modal';
import { units } from '../../data/mockData';

interface AddRenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddRenterModal: React.FC<AddRenterModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [personalId, setPersonalId] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [isReserved, setIsReserved] = useState(false);
  
  const availableUnits = units.filter(unit => 
    unit.status === 'Available' || unit.status === 'Reserved'
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally save the data
    console.log({
      name,
      email,
      phone,
      personalId,
      selectedUnit,
      checkInDate,
      checkOutDate,
      isReserved
    });
    
    // Reset form and close modal
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPersonalId('');
    setSelectedUnit('');
    setCheckInDate('');
    setCheckOutDate('');
    setIsReserved(false);
  };
  
  return (
    <Modal isOpen={isOpen} title="Add New Renter" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                <Upload size={24} className="text-secondary-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-gray-50"
                  >
                    Upload Image
                  </button>
                  <span className="text-xs text-secondary-500">
                    JPEG, PNG or GIF (Max. 2MB)
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="e.g. John Doe"
            />
          </div>
          
          <div>
            <label htmlFor="personalId" className="block text-sm font-medium text-secondary-700 mb-1">
              Personal ID *
            </label>
            <input
              id="personalId"
              type="text"
              required
              value={personalId}
              onChange={(e) => setPersonalId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="e.g. AB12345678"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="e.g. john@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-1">
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="e.g. 555-123-4567"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="personalIdImage" className="block text-sm font-medium text-secondary-700 mb-1">
              Personal ID Image (Optional)
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-gray-50"
              >
                Upload ID Image
              </button>
              <span className="text-xs text-secondary-500">
                JPEG, PNG or PDF (Max. 5MB)
              </span>
            </div>
          </div>
          
          <div className="md:col-span-2 border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-secondary-900 mb-3">Room Assignment</h3>
          </div>
          
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-secondary-700 mb-1">
              Assign Room
            </label>
            <select
              id="unit"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            >
              <option value="">-- No room assigned --</option>
              {availableUnits.map(unit => (
                <option key={unit.id} value={unit.id}>
                  Room #{unit.roomNumber} ({unit.type}, ${unit.price}/month)
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="isReserved"
                type="checkbox"
                checked={isReserved}
                onChange={(e) => setIsReserved(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
            </div>
            <label htmlFor="isReserved" className="ml-2 block text-sm text-secondary-700">
              Reserve this room (mark as 'Reserved' status)
            </label>
          </div>
          
          <div>
            <label htmlFor="checkInDate" className="block text-sm font-medium text-secondary-700 mb-1">
              Check-in Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-secondary-400" />
              </div>
              <input
                id="checkInDate"
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="checkOutDate" className="block text-sm font-medium text-secondary-700 mb-1">
              Check-out Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-secondary-400" />
              </div>
              <input
                id="checkOutDate"
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
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
            Add Renter
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddRenterModal;