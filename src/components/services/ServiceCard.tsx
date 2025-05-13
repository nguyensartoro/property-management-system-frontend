import React from 'react';
import { Trash2, Edit, Eye } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import ActionCard from '../shared/ActionCard';
import { toast } from 'react-hot-toast';
import { Service } from '../../interface/interfaces';

interface ServiceCardProps {
  service: Service;
  onEdit?: (serviceId: string) => void;
  onView?: (serviceId: string) => void;
  viewMode: 'grid' | 'list';
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onEdit,
  onView,
  viewMode
}) => {
  return (
    <ActionCard
      title={service.name}
      subtitle={service.information || 'No description available'}
      onView={onView ? () => onView(service.id) : undefined}
      onEdit={onEdit ? () => onEdit(service.id) : undefined}
      onDelete={() => toast.success('Service Deleted')}
      className="transition-all hover:shadow-md group"
    >
      <div className="flex flex-col gap-1 mt-3">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Fee:</span>
          <span className="font-medium dark:text-gray-200">${service.fee}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">/ {service.feeType}</span>
        </div>
        {service.availableRooms && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Available in:</span>
            <StatusBadge status={`${service.availableRooms} rooms`} size="sm" />
          </div>
        )}
      </div>
    </ActionCard>
  );
};

export default ServiceCard;