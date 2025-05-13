import React from 'react';
import { FileText } from 'lucide-react';
import ActionCard from '../shared/ActionCard';
import StatusBadge from '../shared/StatusBadge';
import { toast } from 'react-hot-toast';

interface Contract {
  id: string;
  roomId: string;
  roomName: string;
  renterIds: string[];
  renterNames: string[];
  startDate: string;
  endDate: string;
  contractType: 'longTerm' | 'shortTerm';
  status: 'active' | 'expired' | 'terminated';
  amount: number;
}

interface ContractCardProps {
  contract: Contract;
  onEdit?: () => void;
  onView?: () => void;
  viewMode?: 'grid' | 'list';
}

const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  onEdit,
  onView
}: ContractCardProps) => {
  const handleDelete = () => {
    toast.success('Contract deleted successfully');
  };

  // Convert contract type to display format
  const getContractTypeDisplay = (): 'Long Term' | 'Short Term' => {
    return contract.contractType === 'longTerm' ? 'Long Term' : 'Short Term';
  };

  return (
    <ActionCard
      title={`Room: ${contract.roomName}`}
      subtitle={`Contract #${contract.id.substring(0, 8)}`}
      icon={<FileText size={18} />}
      onView={onView}
      onEdit={onEdit}
      onDelete={handleDelete}
    >
      <div className="space-y-3">
        <div>
          <span className="block mb-1 text-xs text-secondary-500 dark:text-gray-400">Renters:</span>
          <span className="text-sm font-medium text-secondary-900 dark:text-gray-200">
            {contract.renterNames.join(', ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block mb-1 text-xs text-secondary-500 dark:text-gray-400">Start Date:</span>
            <div className="text-sm font-medium text-secondary-900 dark:text-gray-200">{contract.startDate}</div>
          </div>
          <div>
            <span className="block mb-1 text-xs text-secondary-500 dark:text-gray-400">End Date:</span>
            <div className="text-sm font-medium text-secondary-900 dark:text-gray-200">{contract.endDate}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block mb-1 text-xs text-secondary-500 dark:text-gray-400">Type:</span>
            <StatusBadge status={getContractTypeDisplay()} size="sm" />
          </div>
          <div>
            <span className="block mb-1 text-xs text-secondary-500 dark:text-gray-400">Status:</span>
            <StatusBadge status={contract.status} size="sm" />
          </div>
        </div>
      </div>
    </ActionCard>
  );
};

export default ContractCard;