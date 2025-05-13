import React from "react";
import Modal from '../shared/Modal';
import { toast } from 'react-hot-toast';
import { Room } from '../../interface/interfaces';
import { useQuery } from '@apollo/client';
import { GET_SERVICES } from '../../providers/ServiceProvider';
import { Plus, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoomModalProps {
  isOpen: boolean;
  room: Room | null;
  onClose: () => void;
  onDelete: (room: Room) => void;
  onCreate: (room: Partial<Room> & { services: string[] }) => void;
  onUpdate: (room: Partial<Room> & { services: string[] }) => void;
}

interface Service {
  id: string;
  name: string;
}

const roomTypeOptions = [
  { value: 'Single', label: 'Single' },
  { value: 'Double', label: 'Double' },
  { value: 'Suite', label: 'Suite' },
  { value: 'Studio', label: 'Studio' },
];

const statusOptions = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
];

interface FormState {
  name: string;
  number: string;
  type: string;
  floor: string;
  size: string;
  status: string;
  description: string;
  services: string[];
}

const getDefaultForm = (): FormState => ({
  name: '',
  number: '',
  type: 'Single',
  floor: '',
  size: '',
  status: 'AVAILABLE',
  description: '',
  services: [],
});

type RoomService = { id: string };

const RoomModal: React.FC<RoomModalProps> = ({ isOpen, onClose, room, onCreate, onUpdate }: RoomModalProps) => {
  const isEditMode = !!room;
  const [form, setForm] = React.useState<FormState>(getDefaultForm());
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = React.useState(false);
  const navigate = useNavigate();

  // Use real service data from query
  const { data: servicesData } = useQuery(GET_SERVICES);
  const allServices: Service[] = servicesData?.services?.nodes || [];

  React.useEffect(() => {
    if (isOpen) {
      if (isEditMode && room) {
        setForm({
          name: room.name || '',
          number: room.number || '',
          type: (room as { type?: string }).type || 'Single',
          floor: room.floor !== undefined ? String(room.floor) : '',
          size: room.size !== undefined ? String(room.size) : '',
          status: room.status || 'AVAILABLE',
          description: room.description || '',
          services: Array.isArray(room.roomServices) && room.roomServices.length > 0
            ? (room.roomServices as RoomService[]).map((s: RoomService) => s.id)
            : [],
        });
      } else {
        setForm(getDefaultForm());
      }
      setErrors({});
    }
  }, [isOpen, isEditMode, room, allServices]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: FormState) => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (id: string) => {
    setForm((prev: FormState) => {
      const services = prev.services.includes(id)
        ? prev.services.filter((sid: string) => sid !== id)
        : [...prev.services, id];
      return { ...prev, services };
    });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.number.trim()) newErrors.number = 'Room number is required';
    if (!form.type) newErrors.type = 'Type is required';
    if (!form.status) newErrors.status = 'Status is required';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const payload = {
      ...form,
      floor: form.floor ? Number(form.floor) : undefined,
      size: form.size ? Number(form.size) : undefined,
      services: form.services,
    };
    if (isEditMode) {
      onUpdate(payload);
      toast.success('Room updated successfully');
    } else {
      onCreate(payload);
      toast.success('Room created successfully');
    }
    onClose();
  };

  const handleCreateNewService = () => {
    // Close current modal
    onClose();
    
    // Navigate to services page and open add service modal
    // We'll use a URL parameter to trigger the modal
    navigate('/services?openAddModal=true');
  };

  const handleCreateNewRenter = () => {
    // Close current modal
    onClose();
    
    // Navigate to renters page and open add renter modal
    navigate('/renters?openAddModal=true');
  };

  const getSelectedServicesText = () => {
    if (form.services.length === 0) return 'Select services...';
    
    const selectedServices = allServices.filter(s => form.services.includes(s.id));
    if (selectedServices.length <= 2) {
      return selectedServices.map(s => s.name).join(', ');
    }
    return `${selectedServices.length} services selected`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit Room ${room?.number}` : 'Add New Room'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-700">Name <span className="text-red-500">*</span></label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Deluxe Suite"
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 font-vietnam"
            />
            {errors.name && <div className="mt-1 text-xs text-red-500">{errors.name}</div>}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-700">Room Number <span className="text-red-500">*</span></label>
            <input
              name="number"
              value={form.number}
              onChange={handleChange}
              placeholder="e.g. 101"
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 font-vietnam"
            />
            {errors.number && <div className="mt-1 text-xs text-red-500">{errors.number}</div>}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-700">Type <span className="text-red-500">*</span></label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 font-vietnam"
            >
              {roomTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.type && <div className="mt-1 text-xs text-red-500">{errors.type}</div>}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-700">Floor</label>
            <input
              name="floor"
              type="number"
              value={form.floor}
              onChange={handleChange}
              placeholder="e.g. 1"
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 font-vietnam"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-700">Size (sqft)</label>
            <input
              name="size"
              type="number"
              value={form.size}
              onChange={handleChange}
              placeholder="e.g. 350"
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 font-vietnam"
            />
          </div>
          <div className="pt-4 border-t border-gray-200 md:col-span-2">
            <h3 className="mb-3 font-medium text-md text-secondary-900">Room Status</h3>
            <div className="flex flex-wrap gap-3">
              {statusOptions.map(opt => (
                <label key={opt.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={form.status === opt.value}
                    onChange={handleChange}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span className="ml-2 text-sm text-secondary-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.status && <div className="mt-1 text-xs text-red-500">{errors.status}</div>}
            {form.status === 'OCCUPIED' && (
              <div className="flex items-center mt-3">
                <button
                  type="button"
                  onClick={handleCreateNewRenter}
                  className="flex gap-1 items-center px-3 py-1.5 rounded-md border border-primary-500 text-sm text-primary-600 hover:bg-primary-50 font-vietnam"
                >
                  <Plus size={16} />
                  <span>Create New Renter</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-secondary-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Room description..."
            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 font-vietnam"
            rows={2}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-secondary-700">Services</label>
          <div className="relative">
            {/* Services Dropdown Button */}
            <button
              type="button"
              onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
              className="flex gap-2 justify-between items-center px-4 py-2 w-full rounded-md border border-gray-300 text-left text-secondary-700 hover:bg-gray-50 font-vietnam"
            >
              <span>{getSelectedServicesText()}</span>
              <ChevronDown size={16} className={`transition-transform ${isServicesDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {isServicesDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                <div className="py-1 max-h-60 overflow-auto">
                  {allServices.length > 0 ? (
                    <>
                      {allServices.map((service: Service) => (
                        <label 
                          key={service.id} 
                          className="flex gap-2 items-center px-4 py-2 w-full cursor-pointer hover:bg-gray-100"
                        >
                          <input
                            type="checkbox"
                            checked={form.services.includes(service.id)}
                            onChange={() => handleServiceToggle(service.id)}
                            className="accent-primary-500"
                          />
                          <span className="text-sm text-secondary-700 font-vietnam">{service.name}</span>
                        </label>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-2 text-sm text-secondary-500 font-vietnam">No services available</div>
                  )}
                </div>
                
                {/* Create New Service Button */}
                <div className="flex justify-center py-2 px-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCreateNewService}
                    className="flex gap-1 items-center px-3 py-1 w-full rounded-md text-sm text-primary-600 hover:bg-primary-50 font-vietnam"
                  >
                    <Plus size={16} />
                    <span>Create New Service</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-4 mt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-secondary-700 hover:bg-gray-50 font-vietnam"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-primary-500 text-white hover:bg-primary-600 font-vietnam"
          >
            {isEditMode ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoomModal;