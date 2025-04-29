import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastHook } from '../../utils/useToast';
import { modalBackdrop, modalContent } from '../../utils/motion';
import { Renter, Unit } from '../../types';
import { units } from '../../data/mockData';

interface RenterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (renter: RenterData) => void;
  editData?: RenterData;
}

interface RenterData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  documentType: string;
  documentNumber: string;
}

const RenterForm: React.FC<RenterFormProps> = ({ isOpen, onClose, onSubmit, editData }) => {
  const toast = useToastHook();
  const [formData, setFormData] = useState<RenterData>({
    id: `renter-${Date.now()}`,
    name: '',
    email: '',
    phone: '',
    address: '',
    documentType: 'ID Card',
    documentNumber: '',
  });

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    }
  }, [editData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Error", {
        description: "Renter name is required"
      });
      return;
    }
    
    if (!formData.phone.trim()) {
      toast.error("Error", {
        description: "Phone number is required"
      });
      return;
    }
    
    onSubmit(formData);
    onClose();
    
    toast.success("Success", {
      description: editData ? "Renter has been updated successfully" : "Renter has been added successfully"
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalBackdrop}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
        >
          <motion.div 
            variants={modalContent}
            className="bg-white rounded-lg shadow-xl w-full max-w-[600px]"
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-semibold text-secondary-900">{editData ? 'Edit Renter' : 'Add New Renter'}</h3>
              <button
                onClick={onClose}
                className="text-secondary-500 hover:text-secondary-700 p-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="e.g. john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="e.g. 123-456-7890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="address">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="e.g. 123 Main St, City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="documentType">
                    Document Type
                  </label>
                  <select
                    id="documentType"
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
                  >
                    <option value="ID Card">ID Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver License">Driver License</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1" htmlFor="documentNumber">
                    Document Number
                  </label>
                  <input
                    type="text"
                    id="documentNumber"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="e.g. AB123456"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-secondary-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  {editData ? 'Save Changes' : 'Add Renter'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RenterForm; 