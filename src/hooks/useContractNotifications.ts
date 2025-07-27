import { useState, useEffect, useCallback } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import { useContractStore } from '../stores/contractStore';
import { contractNotificationService, ContractNotification, ContractNotificationData } from '../services/contractNotificationService';
import { NotificationType, NotificationPriority, Contract } from '../utils/apiClient';

interface UseContractNotificationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableExpirationReminders?: boolean;
  expirationReminderDays?: number[];
}

interface ContractNotificationHook {
  notifications: ContractNotification[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  urgentCount: number;
  
  // Actions
  createExpirationReminder: (contractId: string, daysUntilExpiration: number) => Promise<void>;
  createRenewalNotification: (contractId: string) => Promise<void>;
  createStatusChangeNotification: (contractId: string, oldStatus: string, newStatus: string) => Promise<void>;
  createDocumentNotification: (contractId: string, documentType: 'uploaded' | 'updated' | 'signed') => Promise<void>;
  createTerminationNotification: (contractId: string, reason?: string, isRenterInitiated?: boolean) => Promise<void>;
  
  // Batch operations
  checkExpiringContracts: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  
  // Utilities
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  
  // Filters
  filterByType: (type: NotificationType) => ContractNotification[];
  filterByPriority: (priority: NotificationPriority) => ContractNotification[];
  filterByContract: (contractId: string) => ContractNotification[];
}

export const useContractNotifications = (
  options: UseContractNotificationsOptions = {}
): ContractNotificationHook => {
  const {
    autoRefresh = true,
    refreshInterval = 300000, // 5 minutes
    enableExpirationReminders = true,
    expirationReminderDays = [90, 60, 30, 14, 7, 3, 1],
  } = options;

  const [notifications, setNotifications] = useState<ContractNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    createNotification,
    markNotificationAsRead,
    deleteNotification: deleteStoreNotification,
    fetchNotifications,
  } = useNotificationStore();

  const {
    contracts,
    fetchContracts,
  } = useContractStore();

  // Convert contract to notification data
  const contractToNotificationData = useCallback((contract: Contract): ContractNotificationData => {
    return {
      contractId: contract.id,
      renterId: contract.renterId,
      roomId: contract.roomId,
      contractTitle: `Contract for ${contract.renter?.name || 'Unknown'} - Room ${contract.room?.number || 'N/A'}`,
      renterName: contract.renter?.name || 'Unknown Renter',
      roomNumber: contract.room?.number || 'N/A',
      propertyName: contract.room?.property?.name || 'Unknown Property',
      expirationDate: contract.endDate,
      renewalDate: contract.renewalDate,
      terminationDate: contract.terminationDate,
      documentUrl: contract.documentPath,
    };
  }, []);

  // Create expiration reminder
  const createExpirationReminder = useCallback(async (contractId: string, daysUntilExpiration: number) => {
    try {
      setError(null);
      const contract = contracts.find(c => c.id === contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      const notificationData = contractToNotificationData(contract);
      const notification = contractNotificationService.createExpirationReminder(notificationData, daysUntilExpiration);
      
      await createNotification({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        relatedId: contractId,
        relatedType: 'contract',
        actionUrl: notification.actionUrl,
      });

      setNotifications(prev => [notification, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create expiration reminder';
      setError(errorMessage);
      throw err;
    }
  }, [contracts, contractToNotificationData, createNotification]);

  // Create renewal notification
  const createRenewalNotification = useCallback(async (contractId: string) => {
    try {
      setError(null);
      const contract = contracts.find(c => c.id === contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      const notificationData = contractToNotificationData(contract);
      const notification = contractNotificationService.createRenewalNotification(notificationData);
      
      await createNotification({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        relatedId: contractId,
        relatedType: 'contract',
        actionUrl: notification.actionUrl,
      });

      setNotifications(prev => [notification, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create renewal notification';
      setError(errorMessage);
      throw err;
    }
  }, [contracts, contractToNotificationData, createNotification]);

  // Create status change notification
  const createStatusChangeNotification = useCallback(async (contractId: string, oldStatus: string, newStatus: string) => {
    try {
      setError(null);
      const contract = contracts.find(c => c.id === contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      const notificationData = contractToNotificationData(contract);
      const notification = contractNotificationService.createStatusChangeNotification(notificationData, oldStatus, newStatus);
      
      await createNotification({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        relatedId: contractId,
        relatedType: 'contract',
        actionUrl: notification.actionUrl,
      });

      setNotifications(prev => [notification, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create status change notification';
      setError(errorMessage);
      throw err;
    }
  }, [contracts, contractToNotificationData, createNotification]);

  // Create document notification
  const createDocumentNotification = useCallback(async (contractId: string, documentType: 'uploaded' | 'updated' | 'signed') => {
    try {
      setError(null);
      const contract = contracts.find(c => c.id === contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      const notificationData = contractToNotificationData(contract);
      const notification = contractNotificationService.createDocumentNotification(notificationData, documentType);
      
      await createNotification({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        relatedId: contractId,
        relatedType: 'contract',
        actionUrl: notification.actionUrl,
      });

      setNotifications(prev => [notification, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create document notification';
      setError(errorMessage);
      throw err;
    }
  }, [contracts, contractToNotificationData, createNotification]);

  // Create termination notification
  const createTerminationNotification = useCallback(async (contractId: string, reason?: string, isRenterInitiated: boolean = false) => {
    try {
      setError(null);
      const contract = contracts.find(c => c.id === contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      const notificationData = contractToNotificationData(contract);
      const notification = contractNotificationService.createTerminationNotification(notificationData, reason, isRenterInitiated);
      
      await createNotification({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        relatedId: contractId,
        relatedType: 'contract',
        actionUrl: notification.actionUrl,
      });

      setNotifications(prev => [notification, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create termination notification';
      setError(errorMessage);
      throw err;
    }
  }, [contracts, contractToNotificationData, createNotification]);

  // Check for expiring contracts and create notifications
  const checkExpiringContracts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!enableExpirationReminders) {
        return;
      }

      const today = new Date();
      const expiringContracts = contracts.filter(contract => {
        if (!contract.endDate || contract.status !== 'ACTIVE') {
          return false;
        }

        const expirationDate = new Date(contract.endDate);
        const daysUntilExpiration = Math.ceil(
          (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        return expirationReminderDays.includes(daysUntilExpiration);
      });

      for (const contract of expiringContracts) {
        const expirationDate = new Date(contract.endDate!);
        const daysUntilExpiration = Math.ceil(
          (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check if we already have a notification for this contract and timeframe
        const existingNotification = notifications.find(n => 
          n.data.contractId === contract.id && 
          n.type === NotificationType.CONTRACT_EXPIRATION &&
          Math.abs(new Date(n.createdAt).getTime() - today.getTime()) < 24 * 60 * 60 * 1000 // Within last 24 hours
        );

        if (!existingNotification) {
          await createExpirationReminder(contract.id, daysUntilExpiration);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check expiring contracts';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [contracts, notifications, expirationReminderDays, enableExpirationReminders, createExpirationReminder]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await fetchNotifications();
      await fetchContracts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh notifications';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchNotifications, fetchContracts]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read';
      setError(errorMessage);
    }
  }, [markNotificationAsRead]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(unreadNotifications.map(n => markNotificationAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all notifications as read';
      setError(errorMessage);
    }
  }, [notifications, markNotificationAsRead]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await deleteStoreNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
      setError(errorMessage);
    }
  }, [deleteStoreNotification]);

  // Filter utilities
  const filterByType = useCallback((type: NotificationType) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  const filterByPriority = useCallback((priority: NotificationPriority) => {
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);

  const filterByContract = useCallback((contractId: string) => {
    return notifications.filter(n => n.data.contractId === contractId);
  }, [notifications]);

  // Calculate counts
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.priority === NotificationPriority.HIGH).length;

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshNotifications();
        checkExpiringContracts();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshNotifications, checkExpiringContracts]);

  // Initial load
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Check expiring contracts on contracts change
  useEffect(() => {
    if (contracts.length > 0) {
      checkExpiringContracts();
    }
  }, [contracts, checkExpiringContracts]);

  return {
    notifications: contractNotificationService.sortNotifications(notifications),
    isLoading,
    error,
    unreadCount,
    urgentCount,
    
    // Actions
    createExpirationReminder,
    createRenewalNotification,
    createStatusChangeNotification,
    createDocumentNotification,
    createTerminationNotification,
    
    // Batch operations
    checkExpiringContracts,
    refreshNotifications,
    
    // Utilities
    markAsRead,
    markAllAsRead,
    deleteNotification,
    
    // Filters
    filterByType,
    filterByPriority,
    filterByContract,
  };
};

export default useContractNotifications;