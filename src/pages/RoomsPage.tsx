import React from "react";
import { Plus } from 'lucide-react';
import { useQuery } from '@apollo/client';
import RoomsList from '../components/rooms/RoomsList';
import RoomModal from '../components/rooms/RoomModal';
import { toast } from 'react-hot-toast';
import ViewModeSwitcher from '../components/shared/ViewModeSwitcher';
import { Room } from '@/interface/interfaces';
import SearchFilterBar from '../components/shared/SearchFilterBar';
import RoomDetailModal from "@/components/rooms/RoomDetailModal";
import { GET_ROOMS, DELETE_ROOM, CREATE_ROOM, UPDATE_ROOM } from '../providers/RoomProvider';
import { client } from "../providers/apollo";


// Define SelectOption type locally
export type SelectOption = { value: string; label: string };

const roomTypeOptions: SelectOption[] = [
  { value: 'All', label: 'All Types' },
  { value: 'Single', label: 'Single' },
  { value: 'Double', label: 'Double' },
  { value: 'Suite', label: 'Suite' },
  { value: 'Studio', label: 'Studio' },
];

const sortByOptions: SelectOption[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'room-number', label: 'Room Number' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

const statusOptions: SelectOption[] = [
  { value: 'All', label: 'All Statuses' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
];

const RoomsPage: React.FC = () => {
  const [isRoomModalOpen, setIsRoomModalOpen] = React.useState(false);
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);
  const [isDetailRoomModalOpen, setIsDetailRoomModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('All');
  const [filterType, setFilterType] = React.useState<string>('All');
  const [sortBy, setSortBy] = React.useState<string>('newest');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 1000]);
  const itemsPerPage = 10;
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [roomToDelete, setRoomToDelete] = React.useState<Room | null>(null);

  // Apollo query with backend filtering
  const { data, loading, error } = useQuery(GET_ROOMS, {
    variables: {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      type: filterType !== 'All' ? filterType : undefined,
      status: filterStatus !== 'All' ? filterStatus : undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      sortBy: sortBy === 'newest' ? 'createdAt' : sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? 'price' : undefined,
      sortOrder: sortBy === 'price-low' ? 'asc' : sortBy === 'price-high' ? 'desc' : 'desc',
    },
    fetchPolicy: 'cache-and-network',
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading rooms...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error loading rooms: {error.message}</div>;
  }

  const rooms = data?.rooms?.nodes || [];
  const maxPrice = rooms.length > 0 ? Math.max(...rooms.map((room: Room) => room.price)) : 1000;
  const totalPages = data?.rooms?.pageInfo?.totalPages || 1;
  const totalCount = data?.rooms?.pageInfo?.totalCount || 0;

  // Modal handlers
  const handleAddRoom = () => {
    setSelectedRoom(null);
    setIsRoomModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsRoomModalOpen(true);
  };

  const handleCloseRoomModal = () => {
    setIsRoomModalOpen(false);
    setSelectedRoom(null);
  };

  // CRUD handlers with GraphQL mutations
  const handleCreateRoom = async (roomData: Partial<Room> & { services: string[] }) => {
    try {
      await client.mutate({
        mutation: CREATE_ROOM,
        variables: { 
          input: {
            name: roomData.name,
            number: roomData.number,
            floor: roomData.floor,
            size: roomData.size,
            description: roomData.description,
            status: roomData.status,
            price: roomData.price || 0,
            services: roomData.services
          } 
        },
        refetchQueries: [
          {
            query: GET_ROOMS,
            variables: {
              page: currentPage,
              limit: itemsPerPage,
              search: searchTerm || undefined,
              type: filterType !== 'All' ? filterType : undefined,
              status: filterStatus !== 'All' ? filterStatus : undefined,
              minPrice: priceRange[0],
              maxPrice: priceRange[1],
            }
          }
        ]
      });
      toast.success(`Room ${roomData.number} created!`);
    } catch (error) {
      toast.error(`Failed to create room: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateRoom = async (roomData: Partial<Room> & { services: string[] }) => {
    if (!selectedRoom) return;
    
    try {
      await client.mutate({
        mutation: UPDATE_ROOM,
        variables: { 
          id: selectedRoom.id,
          input: {
            name: roomData.name,
            number: roomData.number,
            floor: roomData.floor,
            size: roomData.size,
            description: roomData.description,
            status: roomData.status,
            price: roomData.price || selectedRoom.price,
            services: roomData.services
          } 
        },
        refetchQueries: [
          {
            query: GET_ROOMS,
            variables: {
              page: currentPage,
              limit: itemsPerPage,
              search: searchTerm || undefined,
              type: filterType !== 'All' ? filterType : undefined,
              status: filterStatus !== 'All' ? filterStatus : undefined,
              minPrice: priceRange[0],
              maxPrice: priceRange[1],
            }
          }
        ]
      });
      toast.success(`Room ${roomData.number} updated!`);
    } catch (error) {
      toast.error(`Failed to update room: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteRoom = (room: Room) => {
    setRoomToDelete(room);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return;
    try {
      await client.mutate({
        mutation: DELETE_ROOM,
        variables: { id: roomToDelete.id },
      });
      toast.success(`Room ${roomToDelete.number} deleted!`);
    } catch {
      toast.error('Failed to delete room.');
    }
    setDeleteConfirmOpen(false);
    setRoomToDelete(null);
  };

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsDetailRoomModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-gray-100">Rooms Management</h2>
          <p className="text-secondary-500 dark:text-gray-400">Manage all your rental rooms</p>
        </div>
        <button
          onClick={handleAddRoom}
          className="flex gap-2 items-center btn btn-primary"
        >
          <Plus size={16} />
          <span>Add New Room</span>
        </button>
      </div>

      <div className="dashboard-card dark:bg-gray-800 dark:border-gray-700">
        <SearchFilterBar
          searchPlaceholder="Search by room number..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            {
              type: 'dropdown',
              label: 'Type',
              value: filterType,
              options: roomTypeOptions,
              onChange: setFilterType,
            },
            {
              type: 'dropdown',
              label: 'Status',
              value: filterStatus,
              options: statusOptions,
              onChange: setFilterStatus,
            },
            {
              type: 'dropdown',
              label: 'Sort By',
              value: sortBy,
              options: sortByOptions,
              onChange: setSortBy,
            },
            {
              type: 'range',
              label: 'Price',
              value: priceRange,
              min: 0,
              max: maxPrice,
              step: 50,
              onChange: setPriceRange,
              placeholder: ['Min', 'Max'],
            },
          ]}
          rightContent={
            <ViewModeSwitcher
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          }
        />

        <RoomsList
          rooms={rooms}
          viewMode={viewMode}
          onViewRoom={handleViewRoom}
          onEditRoom={handleEditRoom}
          onDeleteRoom={handleDeleteRoom}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-secondary-500 dark:text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} rooms
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm
                    ${currentPage === i + 1
                      ? 'bg-primary-500 text-white dark:bg-primary-600'
                      : 'text-secondary-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Unified Add/Edit Room Modal */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={handleCloseRoomModal}
        room={selectedRoom}
        onCreate={handleCreateRoom}
        onUpdate={handleUpdateRoom}
        onDelete={handleDeleteRoom}
      />

      <RoomDetailModal
        isOpen={isDetailRoomModalOpen}
        onClose={() => setIsDetailRoomModalOpen(false)}
        room={selectedRoom}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete room <span className="font-bold">{roomToDelete?.number}</span>?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 text-secondary-700 hover:bg-gray-50"
                onClick={() => { setDeleteConfirmOpen(false); setRoomToDelete(null); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white rounded-md bg-danger-500 hover:bg-danger-600"
                onClick={confirmDeleteRoom}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;