import React from 'react';
import useApi from '../hooks/useApi';
import { serviceService, FeeType } from '../utils/apiClient';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import { Edit, Eye, Trash2, Plus, Search, Package } from 'lucide-react';

// Service form component for creating/editing services
interface ServiceFormProps {
  service?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ 
  service = null, 
  onSubmit, 
  isLoading = false 
}) => {
  const [formData, setFormData] = React.useState({
    name: service?.name || '',
    description: service?.description || '',
    fee: service?.fee || 0,
    feeType: service?.feeType || FeeType.MONTHLY,
    icon: service?.icon || '',
    active: service?.active ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'fee' ? Number(value) : value,
    }));
  };

  const handleFeeTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      feeType: value as FeeType,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label htmlFor="fee" className="text-sm font-medium">Fee</label>
          <Input
            id="fee"
            name="fee"
            type="number"
            value={formData.fee}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="feeType" className="text-sm font-medium">Fee Type</label>
          <Select 
            value={formData.feeType} 
            onValueChange={handleFeeTypeChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select fee type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FeeType.ONE_TIME}>One Time</SelectItem>
              <SelectItem value={FeeType.MONTHLY}>Monthly</SelectItem>
              <SelectItem value={FeeType.YEARLY}>Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="icon" className="text-sm font-medium">Icon</label>
          <Input
            id="icon"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            placeholder="Icon name or URL"
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2 col-span-2">
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
          {isLoading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Service details view component
interface ServiceViewDialogProps {
  service: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const ServiceViewDialog: React.FC<ServiceViewDialogProps> = ({ service, isOpen, onClose }) => {
  if (!service) return null;

  const getFeeTypeDisplay = (feeType: FeeType) => {
    switch (feeType) {
      case FeeType.ONE_TIME:
        return 'One Time';
      case FeeType.MONTHLY:
        return 'Monthly';
      case FeeType.YEARLY:
        return 'Yearly';
      default:
        return feeType;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Service Details</DialogTitle>
          <DialogDescription>
            Detailed information about the service
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              {service.icon ? (
                <img src={service.icon} alt={service.name} className="h-6 w-6" />
              ) : (
                <Package className="h-6 w-6 text-blue-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{service.name}</h3>
              {service.description && <p className="text-gray-500">{service.description}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
            <div>
              <p className="text-gray-500 mb-1">Fee</p>
              <p>${service.fee.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Fee Type</p>
              <p>{getFeeTypeDisplay(service.feeType)}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Status</p>
              <p>
                {service.active ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Inactive</span>
                )}
              </p>
            </div>
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
const ServicesPage: React.FC = () => {
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  
  const [selectedService, setSelectedService] = React.useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  
  // Fetch services data
  const {
    data: servicesData,
    loading: servicesLoading,
    error: servicesError,
    refetch: refetchServices,
  } = useApi(
    () => serviceService.getAllServices(currentPage, itemsPerPage, searchTerm),
    [currentPage, itemsPerPage, searchTerm]
  );
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetchServices();
  };
  
  // Handle service creation
  const handleCreateService = async (formData: any) => {
    try {
      await serviceService.createService(formData);
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Service created successfully",
      });
      refetchServices();
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: "Failed to create service",
        variant: "destructive",
      });
    }
  };
  
  // Handle service update
  const handleUpdateService = async (formData: any) => {
    try {
      await serviceService.updateService(selectedService.id, formData);
      setIsEditModalOpen(false);
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
      refetchServices();
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
    }
  };
  
  // Handle service deletion
  const handleDeleteService = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await serviceService.deleteService(id);
        toast({
          title: "Success",
          description: "Service deleted successfully",
        });
        refetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        toast({
          title: "Error",
          description: "Failed to delete service",
          variant: "destructive",
        });
      }
    }
  };
  
  // Open edit modal
  const openEditModal = (service: any) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };
  
  // Open view modal
  const openViewModal = (service: any) => {
    setSelectedService(service);
    setIsViewModalOpen(true);
  };
  
  // Fee type display helper
  const getFeeTypeDisplay = (feeType: FeeType) => {
    switch (feeType) {
      case FeeType.ONE_TIME:
        return 'One Time';
      case FeeType.MONTHLY:
        return 'Monthly';
      case FeeType.YEARLY:
        return 'Yearly';
      default:
        return feeType;
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Services</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services..."
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
      {servicesError && (
        <Card className="mb-6 border-red-300">
          <CardContent className="pt-6">
            <p className="text-red-500">Error loading services: {servicesError.message}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Loading state */}
      {servicesLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
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
      
      {/* Services Table */}
      {!servicesLoading && servicesData?.data && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicesData.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No services found. Add your first service to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  servicesData.data.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {service.icon ? (
                            <img src={service.icon} alt={service.name} className="h-5 w-5" />
                          ) : (
                            <Package className="h-5 w-5 text-gray-400" />
                          )}
                          {service.name}
                        </div>
                      </TableCell>
                      <TableCell>{service.description || '-'}</TableCell>
                      <TableCell>${service.fee.toFixed(2)}</TableCell>
                      <TableCell>{getFeeTypeDisplay(service.feeType)}</TableCell>
                      <TableCell>
                        {service.active ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openViewModal(service)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => openEditModal(service)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteService(service.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          
          {/* Pagination */}
          {servicesData.pagination && servicesData.pagination.totalPages > 1 && (
            <CardFooter className="flex justify-center py-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    />
                  </PaginationItem>
                  
                  {[...Array(servicesData.pagination.totalPages)].map((_, i) => (
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
                      onClick={() => setCurrentPage(Math.min(servicesData.pagination.totalPages, currentPage + 1))}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          )}
        </Card>
      )}
      
      {/* Create Service Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Fill out the form below to add a new service
            </DialogDescription>
          </DialogHeader>
          
          <ServiceForm 
            onSubmit={handleCreateService} 
            isLoading={servicesLoading}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Service Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update service information
            </DialogDescription>
          </DialogHeader>
          
          <ServiceForm 
            service={selectedService} 
            onSubmit={handleUpdateService}
            isLoading={servicesLoading}
          />
        </DialogContent>
      </Dialog>
      
      {/* View Service Modal */}
      <ServiceViewDialog 
        service={selectedService}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
    </div>
  );
};

export default ServicesPage; 