import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRenterStore } from '../../stores/renterStore';
import { useRoomStore } from '../../stores/roomStore';
import { DocumentType, EntityType, useDocumentStore } from '../../stores/documentStore';
import FileUpload from '../shared/FileUpload';

interface RenterFormProps {
  renterId?: string;
  roomId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface RenterFormData {
  name: string;
  email?: string;
  phone: string;
  emergencyContact?: string;
  identityNumber?: string;
  roomId?: string;
}

const RenterForm: React.FC<RenterFormProps> = ({
  renterId,
  roomId: initialRoomId,
  onSuccess,
  onCancel,
}) => {
  const { createRenter, updateRenter, selectedRenter } = useRenterStore();
  const { rooms, fetchRooms } = useRoomStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [newRenterId, setNewRenterId] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RenterFormData>({
    defaultValues: renterId && selectedRenter
      ? {
          name: selectedRenter.name,
          email: selectedRenter.email || '',
          phone: selectedRenter.phone,
          emergencyContact: selectedRenter.emergencyContact || '',
          identityNumber: selectedRenter.identityNumber || '',
          roomId: selectedRenter.roomId || '',
        }
      : {
          name: '',
          email: '',
          phone: '',
          emergencyContact: '',
          identityNumber: '',
          roomId: initialRoomId || '',
        },
  });

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (initialRoomId) {
      setValue('roomId', initialRoomId);
    }
  }, [initialRoomId, setValue]);

  const onSubmit = async (data: RenterFormData) => {
    try {
      setIsSubmitting(true);
      
      if (renterId) {
        // Update existing renter
        await updateRenter(renterId, data);
        if (onSuccess) onSuccess();
      } else {
        // Create new renter
        const newRenter = await createRenter(data);
        setNewRenterId(newRenter.id);
        setShowFileUpload(true);
      }
      
      if (!renterId) {
        reset();
      }
    } catch (error) {
      console.error('Error submitting renter form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUploadComplete = () => {
    if (onSuccess) onSuccess();
  };

  // Filter available rooms
  const availableRooms = rooms.filter(room => 
    room.status === 'AVAILABLE' || (selectedRenter?.roomId === room.id)
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {!showFileUpload ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter renter's full name"
                {...register('name', { required: 'Full name is required' })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email (optional)
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter email address"
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
                {...register('phone', { required: 'Phone number is required' })}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact (optional)
              </label>
              <input
                id="emergencyContact"
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter emergency contact"
                {...register('emergencyContact')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="identityNumber" className="block text-sm font-medium text-gray-700 mb-1">
                ID Number (optional)
              </label>
              <input
                id="identityNumber"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter ID number"
                {...register('identityNumber')}
              />
            </div>

            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                Assign Room (optional)
              </label>
              <select
                id="roomId"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...register('roomId')}
                disabled={!!initialRoomId}
              >
                <option value="">Select a room</option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} ({room.number})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            {onCancel && (
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : renterId ? 'Update Renter' : 'Create Renter'}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Identification Documents</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload identification documents for the renter. You can skip this step and add documents later.
          </p>
          
          {newRenterId && (
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">ID Card</h4>
                <FileUpload
                  entityId={newRenterId}
                  entityType={EntityType.RENTER}
                  documentType={DocumentType.ID_CARD}
                  allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                />
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Passport (Optional)</h4>
                <FileUpload
                  entityId={newRenterId}
                  entityType={EntityType.RENTER}
                  documentType={DocumentType.PASSPORT}
                  allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={handleFileUploadComplete}
            >
              Complete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RenterForm;