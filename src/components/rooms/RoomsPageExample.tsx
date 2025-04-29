import React, { useState } from 'react';
import { Unit } from '../../types';
import RoomsList from './RoomsList';
import AddRoomModal from './AddRoomModal';
import EditRoomModal from './EditRoomModal';
import RoomDetailModal from './RoomDetailModal';
import ViewModeSwitcher from '../shared/ViewModeSwitcher';
import { toast } from '../ui/toast';

// Mock data for example
const mockRooms: Unit[] = [
  {
    id: '1',
    roomNumber: 'A101',
    type: 'Single',
    status: 'Available',
    price: 500,
    size: 300,
    floor: '1st',
    services: ['Wi-Fi', 'TV', 'Kitchen'],
    rentalTerm: 'Short',
  },
  {
    id: '2',
    roomNumber: 'A102',
    type: 'Double',
    status: 'Occupied',
    price: 700,
    size: 450,
    floor: '1st',
    services: ['Wi-Fi', 'TV', 'Kitchen', 'Laundry'],
    rentalTerm: 'Long',
    renter: {
      id: 'r1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      personalId: 'ID12345',
      avatar: 'https://i.pravatar.cc/150?u=john'
    }
  },
  {
    id: '3',
    roomNumber: 'B201',
    type: 'Suite',
    status: 'Reserved',
    price: 1000,
    size: 600,
    floor: '2nd',
    services: ['Wi-Fi', 'TV', 'Kitchen', 'Laundry', 'Parking'],
    rentalTerm: 'Long',
  },
  {
    id: '4',
    roomNumber: 'B202',
    type: 'Studio',
    status: 'Maintenance',
    price: 800,
    size: 500,
    floor: '2nd',
    services: ['Wi-Fi', 'TV'],
    rentalTerm: 'Short',
    electricUsage: 245,
    waterUsage: 12,
  }
];

const RoomsPageExample: React.FC = () => {
  const [rooms] = useState<Unit[]>(mockRooms);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Unit | null>(null);

  const handleViewRoom = (room: Unit) => {
    setSelectedRoom(room);
    setIsDetailModalOpen(true);
  };

  const handleEditRoom = (room: Unit) => {
    setSelectedRoom(room);
    setIsEditModalOpen(true);
    setIsDetailModalOpen(false); // Close detail modal if it's open
  };

  const handleDeleteRoom = (room: Unit) => {
    // In a real app, you would delete the room from your backend
    toast.success('Room Deleted', {
      description: `Room ${room.roomNumber} has been successfully deleted.`
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Rooms</h1>
        <div className="flex items-center gap-4">
          <ViewModeSwitcher 
            viewMode={viewMode} 
            onChange={setViewMode} 
          />
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            Add Room
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <RoomsList 
          rooms={rooms}
          viewMode={viewMode}
          onViewRoom={handleViewRoom}
          onEditRoom={handleEditRoom}
          onDeleteRoom={handleDeleteRoom}
        />
      </div>

      {/* Modals */}
      <AddRoomModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditRoomModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        room={selectedRoom}
      />

      <RoomDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        room={selectedRoom}
        onEdit={handleEditRoom}
      />
    </div>
  );
};

export default RoomsPageExample; 