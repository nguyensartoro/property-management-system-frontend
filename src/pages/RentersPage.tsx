import React from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { renterService, roomService, ApiResponse, Renter } from '../utils/apiClient';
import { useToast } from '../hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import { Edit, Eye, Trash2, Plus, Search, User } from 'lucide-react';

// Renter form component for creating/editing renters
interface RenterFormProps {
  renter?: any;
  onSubmit: (data: any) => void;
  rooms?: any[];
  isLoading?: boolean;
}

const RenterForm: React.FC<RenterFormProps> = ({
  renter = null,
  onSubmit,
  rooms = [],
  isLoading = false
}) => {
  const [formData, setFormData] = React.useState({
    name: renter?.name || '',
    email: renter?.email || '',
    phone: renter?.phone || '',
    emergencyContact: renter?.emergencyContact || '',
    identityNumber: renter?.identityNumber || '',
    roomId: renter?.roomId || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoomChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      roomId: value === "none" ? "" : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">Phone</label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="emergencyContact" className="text-sm font-medium">Emergency Contact</label>
          <Input
            id="emergencyContact"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="identityNumber" className="text-sm font-medium">Identity Number</label>
          <Input
            id="identityNumber"
            name="identityNumber"
            value={formData.identityNumber}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="roomId" className="text-sm font-medium">Assigned Room</label>
          <Select
            value={formData.roomId}
            onValueChange={handleRoomChange}
            disabled={isLoading || rooms.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a room" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Room</SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name} ({room.number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : renter ? 'Update Renter' : 'Create Renter'}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Renter details view component
interface RenterViewDialogProps {
  renter: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const RenterViewDialog: React.FC<RenterViewDialogProps> = ({ renter, isOpen, onClose }) => {
  if (!renter) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Renter Details</DialogTitle>
          <DialogDescription>
            Detailed information about the renter
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex justify-center items-center w-16 h-16 bg-gray-100 rounded-full">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{renter.name}</h3>
              {renter.email && <p className="text-gray-500">{renter.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-1 text-gray-500">Phone</p>
              <p>{renter.phone}</p>
            </div>
            {renter.emergencyContact && (
              <div>
                <p className="mb-1 text-gray-500">Emergency Contact</p>
                <p>{renter.emergencyContact}</p>
              </div>
            )}
            {renter.identityNumber && (
              <div>
                <p className="mb-1 text-gray-500">Identity Number</p>
                <p>{renter.identityNumber}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main component
const RentersPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const [selectedRenter, setSelectedRenter] = React.useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);

  // Use the API hook with properly typed response data
  const { data: rentersResponse, loading, error, refetch } = useApi<ApiResponse<Renter[]>>(
    () => renterService.getAllRenters(currentPage, itemsPerPage, searchTerm),
    {
      initialData: null,
      immediate: true
    },
    [currentPage, itemsPerPage, searchTerm]
  );

  // Extract renters data for easier access
  const renters = rentersResponse?.data || [];
  const pagination = rentersResponse?.pagination;

  // Fetch rooms for the dropdown (available rooms)
  const {
    data: roomsData,
    loading: roomsLoading,
  } = useApi(
    () => roomService.getAllRooms(1, 100),
    []
  );

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  // Handle renter creation
  const handleCreateRenter = async (formData: any) => {
    try {
      await renterService.createRenter(formData);
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Renter created successfully",
      });
      refetch();
    } catch (error) {
      console.error('Error creating renter:', error);
      toast({
        title: "Error",
        description: "Failed to create renter",
        variant: "destructive",
      });
    }
  };

  // Handle renter update
  const handleUpdateRenter = async (formData: any) => {
    try {
      await renterService.updateRenter(selectedRenter.id, formData);
      setIsEditModalOpen(false);
      toast({
        title: "Success",
        description: "Renter updated successfully",
      });
      refetch();
    } catch (error) {
      console.error('Error updating renter:', error);
      toast({
        title: "Error",
        description: "Failed to update renter",
        variant: "destructive",
      });
    }
  };

  // Handle renter deletion
  const handleDeleteRenter = async (id: string) => {
    if (confirm('Are you sure you want to delete this renter?')) {
      try {
        await renterService.deleteRenter(id);
        toast({
          title: "Success",
          description: "Renter deleted successfully",
        });
        refetch();
      } catch (error) {
        console.error('Error deleting renter:', error);
        toast({
          title: "Error",
          description: "Failed to delete renter",
          variant: "destructive",
        });
      }
    }
  };

  // Open edit modal
  const openEditModal = (renter: any) => {
    setSelectedRenter(renter);
    setIsEditModalOpen(true);
  };

  // Open view modal
  const openViewModal = (renter: any) => {
    setSelectedRenter(renter);
    setIsViewModalOpen(true);
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Renters</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 w-4 h-4" /> Add Renter
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search renters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Button type="submit" className="shrink-0">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <Card className="mb-6 border-red-300">
          <CardContent className="pt-6">
            <p className="text-red-500">Error loading renters: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="py-4">
                <div className="flex gap-4 items-center">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Renters Table */}
      {!loading && renters && renters.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renters.map((renter) => (
                  <TableRow key={renter.id}>
                    <TableCell className="font-medium">{renter.name}</TableCell>
                    <TableCell>{renter.email || '-'}</TableCell>
                    <TableCell>{renter.phone}</TableCell>
                    <TableCell>{renter.roomId ? (
                      <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full">
                        Assigned
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs text-gray-800 bg-gray-100 rounded-full">
                        Unassigned
                      </span>
                    )}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="icon" variant="ghost" onClick={() => openViewModal(renter)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => openEditModal(renter)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteRenter(renter.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <CardFooter className="flex justify-center py-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <PaginationItem key={i} className={currentPage === i + 1 ? 'hidden md:inline-block' : 'hidden md:inline-block'}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={currentPage === pagination.totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          )}
        </Card>
      )}

      {/* Create Renter Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Renter</DialogTitle>
            <DialogDescription>
              Fill out the form below to add a new renter
            </DialogDescription>
          </DialogHeader>

          <RenterForm
            onSubmit={handleCreateRenter}
            rooms={roomsData?.data || []}
            isLoading={roomsLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Renter Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Renter</DialogTitle>
            <DialogDescription>
              Update renter information
            </DialogDescription>
          </DialogHeader>

          <RenterForm
            renter={selectedRenter}
            onSubmit={handleUpdateRenter}
            rooms={roomsData?.data || []}
            isLoading={roomsLoading}
          />
        </DialogContent>
      </Dialog>

      {/* View Renter Modal */}
      <RenterViewDialog
        renter={selectedRenter}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
    </div>
  );
};

export default RentersPage;