import React, { useEffect } from 'react';
import Modal from '../shared/Modal';
import RoomForm from './RoomForm';
import { useRoomStore } from '../../stores/roomStore';

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  onSuccess?: () => void;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({
  isOpen,
  onClose,
  roomId,
  onSuccess,
}) => {
  const { fetchRoomById } = useRoomStore();

  useEffect(() => {
    if (isOpen && roomId) {
      fetchRoomById(roomId);
    }
  }, [isOpen, roomId, fetchRoomById]);

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Room"
      size="lg"
    >
      <RoomForm 
        roomId={roomId} 
        onSuccess={handleSuccess} 
        onCancel={onClose} 
      />
    </Modal>
  );
};

export default EditRoomModal;