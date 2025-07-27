import React, { useEffect } from 'react';
import Modal from '../shared/Modal';
import PropertyForm from './PropertyForm';
import { usePropertyStore } from '../../stores/propertyStore';

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  onSuccess?: () => void;
}

const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  onSuccess,
}) => {
  const { fetchPropertyById } = usePropertyStore();

  useEffect(() => {
    if (isOpen && propertyId) {
      fetchPropertyById(propertyId);
    }
  }, [isOpen, propertyId, fetchPropertyById]);

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Property"
      size="lg"
    >
      <PropertyForm 
        propertyId={propertyId} 
        onSuccess={handleSuccess} 
        onCancel={onClose} 
      />
    </Modal>
  );
};

export default EditPropertyModal;