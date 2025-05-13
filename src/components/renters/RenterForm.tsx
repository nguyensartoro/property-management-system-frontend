import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Camera, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_RENTER, UPDATE_RENTER, UPLOAD_AVATAR, UPLOAD_DOCUMENT, GET_AVAILABLE_ROOMS } from '../../providers/RenterProvider';
import Modal from '../shared/Modal';

interface RenterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: any;
  closeOtherModals?: () => void;
}

const RenterForm: React.FC<RenterFormProps> = ({ isOpen, onClose, onSubmit, editData, closeOtherModals }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    emergencyContact: '',
    identityNumber: '',
    roomId: '',
  });

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [identityPreview, setIdentityPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{avatar: number, document: number, identity: number}>({
    avatar: 0,
    document: 0,
    identity: 0
  });
  const [uploading, setUploading] = useState<{avatar: boolean, document: boolean, identity: boolean}>({
    avatar: false,
    document: false,
    identity: false
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const identityInputRef = useRef<HTMLInputElement>(null);

  const [createRenter] = useMutation(CREATE_RENTER);
  const [updateRenter] = useMutation(UPDATE_RENTER);
  const [uploadAvatar] = useMutation(UPLOAD_AVATAR);
  const [uploadDocument] = useMutation(UPLOAD_DOCUMENT);

  const { data: roomsData } = useQuery(GET_AVAILABLE_ROOMS);
  const availableRooms = roomsData?.rooms?.nodes || [];

  useEffect(() => {
    if (isOpen && closeOtherModals) {
      closeOtherModals();
    }
  }, [isOpen, closeOtherModals]);

  useEffect(() => {
    if (editData) {
      setFormData({
        id: editData.id || '',
        name: editData.name || '',
        email: editData.email || '',
        phone: editData.phone || '',
        emergencyContact: editData.emergencyContact || '',
        identityNumber: editData.identityNumber || '',
        roomId: editData.roomId || '',
      });

      if (editData.roomId) {
        setSelectedRoom(editData.roomId);
      }

      if (editData.avatar) {
        setAvatarPreview(editData.avatar);
      }

      if (editData.documents && editData.documents.length > 0) {
        setDocumentPreview(editData.documents[0].path);
      }
    } else {
      resetForm();
    }
  }, [editData, isOpen]);

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      emergencyContact: '',
      identityNumber: '',
      roomId: '',
    });
    setSelectedRoom(null);
    setAvatarFile(null);
    setDocumentFile(null);
    setIdentityFile(null);
    setAvatarPreview(null);
    setDocumentPreview(null);
    setIdentityPreview(null);
    setUploadProgress({avatar: 0, document: 0, identity: 0});
    setUploading({avatar: false, document: false, identity: false});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'roomId' && value) {
      setSelectedRoom(value);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Avatar image must be less than 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, GIF)');
        return;
      }

      setAvatarFile(file);
      setUploading({...uploading, avatar: true});

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setUploadProgress(prev => ({...prev, avatar: progress}));
        if (progress >= 100) {
          clearInterval(interval);
          setUploading({...uploading, avatar: false});
        }
      }, 100);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Identity document must be less than 10MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid document file (JPEG, PNG, PDF)');
        return;
      }

      setIdentityFile(file);
      setUploading({...uploading, identity: true});

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setUploadProgress(prev => ({...prev, identity: progress}));
        if (progress >= 100) {
          clearInterval(interval);
          setUploading({...uploading, identity: false});
        }
      }, 100);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdentityPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Document must be less than 10MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid document file (JPEG, PNG, PDF)');
        return;
      }

      setDocumentFile(file);
      setUploading({...uploading, document: true});

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setUploadProgress(prev => ({...prev, document: progress}));
        if (progress >= 100) {
          clearInterval(interval);
          setUploading({...uploading, document: false});
        }
      }, 100);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatarPreview = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const removeDocumentPreview = () => {
    setDocumentPreview(null);
    setDocumentFile(null);
  };

  const removeIdentityPreview = () => {
    setIdentityPreview(null);
    setIdentityFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      let renterId = formData.id;

      // Create or update renter
      if (editData) {
        // Update existing renter
        const { data } = await updateRenter({
          variables: {
            id: editData.id,
            input: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              emergencyContact: formData.emergencyContact,
              identityNumber: formData.identityNumber,
              roomId: selectedRoom,
            }
          }
        });

        if (data?.updateRenter) {
          toast.success("Renter updated successfully");
          renterId = data.updateRenter.id;
        } else {
          throw new Error("Failed to update renter");
        }

      } else {
        // Create new renter
        const { data } = await createRenter({
          variables: {
            input: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              emergencyContact: formData.emergencyContact,
              identityNumber: formData.identityNumber,
              roomId: selectedRoom,
            }
          }
        });

        if (data?.createRenter) {
          toast.success("Renter created successfully");
          renterId = data.createRenter.id;
        } else {
          throw new Error("Failed to create renter");
        }
      }

      // Upload avatar if selected
      if (avatarFile && renterId) {
        try {
          const { data: avatarData } = await uploadAvatar({
            variables: {
              id: renterId,
              file: avatarFile
            }
          });

          if (!avatarData?.uploadAvatar?.success) {
            toast.error("Avatar upload failed");
          }
        } catch (error) {
          toast.error(`Avatar upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }

      // Upload document if selected
      if (documentFile && renterId) {
        try {
          const { data: documentData } = await uploadDocument({
            variables: {
              input: {
                name: `ID Document - ${formData.name}`,
                type: 'ID',
                path: 'document-image-path', // This will be replaced by the backend
                renterId: renterId
              },
              file: documentFile
            }
          });

          if (!documentData?.createDocument) {
            toast.error("Document upload failed");
          }
        } catch (error) {
          toast.error(`Document upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }

      // Upload identity document if selected
      if (identityFile && renterId) {
        try {
          const { data: identityData } = await uploadDocument({
            variables: {
              input: {
                name: `Identity - ${formData.name}`,
                type: 'ID_CARD',
                path: 'identity-image-path', // This will be replaced by the backend
                renterId: renterId
              },
              file: identityFile
            }
          });

          if (!identityData?.createDocument) {
            toast.error("Identity document upload failed");
          }
        } catch (error) {
          toast.error(`Identity document upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }

      // Call onSubmit and close
      onSubmit(formData);
      onClose();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Renter' : 'Add New Renter'} size="lg">
      <form onSubmit={handleSubmit} className="min-w-[680px]">
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
          {/* Avatar upload */}
          <div className="flex col-span-full justify-center mb-4">
            <div className="relative">
              <div
                className="flex overflow-hidden justify-center items-center w-24 h-24 bg-gray-200 rounded-full border-2 cursor-pointer border-primary-100"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="object-cover w-full h-full" />
                ) : (
                  <Camera size={32} className="text-gray-400" />
                )}

                {uploading.avatar && (
                  <div className="flex absolute inset-0 justify-center items-center bg-black bg-opacity-40">
                    <div className="overflow-hidden w-16 h-2 bg-gray-700 rounded-full">
                      <div
                        className="h-full bg-primary-500"
                        style={{ width: `${uploadProgress.avatar}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              {avatarPreview ? (
                <button
                  type="button"
                  className="absolute right-0 bottom-0 p-1 text-white bg-red-500 rounded-full"
                  onClick={removeAvatarPreview}
                >
                  <X size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="absolute right-0 bottom-0 p-1 text-white rounded-full bg-primary-500"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Upload size={16} />
                </button>
              )}
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-700" htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-700" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="e.g. john@example.com"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-700" htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="e.g. 123-456-7890"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-700" htmlFor="emergencyContact">
              Emergency Contact
            </label>
            <input
              type="tel"
              id="emergencyContact"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="e.g. 555-987-6543"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-700" htmlFor="identityNumber">
              Identity Document
            </label>
            <div className="relative">
              <div
                className="flex justify-between items-center px-4 py-2 w-full rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50"
                onClick={() => identityInputRef.current?.click()}
              >
                <span className="text-secondary-500">
                  {identityFile ? identityFile.name : "Upload identity document"}
                </span>
                <FileText size={18} className="text-secondary-400" />
              </div>
              <input
                type="file"
                ref={identityInputRef}
                onChange={handleIdentityChange}
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                className="hidden"
                id="identityDocument"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-700" htmlFor="roomId">
              Assign Room
            </label>
            <select
              id="roomId"
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="">Select a room</option>
              {availableRooms.map((room: any) => (
                <option key={room.id} value={room.id}>
                  {room.number} - {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Identity document preview if available */}
        {identityPreview && (
          <div className="p-3 mb-6 rounded-md border">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Identity Document Preview:</p>
              <button
                type="button"
                onClick={removeIdentityPreview}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex overflow-hidden justify-center items-center h-40 bg-gray-100 rounded-md">
              {identityPreview.includes('data:application/pdf') ? (
                <p className="text-secondary-700">PDF Document</p>
              ) : (
                <img src={identityPreview} alt="Identity document preview" className="object-contain max-h-full" />
              )}
            </div>
          </div>
        )}

        {/* Document preview if available */}
        {documentPreview && (
          <div className="p-3 mb-6 rounded-md border">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Document Preview:</p>
              <button
                type="button"
                onClick={removeDocumentPreview}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex overflow-hidden justify-center items-center h-40 bg-gray-100 rounded-md">
              {documentPreview.includes('data:application/pdf') ? (
                <p className="text-secondary-700">PDF Document</p>
              ) : (
                <img src={documentPreview} alt="Document preview" className="object-contain max-h-full" />
              )}
            </div>
          </div>
        )}

        {/* Room assignment details - only visible if a room is selected */}
        {selectedRoom && (
          <div className="p-4 mb-6 rounded-md border border-primary-100 bg-primary-50">
            <h4 className="mb-2 font-medium text-secondary-900">Room Assignment Details</h4>
            <p className="mb-1 text-sm text-secondary-700">
              The renter will be assigned to the selected room upon submission.
              Additional contract details can be managed in the Contracts section.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-secondary-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {editData ? 'Save Changes' : 'Add Renter'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RenterForm;