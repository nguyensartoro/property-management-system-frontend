import React from 'react';
import { Contract, Room, Renter } from '../../utils/apiClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ContractForm from './ContractForm';

interface ContractFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  contract?: Contract | null;
  rooms: Room[];
  renters: Renter[];
  isLoading?: boolean;
}

const ContractFormModal: React.FC<ContractFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  contract,
  rooms,
  renters,
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {contract 
              ? 'Update the contract information below'
              : 'Fill out the form below to create a new rental contract'
            }
          </DialogDescription>
        </DialogHeader>

        <ContractForm
          contract={contract}
          rooms={rooms}
          renters={renters}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ContractFormModal;