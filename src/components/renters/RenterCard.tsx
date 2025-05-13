import React from 'react';
import { User } from 'lucide-react';
import ActionCard from '../shared/ActionCard';
import { toast } from 'react-hot-toast';

interface RenterCardProps {
  renter: {
    id: string;
    name: string;
    email: string;
    phone: string;
    roomId?: string;
    emergencyContact?: string;
    identityNumber?: string;
    room?: {
      id: string;
      number: string;
      name: string;
    };
  };
  onEdit?: () => void;
  onView?: () => void;
  viewMode?: 'grid' | 'list';
}

const RenterCard: React.FC<RenterCardProps> = ({ renter, onEdit, onView, viewMode = 'grid' }) => {
  const handleDelete = () => {
    toast.success('Renter deleted successfully');
  };

  const isActive = renter.roomId && renter.roomId.length > 0;

  return (
    <ActionCard
      title={renter.name}
      subtitle={renter.email}
      icon={<User size={18} />}
      onView={onView}
      onEdit={onEdit}
      onDelete={handleDelete}
    >
      <div className="space-y-3">
        <div className="flex justify-between">
          <div>
            <span className="text-xs text-secondary-500 block mb-1">Status</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isActive 
              ? 'bg-success-100 text-success-700' 
              : 'bg-secondary-100 text-secondary-700'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-secondary-500 block mb-1">Contact</span>
            <span className="text-secondary-900">{renter.phone}</span>
          </div>
        </div>

        <div className="flex justify-between">
          {renter.roomId ? (
            <div>
              <span className="text-xs text-secondary-500 block mb-1">Room</span>
              <span className="text-secondary-900">
                {renter.room ? `${renter.room.number} - ${renter.room.name}` : `Room ${renter.roomId}`}
              </span>
            </div>
          ) : (
            <div>
              <span className="text-xs text-secondary-500 block mb-1">Status</span>
              <span className="text-secondary-900">No Room Assigned</span>
            </div>
          )}
          
          {renter.emergencyContact && (
            <div className="text-right">
              <span className="text-xs text-secondary-500 block mb-1">Emergency</span>
              <span className="text-secondary-900">{renter.emergencyContact}</span>
            </div>
          )}
        </div>
        
        {renter.identityNumber && (
          <div>
            <span className="text-xs text-secondary-500 block mb-1">ID Number</span>
            <span className="text-secondary-900">{renter.identityNumber}</span>
          </div>
        )}
      </div>
    </ActionCard>
  );
};

export default RenterCard; 