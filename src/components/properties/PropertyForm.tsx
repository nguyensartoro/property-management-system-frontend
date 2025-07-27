import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { usePropertyStore } from '../../stores/propertyStore';
import { DocumentType, EntityType, useDocumentStore } from '../../stores/documentStore';
import FileUpload from '../shared/FileUpload';

interface PropertyFormProps {
  propertyId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface PropertyFormData {
  name: string;
  address: string;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  propertyId,
  onSuccess,
  onCancel,
}) => {
  const { createProperty, updateProperty, selectedProperty } = usePropertyStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [newPropertyId, setNewPropertyId] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PropertyFormData>({
    defaultValues: propertyId && selectedProperty
      ? {
          name: selectedProperty.name,
          address: selectedProperty.address,
        }
      : {
          name: '',
          address: '',
        },
  });

  const onSubmit = async (data: PropertyFormData) => {
    try {
      setIsSubmitting(true);
      
      if (propertyId) {
        // Update existing property
        await updateProperty(propertyId, data);
        if (onSuccess) onSuccess();
      } else {
        // Create new property
        const newProperty = await createProperty(data);
        setNewPropertyId(newProperty.id);
        setShowFileUpload(true);
      }
      
      if (!propertyId) {
        reset();
      }
    } catch (error) {
      console.error('Error submitting property form:', error);
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
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Property Name
            </label>
            <input
              id="name"
              type="text"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter property name"
              {...register('name', { required: 'Property name is required' })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              id="address"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter property address"
              rows={3}
              {...register('address', { required: 'Address is required' })}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
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
              {isSubmitting ? 'Saving...' : propertyId ? 'Update Property' : 'Create Property'}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Property Images</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload images for your property. You can skip this step and add images later.
          </p>
          
          {newPropertyId && (
            <FileUpload
              entityId={newPropertyId}
              entityType={EntityType.PROPERTY}
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

export default PropertyForm;