import React from "react";
import Modal from '../shared/Modal';
import { toast } from 'react-hot-toast';
import { Room } from '../../interface/interfaces';
import { useQuery } from '@apollo/client';
import { GET_SERVICES } from '../../providers/ServiceProvider';

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

const RoomModal: React.FC<RoomModalProps> = ({ isOpen, onClose, room, onCreate, onUpdate, onDelete }: RoomModalProps) => {
  const isEditMode = !!room;
  const [form, setForm] = React.useState<FormState>(getDefaultForm());
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

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
            : allServices.map((s: Service) => s.id),
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
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
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
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            {errors.number && <div className="mt-1 text-xs text-red-500">{errors.number}</div>}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-700">Type <span className="text-red-500">*</span></label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
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
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
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
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-700">Status <span className="text-red-500">*</span></label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.status && <div className="mt-1 text-xs text-red-500">{errors.status}</div>}
          </div>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-secondary-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Room description..."
            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
            rows={2}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-secondary-700">Services</label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {allServices.map((service: Service) => (
              <label key={service.id} className="flex gap-2 items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.services.includes(service.id)}
                  onChange={() => handleServiceToggle(service.id)}
                  className="accent-primary-500"
                />
                <span className="text-sm text-secondary-700">{service.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-4 mt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-secondary-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {isEditMode ? 'Update' : 'Create'}
          </button>

          {isEditMode && (
            <button
              type="button"
              onClick={() => room && onDelete(room)}
              className="px-4 py-2 rounded-md border border-gray-300 text-secondary-700 hover:bg-gray-50"
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default RoomModal;