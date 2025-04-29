import React from 'react';
import { Home, User } from 'lucide-react';
import ActionCard from '../shared/ActionCard';
import StatusBadge from '../shared/StatusBadge';
import { useToastHook } from '../../utils/useToast';

interface RoomCardProps {
  room: {
    id: string;
    roomNumber: string;
    type: string;
    status: string;
    size?: number;
    floor?: string;
    price: number;
    occupants?: number;
    amenities?: string[];
    lastMaintenance?: string;
    renter?: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  viewMode?: 'grid' | 'list';
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onEdit, onView, onDelete, viewMode = 'grid' }) => {
  const toast = useToastHook();
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    } else {
      toast.success('Room deleted successfully', {
        description: `Room ${room.roomNumber} has been deleted.`
      });
    }
  };

  return (
    <ActionCard
      title={
        <div className="flex items-center">
          <Home size={16} className="text-primary-500 mr-2" />
          <span>Room {room.roomNumber}</span>
        </div>
      }
      subtitle={`${room.type} • Floor ${room.floor || 'N/A'}`}
      onView={onView}
      onEdit={onEdit}
      onDelete={handleDelete}
      className="hover:shadow-md transition-all group"
    >
      <div className="space-y-3">
        <div className="flex justify-between">
          <div>
            <span className="text-xs text-secondary-500 block mb-1">Status</span>
            <StatusBadge status={room.status} />
          </div>
          <div className="text-right">
            <span className="text-xs text-secondary-500 block mb-1">Price</span>
            <span className="text-primary-600 font-semibold text-base">${room.price}/mo</span>
          </div>
        </div>

        <div className="flex justify-between">
          <div>
            <span className="text-xs text-secondary-500 block mb-1">Size</span>
            <span className="text-secondary-900">{room.size ? `${room.size} sqft` : 'N/A'}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-secondary-500 block mb-1">Occupants</span>
            <span className="text-secondary-900">{room.occupants || 0}</span>
          </div>
        </div>
        
        {room.renter && (
          <div>
            <span className="text-xs text-secondary-500 block mb-1">Renter</span>
            <div className="flex items-center">
              {room.renter.avatar ? (
                <img 
                  src={room.renter.avatar} 
                  alt={room.renter.name} 
                  className="w-6 h-6 rounded-full object-cover mr-2" 
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                  <User size={12} className="text-gray-500" />
                </div>
              )}
              <span className="text-secondary-600">{room.renter.name}</span>
            </div>
          </div>
        )}
        
        {room.amenities && room.amenities.length > 0 && (
          <div>
            <span className="text-xs text-secondary-500 block mb-1">Amenities</span>
            <div className="flex flex-wrap gap-1">
              {room.amenities.map((amenity, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 text-secondary-700 text-xs px-2 py-0.5 rounded-full"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </ActionCard>
  );
};

export default RoomCard; 