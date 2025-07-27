import React, { useState, useMemo } from 'react';
import { Payment, PaymentStatus, PaymentMethod } from '../../utils/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  isPast
} from 'date-fns';

interface PaymentCalendarProps {
  payments: Payment[];
  onPaymentClick?: (payment: Payment) => void;
  onDateClick?: (date: Date) => void;
  onQuickRecord?: (payment: Payment) => void;
  isLoading?: boolean;
}

interface CalendarDay {
  date: Date;
  payments: Payment[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

// Payment status badge component
const PaymentStatusBadge: React.FC<{ status: PaymentStatus; size?: 'sm' | 'xs' }> = ({ 
  status, 
  size = 'xs' 
}) => {
  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return { 
          variant: 'default' as const, 
          icon: CheckCircle, 
          className: 'bg-green-100 text-green-800 border-green-200' 
        };
      case PaymentStatus.PENDING:
        return { 
          variant: 'secondary' as const, 
          icon: Clock, 
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
        };
      case PaymentStatus.OVERDUE:
        return { 
          variant: 'destructive' as const, 
          icon: AlertCircle, 
          className: 'bg-red-100 text-red-800 border-red-200' 
        };
      case PaymentStatus.PARTIAL:
        return { 
          variant: 'outline' as const, 
          icon: XCircle, 
          className: 'bg-orange-100 text-orange-800 border-orange-200' 
        };
      default:
        return { 
          variant: 'secondary' as const, 
          icon: Clock, 
          className: 'bg-gray-100 text-gray-800 border-gray-200' 
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${size === 'xs' ? 'text-xs px-1 py-0' : 'text-sm'}`}
    >
      <Icon className={`${size === 'xs' ? 'w-2 h-2' : 'w-3 h-3'} mr-1`} />
      {status}
    </Badge>
  );
};

// Payment item component for calendar day
const PaymentItem: React.FC<{
  payment: Payment;
  onClick: () => void;
  onQuickRecord?: () => void;
}> = ({ payment, onClick, onQuickRecord }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isOverdue = payment.status === PaymentStatus.OVERDUE || 
    (payment.status === PaymentStatus.PENDING && isPast(new Date(payment.dueDate)));

  return (
    <div 
      className={`
        p-2 rounded-md border cursor-pointer transition-colors hover:bg-muted/50
        ${isOverdue ? 'border-red-300 bg-red-50 shadow-sm animate-pulse' : 'border-border bg-background'}
        ${payment.status === PaymentStatus.PAID ? 'border-green-200 bg-green-50' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium truncate">
          {payment.contract?.renter?.name}
        </span>
        <PaymentStatusBadge status={payment.status} size="xs" />
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Room {payment.contract?.room?.number}
        </span>
        <span className="text-xs font-medium">
          {formatCurrency(payment.amount)}
        </span>
      </div>

      {payment.status !== PaymentStatus.PAID && onQuickRecord && (
        <Button
          size="sm"
          variant={isOverdue ? "destructive" : "outline"}
          className="w-full mt-2 h-6 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onQuickRecord();
          }}
        >
          {isOverdue ? 'Record Now!' : 'Quick Record'}
        </Button>
      )}
    </div>
  );
};

const PaymentCalendar: React.FC<PaymentCalendarProps> = ({
  payments,
  onPaymentClick,
  onDateClick,
  onQuickRecord,
  isLoading = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    return days.map((date): CalendarDay => {
      const dayPayments = payments.filter(payment => 
        isSameDay(new Date(payment.dueDate), date)
      );

      return {
        date,
        payments: dayPayments,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isToday(date),
        isPast: isPast(date),
      };
    });
  }, [currentDate, payments]);

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Payment handlers
  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentModalOpen(true);
    onPaymentClick?.(payment);
  };

  const handleDateClick = (date: Date) => {
    onDateClick?.(date);
  };

  const handleQuickRecord = (payment: Payment) => {
    onQuickRecord?.(payment);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate monthly summary
  const monthlySummary = useMemo(() => {
    const monthPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.dueDate);
      return isSameMonth(paymentDate, currentDate);
    });

    return {
      total: monthPayments.reduce((sum, p) => sum + p.amount, 0),
      paid: monthPayments.filter(p => p.status === PaymentStatus.PAID).reduce((sum, p) => sum + p.amount, 0),
      pending: monthPayments.filter(p => p.status === PaymentStatus.PENDING).reduce((sum, p) => sum + p.amount, 0),
      overdue: monthPayments.filter(p => p.status === PaymentStatus.OVERDUE).reduce((sum, p) => sum + p.amount, 0),
      count: monthPayments.length,
    };
  }, [payments, currentDate]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Payment Calendar
              </CardTitle>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold min-w-[200px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{formatCurrency(monthlySummary.total)}</div>
            <p className="text-xs text-muted-foreground">Total Due</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(monthlySummary.paid)}</div>
            <p className="text-xs text-muted-foreground">Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(monthlySummary.pending)}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{formatCurrency(monthlySummary.overdue)}</div>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  min-h-[120px] p-2 border-r border-b last:border-r-0 cursor-pointer
                  transition-colors hover:bg-muted/50
                  ${!day.isCurrentMonth ? 'bg-muted/20' : ''}
                  ${day.isToday ? 'bg-blue-50 border-blue-200' : ''}
                `}
                onClick={() => handleDateClick(day.date)}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className={`
                      text-sm font-medium
                      ${!day.isCurrentMonth ? 'text-muted-foreground' : ''}
                      ${day.isToday ? 'text-blue-600 font-bold' : ''}
                    `}
                  >
                    {format(day.date, 'd')}
                  </span>
                  
                  {day.payments.length > 0 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {day.payments.length}
                    </Badge>
                  )}
                </div>

                {/* Payments for this day */}
                <div className="space-y-1">
                  {day.payments.slice(0, 2).map((payment) => (
                    <PaymentItem
                      key={payment.id}
                      payment={payment}
                      onClick={() => handlePaymentClick(payment)}
                      onQuickRecord={() => handleQuickRecord(payment)}
                    />
                  ))}
                  
                  {day.payments.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{day.payments.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              View payment information and take actions
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Renter:</span>
                  <div>{selectedPayment.contract?.renter?.name}</div>
                </div>
                <div>
                  <span className="font-medium">Room:</span>
                  <div>{selectedPayment.contract?.room?.number}</div>
                </div>
                <div>
                  <span className="font-medium">Amount:</span>
                  <div className="font-medium">{formatCurrency(selectedPayment.amount)}</div>
                </div>
                <div>
                  <span className="font-medium">Due Date:</span>
                  <div>{format(new Date(selectedPayment.dueDate), 'MMM dd, yyyy')}</div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div><PaymentStatusBadge status={selectedPayment.status} /></div>
                </div>
                <div>
                  <span className="font-medium">Method:</span>
                  <div>{selectedPayment.method.replace('_', ' ')}</div>
                </div>
              </div>

              {selectedPayment.paymentDate && (
                <div className="text-sm">
                  <span className="font-medium">Payment Date:</span>
                  <div>{format(new Date(selectedPayment.paymentDate), 'MMM dd, yyyy')}</div>
                </div>
              )}

              {selectedPayment.notes && (
                <div className="text-sm">
                  <span className="font-medium">Notes:</span>
                  <div className="text-muted-foreground">{selectedPayment.notes}</div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                  Close
                </Button>
                {selectedPayment.status !== PaymentStatus.PAID && (
                  <Button onClick={() => handleQuickRecord(selectedPayment)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentCalendar;