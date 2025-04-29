import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { useToastHook } from '../../utils/useToast';
import { Calendar as CalendarComponent } from '../ui/calendar';

interface Room {
  id: string;
  roomNumber: string;
  status: string;
}

interface Renter {
  id: string;
  name: string;
  phone: string;
}

interface ContractFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRenter: () => void;
  existingContract?: {
    id: string;
    contractId: string;
    roomId: string;
    roomNumber: string;
    renterIds: string[];
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    amount: number;
  };
  rooms: Room[];
  renters: Renter[];
  onSubmit: (contract: any) => void;
}

const ContractForm: React.FC<ContractFormProps> = ({
  isOpen,
  onClose,
  onAddRenter,
  existingContract,
  rooms,
  renters,
  onSubmit,
}) => {
  const toast = useToastHook();
  const isEditMode = !!existingContract;
  
  const [roomSelectionOpen, setRoomSelectionOpen] = useState(false);
  const [renterSelectionOpen, setRenterSelectionOpen] = useState(false);
  
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedRenterIds, setSelectedRenterIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [contractType, setContractType] = useState<'Short Term' | 'Long Term'>(
    existingContract?.type as any || 'Short Term'
  );
  const [amount, setAmount] = useState<string>('');
  const [termMonths, setTermMonths] = useState<number>(1);
  
  const [startDateCalendarOpen, setStartDateCalendarOpen] = useState(false);
  const [endDateCalendarOpen, setEndDateCalendarOpen] = useState(false);

  // Set initial values if in edit mode
  useEffect(() => {
    if (existingContract) {
      setSelectedRoomId(existingContract.roomId);
      setSelectedRenterIds(existingContract.renterIds);
      setStartDate(new Date(existingContract.startDate));
      setEndDate(new Date(existingContract.endDate));
      setContractType(existingContract.type as any);
      setAmount(existingContract.amount.toString());
      
      // Calculate term months for long term contracts
      if (existingContract.type === 'Long Term') {
        const start = new Date(existingContract.startDate);
        const end = new Date(existingContract.endDate);
        const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + 
                           (end.getMonth() - start.getMonth());
        setTermMonths(diffMonths);
      }
    }
  }, [existingContract]);

  // Calculate end date based on start date and term length for long term contracts
  useEffect(() => {
    if (startDate && contractType === 'Long Term') {
      const newEndDate = new Date(startDate);
      newEndDate.setMonth(newEndDate.getMonth() + termMonths);
      setEndDate(newEndDate);
    }
  }, [startDate, termMonths, contractType]);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    setRoomSelectionOpen(false);
  };

  const handleRenterToggle = (renterId: string) => {
    if (selectedRenterIds.includes(renterId)) {
      setSelectedRenterIds(selectedRenterIds.filter(id => id !== renterId));
    } else {
      setSelectedRenterIds([...selectedRenterIds, renterId]);
    }
  };

  const handleStartDateSelect = (date: Date) => {
    setStartDate(date);
    setStartDateCalendarOpen(false);
    
    // Adjust end date if needed
    if (contractType === 'Long Term') {
      const newEndDate = new Date(date);
      newEndDate.setMonth(newEndDate.getMonth() + termMonths);
      setEndDate(newEndDate);
    }
  };

  const handleEndDateSelect = (date: Date) => {
    setEndDate(date);
    setEndDateCalendarOpen(false);
  };

  const handleTermMonthsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const months = parseInt(e.target.value);
    setTermMonths(months);
    
    if (startDate) {
      const newEndDate = new Date(startDate);
      newEndDate.setMonth(newEndDate.getMonth() + months);
      setEndDate(newEndDate);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoomId) {
      toast.error("Error", {
        description: "Please select a room"
      });
      return;
    }
    
    if (selectedRenterIds.length === 0) {
      toast.error("Error", {
        description: "Please select at least one renter"
      });
      return;
    }
    
    if (!startDate) {
      toast.error("Error", {
        description: "Please select a start date"
      });
      return;
    }
    
    if (!endDate) {
      toast.error("Error", {
        description: "Please select an end date"
      });
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Error", {
        description: "Please enter a valid amount"
      });
      return;
    }

    const newContract = {
      id: existingContract?.id || `contract-${Date.now()}`,
      contractId: existingContract?.contractId || `contract${Math.floor(Math.random() * 100) + 1}`,
      roomId: selectedRoomId,
      roomNumber: rooms.find(room => room.id === selectedRoomId)?.roomNumber || '',
      renterIds: selectedRenterIds,
      type: contractType,
      status: 'Active',
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      amount: parseFloat(amount),
      renters: selectedRenterIds.map(id => {
        const renter = renters.find(r => r.id === id);
        return {
          id,
          name: renter?.name || '',
        };
      }),
    };

    onSubmit(newContract);
    onClose();
  };

  if (!isOpen) return null;

  const selectedRoom = rooms.find(room => room.id === selectedRoomId);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-secondary-900">
            {isEditMode ? 'Edit Contract' : 'Add New Contract'}
          </h3>
          <button
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700 p-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="room">
                Room <span className="text-red-500">*</span>
              </label>
              
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 hover:bg-gray-50"
                  onClick={() => setRoomSelectionOpen(!roomSelectionOpen)}
                  disabled={isEditMode}
                >
                  {selectedRoom ? `${selectedRoom.roomNumber}` : 'Select a room'}
                </button>
                
                {roomSelectionOpen && !isEditMode && (
                  <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                    <div className="p-2">
                      {rooms.map(room => (
                        <button
                          type="button"
                          key={room.id}
                          className="flex justify-between items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md"
                          onClick={() => handleRoomSelect(room.id)}
                        >
                          <div className="flex items-center">
                            <div className="mr-2">
                              <input 
                                type="radio" 
                                checked={selectedRoomId === room.id}
                                onChange={() => {}}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-400"
                              />
                            </div>
                            <span>Room {room.roomNumber}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            room.status === 'Available' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {room.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Renters <span className="text-red-500">*</span>
              </label>
              
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 hover:bg-gray-50"
                  onClick={() => setRenterSelectionOpen(!renterSelectionOpen)}
                >
                  {selectedRenterIds.length > 0 
                    ? `${selectedRenterIds.length} renter(s) selected` 
                    : 'Select renters'}
                </button>
                
                {renterSelectionOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <div className="flex justify-between items-center p-2 border-b border-gray-200">
                        <p className="text-xs text-secondary-500">Hold Ctrl/Cmd to select multiple</p>
                        <button
                          type="button"
                          className="text-xs text-primary-600 hover:text-primary-700"
                          onClick={onAddRenter}
                        >
                          + Add New Renter
                        </button>
                      </div>
                      
                      {renters.map(renter => (
                        <div
                          key={renter.id}
                          className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md cursor-pointer"
                          onClick={() => handleRenterToggle(renter.id)}
                        >
                          <div className="mr-2">
                            <input 
                              type="checkbox" 
                              checked={selectedRenterIds.includes(renter.id)}
                              onChange={() => {}}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-400 rounded"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{renter.name}</p>
                            <p className="text-xs text-secondary-500">{renter.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              
              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-primary-400">
                  <input
                    type="text"
                    value={formatDate(startDate)}
                    readOnly
                    placeholder="dd/mm/yyyy"
                    className="w-full px-4 py-2 focus:outline-none rounded-md"
                  />
                  <button
                    type="button"
                    className="px-3 text-secondary-500"
                    onClick={() => setStartDateCalendarOpen(!startDateCalendarOpen)}
                  >
                    <Calendar size={18} />
                  </button>
                </div>
                
                {startDateCalendarOpen && (
                  <div className="absolute z-20 mt-1 right-0">
                    <CalendarComponent 
                      onSelectDate={handleStartDateSelect}
                      initialDate={startDate}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              
              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-primary-400">
                  <input
                    type="text"
                    value={formatDate(endDate)}
                    readOnly
                    placeholder="dd/mm/yyyy"
                    className="w-full px-4 py-2 focus:outline-none rounded-md"
                    disabled={contractType === 'Long Term'}
                  />
                  <button
                    type="button"
                    className={`px-3 ${contractType === 'Long Term' ? 'text-secondary-300' : 'text-secondary-500'}`}
                    onClick={() => contractType !== 'Long Term' && setEndDateCalendarOpen(!endDateCalendarOpen)}
                    disabled={contractType === 'Long Term'}
                  >
                    <Calendar size={18} />
                  </button>
                </div>
                
                {endDateCalendarOpen && contractType !== 'Long Term' && (
                  <div className="absolute z-20 mt-1 right-0">
                    <CalendarComponent 
                      onSelectDate={handleEndDateSelect}
                      initialDate={endDate}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="contractType">
                Contract Type <span className="text-red-500">*</span>
              </label>
              
              <select
                id="contractType"
                value={contractType}
                onChange={(e) => setContractType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="Long Term">Long Term</option>
                <option value="Short Term">Short Term</option>
              </select>
            </div>
            
            {contractType === 'Long Term' && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="termMonths">
                  Term Length <span className="text-red-500">*</span>
                </label>
                
                <select
                  id="termMonths"
                  value={termMonths}
                  onChange={handleTermMonthsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                    <option key={month} value={month}>
                      {month} {month === 1 ? 'month' : 'months'}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="amount">
                Amount (USD) <span className="text-red-500">*</span>
              </label>
              
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1000"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-secondary-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {isEditMode ? 'Update Contract' : 'Create Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractForm; 