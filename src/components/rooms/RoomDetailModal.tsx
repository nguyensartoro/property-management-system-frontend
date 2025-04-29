import React from 'react';
import { X, Home, User, Calendar, Droplets, Zap, Wifi } from 'lucide-react';
import { Unit } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import { renters } from '../../data/mockData';

interface RoomDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Unit | null;
  onEdit?: (room: Unit) => void;
}

const RoomDetailModal: React.FC<RoomDetailModalProps> = ({ isOpen, onClose, room, onEdit }) => {
  if (!isOpen || !room) return null;
  
  const renter = room.renter || renters.find(r => r.unitId === room.id);
  
  const handleEdit = () => {
    if (onEdit && room) {
      onEdit(room);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            <Home size={18} className="text-primary-500 mr-2" />
            <h3 className="text-xl font-semibold text-secondary-900">Room {room.roomNumber}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between mb-6">
            <StatusBadge status={room.status} size="md" />
            <span className="text-primary-600 font-semibold text-lg">${room.price}/mo</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-secondary-500 mb-2">Room Details</h4>
              <div className="space-y-3 text-secondary-900">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span>Type:</span>
                  <span className="font-medium">{room.type}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span>Floor:</span>
                  <span className="font-medium">{room.floor || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span>Size:</span>
                  <span className="font-medium">{room.size ? `${room.size} sqft` : 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span>Rental Term:</span>
                  <span className="font-medium">{room.rentalTerm} Term</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-secondary-500 mb-2">Occupancy</h4>
              <div className="space-y-3 text-secondary-900">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span>Status:</span>
                  <StatusBadge status={room.status} size="sm" />
                </div>
                {room.checkInDate && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span>Check-in:</span>
                    <span className="font-medium">{room.checkInDate}</span>
                  </div>
                )}
                {room.checkOutDate && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span>Check-out:</span>
                    <span className="font-medium">{room.checkOutDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Services Section */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-secondary-500 mb-2">Services</h4>
            {room.services && room.services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {room.services.map((service, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 text-secondary-700 text-xs px-2 py-1 rounded-full flex items-center"
                  >
                    {service === 'Wi-Fi' && <Wifi size={12} className="mr-1 text-indigo-500" />}
                    {service === 'Electric' && <Zap size={12} className="mr-1 text-amber-500" />}
                    {service === 'Water' && <Droplets size={12} className="mr-1 text-blue-500" />}
                    {service}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No services added</p>
            )}
          </div>
          
          {/* Renter Section */}
          {renter && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-secondary-500 mb-2">Current Renter</h4>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                {renter.avatar ? (
                  <img 
                    src={renter.avatar} 
                    alt={renter.name} 
                    className="w-10 h-10 rounded-full object-cover mr-3" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <User size={16} className="text-gray-500" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-secondary-900">{renter.name}</div>
                  <div className="text-secondary-500 text-sm">{renter.email}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Usage Section */}
          {(room.electricUsage !== undefined || room.waterUsage !== undefined) && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-secondary-500 mb-2">Utility Usage</h4>
              <div className="space-y-3 text-secondary-900">
                {room.electricUsage !== undefined && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="flex items-center">
                      <Zap size={14} className="text-amber-500 mr-2" />
                      Electric:
                    </span>
                    <span className="font-medium">{room.electricUsage} kWh</span>
                  </div>
                )}
                {room.waterUsage !== undefined && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="flex items-center">
                      <Droplets size={14} className="text-blue-500 mr-2" />
                      Water:
                    </span>
                    <span className="font-medium">{room.waterUsage} m³</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-secondary-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              Edit Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailModal; 