import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { useQuery } from '@apollo/client';
import { GET_AVAILABLE_ROOMS, GET_RENTERS } from '@/providers/RenterProvider';

interface Room {
  id: string;
  number: string;
  status: string;
}

interface Renter {
  id: string;
  name: string;
  phone: string;
}

interface ContractInput {
  id?: string;
  roomId: string;
  room?: Room;
  renterIds: string[];
  renters?: Array<{ id: string; name: string }>;
  startDate: string;
  endDate: string;
  contractType: string;
  type?: string;
  status?: string;
  amount: number;
}

interface ContractFormProps {
  onClose: () => void;
  editData?: Record<string, any>;
  onSubmit: (contract: ContractInput) => void;
}

const ContractForm: React.FC<ContractFormProps> = ({
  onClose,
  editData,
  onSubmit,
}) => {
  const isEditMode = !!editData;

  const [roomSelectionOpen, setRoomSelectionOpen] = React.useState(false);
  const [renterSelectionOpen, setRenterSelectionOpen] = React.useState(false);

  const [selectedRoomId, setSelectedRoomId] = React.useState<string>('');
  const [selectedRenterIds, setSelectedRenterIds] = React.useState<string[]>([]);
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [contractType, setContractType] = React.useState<'Short Term' | 'Long Term'>('Short Term');
  const [amount, setAmount] = React.useState<string>('');
  const [termMonths, setTermMonths] = React.useState<number>(1);

  const [startDateCalendarOpen, setStartDateCalendarOpen] = React.useState(false);
  const [endDateCalendarOpen, setEndDateCalendarOpen] = React.useState(false);

  // Fetch available rooms
  const { data: roomsData, loading: roomsLoading } = useQuery(GET_AVAILABLE_ROOMS);
  const rooms = roomsData?.rooms?.nodes || [];

  // Fetch renters
  const { data: rentersData, loading: rentersLoading } = useQuery(GET_RENTERS, {
    variables: { limit: 100 }
  });
  const renters = rentersData?.renters?.nodes || [];

  // Set initial values if in edit mode
  React.useEffect(() => {
    if (editData) {
      setSelectedRoomId(editData.roomId);
      setSelectedRenterIds(editData.renterIds || (editData.renters ? editData.renters.map((r: Renter) => r.id) : []) || []);
      setStartDate(editData.startDate ? new Date(editData.startDate) : undefined);
      setEndDate(editData.endDate ? new Date(editData.endDate) : undefined);
      setContractType(editData.type === 'LONG_TERM' || editData.contractType === 'LONG_TERM' 
        ? 'Long Term' : 'Short Term');
      setAmount(editData.amount?.toString() || editData.rentAmount?.toString() || '');

      // Calculate term months for long term contracts
      if (editData.type === 'LONG_TERM' || editData.contractType === 'LONG_TERM') {
        const start = new Date(editData.startDate);
        const end = new Date(editData.endDate);
        const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 +
                           (end.getMonth() - start.getMonth());
        setTermMonths(diffMonths);
      }
    }
  }, [editData]);

  // Calculate end date based on start date and term length for long term contracts
  React.useEffect(() => {
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
      toast.error("Please select a room");
      return;
    }

    if (selectedRenterIds.length === 0) {
      toast.error("Please select at least one renter");
      return;
    }

    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }

    if (!endDate) {
      toast.error("Please select an end date");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Contract amount must be greater than 0.");
      return;
    }

    const selectedRoom = rooms.find((room: Room) => room.id === selectedRoomId);
    
    const newContract: ContractInput = {
      id: editData?.id,
      roomId: selectedRoomId,
      room: selectedRoom,
      renterIds: selectedRenterIds,
      type: contractType === 'Long Term' ? 'LONG_TERM' : 'SHORT_TERM',
      contractType: contractType === 'Long Term' ? 'LONG_TERM' : 'SHORT_TERM',
      status: 'ACTIVE',
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      amount: parseFloat(amount),
      renters: selectedRenterIds.map(id => {
        const renter = renters.find((r: Renter) => r.id === id);
        return {
          id,
          name: renter?.name || '',
        };
      }),
    };

    onSubmit(newContract);
    toast.success(`Contract ${isEditMode ? 'updated' : 'created'} successfully.`);
  };

  if (roomsLoading || rentersLoading) {
    return <div className="p-6 text-center">Loading resources...</div>;
  }

  const selectedRoom = rooms.find((room: Room) => room.id === selectedRoomId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
        <div>
          <label className="block mb-1 text-sm font-medium text-secondary-700" htmlFor="room">
            Room <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <button
              type="button"
              className="px-4 py-2 w-full text-left rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 hover:bg-gray-50"
              onClick={() => setRoomSelectionOpen(!roomSelectionOpen)}
              disabled={isEditMode}
            >
              {selectedRoom ? `Room ${selectedRoom.number}` : 'Select a room'}
            </button>

            {roomSelectionOpen && !isEditMode && (
              <div className="overflow-y-auto absolute z-10 mt-1 w-full max-h-60 bg-white rounded-md border border-gray-200 shadow-lg">
                <div className="p-2">
                  {rooms.map((room: Room) => (
                    <button
                      type="button"
                      key={room.id}
                      className="flex justify-between items-center px-3 py-2 w-full text-left rounded-md hover:bg-gray-100"
                      onClick={() => handleRoomSelect(room.id)}
                    >
                      <div className="flex items-center">
                        <div className="mr-2">
                          <input
                            type="radio"
                            checked={selectedRoomId === room.id}
                            onChange={() => {}}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-400"
                          />
                        </div>
                        <span>Room {room.number}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        room.status === 'AVAILABLE'
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
          <label className="block mb-1 text-sm font-medium text-secondary-700">
            Renters <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <button
              type="button"
              className="px-4 py-2 w-full text-left rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 hover:bg-gray-50"
              onClick={() => setRenterSelectionOpen(!renterSelectionOpen)}
            >
              {selectedRenterIds.length > 0
                ? `${selectedRenterIds.length} renter(s) selected`
                : 'Select renters'}
            </button>

            {renterSelectionOpen && (
              <div className="overflow-y-auto absolute z-10 mt-1 w-full max-h-60 bg-white rounded-md border border-gray-200 shadow-lg">
                <div className="p-2">
                  {renters.map((renter: Renter) => (
                    <div
                      key={renter.id}
                      className="flex items-center px-3 py-2 w-full text-left rounded-md cursor-pointer hover:bg-gray-100"
                      onClick={() => handleRenterToggle(renter.id)}
                    >
                      <div className="mr-2">
                        <input
                          type="checkbox"
                          checked={selectedRenterIds.includes(renter.id)}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-primary-600 focus:ring-primary-400"
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
          <label className="block mb-1 text-sm font-medium text-secondary-700">
            Start Date <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <div className="flex items-center rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-primary-400">
              <input
                type="text"
                value={formatDate(startDate)}
                readOnly
                placeholder="YYYY-MM-DD"
                className="px-4 py-2 w-full rounded-md focus:outline-none"
              />
              <button
                type="button"
                className="px-3 text-secondary-500"
                onClick={() => setStartDateCalendarOpen(!startDateCalendarOpen)}
              >
                <CalendarIcon size={18} />
              </button>
            </div>

            {startDateCalendarOpen && (
              <div className="absolute right-0 z-20 mt-1">
                <CalendarComponent
                  onSelectDate={handleStartDateSelect}
                  initialDate={startDate}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-secondary-700">
            End Date <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <div className="flex items-center rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-primary-400">
              <input
                type="text"
                value={formatDate(endDate)}
                readOnly
                placeholder="YYYY-MM-DD"
                className="px-4 py-2 w-full rounded-md focus:outline-none"
                disabled={contractType === 'Long Term'}
              />
              <button
                type="button"
                className={`px-3 ${contractType === 'Long Term' ? 'text-secondary-300' : 'text-secondary-500'}`}
                onClick={() => contractType !== 'Long Term' && setEndDateCalendarOpen(!endDateCalendarOpen)}
                disabled={contractType === 'Long Term'}
              >
                <CalendarIcon size={18} />
              </button>
            </div>

            {endDateCalendarOpen && contractType !== 'Long Term' && (
              <div className="absolute right-0 z-20 mt-1">
                <CalendarComponent
                  onSelectDate={handleEndDateSelect}
                  initialDate={endDate}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-secondary-700" htmlFor="contractType">
            Contract Type <span className="text-red-500">*</span>
          </label>

          <select
            id="contractType"
            value={contractType}
            onChange={(e) => setContractType(e.target.value as 'Short Term' | 'Long Term')}
            className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="Long Term">Long Term</option>
            <option value="Short Term">Short Term</option>
          </select>
        </div>

        {contractType === 'Long Term' && (
          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-700" htmlFor="termMonths">
              Term Length <span className="text-red-500">*</span>
            </label>

            <select
              id="termMonths"
              value={termMonths}
              onChange={handleTermMonthsChange}
              className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
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
          <label className="block mb-1 text-sm font-medium text-secondary-700" htmlFor="amount">
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
            className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-md border border-gray-300 text-secondary-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-6 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          {isEditMode ? 'Update Contract' : 'Create Contract'}
        </button>
      </div>
    </form>
  );
};

export default ContractForm;