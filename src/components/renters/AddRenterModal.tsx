import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ROOMS } from '../../providers/RoomProvider';
// import { Calendar, Upload } from 'lucide-react';
import Modal from '../shared/Modal';
import { Room } from '../../interface/interfaces';

interface AddRenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddRenterModal: React.FC<AddRenterModalProps> = ({ isOpen, onClose }: AddRenterModalProps) => {
  const [name, setName] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [phone, setPhone] = React.useState<string>('');
  const [personalId, setPersonalId] = React.useState<string>('');
  const [selectedRoom, setSelectedRoom] = React.useState<string>('');
  const [checkInDate, setCheckInDate] = React.useState<string>('');
  const [checkOutDate, setCheckOutDate] = React.useState<string>('');
  const [isReserved, setIsReserved] = React.useState<boolean>(false);

  const { data } = useQuery(GET_ROOMS, {
    variables: {
      status: "AVAILABLE"
    }
  });
  const availableRooms = data?.rooms?.nodes || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally save the data
    console.log({
      name,
      email,
      phone,
      personalId,
      selectedRoom,
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
    setSelectedRoom('');
    setCheckInDate('');
    setCheckOutDate('');
    setIsReserved(false);
  };

  return (
    <Modal isOpen={isOpen} title="Add New Renter" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-medium text-secondary-700">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex justify-center items-center w-16 h-16 bg-gray-100 rounded-lg border border-gray-300 border-dashed">
                {/* <Upload size={24} className="text-secondary-400" /> */}
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
            <label htmlFor="name" className="block mb-1 text-sm font-medium text-secondary-700">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label htmlFor="personalId" className="block mb-1 text-sm font-medium text-secondary-700">
              Personal ID *
            </label>
            <input
              id="personalId"
              type="text"
              required
              value={personalId}
              onChange={(e) => setPersonalId(e.target.value)}
              className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="e.g. AB12345678"
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-secondary-700">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="e.g. john@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block mb-1 text-sm font-medium text-secondary-700">
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="e.g. 555-123-4567"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="personalIdImage" className="block mb-1 text-sm font-medium text-secondary-700">
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

          <div className="pt-4 border-t border-gray-200 md:col-span-2">
            <h3 className="mb-3 font-medium text-md text-secondary-900">Room Assignment</h3>
          </div>

          <div>
            <label htmlFor="room" className="block mb-1 text-sm font-medium text-secondary-700">
              Assign Room
            </label>
            <select
              id="room"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            >
              <option value="">-- No room assigned --</option>
              {availableRooms.map((room: Room) => (
                <option key={room.id} value={room.id}>
                  Room #{room.number} ({room.name}, ${room.price}/month)
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
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
            <label htmlFor="isReserved" className="block ml-2 text-sm text-secondary-700">
              Reserve this room (mark as 'Reserved' status)
            </label>
          </div>

          <div>
            <label htmlFor="checkInDate" className="block mb-1 text-sm font-medium text-secondary-700">
              Check-in Date
            </label>
            <div className="relative">
              <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                {/* <Calendar size={16} className="text-secondary-400" /> */}
              </div>
              <input
                id="checkInDate"
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="py-2 pr-4 pl-10 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="checkOutDate" className="block mb-1 text-sm font-medium text-secondary-700">
              Check-out Date
            </label>
            <div className="relative">
              <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                {/* <Calendar size={16} className="text-secondary-400" /> */}
              </div>
              <input
                id="checkOutDate"
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="py-2 pr-4 pl-10 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white rounded-md border border-gray-300 text-secondary-700 hover:bg-gray-50"
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