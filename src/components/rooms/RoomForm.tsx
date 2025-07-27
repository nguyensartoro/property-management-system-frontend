import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRoomStore } from '../../stores/roomStore';
import { usePropertyStore } from '../../stores/propertyStore';
import { DocumentType, EntityType, useDocumentStore } from '../../stores/documentStore';
import FileUpload from '../shared/FileUpload';
import { RoomStatus } from '../../utils/apiClient';

interface RoomFormProps {
  roomId?: string;
  propertyId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface RoomFormData {
  name: string;
  number: string;
  floor: number;
  size: number;
  description?: string;
  status: RoomStatus;
  price: number;
  propertyId: string;
  type?: string;
}

const RoomForm: React.FC<RoomFormProps> = ({
  roomId,
  propertyId: initialPropertyId,
  onSuccess,
  onCancel,
}) => {
  const { createRoom, updateRoom, selectedRoom } = useRoomStore();
  const { properties, fetchProperties } = usePropertyStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [newRoomId, setNewRoomId] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RoomFormData>({
    defaultValues: roomId && selectedRoom
      ? {
          name: selectedRoom.name,
          number: selectedRoom.number,
          floor: selectedRoom.floor,
          size: selectedRoom.size,
          description: selectedRoom.description || '',
          status: selectedRoom.status,
          price: selectedRoom.price,
          propertyId: selectedRoom.propertyId,
          type: selectedRoom.type || '',
        }
      : {
          name: '',
          number: '',
          floor: 1,
          size: 0,
          description: '',
          status: RoomStatus.AVAILABLE,
          price: 0,
          propertyId: initialPropertyId || '',
          type: '',
        },
  });

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    if (initialPropertyId) {
      setValue('propertyId', initialPropertyId);
    }
  }, [initialPropertyId, setValue]);

  const onSubmit = async (data: RoomFormData) => {
    try {
      setIsSubmitting(true);
      
      if (roomId) {
        // Update existing room
        await updateRoom(roomId, data);
        if (onSuccess) onSuccess();
      } else {
        // Create new room
        const newRoom = await createRoom(data);
        setNewRoomId(newRoom.id);
        setShowFileUpload(true);
      }
      
      if (!roomId) {
        reset();
      }
    } catch (error) {
      console.error('Error submitting room form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUploadComplete = () => {
    if (onSuccess) onSuccess();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {!showFileUpload ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Room Name
              </label>
              <input
                id="name"
                type="text"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter room name"
                {...register('name', { required: 'Room name is required' })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                Room Number
              </label>
              <input
                id="number"
                type="text"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter room number"
                {...register('number', { required: 'Room number is required' })}
              />
              {errors.number && (
                <p className="mt-1 text-sm text-red-600">{errors.number.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                Floor
              </label>
              <input
                id="floor"
                type="number"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.floor ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('floor', { 
                  required: 'Floor is required',
                  valueAsNumber: true,
                })}
              />
              {errors.floor && (
                <p className="mt-1 text-sm text-red-600">{errors.floor.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                Size (sq ft)
              </label>
              <input
                id="size"
                type="number"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.size ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('size', { 
                  required: 'Size is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Size must be greater than 0' },
                })}
              />
              {errors.size && (
                <p className="mt-1 text-sm text-red-600">{errors.size.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                id="price"
                type="number"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('price', { 
                  required: 'Price is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Price cannot be negative' },
                })}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('status', { required: 'Status is required' })}
              >
                <option value={RoomStatus.AVAILABLE}>Available</option>
                <option value={RoomStatus.OCCUPIED}>Occupied</option>
                <option value={RoomStatus.MAINTENANCE}>Maintenance</option>
                <option value={RoomStatus.RESERVED}>Reserved</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700 mb-1">
                Property
              </label>
              <select
                id="propertyId"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.propertyId ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('propertyId', { required: 'Property is required' })}
                disabled={!!initialPropertyId}
              >
                <option value="">Select a property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              {errors.propertyId && (
                <p className="mt-1 text-sm text-red-600">{errors.propertyId.message}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Room Type (optional)
            </label>
            <input
              id="type"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., Studio, 1BR, 2BR, etc."
              {...register('type')}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter room description"
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="flex justify-end space-x-3">
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
              {isSubmitting ? 'Saving...' : roomId ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Room Images</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload images for your room. You can skip this step and add images later.
          </p>
          
          {newRoomId && (
            <FileUpload
              entityId={newRoomId}
              entityType={EntityType.ROOM}
              documentType={DocumentType.OTHER}
              allowedTypes={['image/jpeg', 'image/png', 'image/gif']}
              onUploadComplete={handleFileUploadComplete}
            />
          )}
          
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={handleFileUploadComplete}
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomForm;