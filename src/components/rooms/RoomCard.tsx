import React from 'react';
import { Home, User } from 'lucide-react';
import ActionCard from '../shared/ActionCard';
import StatusBadge from '../shared/StatusBadge';
import { toast } from 'react-hot-toast';

interface Renter {
  id: string;
  name: string;
  avatar?: string;
}

interface Room {
  id: string;
  roomNumber: string;
  type: string;
  status: string;
  size?: number;
  floor?: string;
  price: number;
  amenities?: string[];
  lastMaintenance?: string;
  renter?: Renter;
}

interface RoomCardProps {
  room: Room;
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
}

const RoomCard: React.FC<RoomCardProps> = (props: RoomCardProps) => {
  const { room, onEdit, onView, onDelete } = props;

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    } else {
      toast.success('Room deleted successfully');
    }
  };

  return (
    <ActionCard
      title={
        <div className="flex items-center">
          <Home size={16} className="mr-2" />
          <span>Room {room.roomNumber || ''}</span>
          <span className="ml-3">
            <StatusBadge status={room.status} size="sm" />
          </span>
        </div>
      }
      subtitle={`${room.type || 'N/A'} • Floor ${room.floor || 'N/A'}`}
      onView={onView}
      onEdit={onEdit}
      onDelete={handleDelete}
      className="transition-all hover:shadow-md group"
    >
      <div className="space-y-3">
        <div className="flex justify-between">
          <div>
            <span className="block mb-1 text-xs text-secondary-500">Size</span>
            <span className="text-secondary-900">{room.size ? `${room.size} sqft` : 'N/A'}</span>
          </div>
          <div className="text-right">
            <span className="block mb-1 text-xs text-secondary-500">Price</span>
            <span className="text-base font-semibold text-primary-600">{room.price ? `$${room.price}/mo` : 'N/A'}</span>
          </div>
        </div>
        <div>
          <span className="block mb-1 text-xs text-secondary-500">Renter</span>
          {room.renter ? (
            <div className="flex items-center">
              {room.renter.avatar ? (
                <img
                  src={room.renter.avatar}
                  alt={room.renter.name}
                  className="object-cover mr-2 w-6 h-6 rounded-full"
                />
              ) : (
                <div className="flex justify-center items-center mr-2 w-6 h-6 bg-gray-200 rounded-full">
                  <User size={12} className="text-gray-500" />
                </div>
              )}
              <span className="text-secondary-600">{room.renter.name}</span>
            </div>
          ) : (
            <span className="text-gray-400">None</span>
          )}
        </div>
        <div>
          <span className="block mb-1 text-xs text-secondary-500">Amenities</span>
          <div className="flex flex-wrap gap-1">
            {room.amenities && room.amenities.length > 0 ? (
              room.amenities.map((amenity: string, index: number) => (
                <span
                  key={index}
                  className="bg-gray-100 text-secondary-700 text-xs px-2 py-0.5 rounded-full"
                >
                  {amenity}
                </span>
              ))
            ) : (
              <span className="text-gray-400">None</span>
            )}
          </div>
        </div>
      </div>
    </ActionCard>
  );
};

export default RoomCard;