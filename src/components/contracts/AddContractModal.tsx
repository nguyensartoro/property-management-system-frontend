import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { toast } from 'react-hot-toast';
import { Search, Info } from 'lucide-react';

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
    duration: 12, // Default 12 months for long term
    autoRenew: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRenters, setFilteredRenters] = useState<Renter[]>([]);

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
    { id: 'renter4', name: 'Alice Williams', phone: '123-456-7893' },
    { id: 'renter5', name: 'David Brown', phone: '123-456-7894' },
    { id: 'renter6', name: 'Emily Davis', phone: '123-456-7895' },
    { id: 'renter7', name: 'Michael Wilson', phone: '123-456-7896' },
  ];

  // Filter renters when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRenters(availableRenters);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = availableRenters.filter(renter => 
        renter.name.toLowerCase().includes(lowercaseSearch) || 
        renter.phone.includes(searchTerm)
      );
      setFilteredRenters(filtered);
    }
  }, [searchTerm]);

  // Initialize filtered renters on component mount
  useEffect(() => {
    setFilteredRenters(availableRenters);
  }, []);
  
  // Calculate end date based on start date and duration for long term contracts
  useEffect(() => {
    if (form.contractType === 'longTerm' && form.startDate) {
      const startDate = new Date(form.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + form.duration);
      
      // Format the date as YYYY-MM-DD for the input
      const formattedEndDate = endDate.toISOString().split('T')[0];
      setForm(prevForm => ({ ...prevForm, endDate: formattedEndDate }));
    }
  }, [form.startDate, form.duration, form.contractType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prevForm => ({ ...prevForm, [name]: checked }));
    } else {
      setForm(prevForm => ({ ...prevForm, [name]: value }));
    }
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map(option => option.value);
    setForm(prevForm => ({ ...prevForm, renterIds: options }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would normally send this to an API
    console.log('Form submitted:', form);
    
    toast.success('Contract created successfully');
    
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Contract" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent font-vietnam"
            >
              <option value="">Select a room</option>
              {availableRooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} - {room.status}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Renters *
            </label>
            <div className="mb-2 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search renters by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent font-vietnam"
              />
            </div>
            <select
              name="renterIds"
              multiple
              value={form.renterIds}
              onChange={handleMultiSelect}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent h-32 font-vietnam"
            >
              {filteredRenters.map(renter => (
                <option key={renter.id} value={renter.id}>
                  {renter.name} - {renter.phone}
                </option>
              ))}
            </select>
            <p className="text-xs text-secondary-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
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
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent font-vietnam"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent font-vietnam"
            />
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
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent font-vietnam"
            />
          </div>
          
          {form.contractType === 'longTerm' ? (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Duration (Months) *
              </label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                required
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent font-vietnam"
              />
            </div>
          ) : (
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
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent font-vietnam"
              />
            </div>
          )}
          
          {form.contractType === 'longTerm' && (
            <div className="md:col-span-2 flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="autoRenew"
                  name="autoRenew"
                  type="checkbox"
                  checked={form.autoRenew}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
              <div className="ml-2 text-sm">
                <label htmlFor="autoRenew" className="font-medium text-gray-700">
                  Auto Renew
                </label>
                <p className="text-xs text-gray-500 flex items-center mt-0.5">
                  <Info size={12} className="mr-1 text-primary-500" />
                  Contract will automatically renew for the same duration when it expires
                </p>
              </div>
            </div>
          )}
          
          {form.contractType === 'longTerm' && (
            <div className="md:col-span-2">
              <p className="text-sm text-secondary-700 bg-blue-50 p-3 rounded-md border border-blue-200">
                <span className="font-medium block mb-1">End date calculation:</span>
                Based on your selections, this contract will end on <span className="font-semibold">{form.endDate}</span>.
                {form.autoRenew && " It will automatically renew for another " + form.duration + " months upon expiration."}
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-secondary-700 hover:bg-gray-50 font-vietnam"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-primary-500 text-white hover:bg-primary-600 font-vietnam"
          >
            Create Contract
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddContractModal; 