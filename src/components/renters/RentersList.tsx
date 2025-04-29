import React from 'react';
import { useNavigate } from 'react-router-dom';
import RenterCard from './RenterCard';
import StatusBadge from '../shared/StatusBadge';
import { toast } from '../ui/toast';

interface Renter {
  id: string;
  name: string;
  email: string;
  phone: string;
  unitId?: string;
  unitName?: string;
  moveInDate?: string;
  status?: string;
  paymentStatus?: string;
}

interface RentersListProps {
  renters: Renter[];
  viewMode: 'grid' | 'list';
}

const RentersList: React.FC<RentersListProps> = ({ renters, viewMode }) => {
  const navigate = useNavigate();

  const handleViewRenter = (renterId: string) => {
    toast.info('Renter Details', {
      description: `Viewing details for renter ID: ${renterId}`
    });
    // navigate(`/renters/${renterId}`);
  };

  const handleEditRenter = (renterId: string) => {
    toast.info('Edit Renter', {
      description: `Editing renter ID: ${renterId}`
    });
    // navigate(`/renters/edit/${renterId}`);
  };

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {renters.map(renter => (
          <RenterCard
            key={renter.id}
            renter={renter}
            onView={() => handleViewRenter(renter.id)}
            onEdit={() => handleEditRenter(renter.id)}
            viewMode={viewMode}
          />
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
          {renters.map(renter => (
            <tr key={renter.id}>
              <td className="font-medium">{renter.name}</td>
              <td className="text-secondary-500">{renter.email}</td>
              <td className="text-secondary-500">{renter.phone}</td>
              <td>
                <StatusBadge 
                  status={renter.unitId ? 'Active' : 'Inactive'} 
                  size="sm" 
                />
              </td>
              <td className="text-secondary-500">
                {renter.unitName || (renter.unitId ? `Room ${renter.unitId}` : 'Not Assigned')}
              </td>
              <td className="text-right">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleViewRenter(renter.id)}
                    className="transition-colors text-secondary-500 hover:text-primary-500"
                    aria-label="View details"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditRenter(renter.id)}
                    className="transition-colors text-secondary-500 hover:text-primary-500"
                    aria-label="Edit renter"
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RentersList;