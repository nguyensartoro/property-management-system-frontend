import React, { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { units } from '../../data/mockData';
import RoomsList from './RoomsList';
import AddRoomModal from './AddRoomModal';
import StatusBadge from '../shared/StatusBadge';
import { useToastHook } from '../../utils/useToast';
import ViewModeSwitcher from '../shared/ViewModeSwitcher';
import { Unit } from '../../types';
import EditRoomModal from './EditRoomModal';
import RoomDetailModal from './RoomDetailModal';

const RoomsPage: React.FC = () => {
  const toast = useToastHook();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Unit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRooms = units.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || room.status === filterStatus;
    const matchesType = filterType === 'All' || room.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'newest') return b.id.localeCompare(a.id);
    return a.roomNumber.localeCompare(b.roomNumber);
  });

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = sortedRooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const roomStatusCount = {
    All: units.length,
    Occupied: units.filter(unit => unit.status === 'Occupied').length,
    Available: units.filter(unit => unit.status === 'Available').length,
    Reserved: units.filter(unit => unit.status === 'Reserved').length,
    Maintenance: units.filter(unit => unit.status === 'Maintenance').length,
  };

  const handleAddRoom = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    toast.success('Success', {
      description: 'Room has been created successfully'
    });
  };

  const handleViewRoom = (room: Unit) => {
    if (room) {
      setSelectedRoom(room);
      setIsDetailsModalOpen(true);
    }
  };

  const handleEditRoom = (room: Unit) => {
    if (room) {
      setSelectedRoom(room);
      setIsEditModalOpen(true);
      setIsDetailsModalOpen(false); // Close details modal if it's open
      toast.info('Edit Room', {
        description: `You are now editing Room ${room.roomNumber}`
      });
    }
  };

  const handleDeleteRoom = (room: Unit) => {
    // In a real app, you would delete the room from your API
    toast.success('Room Deleted', {
      description: `Room ${room.roomNumber} has been successfully deleted.`
    });
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRoom(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRoom(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Rooms Management</h2>
          <p className="text-secondary-500">Manage all your rental rooms</p>
        </div>

        <button
          onClick={handleAddRoom}
          className="flex gap-2 items-center btn btn-primary"
        >
          <Plus size={16} />
          <span>Add New Room</span>
        </button>
      </div>

      <div className="dashboard-card">
        <div className="mb-6">
          <h3 className="mb-3 font-medium text-md text-secondary-700">Filter by Status</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(roomStatusCount).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                  ${filterStatus === status
                    ? 'bg-primary-100 text-primary-600 border border-primary-200'
                    : 'bg-white border border-gray-200 text-secondary-500 hover:bg-gray-50'}`}
              >
                {status !== 'All' ? (
                  <StatusBadge status={status as any} size="sm" />
                ) : (
                  <div className="flex w-2 h-2 rounded-full bg-primary-400"></div>
                )}
                <span>{status}</span>
                <span className="bg-secondary-100 text-secondary-700 px-1.5 py-0.5 rounded-full text-xs">{count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 justify-between mb-6 md:flex-row">
          <div className="relative w-full md:w-64">
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2 pr-4 pl-10 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex gap-2 items-center">
              <Filter size={18} className="text-secondary-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="All">All Types</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Suite">Suite</option>
                <option value="Studio">Studio</option>
              </select>
            </div>

            <div className="flex gap-2 items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="newest">Newest</option>
                <option value="room-number">Room Number</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <div className="flex gap-2 items-center ml-2">
                <ViewModeSwitcher
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>
          </div>
        </div>

        <RoomsList
          rooms={paginatedRooms}
          viewMode={viewMode}
          onViewRoom={handleViewRoom}
          onEditRoom={handleEditRoom}
          onDeleteRoom={handleDeleteRoom}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 mt-6 border-t border-gray-200">
            <div className="text-sm text-secondary-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRooms.length)} of {filteredRooms.length} rooms
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm
                    ${currentPage === i + 1
                      ? 'bg-primary-500 text-white'
                      : 'text-secondary-700 hover:bg-gray-100'}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddRoomModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
      />

      <EditRoomModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        room={selectedRoom}
      />

      <RoomDetailModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        room={selectedRoom}
        onEdit={handleEditRoom}
      />
    </div>
  );
};

export default RoomsPage;