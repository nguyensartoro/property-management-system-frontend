import { useEffect, useCallback } from 'react';
import { usePaymentStore } from '../stores/paymentStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useAuth } from './useAuth';
import { paymentNotificationService } from '../services/paymentNotificationService';
import { PaymentStatus, PaymentMethod } from '../utils/apiClient';

export const usePaymentNotifications = () => {
  const { user } = useAuth();
  const { payments, overduePayments, fetchOverduePayments } = usePaymentStore();
  const { fetchUnreadCount } = useNotificationStore();

  /**
   * Check for due payments and create notifications
   */
  const checkDuePayments = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await paymentNotificationService.checkAndCreateDuePaymentNotifications();
      // Refresh unread count after creating notifications
      await fetchUnreadCount(user.id);
    } catch (error) {
      console.error('Error checking due payments:', error);
    }
  }, [user?.id, fetchUnreadCount]);

  /**
   * Check for overdue payments and create notifications
   */
  const checkOverduePayments = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // First fetch the latest overdue payments
      await fetchOverduePayments();
      // Then create notifications for them
      await paymentNotificationService.checkAndCreateOverduePaymentNotifications();
      // Refresh unread count after creating notifications
      await fetchUnreadCount(user.id);
    } catch (error) {
      console.error('Error checking overdue payments:', error);
    }
  }, [user?.id, fetchOverduePayments, fetchUnreadCount]);

  /**
   * Create payment confirmation notification
   */
  const notifyPaymentReceived = useCallback(async (
    paymentId: string,
    amount: number,
    paymentDate: string,
    method: PaymentMethod,
    contractId: string,
    userId?: string
  ) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;
    
    try {
      await paymentNotificationService.createPaymentConfirmation(
        targetUserId,
        contractId,
        paymentId,
        amount,
        paymentDate,
        method
      );
      await fetchUnreadCount(targetUserId);
    } catch (error) {
      console.error('Error creating payment confirmation notification:', error);
    }
  }, [user?.id, fetchUnreadCount]);

  /**
   * Create payment method change notification
   */
  const notifyPaymentMethodChange = useCallback(async (
    contractId: string,
    oldMethod: PaymentMethod,
    newMethod: PaymentMethod,
    userId?: string
  ) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;
    
    try {
      await paymentNotificationService.createPaymentMethodChangeNotification(
        targetUserId,
        contractId,
        oldMethod,
        newMethod
      );
      await fetchUnreadCount(targetUserId);
    } catch (error) {
      console.error('Error creating payment method change notification:', error);
    }
  }, [user?.id, fetchUnreadCount]);

  /**
   * Create payment due reminder notification
   */
  const notifyPaymentDue = useCallback(async (
    paymentId: string,
    amount: number,
    dueDate: string,
    contractId: string,
    daysUntilDue: number,
    userId?: string
  ) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;
    
    try {
      await paymentNotificationService.createPaymentDueReminder(
        targetUserId,
        contractId,
        paymentId,
        amount,
        dueDate,
        daysUntilDue
      );
      await fetchUnreadCount(targetUserId);
    } catch (error) {
      console.error('Error creating payment due notification:', error);
    }
  }, [user?.id, fetchUnreadCount]);

  /**
   * Create overdue payment alert notification
   */
  const notifyPaymentOverdue = useCallback(async (
    paymentId: string,
    amount: number,
    dueDate: string,
    contractId: string,
    daysOverdue: number,
    userId?: string
  ) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;
    
    try {
      await paymentNotificationService.createOverduePaymentAlert(
        targetUserId,
        contractId,
        paymentId,
        amount,
        dueDate,
        daysOverdue
      );
      await fetchUnreadCount(targetUserId);
    } catch (error) {
      console.error('Error creating overdue payment notification:', error);
    }
  }, [user?.id, fetchUnreadCount]);

  /**
   * Create bulk payment notifications
   */
  const notifyBulkPaymentDue = useCallback(async (
    userIds: string[],
    title: string,
    message: string,
    priority: string = 'NORMAL'
  ) => {
    try {
      await paymentNotificationService.createBulkPaymentDueNotifications(
        userIds,
        title,
        message,
        priority
      );
      
      // Refresh unread count for all affected users
      for (const userId of userIds) {
        await fetchUnreadCount(userId);
      }
    } catch (error) {
      console.error('Error creating bulk payment due notifications:', error);
    }
  }, [fetchUnreadCount]);

  /**
   * Create bulk overdue payment notifications
   */
  const notifyBulkPaymentOverdue = useCallback(async (
    userIds: string[],
    title: string,
    message: string
  ) => {
    try {
      await paymentNotificationService.createBulkOverdueNotifications(
        userIds,
        title,
        message
      );
      
      // Refresh unread count for all affected users
      for (const userId of userIds) {
        await fetchUnreadCount(userId);
      }
    } catch (error) {
      console.error('Error creating bulk overdue payment notifications:', error);
    }
  }, [fetchUnreadCount]);

  /**
   * Get payment notification statistics
   */
  const getPaymentNotificationStats = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueToday = payments.filter(payment => {
      if (payment.status !== PaymentStatus.PENDING) return false;
      const dueDate = new Date(payment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });

    const dueSoon = payments.filter(payment => {
      if (payment.status !== PaymentStatus.PENDING) return false;
      const dueDate = new Date(payment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 0 && daysDiff <= 7;
    });

    return {
      dueToday: dueToday.length,
      dueSoon: dueSoon.length,
      overdue: overduePayments.length,
      totalAmount: {
        dueToday: dueToday.reduce((sum, p) => sum + p.amount, 0),
        dueSoon: dueSoon.reduce((sum, p) => sum + p.amount, 0),
        overdue: overduePayments.reduce((sum, p) => sum + p.amount, 0),
      }
    };
  }, [payments, overduePayments]);

  // Auto-check for due and overdue payments periodically
  useEffect(() => {
    if (!user?.id) return;

    // Check immediately
    checkDuePayments();
    checkOverduePayments();

    // Set up periodic checks (every hour)
    const interval = setInterval(() => {
      checkDuePayments();
      checkOverduePayments();
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [user?.id, checkDuePayments, checkOverduePayments]);

  return {
    // Notification functions
    notifyPaymentReceived,
    notifyPaymentMethodChange,
    notifyPaymentDue,
    notifyPaymentOverdue,
    notifyBulkPaymentDue,
    notifyBulkPaymentOverdue,
    
    // Check functions
    checkDuePayments,
    checkOverduePayments,
    
    // Stats
    getPaymentNotificationStats,
  };
};