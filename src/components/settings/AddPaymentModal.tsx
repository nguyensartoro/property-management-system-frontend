import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { Wallet, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentMethodType {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPaymentMethod: (paymentMethod: any) => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ 
  isOpen, 
  onClose,
  onAddPaymentMethod
}) => {
  const paymentMethodTypes: PaymentMethodType[] = [
    { id: 'momo', name: 'Momo', icon: <Wallet className="w-5 h-5 text-pink-500" /> },
    { id: 'zalopay', name: 'ZaloPay', icon: <Wallet className="w-5 h-5 text-blue-500" /> },
    { id: 'bank', name: 'Bank Transfer', icon: <Building2 className="w-5 h-5 text-green-500" /> }
  ];

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: '',
    details: {}
  });

  const handleAddPaymentSubmit = () => {
    if (newPaymentMethod.type) {
      onAddPaymentMethod({
        id: Date.now().toString(),
        type: newPaymentMethod.type,
        ...newPaymentMethod.details
      });
      
      toast.success('Payment method added successfully');
      
      // Reset form and close modal
      setNewPaymentMethod({ type: '', details: {} });
      onClose();
    } else {
      toast.error('Please select a payment method type');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Payment Method"
    >
      <div className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method Type
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={newPaymentMethod.type}
            onChange={(e) => setNewPaymentMethod({...newPaymentMethod, type: e.target.value, details: {}})}
          >
            <option value="">Select payment method</option>
            {paymentMethodTypes.map(type => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        
        {newPaymentMethod.type === 'Bank Transfer' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={newPaymentMethod.details?.bankName || ''}
                onChange={(e) => setNewPaymentMethod({
                  ...newPaymentMethod, 
                  details: {...newPaymentMethod.details, bankName: e.target.value}
                })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={newPaymentMethod.details?.accountNumber || ''}
                onChange={(e) => setNewPaymentMethod({
                  ...newPaymentMethod, 
                  details: {...newPaymentMethod.details, accountNumber: e.target.value}
                })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={newPaymentMethod.details?.accountName || ''}
                onChange={(e) => setNewPaymentMethod({
                  ...newPaymentMethod, 
                  details: {...newPaymentMethod.details, accountName: e.target.value}
                })}
              />
            </div>
          </>
        )}
        
        {(newPaymentMethod.type === 'Momo' || newPaymentMethod.type === 'ZaloPay') && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={newPaymentMethod.details?.phoneNumber || ''}
                onChange={(e) => setNewPaymentMethod({
                  ...newPaymentMethod, 
                  details: {...newPaymentMethod.details, phoneNumber: e.target.value}
                })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={newPaymentMethod.details?.accountName || ''}
                onChange={(e) => setNewPaymentMethod({
                  ...newPaymentMethod, 
                  details: {...newPaymentMethod.details, accountName: e.target.value}
                })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QR Code URL (Optional)
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={newPaymentMethod.details?.url || ''}
                onChange={(e) => setNewPaymentMethod({
                  ...newPaymentMethod, 
                  details: {...newPaymentMethod.details, url: e.target.value}
                })}
                placeholder="e.g., momo://pay?phone=0123456789&amount=0"
              />
            </div>
          </>
        )}
        
        <div className="flex justify-end mt-6 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddPaymentSubmit}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Add Payment Method
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddPaymentModal; 