/// <reference types="react" />
import React from 'react';
import { motion } from 'framer-motion';
import { User, Home, Edit, Trash2, Eye } from 'lucide-react';
import { Unit, Renter, Service } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import { renters, services } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';
import RoomCard from './RoomCard';
import { useToastHook } from '../../utils/useToast';

interface RoomsListProps {
  rooms: Unit[];
  viewMode: 'grid' | 'list';
  onViewRoom?: (room: Unit) => void;
  onEditRoom?: (room: Unit) => void;
  onDeleteRoom?: (room: Unit) => void;
}

const RoomsList = ({
  rooms,
  viewMode,
  onViewRoom,
  onEditRoom,
  onDeleteRoom
}: RoomsListProps) => {
  const toast = useToastHook();
  const [expandedRoomId, setExpandedRoomId] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const toggleExpand = (roomId: string) => {
    setExpandedRoomId(expandedRoomId === roomId ? null : roomId);
  };

  const getRenterForRoom = (roomId: string): Renter | undefined => {
    return renters.find(renter => renter.unitId === roomId);
  };

  const getServiceDetails = (serviceName: string): Service | undefined => {
    return services.find(service => service.name === serviceName);
  };

  const handleViewRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      if (onViewRoom) {
        onViewRoom(room);
      } else {
        toast.info('Room Details', {
          description: `Viewing details for room ID: ${roomId}`
        });
      }
    }
  };

  const handleEditRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      if (onEditRoom) {
        onEditRoom(room);
      } else {
        toast.info('Edit Room', {
          description: `Editing room ID: ${roomId}`
        });
      }
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      if (onDeleteRoom) {
        onDeleteRoom(room);
      } else {
        toast.success('Room Deleted', {
          description: `Room ${room.roomNumber} has been deleted.`
        });
      }
    }
  };

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <RoomCard
              room={room}
              onView={() => handleViewRoom(room.id)}
              onEdit={() => handleEditRoom(room.id)}
              onDelete={() => handleDeleteRoom(room.id)}
              viewMode={viewMode}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-500">Room</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-500">Type</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-500">Status</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-500">Floor</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-500">Size</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-500">Price</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-500">Renter</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase text-secondary-500">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rooms.map(room => {
            const renter = getRenterForRoom(room.id);
            return (
              <tr key={room.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-secondary-900">
                  <div className="flex items-center">
                    <Home size={16} className="mr-2 text-primary-500" />
                    {room.roomNumber}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-secondary-500">{room.type}</td>
                <td className="px-4 py-3 text-sm">
                  <StatusBadge status={room.status} />
                </td>
                <td className="px-4 py-3 text-sm text-secondary-500">{room.floor || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-secondary-500">{room.size ? `${room.size} sqft` : 'N/A'}</td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-primary-600">${room.price}/mo</span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {renter ? (
                    <div className="flex items-center">
                      {renter.avatar ? (
                        <img
                          src={renter.avatar}
                          alt={renter.name}
                          className="object-cover mr-2 w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="flex justify-center items-center mr-2 w-6 h-6 bg-gray-200 rounded-full">
                          <User size={12} className="text-gray-500" />
                        </div>
                      )}
                      <span className="text-secondary-600">{renter.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleViewRoom(room.id)}
                      className="p-1 transition-colors text-secondary-500 hover:text-primary-500"
                      aria-label="View details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEditRoom(room.id)}
                      className="p-1 transition-colors text-secondary-500 hover:text-primary-500"
                      aria-label="Edit room"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="p-1 transition-colors text-secondary-500 hover:text-danger-500"
                      aria-label="Delete room"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RoomsList;