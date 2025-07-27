import { useNotificationStore } from '../stores/notificationStore';
import { usePaymentStore } from '../stores/paymentStore';
import { NotificationType, PaymentStatus } from '../utils/apiClient';

export class PaymentNotificationService {
  private static instance: PaymentNotificationService;
  
  static getInstance(): PaymentNotificationService {
    if (!PaymentNotificationService.instance) {
      PaymentNotificationService.instance = new PaymentNotificationService();
    }
    return PaymentNotificationService.instance;
  }

  /**
   * Create payment due reminder notification
   */
  async createPaymentDueReminder(
    userId: string,
    contractId: string,
    paymentId: string,
    amount: number,
    dueDate: string,
    daysUntilDue: number
  ) {
    const { createNotification } = useNotificationStore.getState();
    
    const title = daysUntilDue <= 0 
      ? 'Payment Due Today' 
      : `Payment Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`;
    
    const message = `Your rent payment of $${amount.toFixed(2)} is due on ${new Date(dueDate).toLocaleDateString()}. Please make your payment to avoid late fees.`;
    
    const priority = daysUntilDue <= 1 ? 'HIGH' : daysUntilDue <= 3 ? 'NORMAL' : 'LOW';
    
    return await createNotification({
      userId,
      type: NotificationType.PAYMENT_DUE,
      title,
      message,
      priority,
      relatedId: contractId,
      relatedType: 'contract',
      actionUrl: `/payments?contract=${contractId}`
    });
  }

  /**
   * Create overdue payment alert notification
   */
  async createOverduePaymentAlert(
    userId: string,
    contractId: string,
    paymentId: string,
    amount: number,
    dueDate: string,
    daysOverdue: number
  ) {
    const { createNotification } = useNotificationStore.getState();
    
    const title = `Payment Overdue - ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`;
    const message = `Your rent payment of $${amount.toFixed(2)} was due on ${new Date(dueDate).toLocaleDateString()} and is now ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue. Please make your payment immediately to avoid additional fees.`;
    
    return await createNotification({
      userId,
      type: NotificationType.PAYMENT_OVERDUE,
      title,
      message,
      priority: 'URGENT',
      relatedId: contractId,
      relatedType: 'contract',
      actionUrl: `/payments?contract=${contractId}`
    });
  }

  /**
   * Create payment confirmation notification
   */
  async createPaymentConfirmation(
    userId: string,
    contractId: string,
    paymentId: string,
    amount: number,
    paymentDate: string,
    method: string
  ) {
    const { createNotification } = useNotificationStore.getState();
    
    const title = 'Payment Received';
    const message = `Your payment of $${amount.toFixed(2)} has been successfully received on ${new Date(paymentDate).toLocaleDateString()} via ${method.replace('_', ' ').toLowerCase()}.`;
    
    return await createNotification({
      userId,
      type: NotificationType.PAYMENT_RECEIVED,
      title,
      message,
      priority: 'NORMAL',
      relatedId: contractId,
      relatedType: 'contract',
      actionUrl: `/payments?contract=${contractId}`
    });
  }

  /**
   * Create payment method change notification
   */
  async createPaymentMethodChangeNotification(
    userId: string,
    contractId: string,
    oldMethod: string,
    newMethod: string
  ) {
    const { createNotification } = useNotificationStore.getState();
    
    const title = 'Payment Method Updated';
    const message = `Your payment method has been changed from ${oldMethod.replace('_', ' ').toLowerCase()} to ${newMethod.replace('_', ' ').toLowerCase()}.`;
    
    return await createNotification({
      userId,
      type: NotificationType.GENERAL,
      title,
      message,
      priority: 'NORMAL',
      relatedId: contractId,
      relatedType: 'contract',
      actionUrl: `/contracts/${contractId}`
    });
  }

  /**
   * Check for due payments and create notifications
   */
  async checkAndCreateDuePaymentNotifications() {
    const { payments } = usePaymentStore.getState();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingPayments = payments.filter(payment => {
      if (payment.status !== PaymentStatus.PENDING) return false;
      
      const dueDate = new Date(payment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Notify for payments due in 7 days, 3 days, 1 day, and on due date
      return daysDiff <= 7 && daysDiff >= 0;
    });

    const notifications = [];
    
    for (const payment of upcomingPayments) {
      const dueDate = new Date(payment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Only create notifications for specific intervals
      if ([7, 3, 1, 0].includes(daysUntilDue)) {
        try {
          const notification = await this.createPaymentDueReminder(
            payment.contract?.renter?.id || '',
            payment.contractId,
            payment.id,
            payment.amount,
            payment.dueDate,
            daysUntilDue
          );
          notifications.push(notification);
        } catch (error) {
          console.error('Error creating payment due notification:', error);
        }
      }
    }
    
    return notifications;
  }

  /**
   * Check for overdue payments and create notifications
   */
  async checkAndCreateOverduePaymentNotifications() {
    const { overduePayments } = usePaymentStore.getState();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const notifications = [];
    
    for (const payment of overduePayments) {
      const dueDate = new Date(payment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Create notifications for 1, 3, 7, 14, and 30 days overdue
      if ([1, 3, 7, 14, 30].includes(daysOverdue)) {
        try {
          const notification = await this.createOverduePaymentAlert(
            payment.contract?.renter?.id || '',
            payment.contractId,
            payment.id,
            payment.amount,
            payment.dueDate,
            daysOverdue
          );
          notifications.push(notification);
        } catch (error) {
          console.error('Error creating overdue payment notification:', error);
        }
      }
    }
    
    return notifications;
  }

  /**
   * Create bulk payment due notifications for multiple users
   */
  async createBulkPaymentDueNotifications(
    userIds: string[],
    title: string,
    message: string,
    priority: string = 'NORMAL'
  ) {
    const { createBulkNotifications } = useNotificationStore.getState();
    
    return await createBulkNotifications(
      userIds,
      NotificationType.PAYMENT_DUE,
      title,
      message,
      priority,
      undefined,
      'payment'
    );
  }

  /**
   * Create bulk overdue payment notifications for multiple users
   */
  async createBulkOverdueNotifications(
    userIds: string[],
    title: string,
    message: string
  ) {
    const { createBulkNotifications } = useNotificationStore.getState();
    
    return await createBulkNotifications(
      userIds,
      NotificationType.PAYMENT_OVERDUE,
      title,
      message,
      'URGENT',
      undefined,
      'payment'
    );
  }
}

export const paymentNotificationService = PaymentNotificationService.getInstance();