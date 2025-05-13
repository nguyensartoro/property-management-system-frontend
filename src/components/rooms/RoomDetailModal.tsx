import React from 'react';
import { Room, Contract, Renter } from '../../interface/interfaces';
import StatusBadge from '../shared/StatusBadge';
import Modal from '../shared/Modal';

interface RoomDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onEdit?: (room: Room) => void;
}

const RoomDetailModal: React.FC<RoomDetailModalProps> = ({ isOpen, onClose, room, onEdit }: RoomDetailModalProps) => {
  if (!isOpen || !room) return null;

  const contracts: Contract[] = room.contracts || [];
  const renters: Renter[] = room.renters || [];

  const handleEdit = () => {
    if (onEdit && room) {
      onEdit(room);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Room ${room.number}`} size="lg">
      <div className="p-6">
        <div className="flex justify-between mb-6">
          <StatusBadge status={room.status} size="md" />
          <span className="text-lg font-semibold text-primary-600">${room.price}/mo</span>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-medium text-secondary-500">Room Details</h4>
            <div className="space-y-3 text-secondary-900">
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span>Name:</span>
                <span className="font-medium">{room.name}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span>Floor:</span>
                <span className="font-medium">{room.floor ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span>Size:</span>
                <span className="font-medium">{room.size ? `${room.size} sqft` : 'N/A'}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span>Status:</span>
                <span className="font-medium">{room.status}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-secondary-500">Description</h4>
            <div className="text-secondary-900">
              {room.description || <span className="text-gray-400">No description</span>}
            </div>
          </div>
        </div>

        {/* Contracts Section */}
        <div className="mb-6">
          <h4 className="mb-2 text-sm font-medium text-secondary-500">Contracts</h4>
          {contracts.length === 0 ? (
            <span className="text-gray-400">None</span>
          ) : (
            <div className="space-y-3">
              {contracts.map((contract) => (
                <div key={contract.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                  <div className="flex flex-wrap gap-4 justify-between items-center mb-1">
                    <span className="font-semibold text-primary-700">{contract.contractType === 'longTerm' ? 'Long Term' : 'Short Term'}</span>
                    <span className="text-xs rounded px-2 py-0.5 bg-gray-200 text-secondary-700">{contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}</span>
                    <span className="font-semibold text-primary-600">${contract.amount}</span>
                  </div>
                  <div className="text-xs text-secondary-700 mb-1">{contract.startDate} - {contract.endDate}</div>
                  <div className="text-xs text-secondary-700">Renters: {contract.renterNames && contract.renterNames.length > 0 ? contract.renterNames.join(', ') : 'None'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Renters Section */}
        <div className="mb-6">
          <h4 className="mb-2 text-sm font-medium text-secondary-500">Renters</h4>
          {renters.length === 0 ? (
            <span className="text-gray-400">None</span>
          ) : (
            <div className="space-y-3">
              {renters.map((renter) => (
                <div key={renter.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                  {renter.avatar ? (
                    <img src={renter.avatar} alt={renter.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">?
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-secondary-900">{renter.name}</div>
                    <div className="text-xs text-secondary-700">{renter.email} | {renter.phone}</div>
                    <div className="text-xs text-secondary-500">Check-in: {renter.checkInDate || 'N/A'} | Check-out: {renter.checkOutDate || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4 mt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-secondary-700 hover:bg-gray-50"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={handleEdit}
              className="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              Edit Room
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RoomDetailModal;