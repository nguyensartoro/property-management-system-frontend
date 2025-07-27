import React from 'react';
import { Contract, ContractStatus, ContractType, Payment } from '../../utils/apiClient';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  FileText,
  User,
  Building,
  Calendar,
  DollarSign,
  Download,
  Edit,
  XCircle,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';

interface ContractDetailsProps {
  contract: Contract | null;
  onEdit?: () => void;
  onTerminate?: (id: string, reason: string) => void;
  onRenew?: (id: string, newEndDate: string, monthlyRent?: number) => void;
}

interface ContractDetailsModalProps extends ContractDetailsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContractDetails: React.FC<ContractDetailsProps> = ({
  contract,
  onEdit,
  onTerminate,
  onRenew,
}) => {
  if (!contract) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <p>No contract selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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

    const icons = {
      [ContractStatus.ACTIVE]: CheckCircle,
      [ContractStatus.DRAFT]: Clock,
      [ContractStatus.EXPIRED]: AlertCircle,
      [ContractStatus.TERMINATED]: XCircle,
    };

    const Icon = icons[status];

    return (
      <Badge variant={variants[status] || 'secondary'} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
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

  const getDaysUntilExpiry = () => {
    if (!contract.endDate) return null;
    const endDate = new Date(contract.endDate);
    const today = new Date();
    return differenceInDays(endDate, today);
  };

  const isExpiringSoon = () => {
    const daysUntilExpiry = getDaysUntilExpiry();
    return daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = () => {
    if (!contract.endDate) return false;
    return isBefore(new Date(contract.endDate), new Date());
  };

  const handleTerminate = () => {
    const reason = prompt('Please provide a reason for termination:');
    if (reason && onTerminate) {
      onTerminate(contract.id, reason);
    }
  };

  const handleRenew = () => {
    if (!contract.endDate || !onRenew) return;
    
    const currentEndDate = new Date(contract.endDate);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    
    const confirmed = confirm(
      `Renew contract until ${format(newEndDate, 'MMM dd, yyyy')}?`
    );
    
    if (confirmed) {
      onRenew(contract.id, newEndDate.toISOString(), contract.monthlyRent);
    }
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Contract Details</h2>
              <div className="flex items-center gap-2">
                {getStatusBadge(contract.status)}
                {getContractTypeBadge(contract.contractType)}
              </div>
            </div>
          </div>
          
          {/* Expiry Warning */}
          {isExpiringSoon() && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <p className="text-sm text-orange-800">
                Contract expires in {daysUntilExpiry} days
              </p>
            </div>
          )}
          
          {isExpired() && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">
                Contract expired {Math.abs(daysUntilExpiry!)} days ago
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {contract.status === ContractStatus.ACTIVE && onTerminate && (
            <Button variant="outline" onClick={handleTerminate}>
              <XCircle className="mr-2 h-4 w-4" />
              Terminate
            </Button>
          )}
          {(contract.status === ContractStatus.ACTIVE || isExpiringSoon()) && onRenew && (
            <Button onClick={handleRenew}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Renew
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Renter Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Renter Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contract.renter ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{contract.renter.name}</p>
                </div>
                {contract.renter.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{contract.renter.email}</p>
                  </div>
                )}
                {contract.renter.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{contract.renter.phone}</p>
                  </div>
                )}
                {contract.renter.emergencyContact && (
                  <div>
                    <p className="text-sm text-muted-foreground">Emergency Contact</p>
                    <p className="text-sm">{contract.renter.emergencyContact}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Renter information not available</p>
            )}
          </CardContent>
        </Card>

        {/* Room Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Room Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contract.room ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-medium">Room {contract.room.number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-sm">{contract.room.name}</p>
                </div>
                {contract.room.floor && (
                  <div>
                    <p className="text-sm text-muted-foreground">Floor</p>
                    <p className="text-sm">{contract.room.floor}</p>
                  </div>
                )}
                {contract.room.size && (
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="text-sm">{contract.room.size} sq ft</p>
                  </div>
                )}
                {contract.room.property && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{contract.room.property.name}</p>
                      <p className="text-sm text-muted-foreground">{contract.room.property.address}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Room information not available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contract Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{formatDate(contract.startDate)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">{formatDate(contract.endDate)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <p className="font-medium">${contract.monthlyRent.toLocaleString()}</p>
              </div>
            </div>
            
            {contract.securityDeposit && contract.securityDeposit > 0 && (
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Security Deposit</p>
                  <p className="font-medium">${contract.securityDeposit.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          {contract.terms && (
            <>
              <Separator className="my-6" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Terms & Conditions</p>
                <p className="text-sm whitespace-pre-wrap">{contract.terms}</p>
              </div>
            </>
          )}

          {contract.terminationReason && (
            <>
              <Separator className="my-6" />
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium mb-1">Termination Reason</p>
                <p className="text-sm text-red-700">{contract.terminationReason}</p>
                {contract.terminationDate && (
                  <p className="text-sm text-red-600 mt-2">
                    Terminated on {formatDate(contract.terminationDate)}
                  </p>
                )}
              </div>
            </>
          )}

          {contract.documentPath && (
            <>
              <Separator className="my-6" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contract Document</p>
                  <p className="text-sm">Signed contract document available</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      {contract.payments && contract.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contract.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>${payment.amount.toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{payment.method.toLowerCase()}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'PAID' ? 'default' : 'secondary'}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const ContractDetailsModal: React.FC<ContractDetailsModalProps> = ({
  isOpen,
  onClose,
  ...props
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contract Details</DialogTitle>
          <DialogDescription>
            Comprehensive view of contract information and history
          </DialogDescription>
        </DialogHeader>

        <ContractDetails {...props} />
      </DialogContent>
    </Dialog>
  );
};

export default ContractDetails;