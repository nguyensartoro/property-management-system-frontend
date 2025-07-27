import React from 'react';
import { Contract, ContractStatus, ContractType } from '../../utils/apiClient';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  FileText, 
  Upload, 
  XCircle, 
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  User,
  Building,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

interface ContractListProps {
  contracts: Contract[];
  isLoading: boolean;
  onView: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
  onTerminate: (id: string, reason: string) => void;
  onUploadDocument: (id: string) => void;
  onSort: (field: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  onPageChange: (page: number) => void;
  currentPage: number;
}

const ContractList: React.FC<ContractListProps> = ({
  contracts,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onTerminate,
  onUploadDocument,
  onSort,
  sortBy,
  sortOrder,
  pagination,
  onPageChange,
  currentPage,
}) => {
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: ContractStatus) => {
    const variants = {
      [ContractStatus.ACTIVE]: 'default',
      [ContractStatus.DRAFT]: 'secondary',
      [ContractStatus.EXPIRED]: 'destructive',
      [ContractStatus.TERMINATED]: 'outline',
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const getContractTypeBadge = (type: ContractType) => {
    return (
      <Badge variant="outline">
        {type === ContractType.LONG_TERM ? 'Long Term' : 'Short Term'}
      </Badge>
    );
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const handleTerminate = (contract: Contract) => {
    const reason = prompt('Please provide a reason for termination:');
    if (reason) {
      onTerminate(contract.id, reason);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort('renter')}
                  className="h-auto p-0 font-semibold"
                >
                  Renter
                  {getSortIcon('renter')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort('room')}
                  className="h-auto p-0 font-semibold"
                >
                  Room
                  {getSortIcon('room')}
                </Button>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort('monthlyRent')}
                  className="h-auto p-0 font-semibold"
                >
                  Monthly Rent
                  {getSortIcon('monthlyRent')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort('startDate')}
                  className="h-auto p-0 font-semibold"
                >
                  Start Date
                  {getSortIcon('startDate')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort('endDate')}
                  className="h-auto p-0 font-semibold"
                >
                  End Date
                  {getSortIcon('endDate')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort('status')}
                  className="h-auto p-0 font-semibold"
                >
                  Status
                  {getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="h-12 w-12" />
                    <p className="text-lg font-medium">No contracts found</p>
                    <p className="text-sm">Create your first contract to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              contracts.map((contract) => (
                <TableRow key={contract.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{contract.renter?.name || 'Unknown Renter'}</p>
                        <p className="text-sm text-muted-foreground">{contract.renter?.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Room {contract.room?.number || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{contract.room?.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getContractTypeBadge(contract.contractType)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">${contract.monthlyRent.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(contract.startDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(contract.endDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(contract.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onView(contract)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEdit(contract)}
                        title="Edit Contract"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onUploadDocument(contract.id)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Document
                          </DropdownMenuItem>
                          {contract.status === ContractStatus.ACTIVE && (
                            <>
                              <DropdownMenuItem onClick={() => handleTerminate(contract)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Terminate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Renew
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(contract.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <CardFooter className="flex justify-between items-center py-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} contracts
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={!pagination.hasPreviousPage ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(
                  pagination.totalPages - 4,
                  currentPage - 2
                )) + i;
                
                if (pageNumber > pagination.totalPages) return null;
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => onPageChange(pageNumber)}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(Math.min(pagination.totalPages, currentPage + 1))}
                  className={!pagination.hasNextPage ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
    </Card>
  );
};

export default ContractList;