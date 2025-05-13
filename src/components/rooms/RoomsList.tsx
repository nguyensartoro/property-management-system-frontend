import React from 'react';
import { motion } from 'framer-motion';
import { Home, Edit, Trash2, Eye } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import RoomCard from './RoomCard';
import { toast } from 'react-hot-toast';
import { Room } from '../../interface/interfaces';
import Icon from '../shared/Icon';

interface RoomsListProps {
  rooms: Room[];
  viewMode: 'grid' | 'list';
  onViewRoom?: (room: Room) => void;
  onEditRoom?: (room: Room) => void;
  onDeleteRoom?: (room: Room) => void;
}

const RoomsList = ({
  rooms,
  viewMode,
  onViewRoom,
  onEditRoom,
  onDeleteRoom
}: RoomsListProps) => {
  const handleViewRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      if (onViewRoom) {
        onViewRoom(room);
      } else {
        toast('Room Details');
      }
    }
  };

  const handleEditRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      if (onEditRoom) {
        onEditRoom(room);
      } else {
        toast('Edit Room');
      }
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      if (onDeleteRoom) {
        onDeleteRoom(room);
      } else {
        toast.success('Room Deleted');
      }
    }
  };

  const tableTitle = ['Room', 'Type', 'Status', 'Floor', 'Size', 'Price', 'Contract Type', 'Renters', 'Actions'];

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
      <table className="data-table w-full">
        <thead>
          <tr>
            {tableTitle.map((title, index) => (
              <th key={index} className="px-4 py-3 text-sm font-medium text-left text-secondary-700">{title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, index) => {
            const contract = room.contracts?.[0];
            return (
              <motion.tr
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-sm font-medium text-secondary-900">
                  <div className="flex items-center">
                    <Home size={16} className="mr-2 text-gray-500" />
                    {room.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-secondary-500">{room.name || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">
                  <StatusBadge status={room.status} />
                </td>
                <td className="px-4 py-3 text-sm text-secondary-500">{room.floor}</td>
                <td className="px-4 py-3 text-sm text-secondary-500">{room.size ? `${room.size} sqft` : 'N/A'}</td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-primary-600">{contract ? `$${contract.amount}` : <span className="text-gray-400">None</span>}</span>
                </td>
                <td className="px-4 py-3 text-sm text-secondary-500">{contract && contract.contractType ? (contract.contractType === 'longTerm' ? 'Long Term' : 'Short Term') : ''}</td>
                <td className="px-4 py-3 text-sm">
                  {contract && contract.renterNames.length > 0 ? (<>{contract.renterNames.map(name => <div key={name}>{name}</div>)}</>) : ''}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleViewRoom(room.id)}
                      className="p-1 transition-colors text-secondary-500 hover:text-primary-500"
                      aria-label="View details"
                    >
                      <Icon icon={Eye} size={18} />
                    </button>
                    <button
                      onClick={() => handleEditRoom(room.id)}
                      className="p-1 transition-colors text-secondary-500 hover:text-primary-500"
                      aria-label="Edit room"
                    >
                      <Icon icon={Edit} size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="p-1 transition-colors text-secondary-500 hover:text-danger-500"
                      aria-label="Delete room"
                    >
                      <Icon icon={Trash2} size={18} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RoomsList;