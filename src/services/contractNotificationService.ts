import { NotificationType, NotificationPriority } from '../utils/apiClient';

export interface ContractNotificationData {
  contractId: string;
  renterId: string;
  roomId: string;
  contractTitle: string;
  renterName: string;
  roomNumber: string;
  propertyName: string;
  expirationDate?: string;
  renewalDate?: string;
  terminationDate?: string;
  documentUrl?: string;
}

export interface ContractNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  data: ContractNotificationData;
  actionUrl?: string;
  createdAt: string;
}

class ContractNotificationService {
  // Contract expiration notifications
  createExpirationReminder(data: ContractNotificationData, daysUntilExpiration: number): ContractNotification {
    const urgency = daysUntilExpiration <= 7 ? 'urgent' : daysUntilExpiration <= 30 ? 'high' : 'medium';
    
    return {
      id: `contract-expiration-${data.contractId}-${Date.now()}`,
      type: NotificationType.CONTRACT_EXPIRATION,
      title: `Contract Expiring ${daysUntilExpiration <= 7 ? 'Soon' : `in ${daysUntilExpiration} days`}`,
      message: `Contract for ${data.renterName} in ${data.roomNumber} (${data.propertyName}) expires on ${data.expirationDate}. ${
        daysUntilExpiration <= 7 
          ? 'Immediate action required!' 
          : 'Consider initiating renewal process.'
      }`,
      priority: urgency === 'urgent' 
        ? NotificationPriority.HIGH 
        : urgency === 'high' 
        ? NotificationPriority.MEDIUM 
        : NotificationPriority.LOW,
      data,
      actionUrl: `/contracts/${data.contractId}`,
      createdAt: new Date().toISOString(),
    };
  }

  // Contract renewal notifications
  createRenewalNotification(data: ContractNotificationData): ContractNotification {
    return {
      id: `contract-renewal-${data.contractId}-${Date.now()}`,
      type: NotificationType.CONTRACT_RENEWAL,
      title: 'Contract Renewal Available',
      message: `Contract renewal is now available for ${data.renterName} in ${data.roomNumber} (${data.propertyName}). Review terms and initiate renewal process.`,
      priority: NotificationPriority.MEDIUM,
      data,
      actionUrl: `/contracts/${data.contractId}/renew`,
      createdAt: new Date().toISOString(),
    };
  }

  // Contract status change notifications
  createStatusChangeNotification(
    data: ContractNotificationData, 
    oldStatus: string, 
    newStatus: string
  ): ContractNotification {
    const getStatusMessage = (status: string) => {
      switch (status.toLowerCase()) {
        case 'active':
          return 'activated and is now in effect';
        case 'expired':
          return 'expired and requires attention';
        case 'terminated':
          return 'terminated';
        case 'draft':
          return 'moved to draft status';
        default:
          return `changed to ${status}`;
      }
    };

    const getPriorityForStatus = (status: string) => {
      switch (status.toLowerCase()) {
        case 'expired':
        case 'terminated':
          return NotificationPriority.HIGH;
        case 'active':
          return NotificationPriority.MEDIUM;
        default:
          return NotificationPriority.LOW;
      }
    };

    return {
      id: `contract-status-${data.contractId}-${Date.now()}`,
      type: NotificationType.CONTRACT_STATUS_CHANGE,
      title: 'Contract Status Updated',
      message: `Contract for ${data.renterName} in ${data.roomNumber} (${data.propertyName}) has been ${getStatusMessage(newStatus)}.`,
      priority: getPriorityForStatus(newStatus),
      data: {
        ...data,
        oldStatus,
        newStatus,
      } as any,
      actionUrl: `/contracts/${data.contractId}`,
      createdAt: new Date().toISOString(),
    };
  }

  // Contract document notifications
  createDocumentNotification(
    data: ContractNotificationData, 
    documentType: 'uploaded' | 'updated' | 'signed'
  ): ContractNotification {
    const getDocumentMessage = (type: string) => {
      switch (type) {
        case 'uploaded':
          return 'A new contract document has been uploaded';
        case 'updated':
          return 'Contract document has been updated';
        case 'signed':
          return 'Contract document has been signed';
        default:
          return 'Contract document has been modified';
      }
    };

    return {
      id: `contract-document-${data.contractId}-${Date.now()}`,
      type: NotificationType.CONTRACT_DOCUMENT,
      title: 'Contract Document Update',
      message: `${getDocumentMessage(documentType)} for ${data.renterName} in ${data.roomNumber} (${data.propertyName}).`,
      priority: documentType === 'signed' ? NotificationPriority.MEDIUM : NotificationPriority.LOW,
      data: {
        ...data,
        documentType,
      } as any,
      actionUrl: data.documentUrl || `/contracts/${data.contractId}`,
      createdAt: new Date().toISOString(),
    };
  }

  // Contract renewal reminder (for renters)
  createRenterRenewalReminder(data: ContractNotificationData, daysUntilExpiration: number): ContractNotification {
    return {
      id: `renter-renewal-${data.contractId}-${Date.now()}`,
      type: NotificationType.CONTRACT_RENEWAL,
      title: 'Contract Renewal Reminder',
      message: `Your contract for ${data.roomNumber} (${data.propertyName}) expires in ${daysUntilExpiration} days. Please contact management to discuss renewal options.`,
      priority: daysUntilExpiration <= 30 ? NotificationPriority.MEDIUM : NotificationPriority.LOW,
      data,
      actionUrl: `/renter/contracts/${data.contractId}`,
      createdAt: new Date().toISOString(),
    };
  }

  // Contract termination notification
  createTerminationNotification(
    data: ContractNotificationData, 
    reason?: string,
    isRenterInitiated: boolean = false
  ): ContractNotification {
    const initiator = isRenterInitiated ? 'renter' : 'management';
    const message = reason 
      ? `Contract for ${data.renterName} in ${data.roomNumber} (${data.propertyName}) has been terminated by ${initiator}. Reason: ${reason}`
      : `Contract for ${data.renterName} in ${data.roomNumber} (${data.propertyName}) has been terminated by ${initiator}.`;

    return {
      id: `contract-termination-${data.contractId}-${Date.now()}`,
      type: NotificationType.CONTRACT_STATUS_CHANGE,
      title: 'Contract Terminated',
      message,
      priority: NotificationPriority.HIGH,
      data: {
        ...data,
        terminationReason: reason,
        terminatedBy: initiator,
      } as any,
      actionUrl: `/contracts/${data.contractId}`,
      createdAt: new Date().toISOString(),
    };
  }

  // Batch create expiration reminders for multiple contracts
  createBatchExpirationReminders(contracts: ContractNotificationData[]): ContractNotification[] {
    const today = new Date();
    
    return contracts
      .filter(contract => contract.expirationDate)
      .map(contract => {
        const expirationDate = new Date(contract.expirationDate!);
        const daysUntilExpiration = Math.ceil(
          (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Only create notifications for contracts expiring within 90 days
        if (daysUntilExpiration > 0 && daysUntilExpiration <= 90) {
          return this.createExpirationReminder(contract, daysUntilExpiration);
        }
        return null;
      })
      .filter((notification): notification is ContractNotification => notification !== null);
  }

  // Get notification summary for dashboard
  getNotificationSummary(notifications: ContractNotification[]) {
    const summary = {
      total: notifications.length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      urgent: 0,
      recent: 0, // Last 24 hours
    };

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    notifications.forEach(notification => {
      // Count by type
      summary.byType[notification.type] = (summary.byType[notification.type] || 0) + 1;
      
      // Count by priority
      summary.byPriority[notification.priority] = (summary.byPriority[notification.priority] || 0) + 1;
      
      // Count urgent
      if (notification.priority === NotificationPriority.HIGH) {
        summary.urgent++;
      }
      
      // Count recent
      if (new Date(notification.createdAt) > oneDayAgo) {
        summary.recent++;
      }
    });

    return summary;
  }

  // Filter notifications by criteria
  filterNotifications(
    notifications: ContractNotification[],
    filters: {
      type?: NotificationType;
      priority?: NotificationPriority;
      propertyId?: string;
      renterId?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): ContractNotification[] {
    return notifications.filter(notification => {
      if (filters.type && notification.type !== filters.type) {
        return false;
      }
      
      if (filters.priority && notification.priority !== filters.priority) {
        return false;
      }
      
      if (filters.propertyId && notification.data.propertyName !== filters.propertyId) {
        return false;
      }
      
      if (filters.renterId && notification.data.renterId !== filters.renterId) {
        return false;
      }
      
      if (filters.dateFrom) {
        const notificationDate = new Date(notification.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (notificationDate < fromDate) {
          return false;
        }
      }
      
      if (filters.dateTo) {
        const notificationDate = new Date(notification.createdAt);
        const toDate = new Date(filters.dateTo);
        if (notificationDate > toDate) {
          return false;
        }
      }
      
      return true;
    });
  }

  // Sort notifications by priority and date
  sortNotifications(notifications: ContractNotification[]): ContractNotification[] {
    const priorityOrder = {
      [NotificationPriority.HIGH]: 0,
      [NotificationPriority.MEDIUM]: 1,
      [NotificationPriority.LOW]: 2,
    };

    return [...notifications].sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      // Then sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
}

export const contractNotificationService = new ContractNotificationService();
export default contractNotificationService;