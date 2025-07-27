import React, { useState, useEffect } from 'react';
import { Payment, PaymentStatus, PaymentMethod, Contract } from '../../utils/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, DollarSign, FileText, CreditCard, Upload, AlertCircle } from 'lucide-react';
import { format, addMonths } from 'date-fns';

interface PaymentFormData {
  contractId: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  method: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  receiptPath?: string;
}

interface PaymentFormProps {
  payment?: Payment | null;
  contracts: Contract[];
  onSubmit: (data: PaymentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'record' | 'edit';
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  payment,
  contracts,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    contractId: payment?.contractId || '',
    amount: payment?.amount || 0,
    dueDate: payment?.dueDate ? format(new Date(payment.dueDate), 'yyyy-MM-dd') : '',
    paymentDate: payment?.paymentDate ? format(new Date(payment.paymentDate), 'yyyy-MM-dd') : '',
    method: payment?.method || PaymentMethod.CASH,
    status: payment?.status || PaymentStatus.PENDING,
    notes: payment?.notes || '',
    receiptPath: payment?.receiptPath || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PaymentFormData, string>>>({});
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [showSchedulingOptions, setShowSchedulingOptions] = useState(false);

  // Auto-set amount based on selected contract's monthly rent
  useEffect(() => {
    if (formData.contractId && !payment) {
      const selectedContract = contracts.find(c => c.id === formData.contractId);
      if (selectedContract) {
        setFormData(prev => ({
          ...prev,
          amount: selectedContract.monthlyRent,
        }));
      }
    }
  }, [formData.contractId, contracts, payment]);

  // Auto-set payment date for recording mode
  useEffect(() => {
    if (mode === 'record' && !formData.paymentDate) {
      setFormData(prev => ({
        ...prev,
        paymentDate: format(new Date(), 'yyyy-MM-dd'),
        status: PaymentStatus.PAID,
      }));
    }
  }, [mode]);

  const handleInputChange = (field: keyof PaymentFormData, value: string | number) => {
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

  const handleReceiptUpload = async (file: File) => {
    setIsUploadingReceipt(true);
    try {
      // TODO: Implement actual file upload logic
      // For now, we'll just simulate the upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fileName = `receipt_${Date.now()}_${file.name}`;
      setFormData(prev => ({
        ...prev,
        receiptPath: fileName,
      }));
      setReceiptFile(file);
    } catch (error) {
      console.error('Error uploading receipt:', error);
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PaymentFormData, string>> = {};

    if (!formData.contractId) {
      newErrors.contractId = 'Please select a contract';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (mode === 'record' && !formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required when recording payment';
    }

    if (formData.dueDate && formData.paymentDate) {
      const dueDate = new Date(formData.dueDate);
      const paymentDate = new Date(formData.paymentDate);
      
      if (paymentDate < dueDate && formData.status === PaymentStatus.PAID) {
        // This is actually fine - early payment
      }
    }

    // Validate payment method for recorded payments
    if (mode === 'record' && formData.status === PaymentStatus.PAID && !formData.method) {
      newErrors.method = 'Payment method is required for recorded payments';
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

  const selectedContract = contracts.find(contract => contract.id === formData.contractId);

  const getFormTitle = () => {
    switch (mode) {
      case 'record':
        return 'Record Payment';
      case 'edit':
        return 'Edit Payment';
      default:
        return 'Create Payment';
    }
  };

  const getFormDescription = () => {
    switch (mode) {
      case 'record':
        return 'Mark this payment as received and record payment details';
      case 'edit':
        return 'Update payment information';
      default:
        return 'Create a new payment record for a rental contract';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          {getFormTitle()}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {getFormDescription()}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contract Selection */}
          <div className="space-y-2">
            <Label htmlFor="contractId">Contract *</Label>
            <Select
              value={formData.contractId}
              onValueChange={(value) => handleInputChange('contractId', value)}
              disabled={isLoading || mode === 'record' || mode === 'edit'}
            >
              <SelectTrigger className={errors.contractId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a contract" />
              </SelectTrigger>
              <SelectContent>
                {contracts.map((contract) => (
                  <SelectItem key={contract.id} value={contract.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {contract.renter?.name} - Room {contract.room?.number}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {contract.room?.property?.name} | ${contract.monthlyRent}/month
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.contractId && (
              <p className="text-sm text-destructive flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.contractId}
              </p>
            )}
          </div>

          {/* Selected Contract Info */}
          {selectedContract && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Renter:</span> {selectedContract.renter?.name}
                  </div>
                  <div>
                    <span className="font-medium">Room:</span> {selectedContract.room?.number}
                  </div>
                  <div>
                    <span className="font-medium">Monthly Rent:</span> ${selectedContract.monthlyRent}
                  </div>
                  <div>
                    <span className="font-medium">Contract Status:</span> {selectedContract.status}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  className={`pl-10 ${errors.amount ? 'border-destructive' : ''}`}
                  placeholder="0.00"
                  disabled={isLoading}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.amount}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className={`pl-10 ${errors.dueDate ? 'border-destructive' : ''}`}
                  disabled={isLoading || mode === 'record'}
                />
              </div>
              {errors.dueDate && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.dueDate}
                </p>
              )}
            </div>
          </div>

          {/* Payment Date (for recording/editing) */}
          {(mode === 'record' || mode === 'edit' || formData.status === PaymentStatus.PAID) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date {mode === 'record' ? '*' : ''}</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                    className={`pl-10 ${errors.paymentDate ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.paymentDate && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.paymentDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method {mode === 'record' ? '*' : ''}</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value) => handleInputChange('method', value as PaymentMethod)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.method ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentMethod.CASH}>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value={PaymentMethod.BANK_TRANSFER}>
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value={PaymentMethod.CREDIT_CARD}>
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Credit Card
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.method && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.method}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Status (for create/edit mode) */}
          {mode !== 'record' && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value as PaymentStatus)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={PaymentStatus.PAID}>Paid</SelectItem>
                  <SelectItem value={PaymentStatus.OVERDUE}>Overdue</SelectItem>
                  <SelectItem value={PaymentStatus.PARTIAL}>Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt (Optional)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleReceiptUpload(file);
                  }
                }}
                disabled={isLoading || isUploadingReceipt}
                className="flex-1"
              />
              {isUploadingReceipt && (
                <div className="text-sm text-muted-foreground">Uploading...</div>
              )}
            </div>
            {formData.receiptPath && (
              <p className="text-sm text-green-600 flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Receipt uploaded: {formData.receiptPath}
              </p>
            )}
          </div>

          {/* Payment Scheduling Options */}
          {mode === 'create' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Payment Scheduling</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSchedulingOptions(!showSchedulingOptions)}
                >
                  {showSchedulingOptions ? 'Hide Options' : 'Show Options'}
                </Button>
              </div>
              
              {showSchedulingOptions && (
                <Card className="p-4 bg-muted/50">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const nextMonth = addMonths(new Date(formData.dueDate || new Date()), 1);
                          setFormData(prev => ({
                            ...prev,
                            dueDate: format(nextMonth, 'yyyy-MM-dd')
                          }));
                        }}
                        disabled={!formData.dueDate}
                      >
                        Set Next Month
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const firstOfMonth = new Date();
                          firstOfMonth.setDate(1);
                          setFormData(prev => ({
                            ...prev,
                            dueDate: format(firstOfMonth, 'yyyy-MM-dd')
                          }));
                        }}
                      >
                        First of Month
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Quick scheduling options to set common due dates</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional notes about this payment..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
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
              disabled={isLoading || isUploadingReceipt}
            >
              {isLoading ? 'Saving...' : mode === 'record' ? 'Record Payment' : 'Save Payment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;