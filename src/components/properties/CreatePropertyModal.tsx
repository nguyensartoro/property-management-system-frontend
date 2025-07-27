import React from 'react';
import Modal from '../shared/Modal';
import PropertyForm from './PropertyForm';

interface CreatePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreatePropertyModal: React.FC<CreatePropertyModalProps> = ({
  isOpen,
  onClose,
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
      title="Create New Property"
      size="lg"
    >
      <PropertyForm onSuccess={handleSuccess} onCancel={onClose} />
    </Modal>
  );
};

export default CreatePropertyModal;