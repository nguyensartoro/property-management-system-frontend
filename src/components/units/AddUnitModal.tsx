import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { renters, services } from '../../data/mockData';

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddUnitModal: React.FC<AddUnitModalProps> = ({ isOpen, onClose }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [type, setType] = useState('Single');
  const [price, setPrice] = useState('');
  const [rentalTerm, setRentalTerm] = useState('Long');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedRenter, setSelectedRenter] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  const handleServiceToggle = (serviceName: string) => {
    if (selectedServices.includes(serviceName)) {
      setSelectedServices(selectedServices.filter(name => name !== serviceName));
    } else {
      setSelectedServices([...selectedServices, serviceName]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally save the data
    console.log({
      roomNumber,
      type,
      price,
      rentalTerm,
      checkInDate,
      checkOutDate,
      selectedRenter,
      selectedServices
    });
    
    // Reset form and close modal
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setRoomNumber('');
    setType('Single');
    setPrice('');
    setRentalTerm('Long');
    setCheckInDate('');
    setCheckOutDate('');
    setSelectedRenter('');
    setSelectedServices([]);
  };
  
  return (
    <Modal isOpen={isOpen} title="Add New Unit" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="roomNumber" className="block text-sm font-medium text-secondary-700 mb-1">
              Room Number *
            </label>
            <input
              id="roomNumber"
              type="text"
              required
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="e.g. 101"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-secondary-700 mb-1">
              Room Type *
            </label>
            <select
              id="type"
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            >
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Suite">Suite</option>
              <option value="Studio">Studio</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-secondary-700 mb-1">
              Price per Month (USD) *
            </label>
            <input
              id="price"
              type="number"
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="e.g. 500"
            />
          </div>
          
          <div>
            <label htmlFor="rentalTerm" className="block text-sm font-medium text-secondary-700 mb-1">
              Rental Term *
            </label>
            <select
              id="rentalTerm"
              required
              value={rentalTerm}
              onChange={(e) => setRentalTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            >
              <option value="Long">Long Term</option>
              <option value="Short">Short Term</option>
            </select>
          </div>
          
          {rentalTerm === 'Short' && (
            <>
              <div>
                <label htmlFor="checkInDate" className="block text-sm font-medium text-secondary-700 mb-1">
                  Check-in Date *
                </label>
                <input
                  id="checkInDate"
                  type="date"
                  required={rentalTerm === 'Short'}
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="checkOutDate" className="block text-sm font-medium text-secondary-700 mb-1">
                  Check-out Date *
                </label>
                <input
                  id="checkOutDate"
                  type="date"
                  required={rentalTerm === 'Short'}
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
            </>
          )}
          
          <div className="md:col-span-2">
            <label htmlFor="renter" className="block text-sm font-medium text-secondary-700 mb-1">
              Assign to Renter
            </label>
            <div className="flex items-center space-x-4">
              <select
                id="renter"
                value={selectedRenter}
                onChange={(e) => setSelectedRenter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="">-- No renter assigned --</option>
                {renters.map(renter => (
                  <option key={renter.id} value={renter.id}>
                    {renter.name} ({renter.phone})
                  </option>
                ))}
              </select>
              
              <button
                type="button"
                className="btn btn-outline whitespace-nowrap"
              >
                Add New Renter
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Services Included
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {services.map(service => (
              <div key={service.id} className="flex items-center">
                <input
                  id={`service-${service.id}`}
                  type="checkbox"
                  checked={selectedServices.includes(service.name)}
                  onChange={() => handleServiceToggle(service.name)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor={`service-${service.id}`} className="ml-2 text-sm text-secondary-700">
                  {service.name}
                </label>
              </div>
            ))}
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
            Create Unit
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddUnitModal;