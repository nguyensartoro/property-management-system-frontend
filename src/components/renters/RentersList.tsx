import React from 'react';
import RenterCard from './RenterCard';
import StatusBadge from '../shared/StatusBadge';
import Icon from '../shared/Icon';
import { Edit, User, Info, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Renter {
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
  documents?: {
    id: string;
    name: string;
    type: string;
    path: string;
  }[];
}

interface RentersListProps {
  renters: Renter[];
  viewMode: 'grid' | 'list';
  onViewRenter: (renter: Renter) => void;
  onEditRenter: (renter: Renter) => void;
  onDeleteRenter: (renter: Renter) => void;
}

const RentersList: React.FC<RentersListProps> = (props: RentersListProps) => {
  const { renters, viewMode, onViewRenter, onEditRenter, onDeleteRenter } = props;

  if (viewMode === 'grid') {
    return (
      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 gap-4'}`}>
        {renters.map((renter: Renter, index: number) => (
          <motion.div
            key={renter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <RenterCard
              renter={renter}
              onView={() => onViewRenter(renter)}
              onEdit={() => onEditRenter(renter)}
              viewMode={viewMode}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  // List View
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Room</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {renters.map((renter: Renter, index: number) => (
            <motion.tr
              key={renter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <td className="font-medium flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={18} className="text-gray-400" />
                </span>
                {renter.name}
              </td>
              <td className="text-secondary-500">{renter.email}</td>
              <td className="text-secondary-500">{renter.phone}</td>
              <td>
                <StatusBadge
                  status={renter.roomId ? 'Active' : 'Inactive'}
                  size="sm"
                />
              </td>
              <td className="text-secondary-500">
                {renter.room ? `${renter.room.number} - ${renter.room.name}` : 'Not Assigned'}
              </td>
              <td className="text-right">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => onViewRenter(renter)}
                    className="transition-colors text-secondary-500 hover:text-primary-500"
                    aria-label="View renter details"
                  >
                    <Icon icon={Info} size={18} />
                  </button>
                  <button
                    onClick={() => onEditRenter(renter)}
                    className="transition-colors text-secondary-500 hover:text-primary-500"
                    aria-label="Edit renter"
                  >
                    <Icon icon={Edit} size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteRenter(renter)}
                    className="transition-colors text-secondary-500 hover:text-danger-500"
                    aria-label="Delete renter"
                  >
                    <Icon icon={Trash2} size={18} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RentersList;