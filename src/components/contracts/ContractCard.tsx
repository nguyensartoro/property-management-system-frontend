import React from 'react';
import { FileText } from 'lucide-react';
import ActionCard from '../shared/ActionCard';
import StatusBadge from '../shared/StatusBadge';
import { useToastHook } from '../../utils/useToast';

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
  const toast = useToastHook();
  
  const handleDelete = () => {
    toast.success('Contract deleted successfully', {
      description: `Contract for Room ${contract.roomName} has been deleted.`
    });
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
          <span className="text-xs text-secondary-500 block mb-1">Renters:</span>
          <span className="text-sm font-medium text-secondary-900">
            {contract.renterNames.join(', ')}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-secondary-500 block mb-1">Start Date:</span>
            <div className="text-sm font-medium text-secondary-900">{contract.startDate}</div>
          </div>
          <div>
            <span className="text-xs text-secondary-500 block mb-1">End Date:</span>
            <div className="text-sm font-medium text-secondary-900">{contract.endDate}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-secondary-500 block mb-1">Type:</span>
            <StatusBadge status={getContractTypeDisplay()} size="sm" />
          </div>
          <div>
            <span className="text-xs text-secondary-500 block mb-1">Status:</span>
            <StatusBadge status={contract.status} size="sm" />
          </div>
        </div>
      </div>
    </ActionCard>
  );
};

export default ContractCard; 