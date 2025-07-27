import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Upload, Calendar, DollarSign, Building, Tag, User, FileText, RotateCcw } from 'lucide-react';
import { useExpenseStore } from '../../stores/expenseStore';
import { usePropertyStore } from '../../stores/propertyStore';
import { ExpenseCategory, RecurringFrequency } from '../../utils/apiClient';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';

const expenseFormSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  category: z.nativeEnum(ExpenseCategory, {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  date: z.string().min(1, 'Date is required'),
  vendor: z.string().optional(),
  isRecurring: z.boolean(),
  recurringFrequency: z.nativeEnum(RecurringFrequency).optional(),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId?: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  isOpen,
  onClose,
  expenseId,
}) => {
  const { toast } = useToast();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    selectedExpense,
    createExpense,
    updateExpense,
    fetchExpenseById,
    clearSelectedExpense,
    error,
    clearError,
  } = useExpenseStore();

  const {
    properties,
    fetchProperties,
  } = usePropertyStore();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      propertyId: '',
      category: ExpenseCategory.OTHER,
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      vendor: '',
      isRecurring: false,
      recurringFrequency: undefined,
    },
  });

  const { watch, reset } = form;
  const isRecurring = watch('isRecurring');

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
      if (expenseId) {
        fetchExpenseById(expenseId);
      } else {
        clearSelectedExpense();
        reset();
      }
    }
  }, [isOpen, expenseId]);

  useEffect(() => {
    if (selectedExpense && expenseId) {
      reset({
        propertyId: selectedExpense.propertyId,
        category: selectedExpense.category,
        amount: selectedExpense.amount.toString(),
        description: selectedExpense.description,
        date: selectedExpense.date,
        vendor: selectedExpense.vendor || '',
        isRecurring: selectedExpense.isRecurring,
        recurringFrequency: selectedExpense.recurringFrequency,
      });
      
      if (selectedExpense.receiptPath) {
        setReceiptPreview(selectedExpense.receiptPath);
      }
    }
  }, [selectedExpense, expenseId, reset]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image (JPEG, PNG, GIF) or PDF file.',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      setReceiptFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setReceiptPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview(null);
      }
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      setIsSubmitting(true);
      clearError();

      const expenseData = {
        ...data,
        amount: parseFloat(data.amount),
        recurringFrequency: data.isRecurring ? data.recurringFrequency : undefined,
      };

      if (expenseId) {
        await updateExpense(expenseId, expenseData);
        toast({
          title: 'Expense updated',
          description: 'The expense has been successfully updated.',
        });
      } else {
        await createExpense(expenseData);
        toast({
          title: 'Expense created',
          description: 'The expense has been successfully recorded.',
        });
      }

      handleClose();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save expense. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setReceiptFile(null);
    setReceiptPreview(null);
    clearSelectedExpense();
    clearError();
    onClose();
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>{expenseId ? 'Edit Expense' : 'Add New Expense'}</span>
              </CardTitle>
              <CardDescription>
                {expenseId ? 'Update expense details' : 'Record a new property expense'}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <h3 className="text-lg font-medium">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="propertyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(ExpenseCategory).map((category) => (
                              <SelectItem key={category} value={category}>
                                <div className="flex items-center space-x-2">
                                  <Tag className="h-3 w-3" />
                                  <span>{category.charAt(0) + category.slice(1).toLowerCase()}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        {field.value && (
                          <FormDescription>
                            {formatCurrency(field.value)}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="date"
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe the expense..."
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/500 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor/Supplier</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="Enter vendor name"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Optional: Name of the vendor or supplier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Recurring Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-4 w-4" />
                  <h3 className="text-lg font-medium">Recurring Options</h3>
                </div>

                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Recurring Expense
                        </FormLabel>
                        <FormDescription>
                          This expense occurs regularly (e.g., monthly utilities)
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {isRecurring && (
                  <FormField
                    control={form.control}
                    name="recurringFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(RecurringFrequency).map((frequency) => (
                              <SelectItem key={frequency} value={frequency}>
                                {frequency.charAt(0) + frequency.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Receipt Upload */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <h3 className="text-lg font-medium">Receipt</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="receipt">Upload Receipt</Label>
                    <div className="mt-2">
                      <input
                        id="receipt"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('receipt')?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {receiptFile ? 'Change Receipt' : 'Upload Receipt'}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supported formats: JPEG, PNG, GIF, PDF (max 5MB)
                    </p>
                  </div>

                  {(receiptFile || receiptPreview) && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {receiptFile ? receiptFile.name : 'Current receipt'}
                          </span>
                          {receiptFile && (
                            <Badge variant="secondary">
                              {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                            </Badge>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeReceipt}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {receiptPreview && receiptPreview.startsWith('data:image') && (
                        <div className="mt-2">
                          <img
                            src={receiptPreview}
                            alt="Receipt preview"
                            className="max-w-full h-32 object-contain rounded"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : expenseId ? 'Update Expense' : 'Create Expense'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseForm;