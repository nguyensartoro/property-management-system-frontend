import React, { useEffect, useState } from 'react';
import { useRoomStore } from '../../stores/roomStore';
import { usePropertyStore } from '../../stores/propertyStore';
import { useRenterStore } from '../../stores/renterStore';
import { DocumentType, EntityType } from '../../stores/documentStore';
import DocumentList from '../documents/DocumentList';
import { Home, MapPin, Edit, Trash2, Plus, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUpload from '../shared/FileUpload';

interface RoomDetailsProps {
  roomId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onAssignRenter?: () => void;
}

const RoomDetails: React.FC<RoomDetailsProps> = ({
  roomId,
  onEdit,
  onDelete,
  onAssignRenter,
}) => {
  const { selectedRoom, fetchRoomById, isLoading: roomLoading } = useRoomStore();
  const { properties, fetchProperties } = usePropertyStore();
  const { renters, fetchRenters } = useRenterStore();
  const [activeTab, setActiveTab] = useState<'details' | 'renters' | 'documents'>('details');
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchRoomById(roomId);
      fetchProperties();
      fetchRenters();
    }
  }, [roomId, fetchRoomById, fetchProperties, fetchRenters]);

  if (roomLoading || !selectedRoom) {
    return (
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-40 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  const property = properties.find(p => p.id === selectedRoom.propertyId);
  const roomRenters = renters.filter(renter => renter.roomId === roomId);

  const handleDocumentUploadComplete = () => {
    setShowUploadForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'OCCUPIED':
        return 'bg-blue-100 text-blue-800';
      case 'RESERVED':
        return 'bg-purple-100 text-purple-800';
      case 'MAINTENANCE':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedRoom.name}</h2>
              <span className={`ml-3 text-xs px-2 py-1 rounded-full ${getStatusColor(selectedRoom.status)}`}>
                {selectedRoom.status}
              </span>
            </div>
            <div className="flex items-center text-gray-500 mt-1">
              <Home className="w-4 h-4 mr-1" />
              <span>Room {selectedRoom.number}, Floor {selectedRoom.floor}</span>
            </div>
            {property && (
              <div className="flex items-center text-gray-500 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <Link to={`/properties/${property.id}`} className="hover:text-blue-600">
                  {property.name}
                </Link>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-500 hover:text-amber-600 transition-colors"
                title="Edit room"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Delete room"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex border-b border-gray-200 mt-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'renters'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('renters')}
          >
            Renters
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Room Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedRoom.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Room Number</p>
                    <p className="font-medium">{selectedRoom.number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Floor</p>
                    <p className="font-medium">{selectedRoom.floor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="font-medium">{selectedRoom.size} sq ft</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium">${selectedRoom.price}/month</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{selectedRoom.status}</p>
                  </div>
                  {selectedRoom.type && (
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium">{selectedRoom.type}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Created On</p>
                    <p className="font-medium">
                      {new Date(selectedRoom.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {selectedRoom.description && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700">{selectedRoom.description}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'renters' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Renters</h3>
              {onAssignRenter && selectedRoom.status !== 'OCCUPIED' && (
                <button
                  onClick={onAssignRenter}
                  className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Assign Renter
                </button>
              )}
            </div>

            {roomRenters.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-md text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No renters assigned</h3>
                <p className="text-gray-500 mb-4">
                  This room doesn't have any renters assigned yet.
                </p>
                {onAssignRenter && selectedRoom.status !== 'OCCUPIED' && (
                  <button
                    onClick={onAssignRenter}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Assign Renter
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {roomRenters.map(renter => (
                  <div key={renter.id} className="bg-gray-50 p-4 rounded-md">
                    <Link to={`/renters/${renter.id}`} className="block">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          {renter.avatar ? (
                            <img src={renter.avatar} alt={renter.name} className="w-10 h-10 rounded-full" />
                          ) : (
                            <span className="text-blue-600 font-medium">{renter.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{renter.name}</h4>
                          <div className="flex space-x-4 text-sm text-gray-500">
                            {renter.email && <span>{renter.email}</span>}
                            {renter.phone && <span>{renter.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Documents</h3>
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Upload Document
              </button>
            </div>

            {showUploadForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <h4 className="text-md font-medium text-gray-800 mb-2">Upload New Document</h4>
                <FileUpload
                  entityId={roomId}
                  entityType={EntityType.ROOM}
                  documentType={DocumentType.OTHER}
                  onUploadComplete={handleDocumentUploadComplete}
                />
              </div>
            )}

            <DocumentList
              entityId={roomId}
              entityType={EntityType.ROOM}
              onDelete={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetails;