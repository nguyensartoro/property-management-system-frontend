import React from 'react';
import Modal from '../shared/Modal';
import RoomForm from './RoomForm';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
  onSuccess?: () => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  onSuccess,
}) => {
  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Room"
      size="lg"
    >
      <RoomForm 
        propertyId={propertyId} 
        onSuccess={handleSuccess} 
        onCancel={onClose} 
      />
    </Modal>
  );
};

export default CreateRoomModal;