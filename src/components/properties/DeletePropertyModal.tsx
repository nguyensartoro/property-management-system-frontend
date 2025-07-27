import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { usePropertyStore } from '../../stores/propertyStore';
import { AlertTriangle } from 'lucide-react';

interface DeletePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  onSuccess?: () => void;
}

const DeletePropertyModal: React.FC<DeletePropertyModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyName,
  onSuccess,
}) => {
  const { deleteProperty } = usePropertyStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await deleteProperty(propertyId);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete property');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Property"
      size="md"
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 bg-red-100 rounded-full p-2 mr-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Are you sure you want to delete this property?
          </h3>
        </div>
        
        <p className="mb-4 text-gray-500">
          You are about to delete <span className="font-medium text-gray-700">"{propertyName}"</span>. 
          This action cannot be undone and will also delete all rooms, documents, and other data associated with this property.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Property'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeletePropertyModal;