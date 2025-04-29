import React from 'react';
import { X, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../ui/toast';

interface Renter {
  id: string;
  name: string;
}

interface ContractDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  contract: {
    id: string;
    contractId?: string;
    roomId: string;
    roomName?: string;
    roomNumber?: string;
    type?: string;
    contractType?: 'longTerm' | 'shortTerm';
    status: string;
    startDate: string;
    endDate: string;
    amount: number;
    renters?: Renter[];
    renterIds?: string[];
    renterNames?: string[];
  } | null;
}

const ContractDetailsModal: React.FC<ContractDetailsProps> = ({ 
  isOpen, 
  onClose, 
  onEdit,
  contract 
}) => {
  const navigate = useNavigate();

  if (!isOpen || !contract) return null;
  
  // Normalize contract data to handle both data formats
  const contractId = contract.contractId || contract.id;
  const roomNumber = contract.roomNumber || contract.roomName;
  const contractType = contract.type || (contract.contractType === 'longTerm' ? 'Long Term' : 'Short Term');
  
  // Handle both renters array and renterNames array
  const renderRenters = () => {
    if (contract.renters && contract.renters.length > 0) {
      return contract.renters.map(renter => (
        <div key={renter.id} className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
            {renter.name.charAt(0)}
          </div>
          <button
            onClick={() => navigateToRenter(renter.id)}
            className="text-primary-600 hover:underline"
          >
            {renter.name}
          </button>
          <p className="text-secondary-500 text-sm">ID: {renter.id}</p>
        </div>
      ));
    } else if (contract.renterNames && contract.renterIds) {
      return contract.renterNames.map((name, index) => {
        const renterId = contract.renterIds ? contract.renterIds[index] : `renter-${index}`;
        return (
          <div key={renterId} className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
              {name.charAt(0)}
            </div>
            <button
              onClick={() => navigateToRenter(renterId)}
              className="text-primary-600 hover:underline"
            >
              {name}
            </button>
            <p className="text-secondary-500 text-sm">ID: {renterId}</p>
          </div>
        );
      });
    }
    return <p className="text-secondary-500">No renters found.</p>;
  };

  const navigateToRenter = (renterId: string) => {
    onClose();
    navigate(`/renters?highlight=${renterId}`);
    
    // Simulating highlighting effect when the page loads
    setTimeout(() => {
      toast({
        title: "Navigation Complete",
        description: `Navigated to Renter ID: ${renterId}`,
      });
    }, 500);
  };

  const handleDelete = () => {
    toast({
      title: "Contract Deleted",
      description: `Contract ${contractId} has been deleted.`,
    });
    onClose();
  };

  const formattedDate = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-secondary-900">Contract Details</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                toast({
                  title: "Print Requested",
                  description: "Contract is being prepared for printing.",
                });
              }}
              className="text-secondary-500 hover:text-secondary-700 p-1"
              aria-label="Print"
            >
              <Printer size={20} />
            </button>
            <button
              onClick={onClose}
              className="text-secondary-500 hover:text-secondary-700 p-1"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-medium text-secondary-900">Rental Agreement</h4>
            <div className="flex gap-3">
              <button 
                onClick={onEdit}
                className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-md text-secondary-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button 
                onClick={handleDelete}
                className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h5 className="text-sm text-secondary-500 mb-2">Room Information</h5>
              <p className="text-secondary-900 font-medium">Room {roomNumber}</p>
              <p className="text-secondary-700">ID: {contract.roomId}</p>
            </div>

            <div>
              <h5 className="text-sm text-secondary-500 mb-2">Contract Information</h5>
              <p className="text-secondary-900">Contract ID: {contractId}</p>
              <p className="flex items-center gap-2 mt-1">
                <span className="text-secondary-700">Type:</span>
                <span className="bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full text-xs font-medium">
                  {contractType}
                </span>
              </p>
              <p className="flex items-center gap-2 mt-1">
                <span className="text-secondary-700">Status:</span>
                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-medium">
                  {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                </span>
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h5 className="text-sm text-secondary-500 mb-3">Renters</h5>
            {renderRenters()}
          </div>

          <div className="mb-8">
            <h5 className="text-sm text-secondary-500 mb-3">Period & Payment</h5>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-secondary-500 text-sm">Start Date:</p>
                <p className="text-secondary-900 font-medium">{formattedDate(contract.startDate)}</p>
              </div>
              <div>
                <p className="text-secondary-500 text-sm">End Date:</p>
                <p className="text-secondary-900 font-medium">{formattedDate(contract.endDate)}</p>
              </div>
              <div>
                <p className="text-secondary-500 text-sm">Amount:</p>
                <p className="text-secondary-900 font-medium">${contract.amount}</p>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-sm text-secondary-500 mb-3">Contract Terms</h5>
            <div className="bg-gray-50 p-4 rounded-md text-secondary-700 text-sm">
              <p className="mb-4">
                This Rental Agreement ("Agreement") is made and entered into on {formattedDate(contract.startDate)} by and between the Landlord and the Tenant(s) identified above.
              </p>
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  <strong>PREMISES:</strong> The Landlord hereby leases to the Tenant, and the Tenant hereby leases from the Landlord, the residential premises known as Room {roomNumber} ("the Premises").
                </li>
                <li>
                  <strong>TERM:</strong> The term of this Agreement shall begin on {formattedDate(contract.startDate)} and end on {formattedDate(contract.endDate)} unless terminated earlier as provided in this Agreement.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetailsModal; 