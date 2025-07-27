import { useNotificationStore } from '../stores/notificationStore';
import { useMaintenanceStore } from '../stores/maintenanceStore';
import { NotificationType, MaintenanceStatus, MaintenancePriority } from '../utils/apiClient';

export class MaintenanceNotificationService {
  private static instance: MaintenanceNotificationService;
  
  static getInstance(): MaintenanceNotificationService {
    if (!MaintenanceNotificationService.instance) {
      MaintenanceNotificationService.instance = new MaintenanceNotificationService();
    }
    return MaintenanceNotificationService.instance;
  }

  /**
   * Create maintenance request submission notification for property managers
   */
  async createMaintenanceRequestNotification(
    managerIds: string[],
    requestId: string,
    title: string,
    priority: MaintenancePriority,
    renterName: string,
    roomNumber: string,
    propertyName: string
  ) {
    const { createBulkNotifications } = useNotificationStore.getState();
    
    const notificationTitle = priority === MaintenancePriority.URGENT 
      ? `🚨 URGENT: New Maintenance Request`
      : `New Maintenance Request`;
    
    const message = `${renterName} has submitted a ${priority.toLowerCase()} priority maintenance request for Room ${roomNumber} at ${propertyName}: "${title}"`;
    
    const notificationPriority = priority === MaintenancePriority.URGENT ? 'URGENT' : 
                                priority === MaintenancePriority.HIGH ? 'HIGH' : 'NORMAL';
    
    return await createBulkNotifications(
      managerIds,
      NotificationType.MAINTENANCE_REQUEST,
      notificationTitle,
      message,
      notificationPriority,
      requestId,
      'maintenance'
    );
  }

  /**
   * Create maintenance status update notification for renters
   */
  async createMaintenanceStatusUpdateNotification(
    renterId: string,
    requestId: string,
    title: string,
    oldStatus: MaintenanceStatus,
    newStatus: MaintenanceStatus,
    assignedTo?: string,
    estimatedCompletion?: string,
    notes?: string
  ) {
    const { createNotification } = useNotificationStore.getState();
    
    let notificationTitle = '';
    let message = '';
    let priority = 'NORMAL';
    
    switch (newStatus) {
      case MaintenanceStatus.IN_PROGRESS:
        notificationTitle = 'Maintenance Request In Progress';
        message = `Your maintenance request "${title}" is now being worked on`;
        if (assignedTo) {
          message += ` by ${assignedTo}`;
        }
        if (estimatedCompletion) {
          message += `. Estimated completion: ${new Date(estimatedCompletion).toLocaleDateString()}`;
        }
        break;
        
      case MaintenanceStatus.COMPLETED:
        notificationTitle = 'Maintenance Request Completed';
        message = `Your maintenance request "${title}" has been completed`;
        priority = 'HIGH';
        break;
        
      case MaintenanceStatus.CANCELLED:
        notificationTitle = 'Maintenance Request Cancelled';
        message = `Your maintenance request "${title}" has been cancelled`;
        break;
        
      default:
        notificationTitle = 'Maintenance Request Updated';
        message = `Your maintenance request "${title}" status has been updated to ${newStatus.toLowerCase()}`;
    }
    
    if (notes) {
      message += `. Note: ${notes}`;
    }
    
    return await createNotification({
      userId: renterId,
      type: NotificationType.MAINTENANCE_UPDATE,
      title: notificationTitle,
      message,
      priority,
      relatedId: requestId,
      relatedType: 'maintenance',
      actionUrl: `/maintenance/${requestId}`
    });
  }

  /**
   * Create maintenance completion confirmation notification
   */
  async createMaintenanceCompletionNotification(
    renterId: string,
    requestId: string,
    title: string,
    completionNotes?: string,
    completedBy?: string
  ) {
    const { createNotification } = useNotificationStore.getState();
    
    const notificationTitle = 'Maintenance Request Completed ✅';
    let message = `Your maintenance request "${title}" has been successfully completed`;
    
    if (completedBy) {
      message += ` by ${completedBy}`;
    }
    
    if (completionNotes) {
      message += `. Completion notes: ${completionNotes}`;
    }
    
    message += '. Please review the work and confirm if everything is satisfactory.';
    
    return await createNotification({
      userId: renterId,
      type: NotificationType.MAINTENANCE_COMPLETED,
      title: notificationTitle,
      message,
      priority: 'HIGH',
      relatedId: requestId,
      relatedType: 'maintenance',
      actionUrl: `/maintenance/${requestId}`
    });
  }

  /**
   * Create emergency maintenance alert for urgent requests
   */
  async createEmergencyMaintenanceAlert(
    managerIds: string[],
    requestId: string,
    title: string,
    description: string,
    renterName: string,
    roomNumber: string,
    propertyName: string,
    renterPhone?: string
  ) {
    const { createBulkNotifications } = useNotificationStore.getState();
    
    const notificationTitle = '🚨 EMERGENCY MAINTENANCE ALERT';
    let message = `URGENT: ${renterName} has reported an emergency maintenance issue in Room ${roomNumber} at ${propertyName}.\n\n`;
    message += `Issue: ${title}\n`;
    message += `Description: ${description}`;
    
    if (renterPhone) {
      message += `\n\nContact: ${renterPhone}`;
    }
    
    message += '\n\nImmediate attention required!';
    
    return await createBulkNotifications(
      managerIds,
      NotificationType.MAINTENANCE_EMERGENCY,
      notificationTitle,
      message,
      'URGENT',
      requestId,
      'maintenance'
    );
  }

  /**
   * Create maintenance assignment notification for assigned staff
   */
  async createMaintenanceAssignmentNotification(
    assignedUserId: string,
    requestId: string,
    title: string,
    priority: MaintenancePriority,
    roomNumber: string,
    propertyName: string,
    estimatedCompletion?: string,
    assignmentNotes?: string
  ) {
    const { createNotification } = useNotificationStore.getState();
    
    const notificationTitle = `New Maintenance Assignment`;
    let message = `You have been assigned a ${priority.toLowerCase()} priority maintenance request:\n\n`;
    message += `Location: Room ${roomNumber} at ${propertyName}\n`;
    message += `Issue: ${title}`;
    
    if (estimatedCompletion) {
      message += `\nEstimated completion: ${new Date(estimatedCompletion).toLocaleDateString()}`;
    }
    
    if (assignmentNotes) {
      message += `\nNotes: ${assignmentNotes}`;
    }
    
    const notificationPriority = priority === MaintenancePriority.URGENT ? 'URGENT' : 
                                priority === MaintenancePriority.HIGH ? 'HIGH' : 'NORMAL';
    
    return await createNotification({
      userId: assignedUserId,
      type: NotificationType.MAINTENANCE_ASSIGNED,
      title: notificationTitle,
      message,
      priority: notificationPriority,
      relatedId: requestId,
      relatedType: 'maintenance',
      actionUrl: `/maintenance/${requestId}`
    });
  }

  /**
   * Create maintenance reminder notification for overdue requests
   */
  async createMaintenanceReminderNotification(
    assignedUserId: string,
    requestId: string,
    title: string,
    priority: MaintenancePriority,
    daysSinceAssigned: number,
    estimatedCompletion?: string
  ) {
    const { createNotification } = useNotificationStore.getState();
    
    const notificationTitle = `Maintenance Request Reminder`;
    let message = `Reminder: You have a ${priority.toLowerCase()} priority maintenance request that has been assigned for ${daysSinceAssigned} days:\n\n`;
    message += `Issue: ${title}`;
    
    if (estimatedCompletion) {
      const dueDate = new Date(estimatedCompletion);
      const today = new Date();
      const isOverdue = dueDate < today;
      
      if (isOverdue) {
        const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        message += `\n⚠️ This request is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue!`;
      } else {
        message += `\nEstimated completion: ${dueDate.toLocaleDateString()}`;
      }
    }
    
    const notificationPriority = priority === MaintenancePriority.URGENT ? 'URGENT' : 'HIGH';
    
    return await createNotification({
      userId: assignedUserId,
      type: NotificationType.MAINTENANCE_REMINDER,
      title: notificationTitle,
      message,
      priority: notificationPriority,
      relatedId: requestId,
      relatedType: 'maintenance',
      actionUrl: `/maintenance/${requestId}`
    });
  }

  /**
   * Check for overdue maintenance requests and create reminder notifications
   */
  async checkAndCreateMaintenanceReminders() {
    const { maintenanceRequests } = useMaintenanceStore.getState();
    const today = new Date();
    
    const overdueRequests = maintenanceRequests.filter(request => {
      if (request.status !== MaintenanceStatus.IN_PROGRESS || !request.assignedTo || !request.estimatedCompletion) {
        return false;
      }
      
      const estimatedDate = new Date(request.estimatedCompletion);
      return estimatedDate < today;
    });

    const notifications = [];
    
    for (const request of overdueRequests) {
      if (!request.assignedTo || !request.estimatedCompletion) continue;
      
      const assignedDate = new Date(request.submittedAt);
      const daysSinceAssigned = Math.ceil((today.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      try {
        const notification = await this.createMaintenanceReminderNotification(
          request.assignedTo,
          request.id,
          request.title,
          request.priority,
          daysSinceAssigned,
          request.estimatedCompletion
        );
        notifications.push(notification);
      } catch (error) {
        console.error('Error creating maintenance reminder notification:', error);
      }
    }
    
    return notifications;
  }

  /**
   * Get maintenance notification statistics
   */
  getMaintenanceNotificationStats() {
    const { maintenanceRequests, urgentRequests } = useMaintenanceStore.getState();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const submittedToday = maintenanceRequests.filter(request => {
      const submittedDate = new Date(request.submittedAt);
      submittedDate.setHours(0, 0, 0, 0);
      return submittedDate.getTime() === today.getTime();
    });

    const inProgress = maintenanceRequests.filter(request => 
      request.status === MaintenanceStatus.IN_PROGRESS
    );

    const overdue = maintenanceRequests.filter(request => {
      if (request.status !== MaintenanceStatus.IN_PROGRESS || !request.estimatedCompletion) {
        return false;
      }
      const estimatedDate = new Date(request.estimatedCompletion);
      return estimatedDate < today;
    });

    return {
      submittedToday: submittedToday.length,
      inProgress: inProgress.length,
      urgent: urgentRequests.length,
      overdue: overdue.length,
      totalPending: maintenanceRequests.filter(r => 
        r.status === MaintenanceStatus.SUBMITTED || r.status === MaintenanceStatus.IN_PROGRESS
      ).length
    };
  }
}

export const maintenanceNotificationService = MaintenanceNotificationService.getInstance();