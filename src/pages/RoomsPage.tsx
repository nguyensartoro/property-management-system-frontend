import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import useApi from '../hooks/useApi';
import { roomService, RoomStatus, ApiResponse } from '../utils/apiClient';
import { useToast } from '../hooks/use-toast';
import {
  Card,
  CardContent,
  CardFooter,
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import { Edit, Eye, Trash2, Plus, Search, ArrowUp, ArrowDown } from 'lucide-react';

// Define Room interface
interface Room {
  id: string;
  name: string;
  number: string;
  floor: number;
  size: number;
  price: number;
  status: RoomStatus;
  description?: string;
  propertyId: string;
  images?: string[];
}

interface Property {
  id: string;
  name: string;
}

// Reuse the same interface structure as apiClient.ts
// interface Pagination {
//   currentPage: number;
//   totalPages: number;
//   totalItems: number;
//   itemsPerPage: number;
// }

// interface ApiResponse<T> {
//   status: string;
//   message: string;
//   data: T;
//   pagination?: Pagination;
// }

interface RoomFormProps {
  room?: Room | null;
  onSubmit: (data: Room) => void;
  properties: Property[];
  isLoading?: boolean;
}

// Room form component for creating/editing rooms
const RoomForm: React.FC<RoomFormProps> = ({
  room = null,
  onSubmit,
  properties = [],
  isLoading = false
}) => {
  const [formData, setFormData] = React.useState<Room>({
    id: room?.id || '',
    name: room?.name || '',
    number: room?.number || '',
    floor: room?.floor || 1,
    size: room?.size || 0,
    description: room?.description || '',
    status: room?.status || RoomStatus.AVAILABLE,
    price: room?.price || 0,
    propertyId: room?.propertyId || (properties[0]?.id || ''),
    images: room?.images || []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'floor' || name === 'size' || name === 'price'
        ? Number(value)
        : value,
    }));
  };

  const handleStatusChange = (value: RoomStatus) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handlePropertyChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      propertyId: value,
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
          <label htmlFor="number" className="text-sm font-medium">Room Number</label>
          <Input
            id="number"
            name="number"
            value={formData.number}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="floor" className="text-sm font-medium">Floor</label>
          <Input
            id="floor"
            name="floor"
            type="number"
            value={formData.floor}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="size" className="text-sm font-medium">Size (sqft)</label>
          <Input
            id="size"
            name="size"
            type="number"
            value={formData.size}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">Price</label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">Status</label>
          <Select
            value={formData.status}
            onValueChange={handleStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RoomStatus.AVAILABLE}>Available</SelectItem>
              <SelectItem value={RoomStatus.OCCUPIED}>Occupied</SelectItem>
              <SelectItem value={RoomStatus.RESERVED}>Reserved</SelectItem>
              <SelectItem value={RoomStatus.MAINTENANCE}>Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-2">
          <label htmlFor="propertyId" className="text-sm font-medium">Property</label>
          <Select
            value={formData.propertyId}
            onValueChange={handlePropertyChange}
            disabled={isLoading || properties.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-2">
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Room'}
        </Button>
      </DialogFooter>
    </form>
  );
};

interface RoomViewDialogProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
}

// Room view component
const RoomViewDialog: React.FC<RoomViewDialogProps> = ({ room, isOpen, onClose }) => {
  if (!room) return null;

  const getStatusBadge = (status: RoomStatus) => {
    const colors = {
      [RoomStatus.AVAILABLE]: 'bg-green-100 text-green-800',
      [RoomStatus.OCCUPIED]: 'bg-blue-100 text-blue-800',
      [RoomStatus.RESERVED]: 'bg-yellow-100 text-yellow-800',
      [RoomStatus.MAINTENANCE]: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Room Details</DialogTitle>
          <DialogDescription>
            View detailed information about this room.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{room.name}</h3>
            {getStatusBadge(room.status)}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-1 text-gray-500">Room Number</p>
              <p>{room.number}</p>
            </div>
            <div>
              <p className="mb-1 text-gray-500">Floor</p>
              <p>{room.floor}</p>
            </div>
            <div>
              <p className="mb-1 text-gray-500">Size</p>
              <p>{room.size} sqft</p>
            </div>
            <div>
              <p className="mb-1 text-gray-500">Price</p>
              <p>${room.price.toFixed(2)}</p>
            </div>
          </div>

          {room.description && (
            <div>
              <p className="mb-1 text-gray-500">Description</p>
              <p>{room.description}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main component
const RoomsPage = () => {
  const { toast } = useToast();

  // State
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0, // 0-based index
    pageSize: 10,
  });

  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);

  const currentPage = pagination.pageIndex + 1; // Convert to 1-based for API
  const itemsPerPage = pagination.pageSize;

  // Function to get the actual status filter value
  const getStatusFilterValue = () => {
    return statusFilter === "all" ? "" : statusFilter;
  };

  // Handle search form
  const [searchInput, setSearchInput] = React.useState('');

  // Handle search with manual trigger only
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update searchTerm only when search is actually submitted
    setSearchTerm(searchInput);
  };

  // Fetch properties
  const {
    data: propertiesData,
    loading: propertiesLoading,
    error: propertiesError,
  } = useApi<ApiResponse<Property[]>>(
    () => roomService.getProperties(),
    [],
    true
  );

  const properties = React.useMemo(() =>
    propertiesData?.data || [],
    [propertiesData]
  );

  // Fetch rooms data
  const {
    data: roomsData,
    loading: roomsLoading,
    error: roomsError,
    refetch: refetchRooms,
  } = useApi<ApiResponse<Room[]>>(
    () => roomService.getAllRooms(currentPage, itemsPerPage, searchTerm, getStatusFilterValue()),
    [currentPage, itemsPerPage, searchTerm, statusFilter],
    true // initial fetch on mount
  );

  // Data for TanStack Table
  const data = React.useMemo(() =>
    roomsData?.data || [],
    [roomsData]
  );

  const columnHelper = createColumnHelper<Room>();

  // Column definitions
  const columns = React.useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('number', {
        header: 'Number',
      }),
      columnHelper.accessor('floor', {
        header: 'Floor',
      }),
      columnHelper.accessor('size', {
        header: 'Size',
        cell: (info) => `${info.getValue()} sqft`,
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => (
          <div className="flex gap-2 justify-end">
            <Button size="icon" variant="ghost" onClick={() => openViewModal(info.row.original)}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => openEditModal(info.row.original)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => handleDeleteRoom(info.row.original.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      }),
    ],
    []
  );

  // Set up TanStack table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: roomsData?.pagination?.totalPages || -1,
  });

  // Handle room creation
  const handleCreateRoom = async (formData: Room) => {
    try {
      // Create a properly formatted object for the API
      const roomToCreate = {
        name: formData.name,
        number: formData.number,
        floor: formData.floor,
        size: formData.size,
        price: formData.price,
        status: formData.status,
        description: formData.description || '',
        propertyId: formData.propertyId
      };

      await roomService.createRoom(roomToCreate);
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Room created successfully",
      });
      refetchRooms(); // Manually trigger refetch
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room. Check if you've selected a valid property.",
        variant: "destructive",
      });
    }
  };

  // Handle room update
  const handleUpdateRoom = async (formData: Room) => {
    try {
      if (selectedRoom) {
        await roomService.updateRoom(selectedRoom.id, formData);
        setIsEditModalOpen(false);
        toast({
          title: "Success",
          description: "Room updated successfully",
        });
        refetchRooms();
      }
    } catch (error) {
      console.error('Error updating room:', error);
      toast({
        title: "Error",
        description: "Failed to update room",
        variant: "destructive",
      });
    }
  };

  // Handle room deletion
  const handleDeleteRoom = async (id: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      try {
        await roomService.deleteRoom(id);
        toast({
          title: "Success",
          description: "Room deleted successfully",
        });
        refetchRooms();
      } catch (error) {
        console.error('Error deleting room:', error);
        toast({
          title: "Error",
          description: "Failed to delete room",
          variant: "destructive",
        });
      }
    }
  };

  // Open edit modal
  const openEditModal = (room: Room) => {
    setSelectedRoom(room);
    setIsEditModalOpen(true);
  };

  // Open view modal
  const openViewModal = (room: Room) => {
    setSelectedRoom(room);
    setIsViewModalOpen(true);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: RoomStatus }) => {
    const colors = {
      [RoomStatus.AVAILABLE]: 'bg-green-100 text-green-800',
      [RoomStatus.OCCUPIED]: 'bg-blue-100 text-blue-800',
      [RoomStatus.RESERVED]: 'bg-yellow-100 text-yellow-800',
      [RoomStatus.MAINTENANCE]: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </span>
    );
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rooms</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 w-4 h-4" /> Add Room
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex items-center space-x-2 w-full max-w-sm">
                <Input
                  placeholder="Search rooms..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>

            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={RoomStatus.AVAILABLE}>Available</SelectItem>
                  <SelectItem value={RoomStatus.OCCUPIED}>Occupied</SelectItem>
                  <SelectItem value={RoomStatus.RESERVED}>Reserved</SelectItem>
                  <SelectItem value={RoomStatus.MAINTENANCE}>Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {roomsError && (
        <Card className="mb-6 border-red-300">
          <CardContent className="pt-6">
            <p className="text-red-500">Error loading rooms: {roomsError.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {roomsLoading && (
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

      {/* Rooms Table with TanStack Table */}
      {!roomsLoading && roomsData?.data && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className={header.id === 'actions' ? 'text-right' : ''}>
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              className: header.column.getCanSort() ? 'cursor-pointer select-none flex items-center' : '',
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <span className="ml-1">
                                {{
                                  asc: <ArrowUp className="w-4 h-4" />,
                                  desc: <ArrowDown className="w-4 h-4" />,
                                }[header.column.getIsSorted() as string] ?? null}
                              </span>
                            )}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No rooms found. Add your first room to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination */}
          {roomsData?.pagination && roomsData.pagination.totalPages > 1 && (
            <CardFooter className="flex justify-center py-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      Previous
                    </Button>
                  </PaginationItem>

                  {Array.from(
                    { length: roomsData.pagination.totalPages },
                    (_, i) => (
                      <PaginationItem key={i} className="hidden md:inline-block">
                        <PaginationLink
                          onClick={() => setPagination(prev => ({
                            ...prev,
                            pageIndex: i
                          }))}
                          isActive={pagination.pageIndex === i}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      Next
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          )}
        </Card>
      )}

      {/* Create Room Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Fill out the form below to add a new room to your property
            </DialogDescription>
          </DialogHeader>

          <RoomForm
            onSubmit={handleCreateRoom}
            properties={properties}
            isLoading={propertiesLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Room Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update room information
            </DialogDescription>
          </DialogHeader>

          <RoomForm
            room={selectedRoom}
            onSubmit={handleUpdateRoom}
            properties={properties}
            isLoading={propertiesLoading}
          />
        </DialogContent>
      </Dialog>

      {/* View Room Modal */}
      <RoomViewDialog
        room={selectedRoom}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
    </div>
  );
};

export default RoomsPage;