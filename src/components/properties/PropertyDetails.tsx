import React, { useEffect, useState } from 'react';
import { usePropertyStore } from '../../stores/propertyStore';
import { useRoomStore } from '../../stores/roomStore';
import { DocumentType, EntityType } from '../../stores/documentStore';
import DocumentList from '../documents/DocumentList';
import { Home, MapPin, Edit, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUpload from '../shared/FileUpload';

interface PropertyDetailsProps {
  propertyId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddRoom?: () => void;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  propertyId,
  onEdit,
  onDelete,
  onAddRoom,
}) => {
  const { selectedProperty, fetchPropertyById, isLoading: propertyLoading } = usePropertyStore();
  const { rooms, fetchRoomsByProperty, isLoading: roomsLoading } = useRoomStore();
  const [activeTab, setActiveTab] = useState<'details' | 'rooms' | 'documents'>('details');
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyById(propertyId);
      fetchRoomsByProperty(propertyId);
    }
  }, [propertyId, fetchPropertyById, fetchRoomsByProperty]);

  if (propertyLoading || !selectedProperty) {
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

  const handleDocumentUploadComplete = () => {
    setShowUploadForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedProperty.name}</h2>
            <div className="flex items-center text-gray-500 mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{selectedProperty.address}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-500 hover:text-amber-600 transition-colors"
                title="Edit property"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Delete property"
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
              activeTab === 'rooms'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('rooms')}
          >
            Rooms
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Property Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedProperty.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{selectedProperty.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Rooms</p>
                    <p className="font-medium">{rooms.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created On</p>
                    <p className="font-medium">
                      {new Date(selectedProperty.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-blue-500 mb-1">Available Rooms</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {rooms.filter(room => room.status === 'AVAILABLE').length}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-sm text-green-500 mb-1">Occupied Rooms</p>
                  <p className="text-2xl font-bold text-green-700">
                    {rooms.filter(room => room.status === 'OCCUPIED').length}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-md">
                  <p className="text-sm text-amber-500 mb-1">Maintenance</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {rooms.filter(room => room.status === 'MAINTENANCE').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Rooms</h3>
              {onAddRoom && (
                <button
                  onClick={onAddRoom}
                  className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Room
                </button>
              )}
            </div>

            {roomsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-md animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-md text-center">
                <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No rooms found</h3>
                <p className="text-gray-500 mb-4">
                  This property doesn't have any rooms yet.
                </p>
                {onAddRoom && (
                  <button
                    onClick={onAddRoom}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add First Room
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map(room => (
                  <div key={room.id} className="bg-gray-50 p-4 rounded-md">
                    <Link to={`/rooms/${room.id}`} className="block">
                      <h4 className="font-medium text-gray-900">{room.name}</h4>
                      <p className="text-sm text-gray-500">Room {room.number}, Floor {room.floor}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium">${room.price}/month</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          room.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                          room.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-800' :
                          room.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {room.status}
                        </span>
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
                  entityId={propertyId}
                  entityType={EntityType.PROPERTY}
                  documentType={DocumentType.OTHER}
                  onUploadComplete={handleDocumentUploadComplete}
                />
              </div>
            )}

            <DocumentList
              entityId={propertyId}
              entityType={EntityType.PROPERTY}
              onDelete={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;