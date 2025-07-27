import React from 'react';
import { Room } from '../../utils/apiClient';
import { Edit, Eye, Trash2, Home } from 'lucide-react';

interface RoomListProps {
  rooms: Room[];
  loading: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  propertyFilter?: string;
}

const RoomList: React.FC<RoomListProps> = ({
  rooms,
  loading,
  onDelete,
  onEdit,
  onView,
  propertyFilter,
}) => {
  // Filter rooms by property if propertyFilter is provided
  const filteredRooms = propertyFilter 
    ? rooms.filter(room => room.propertyId === propertyFilter)
    : rooms;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredRooms.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="flex justify-center mb-4">
          <Home className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No rooms found</h3>
        <p className="text-gray-500 mb-4">
          {propertyFilter 
            ? "This property doesn't have any rooms yet."
            : "You haven't added any rooms yet. Add your first room to get started."}
        </p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => {}}
        >
          Add Room
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'OCCUPIED':
        return 'bg-blue-100 text-blue-800';
      case 'RESERVED':
        return 'bg-purple-100 text-purple-800';
      case 'MAINTENANCE':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredRooms.map((room) => (
        <div
          key={room.id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900">{room.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(room.status)}`}>
                {room.status}
              </span>
            </div>
            
            <p className="text-gray-500 text-sm mb-1">Room {room.number}, Floor {room.floor}</p>
            <p className="text-gray-500 text-sm mb-3">{room.size} sq ft</p>
            
            <div className="flex justify-between items-center">
              <div className="text-lg font-medium text-gray-900">${room.price}/month</div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onView(room.id)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  title="View details"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onEdit(room.id)}
                  className="p-1 text-gray-500 hover:text-amber-600 transition-colors"
                  title="Edit room"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(room.id)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  title="Delete room"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomList;