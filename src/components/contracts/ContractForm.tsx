import React, { useState, useEffect } from 'react';
import { Contract, ContractStatus, ContractType, Room, Renter } from '../../utils/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, DollarSign, FileText, User, Building } from 'lucide-react';
import { format, addMonths } from 'date-fns';

interface ContractFormData {
  renterId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  status: ContractStatus;
  contractType: ContractType;
  terms: string;
}

interface ContractFormProps {
  contract?: Contract | null;
  rooms: Room[];
  renters: Renter[];
  onSubmit: (data: ContractFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ContractForm: React.FC<ContractFormProps> = ({
  contract,
  rooms,
  renters,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ContractFormData>({
    renterId: contract?.renterId || '',
    roomId: contract?.roomId || '',
    startDate: contract?.startDate ? format(new Date(contract.startDate), 'yyyy-MM-dd') : '',
    endDate: contract?.endDate ? format(new Date(contract.endDate), 'yyyy-MM-dd') : '',
    monthlyRent: contract?.monthlyRent || 0,
    securityDeposit: contract?.securityDeposit || 0,
    status: contract?.status || ContractStatus.DRAFT,
    contractType: contract?.contractType || ContractType.LONG_TERM,
    terms: contract?.terms || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContractFormData, string>>>({});

  // Auto-calculate end date for long-term contracts
  useEffect(() => {
    if (formData.contractType === ContractType.LONG_TERM && formData.startDate && !contract) {
      const startDate = new Date(formData.startDate);
      if (!isNaN(startDate.getTime())) {
        const endDate = addMonths(startDate, 12);
        setFormData(prev => ({
          ...prev,
          endDate: format(endDate, 'yyyy-MM-dd')
        }));
      }
    }
  }, [formData.startDate, formData.contractType, contract]);

  // Auto-set security deposit based on monthly rent
  useEffect(() => {
    if (formData.monthlyRent > 0 && !contract) {
      setFormData(prev => ({
        ...prev,
        securityDeposit: formData.monthlyRent * 2 // Default to 2 months rent
      }));
    }
  }, [formData.monthlyRent, contract]);

  const handleInputChange = (field: keyof ContractFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContractFormData, string>> = {};

    if (!formData.renterId) {
      newErrors.renterId = 'Please select a renter';
    }

    if (!formData.roomId) {
      newErrors.roomId = 'Please select a room';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.monthlyRent <= 0) {
      newErrors.monthlyRent = 'Monthly rent must be greater than 0';
    }

    if (formData.securityDeposit < 0) {
      newErrors.securityDeposit = 'Security deposit cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const selectedRoom = rooms.find(room => room.id === formData.roomId);
  const selectedRenter = renters.find(renter => renter.id === formData.renterId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contract Type and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contractType">Contract Type</Label>
          <Select
            value={formData.contractType}
            onValueChange={(value) => handleInputChange('contractType', value as ContractType)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contract type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ContractType.LONG_TERM}>Long Term (12+ months)</SelectItem>
              <SelectItem value={ContractType.SHORT_TERM}>Short Term (&lt; 12 months)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange('status', value as ContractStatus)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ContractStatus.DRAFT}>Draft</SelectItem>
              <SelectItem value={ContractStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={ContractStatus.EXPIRED}>Expired</SelectItem>
              <SelectItem value={ContractStatus.TERMINATED}>Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Renter and Room Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="renterId">Renter *</Label>
          <Select
            value={formData.renterId}
            onValueChange={(value) => handleInputChange('renterId', value)}
            disabled={isLoading}
          >
            <SelectTrigger className={errors.renterId ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select a renter" />
            </SelectTrigger>
            <SelectContent>
              {renters.map((renter) => (
                <SelectItem key={renter.id} value={renter.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div>
                      <p className="font-medium">{renter.name}</p>
                      <p className="text-sm text-muted-foreground">{renter.email}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.renterId && (
            <p className="text-sm text-destructive">{errors.renterId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="roomId">Room *</Label>
          <Select
            value={formData.roomId}
            onValueChange={(value) => handleInputChange('roomId', value)}
            disabled={isLoading}
          >
            <SelectTrigger className={errors.roomId ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select a room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.filter(room => room.status === 'AVAILABLE' || room.id === formData.roomId).map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Room {room.number}</p>
                      <p className="text-sm text-muted-foreground">{room.name} - ${room.price}/month</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.roomId && (
            <p className="text-sm text-destructive">{errors.roomId}</p>
          )}
        </div>
      </div>

      {/* Selected Details Preview */}
      {(selectedRoom || selectedRenter) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Contract Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedRenter && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span><strong>Renter:</strong> {selectedRenter.name}</span>
              </div>
            )}
            {selectedRoom && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span><strong>Room:</strong> {selectedRoom.number} - {selectedRoom.name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`pl-10 ${errors.startDate ? 'border-destructive' : ''}`}
              disabled={isLoading}
            />
          </div>
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={`pl-10 ${errors.endDate ? 'border-destructive' : ''}`}
              disabled={isLoading || formData.contractType === ContractType.LONG_TERM}
            />
          </div>
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate}</p>
          )}
          {formData.contractType === ContractType.LONG_TERM && (
            <p className="text-sm text-muted-foreground">
              End date is automatically set to 12 months from start date for long-term contracts
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Financial Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="monthlyRent">Monthly Rent *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="monthlyRent"
              type="number"
              min="0"
              step="0.01"
              value={formData.monthlyRent}
              onChange={(e) => handleInputChange('monthlyRent', parseFloat(e.target.value) || 0)}
              className={`pl-10 ${errors.monthlyRent ? 'border-destructive' : ''}`}
              disabled={isLoading}
              placeholder="0.00"
            />
          </div>
          {errors.monthlyRent && (
            <p className="text-sm text-destructive">{errors.monthlyRent}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="securityDeposit">Security Deposit</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="securityDeposit"
              type="number"
              min="0"
              step="0.01"
              value={formData.securityDeposit}
              onChange={(e) => handleInputChange('securityDeposit', parseFloat(e.target.value) || 0)}
              className={`pl-10 ${errors.securityDeposit ? 'border-destructive' : ''}`}
              disabled={isLoading}
              placeholder="0.00"
            />
          </div>
          {errors.securityDeposit && (
            <p className="text-sm text-destructive">{errors.securityDeposit}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Typically 1-2 months of rent
          </p>
        </div>
      </div>

      <Separator />

      {/* Terms and Conditions */}
      <div className="space-y-2">
        <Label htmlFor="terms">Terms and Conditions</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="terms"
            value={formData.terms}
            onChange={(e) => handleInputChange('terms', e.target.value)}
            className="pl-10 min-h-[100px]"
            disabled={isLoading}
            placeholder="Enter contract terms, conditions, and special agreements..."
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
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
          {isLoading ? 'Saving...' : contract ? 'Update Contract' : 'Create Contract'}
        </Button>
      </div>
    </form>
  );
};

export default ContractForm;