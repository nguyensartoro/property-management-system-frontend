import { useEffect, useCallback } from 'react';
import { useMaintenanceStore } from '../stores/maintenanceStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useAuth } from './useAuth';
import { maintenanceNotificationService } from '../services/maintenanceNotificationService';
import { MaintenanceStatus, MaintenancePriority } from '../utils/apiClient';

export const useMaintenanceNotifications = () => {
  const { user } = useAuth();
  const { maintenanceRequests, urgentRequests, fetchUrgentMaintenanceRequests } = useMaintenanceStore();
  const { fetchUnreadCount } = useNotificationStore();

  /**
   * Notify property managers about new maintenance request
   */
  const notifyMaintenanceRequestSubmitted = useCallback(async (
    requestId: string,
    title: string,
    priority: MaintenancePriority,
    renterName: string,
    roomNumber: string,
    propertyName: string,
    managerIds: string[]
  ) => {
    try {
      await maintenanceNotificationService.createMaintenanceRequestNotification(
        managerIds,
        requestId,
        title,
        priority,
        renterName,
        roomNumber,
        propertyName
      );
      
      // Refresh unread count for all managers
      for (const managerId of managerIds) {
        await fetchUnreadCount(managerId);
      }
    } catch (error) {
      console.error('Error creating maintenance request notification:', error);
    }
  }, [fetchUnreadCount]);

  /**
   * Notify renter about maintenance status update
   */
  const notifyMaintenanceStatusUpdate = useCallback(async (
    renterId: string,
    requestId: string,
    title: string,
    oldStatus: MaintenanceStatus,
    newStatus: MaintenanceStatus,
    assignedTo?: string,
    estimatedCompletion?: string,
    notes?: string
  ) => {
    try {
      await maintenanceNotificationService.createMaintenanceStatusUpdateNotification(
        renterId,
        requestId,
        title,
        oldStatus,
        newStatus,
        assignedTo,
        estimatedCompletion,
        notes
      );
      await fetchUnreadCount(renterId);
    } catch (error) {
      console.error('Error creating maintenance status update notification:', error);
    }
  }, [fetchUnreadCount]);

  /**
   * Notify renter about maintenance completion
   */
  const notifyMaintenanceCompleted = useCallback(async (
    renterId: string,
    requestId: string,
    title: string,
    completionNotes?: string,
    completedBy?: string
  ) => {
    try {
      await maintenanceNotificationService.createMaintenanceCompletionNotification(
        renterId,
        requestId,
        title,
        completionNotes,
        completedBy
      );
      await fetchUnreadCount(renterId);
    } catch (error) {
      console.error('Error creating maintenance completion notification:', error);
    }
  }, [fetchUnreadCount]);

  /**
   * Create emergency maintenance alert
   */
  const notifyEmergencyMaintenance = useCallback(async (
    requestId: string,
    title: string,
    description: string,
    renterName: string,
    roomNumber: string,
    propertyName: string,
    managerIds: string[],
    renterPhone?: string
  ) => {
    try {
      await maintenanceNotificationService.createEmergencyMaintenanceAlert(
        managerIds,
        requestId,
        title,
        description,
        renterName,
        roomNumber,
        propertyName,
        renterPhone
      );
      
      // Refresh unread count for all managers
      for (const managerId of managerIds) {
        await fetchUnreadCount(managerId);
      }
    } catch (error) {
      console.error('Error creating emergency maintenance alert:', error);
    }
  }, [fetchUnreadCount]);

  /**
   * Notify assigned staff about maintenance assignment
   */
  const notifyMaintenanceAssigned = useCallback(async (
    assignedUserId: string,
    requestId: string,
    title: string,
    priority: MaintenancePriority,
    roomNumber: string,
    propertyName: string,
    estimatedCompletion?: string,
    assignmentNotes?: string
  ) => {
    try {
      await maintenanceNotificationService.createMaintenanceAssignmentNotification(
        assignedUserId,
        requestId,
        title,
        priority,
        roomNumber,
        propertyName,
        estimatedCompletion,
        assignmentNotes
      );
      await fetchUnreadCount(assignedUserId);
    } catch (error) {
      console.error('Error creating maintenance assignment notification:', error);
    }
  }, [fetchUnreadCount]);

  /**
   * Create maintenance reminder for overdue requests
   */
  const notifyMaintenanceReminder = useCallback(async (
    assignedUserId: string,
    requestId: string,
    title: string,
    priority: MaintenancePriority,
    daysSinceAssigned: number,
    estimatedCompletion?: string
  ) => {
    try {
      await maintenanceNotificationService.createMaintenanceReminderNotification(
        assignedUserId,
        requestId,
        title,
        priority,
        daysSinceAssigned,
        estimatedCompletion
      );
      await fetchUnreadCount(assignedUserId);
    } catch (error) {
      console.error('Error creating maintenance reminder notification:', error);
    }
  }, [fetchUnreadCount]);

  /**
   * Check for overdue maintenance requests and create reminders
   */
  const checkOverdueMaintenanceRequests = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await maintenanceNotificationService.checkAndCreateMaintenanceReminders();
      // Refresh unread count after creating notifications
      await fetchUnreadCount(user.id);
    } catch (error) {
      console.error('Error checking overdue maintenance requests:', error);
    }
  }, [user?.id, fetchUnreadCount]);

  /**
   * Get maintenance notification statistics
   */
  const getMaintenanceNotificationStats = useCallback(() => {
    return maintenanceNotificationService.getMaintenanceNotificationStats();
  }, [maintenanceRequests, urgentRequests]);

  /**
   * Handle maintenance request submission with automatic notifications
   */
  const handleMaintenanceRequestSubmission = useCallback(async (
    requestData: {
      id: string;
      title: string;
      priority: MaintenancePriority;
      renterName: string;
      roomNumber: string;
      propertyName: string;
      description: string;
      renterPhone?: string;
    },
    managerIds: string[]
  ) => {
    try {
      // Check if it's an emergency request
      if (requestData.priority === MaintenancePriority.URGENT) {
        await notifyEmergencyMaintenance(
          requestData.id,
          requestData.title,
          requestData.description,
          requestData.renterName,
          requestData.roomNumber,
          requestData.propertyName,
          managerIds,
          requestData.renterPhone
        );
      } else {
        await notifyMaintenanceRequestSubmitted(
          requestData.id,
          requestData.title,
          requestData.priority,
          requestData.renterName,
          requestData.roomNumber,
          requestData.propertyName,
          managerIds
        );
      }
    } catch (error) {
      console.error('Error handling maintenance request submission notifications:', error);
    }
  }, [notifyMaintenanceRequestSubmitted, notifyEmergencyMaintenance]);

  /**
   * Handle maintenance status change with automatic notifications
   */
  const handleMaintenanceStatusChange = useCallback(async (
    requestData: {
      id: string;
      title: string;
      renterId: string;
      oldStatus: MaintenanceStatus;
      newStatus: MaintenanceStatus;
      assignedTo?: string;
      estimatedCompletion?: string;
      notes?: string;
      completionNotes?: string;
      completedBy?: string;
    }
  ) => {
    try {
      if (requestData.newStatus === MaintenanceStatus.COMPLETED) {
        await notifyMaintenanceCompleted(
          requestData.renterId,
          requestData.id,
          requestData.title,
          requestData.completionNotes,
          requestData.completedBy
        );
      } else {
        await notifyMaintenanceStatusUpdate(
          requestData.renterId,
          requestData.id,
          requestData.title,
          requestData.oldStatus,
          requestData.newStatus,
          requestData.assignedTo,
          requestData.estimatedCompletion,
          requestData.notes
        );
      }
    } catch (error) {
      console.error('Error handling maintenance status change notifications:', error);
    }
  }, [notifyMaintenanceStatusUpdate, notifyMaintenanceCompleted]);

  // Auto-check for overdue maintenance requests periodically
  useEffect(() => {
    if (!user?.id) return;

    // Check immediately
    checkOverdueMaintenanceRequests();

    // Set up periodic checks (every 2 hours)
    const interval = setInterval(() => {
      checkOverdueMaintenanceRequests();
    }, 2 * 60 * 60 * 1000); // 2 hours

    return () => clearInterval(interval);
  }, [user?.id, checkOverdueMaintenanceRequests]);

  // Auto-fetch urgent requests when user logs in
  useEffect(() => {
    if (user?.id && (user.role === 'ADMIN' || user.role === 'PROPERTY_MANAGER')) {
      fetchUrgentMaintenanceRequests();
    }
  }, [user?.id, user?.role, fetchUrgentMaintenanceRequests]);

  return {
    // Notification functions
    notifyMaintenanceRequestSubmitted,
    notifyMaintenanceStatusUpdate,
    notifyMaintenanceCompleted,
    notifyEmergencyMaintenance,
    notifyMaintenanceAssigned,
    notifyMaintenanceReminder,
    
    // Handler functions
    handleMaintenanceRequestSubmission,
    handleMaintenanceStatusChange,
    
    // Check functions
    checkOverdueMaintenanceRequests,
    
    // Stats
    getMaintenanceNotificationStats,
  };
};