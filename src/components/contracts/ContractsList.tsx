import React from 'react';
import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
import ContractCard from './ContractCard';
import StatusBadge from '../shared/StatusBadge';
import { toast } from 'react-hot-toast';
import { Edit, Info } from 'lucide-react';

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

interface ContractsListProps {
  contracts: Contract[];
  viewMode: 'grid' | 'list';
  onViewContract?: (contract: Contract) => void;
  onEditContract?: (contract: Contract) => void;
}

const ContractsList: React.FC<ContractsListProps> = ({
  contracts,
  viewMode,
  onViewContract,
  onEditContract
}: ContractsListProps) => {
  // const navigate = useNavigate();

  const handleViewContract = (contractId: string): void => {
    const contract = contracts.find((c: Contract) => c.id === contractId);
    if (contract) {
      if (onViewContract) {
        onViewContract(contract);
      } else {
        toast.success('Viewing details for contract');
        // navigate(`/contracts/${contractId}`);
      }
    }
  };

  const handleEditContract = (contractId: string): void => {
    const contract = contracts.find((c: Contract) => c.id === contractId);
    if (contract) {
      if (onEditContract) {
        onEditContract(contract);
      } else {
        toast.success('Editing contract');
        // navigate(`/contracts/edit/${contractId}`);
      }
    }
  };

  // Get displayable contract type label
  const getContractTypeDisplay = (type: 'longTerm' | 'shortTerm'): 'Long Term' | 'Short Term' => {
    return type === 'longTerm' ? 'Long Term' : 'Short Term';
  };

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {contracts.map((contract: Contract, index: number) => (
          <motion.div
            key={contract.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ContractCard
              contract={contract}
              onView={() => handleViewContract(contract.id)}
              onEdit={() => handleEditContract(contract.id)}
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
            <th>Room</th>
            <th>Renters</th>
            <th>Period</th>
            <th>Type</th>
            <th>Status</th>
            <th>Amount</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract: Contract) => (
            <tr key={contract.id}>
              <td className="font-medium">{contract.roomName}</td>
              <td>{contract.renterNames.join(', ')}</td>
              <td className="text-secondary-500">
                {contract.startDate} - {contract.endDate}
              </td>
              <td>
                <StatusBadge status={getContractTypeDisplay(contract.contractType)} size="sm" />
              </td>
              <td>
                <StatusBadge status={contract.status} size="sm" />
              </td>
              <td className="font-medium">${contract.amount.toLocaleString()}</td>
              <td className="text-right">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleViewContract(contract.id)}
                    className="p-1 transition-colors text-secondary-500 hover:text-primary-500"
                    aria-label="View details"
                  >
                    <Info size={18} />
                  </button>
                  <button
                    onClick={() => handleEditContract(contract.id)}
                    className="p-1 transition-colors text-secondary-500 hover:text-primary-500"
                    aria-label="Edit contract"
                  >
                    <Edit size={18} />
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

export default ContractsList;