import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRenterStore } from '../../stores/renterStore';
import { useRoomStore } from '../../stores/roomStore';
import { MaintenancePriority, MaintenanceCategory } from '../../utils/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '../shared/FileUpload';
import { 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  Upload, 
  X, 
  User, 
  MapPin,
  Wrench,
  Settings,
  Image as ImageIcon
} from 'lucide-react';

// Form validation schema
const maintenanceFormSchema = z.object({
  renterId: z.string().min(1, 'Please select a renter'),
  roomId: z.string().min(1, 'Please select a room'),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  priority: z.nativeEnum(MaintenancePriority),
  category: z.nativeEnum(MaintenanceCategory),
  notes: z.string().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceFormSchema>;

interface MaintenanceFormProps {
  onSubmit: (data: MaintenanceFormData & { images?: string[] }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<MaintenanceFormData>;
}

// Priority configuration
const getPriorityConfig = (priority: MaintenancePriority) => {
  switch (priority) {
    case MaintenancePriority.URGENT:
      return { 
        icon: AlertTriangle, 
        className: 'text-red-600', 
        bgClassName: 'bg-red-100 text-red-800',
        description: 'Requires immediate attention - safety or security issue'
      };
    case MaintenancePriority.HIGH:
      return { 
        icon: AlertCircle, 
        className: 'text-orange-600', 
        bgClassName: 'bg-orange-100 text-orange-800',
        description: 'Important issue that should be addressed soon'
      };
    case MaintenancePriority.MEDIUM:
      return { 
        icon: Clock, 
        className: 'text-yellow-600', 
        bgClassName: 'bg-yellow-100 text-yellow-800',
        description: 'Standard maintenance request'
      };
    case MaintenancePriority.LOW:
      return { 
        icon: Clock, 
        className: 'text-green-600', 
        bgClassName: 'bg-green-100 text-green-800',
        description: 'Non-urgent issue that can be scheduled'
      };
    default:
      return { 
        icon: Clock, 
        className: 'text-gray-600', 
        bgClassName: 'bg-gray-100 text-gray-800',
        description: 'Standard priority'
      };
  }
};

// Category configuration
const getCategoryConfig = (category: MaintenanceCategory) => {
  switch (category) {
    case MaintenanceCategory.PLUMBING:
      return { icon: Wrench, description: 'Water, pipes, drains, toilets, sinks' };
    case MaintenanceCategory.ELECTRICAL:
      return { icon: AlertTriangle, description: 'Wiring, outlets, lighting, electrical panels' };
    case MaintenanceCategory.HVAC:
      return { icon: Settings, description: 'Heating, ventilation, air conditioning' };
    case MaintenanceCategory.APPLIANCES:
      return { icon: Settings, description: 'Refrigerator, stove, washer, dryer' };
    case MaintenanceCategory.CLEANING:
      return { icon: Wrench, description: 'Deep cleaning, carpet cleaning, pest control' };
    case MaintenanceCategory.REPAIRS:
      return { icon: Wrench, description: 'General repairs, painting, fixtures' };
    default:
      return { icon: Wrench, description: 'Other maintenance issues' };
  }
};

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
}) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<MaintenancePriority>(MaintenancePriority.MEDIUM);
  const [selectedCategory, setSelectedCategory] = useState<MaintenanceCategory | ''>('');

  // Stores
  const { renters, fetchRenters, isLoading: rentersLoading } = useRenterStore();
  const { rooms, fetchRooms, isLoading: roomsLoading } = useRoomStore();

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      priority: MaintenancePriority.MEDIUM,
      ...initialData,
    },
  });

  const watchedRenterId = watch('renterId');
  const watchedRoomId = watch('roomId');

  // Load data on mount
  useEffect(() => {
    fetchRenters(1, 100);
    fetchRooms(1, 100);
  }, [fetchRenters, fetchRooms]);

  // Set initial data
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof MaintenanceFormData, value);
      });
      if (initialData.priority) {
        setSelectedPriority(initialData.priority);
      }
      if (initialData.category) {
        setSelectedCategory(initialData.category);
      }
    }
  }, [initialData, setValue]);

  // Handle form submission
  const handleFormSubmit = async (data: MaintenanceFormData) => {
    try {
      await onSubmit({
        ...data,
        images: uploadedImages,
      });
      reset();
      setUploadedImages([]);
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
    }
  };

  // Handle image upload
  const handleImageUpload = (files: File[]) => {
    // In a real implementation, you would upload files to a server
    // For now, we'll simulate with file names
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setUploadedImages(prev => [...prev, ...imageUrls]);
  };

  // Handle image removal
  const handleImageRemove = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Get filtered rooms based on selected renter
  const filteredRooms = watchedRenterId 
    ? rooms.filter(room => 
        room.contracts?.some(contract => 
          contract.renterId === watchedRenterId && 
          contract.status === 'ACTIVE'
        )
      )
    : rooms;

  const selectedRenter = renters.find(r => r.id === watchedRenterId);
  const selectedRoom = rooms.find(r => r.id === watchedRoomId);
  const priorityConfig = getPriorityConfig(selectedPriority);
  const categoryConfig = selectedCategory ? getCategoryConfig(selectedCategory) : null;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Renter and Room Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="renterId">Renter *</Label>
          <Select
            value={watchedRenterId || ''}
            onValueChange={(value) => {
              setValue('renterId', value);
              setValue('roomId', ''); // Reset room when renter changes
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a renter" />
            </SelectTrigger>
            <SelectContent>
              {rentersLoading ? (
                <SelectItem value="" disabled>Loading renters...</SelectItem>
              ) : (
                renters.map((renter) => (
                  <SelectItem key={renter.id} value={renter.id}>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{renter.name}</span>
                      <span className="text-muted-foreground">({renter.email})</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.renterId && (
            <p className="text-sm text-red-600">{errors.renterId.message}</p>
          )}
          {selectedRenter && (
            <div className="text-sm text-muted-foreground">
              Contact: {selectedRenter.phone || 'No phone number'}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="roomId">Room *</Label>
          <Select
            value={watchedRoomId || ''}
            onValueChange={(value) => setValue('roomId', value)}
            disabled={!watchedRenterId}
          >
            <SelectTrigger>
              <SelectValue placeholder={watchedRenterId ? "Select a room" : "Select renter first"} />
            </SelectTrigger>
            <SelectContent>
              {roomsLoading ? (
                <SelectItem value="" disabled>Loading rooms...</SelectItem>
              ) : filteredRooms.length === 0 ? (
                <SelectItem value="" disabled>No rooms available for this renter</SelectItem>
              ) : (
                filteredRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Room {room.number}</span>
                      <span className="text-muted-foreground">- {room.property?.name}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.roomId && (
            <p className="text-sm text-red-600">{errors.roomId.message}</p>
          )}
          {selectedRoom && (
            <div className="text-sm text-muted-foreground">
              Property: {selectedRoom.property?.name} - {selectedRoom.property?.address}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Request Title *</Label>
        <Input
          id="title"
          placeholder="Brief description of the issue (e.g., 'Leaky faucet in bathroom')"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Priority and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select
            value={selectedPriority}
            onValueChange={(value: MaintenancePriority) => {
              setSelectedPriority(value);
              setValue('priority', value);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(MaintenancePriority).map((priority) => {
                const config = getPriorityConfig(priority);
                const Icon = config.icon;
                return (
                  <SelectItem key={priority} value={priority}>
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${config.className}`} />
                      <span>{priority}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {selectedPriority && (
            <div className="flex items-center space-x-2">
              <Badge className={priorityConfig.bgClassName}>
                <priorityConfig.icon className="w-3 h-3 mr-1" />
                {selectedPriority}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {priorityConfig.description}
              </span>
            </div>
          )}
          {errors.priority && (
            <p className="text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value: MaintenanceCategory) => {
              setSelectedCategory(value);
              setValue('category', value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(MaintenanceCategory).map((category) => {
                const config = getCategoryConfig(category);
                const Icon = config.icon;
                return (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{category}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {selectedCategory && categoryConfig && (
            <div className="text-sm text-muted-foreground">
              {categoryConfig.description}
            </div>
          )}
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Detailed Description *</Label>
        <Textarea
          id="description"
          placeholder="Please provide a detailed description of the issue, including when it started, how often it occurs, and any steps you've already taken..."
          rows={4}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information that might be helpful..."
          rows={2}
          {...register('notes')}
        />
      </div>

      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5" />
            <span>Photo Documentation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FileUpload
              onFilesSelected={handleImageUpload}
              accept="image/*"
              multiple
              maxFiles={5}
              maxSize={5 * 1024 * 1024} // 5MB
            />
            
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleImageRemove(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Upload photos to help document the issue. Maximum 5 images, 5MB each.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Submit Request
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default MaintenanceForm;