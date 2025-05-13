import React from "react";
import { Plus } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import RoomsList from '../components/rooms/RoomsList';
import RoomModal from '../components/rooms/RoomModal';
import { toast } from 'react-hot-toast';
import ViewModeSwitcher from '../components/shared/ViewModeSwitcher';
import { Room } from '@/interface/interfaces';
import SearchFilterBar from '../components/shared/SearchFilterBar';
import RoomDetailModal from "@/components/rooms/RoomDetailModal";
import { GET_ROOMS, DELETE_ROOM, CREATE_ROOM, UPDATE_ROOM } from '../providers/RoomProvider';
import { client } from "../providers/apollo";
import { useLanguage } from '../utils/languageContext';
import Modal from '../components/shared/Modal';
import { useLocation, useNavigate } from 'react-router-dom';


// Define SelectOption type locally
export type SelectOption = { value: string; label: string };

const RoomsPage: React.FC = () => {
  const { t } = useLanguage();
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

  // Get URL search params and navigate function
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const shouldOpenAddModal = searchParams.get('openAddModal') === 'true';

  // Check URL parameter and open add modal if needed
  React.useEffect(() => {
    if (shouldOpenAddModal) {
      setIsRoomModalOpen(true);
      // Remove the parameter from the URL
      searchParams.delete('openAddModal');
      navigate({ search: searchParams.toString() }, { replace: true });
    }
  }, [shouldOpenAddModal, navigate, searchParams]);

  const roomTypeOptions: SelectOption[] = [
    { value: 'All', label: t('common.all') },
    { value: 'Single', label: t('rooms.single') },
    { value: 'Double', label: t('rooms.double') },
    { value: 'Suite', label: t('rooms.suite') },
    { value: 'Studio', label: t('rooms.studio') },
  ];
  
  const sortByOptions: SelectOption[] = [
    { value: 'newest', label: t('common.newest') },
    { value: 'room-number', label: t('rooms.roomNumber') },
    { value: 'price-low', label: t('common.priceLowToHigh') },
    { value: 'price-high', label: t('common.priceHighToLow') },
  ];
  
  const statusOptions: SelectOption[] = [
    { value: 'All', label: t('common.allStatuses') },
    { value: 'OCCUPIED', label: t('roomStatus.occupied') },
    { value: 'AVAILABLE', label: t('roomStatus.available') },
    { value: 'RESERVED', label: t('roomStatus.reserved') },
    { value: 'MAINTENANCE', label: t('roomStatus.maintenance') },
  ];

  // Apollo query with backend filtering
  const { data, loading, error, refetch } = useQuery(GET_ROOMS, {
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

  const [deleteRoomMutation] = useMutation(DELETE_ROOM);

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common.loading')}...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">{t('common.errorLoading')}: {error.message}</div>;
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
      toast.success(t('rooms.roomCreated').replace('{number}', roomData.number || ''));
    } catch (error) {
      toast.error(`${t('common.error')}: ${error instanceof Error ? error.message : t('common.unknownError')}`);
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
      toast.success(t('rooms.roomUpdated').replace('{number}', roomData.number || ''));
    } catch (error) {
      toast.error(`${t('common.error')}: ${error instanceof Error ? error.message : t('common.unknownError')}`);
    }
  };

  const handleDeleteRoom = (room: Room) => {
    setRoomToDelete(room);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return;
    try {
      await deleteRoomMutation({
        variables: { id: roomToDelete.id },
      });
      toast.success(t('rooms.roomDeleted').replace('{number}', roomToDelete.number || ''));
    } catch {
      toast.error(t('rooms.failedToDelete'));
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
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-gray-100">{t('navigation.rooms')}</h2>
          <p className="text-secondary-500 dark:text-gray-400">{t('rooms.manageRooms')}</p>
        </div>
        <button
          onClick={handleAddRoom}
          className="flex gap-2 items-center btn btn-primary"
        >
          <Plus size={16} />
          <span>{t('rooms.addNewRoom')}</span>
        </button>
      </div>

      <div className="dashboard-card dark:bg-gray-800 dark:border-gray-700">
        <SearchFilterBar
          searchPlaceholder={t('rooms.searchPlaceholder')}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            {
              type: 'dropdown',
              label: t('rooms.type'),
              value: filterType,
              options: roomTypeOptions,
              onChange: setFilterType,
            },
            {
              type: 'dropdown',
              label: t('common.status'),
              value: filterStatus,
              options: statusOptions,
              onChange: setFilterStatus,
            },
            {
              type: 'dropdown',
              label: t('common.sortBy'),
              value: sortBy,
              options: sortByOptions,
              onChange: setSortBy,
            },
            {
              type: 'range',
              label: t('common.price'),
              value: priceRange,
              min: 0,
              max: maxPrice,
              step: 50,
              onChange: setPriceRange,
              placeholder: [t('common.min'), t('common.max')],
            },
          ]}
          rightContent={
            <ViewModeSwitcher
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          }
        />

        {rooms.length > 0 ? (
          <RoomsList
            rooms={rooms}
            viewMode={viewMode}
            onViewRoom={handleViewRoom}
            onEditRoom={handleEditRoom}
            onDeleteRoom={handleDeleteRoom}
          />
        ) : (
          <div className="flex justify-center items-center h-40 text-secondary-500 dark:text-gray-400">
            {t('common.noRoomsFound')}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-secondary-500 dark:text-gray-400">
              {t('common.showing')} {(currentPage - 1) * itemsPerPage + 1} {t('common.to')} {Math.min(currentPage * itemsPerPage, totalCount)} {t('common.of')} {totalCount} {t('navigation.rooms').toLowerCase()}
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800"
              >
                {t('common.prev')}
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
                {t('common.next')}
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
            <h3 className="text-lg font-semibold mb-4">{t('common.confirmDelete')}</h3>
            <p>{t('rooms.confirmDeleteRoom')} <span className="font-bold">{roomToDelete?.number}</span>?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 text-secondary-700 hover:bg-gray-50"
                onClick={() => { setDeleteConfirmOpen(false); setRoomToDelete(null); }}
              >
                {t('common.cancel')}
              </button>
              <button
                className="px-4 py-2 text-white rounded-md bg-danger-500 hover:bg-danger-600"
                onClick={confirmDeleteRoom}
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;