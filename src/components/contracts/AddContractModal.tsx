import React, { useState } from 'react';
import { X } from 'lucide-react';
import Modal from '../shared/Modal';
import { toast } from '../ui/toast';

interface Room {
  id: string;
  name: string;
  status: string;
}

interface Renter {
  id: string;
  name: string;
  phone: string;
}

interface AddContractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddContractModal: React.FC<AddContractModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    roomId: '',
    renterIds: [] as string[],
    startDate: '',
    endDate: '',
    contractType: 'longTerm',
    amount: '',
  });

  // Mocked data for the example
  const availableRooms: Room[] = [
    { id: 'room1', name: 'Room 101', status: 'Available' },
    { id: 'room2', name: 'Room 202', status: 'Available' },
    { id: 'room3', name: 'Room 303', status: 'Available' },
  ];

  const availableRenters: Renter[] = [
    { id: 'renter1', name: 'John Doe', phone: '123-456-7890' },
    { id: 'renter2', name: 'Jane Smith', phone: '123-456-7891' },
    { id: 'renter3', name: 'Robert Johnson', phone: '123-456-7892' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map(option => option.value);
    setForm(prevForm => ({ ...prevForm, renterIds: options }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would normally send this to an API
    console.log('Form submitted:', form);
    
    toast({
      title: 'Success',
      description: 'Contract created successfully',
      type: 'success',
    });
    
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg overflow-hidden max-w-2xl w-full">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-secondary-900">Add New Contract</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors text-secondary-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Room *
              </label>
              <select
                name="roomId"
                value={form.roomId}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="">Select a room</option>
                {availableRooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} - {room.status}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Renters *
              </label>
              <select
                name="renterIds"
                multiple
                value={form.renterIds}
                onChange={handleMultiSelect}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent h-32"
              >
                {availableRenters.map(renter => (
                  <option key={renter.id} value={renter.id}>
                    {renter.name} - {renter.phone}
                  </option>
                ))}
              </select>
              <p className="text-xs text-secondary-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Contract Type *
              </label>
              <select
                name="contractType"
                value={form.contractType}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="longTerm">Long Term</option>
                <option value="shortTerm">Short Term</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Amount (USD) *
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Create Contract
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddContractModal; 