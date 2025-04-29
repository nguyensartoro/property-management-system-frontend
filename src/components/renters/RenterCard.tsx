import React from 'react';
import { User } from 'lucide-react';
import ActionCard from '../shared/ActionCard';
import { toast } from '../ui/toast';

interface RenterCardProps {
  renter: {
    id: string;
    name: string;
    email: string;
    phone: string;
    unitId?: string;
    unitName?: string;
    moveInDate?: string;
    status?: string;
    paymentStatus?: string;
  };
  onEdit?: () => void;
  onView?: () => void;
  viewMode?: 'grid' | 'list';
}

const RenterCard: React.FC<RenterCardProps> = ({ renter, onEdit, onView, viewMode = 'grid' }) => {
  const handleDelete = () => {
    toast.success('Renter deleted successfully', {
      description: `${renter.name} has been removed from the system.`
    });
  };

  const isActive = renter.unitId && renter.unitId.length > 0;

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
          {renter.unitId ? (
            <div>
              <span className="text-xs text-secondary-500 block mb-1">Room</span>
              <span className="text-secondary-900">{renter.unitName || `Room ${renter.unitId}`}</span>
            </div>
          ) : (
            <div>
              <span className="text-xs text-secondary-500 block mb-1">Status</span>
              <span className="text-secondary-900">No Room Assigned</span>
            </div>
          )}
          
          {renter.moveInDate && (
            <div className="text-right">
              <span className="text-xs text-secondary-500 block mb-1">Move In</span>
              <span className="text-secondary-900">{renter.moveInDate}</span>
            </div>
          )}
        </div>
        
        {renter.paymentStatus && (
          <div>
            <span className="text-xs text-secondary-500 block mb-1">Payment Status</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              renter.paymentStatus === 'Paid' 
              ? 'bg-success-100 text-success-700' 
              : renter.paymentStatus === 'Pending'
              ? 'bg-warning-100 text-warning-700'
              : 'bg-danger-100 text-danger-700'
            }`}>
              {renter.paymentStatus}
            </span>
          </div>
        )}
      </div>
    </ActionCard>
  );
};

export default RenterCard; 