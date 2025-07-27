import { create } from 'zustand';
import { notificationService, Notification, NotificationStatus, NotificationType } from '../utils/apiClient';

interface NotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: string;
  relatedId?: string;
  relatedType?: string;
  actionUrl?: string;
}

interface NotificationFilters {
  search?: string;
  status?: string;
  type?: string;
  priority?: string;
  userId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface NotificationState {
  notifications: Notification[];
  userNotifications: Notification[];
  selectedNotification: Notification | null;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  pagination: Pagination | null;
  filters: NotificationFilters;
  
  // Actions
  fetchNotifications: (page?: number, limit?: number, filters?: NotificationFilters) => Promise<void>;
  fetchUserNotifications: (userId: string, page?: number, limit?: number, status?: string, type?: string, priority?: string) => Promise<void>;
  fetchNotificationById: (id: string) => Promise<void>;
  fetchUnreadCount: (userId: string) => Promise<void>;
  createNotification: (data: NotificationInput) => Promise<Notification>;
  updateNotification: (id: string, data: Partial<NotificationInput>) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<{ updatedCount: number }>;
  createBulkNotifications: (userIds: string[], type: NotificationType, title: string, message: string, priority?: string, relatedId?: string, relatedType?: string, actionUrl?: string) => Promise<{ createdCount: number }>;
  setFilters: (filters: Partial<NotificationFilters>) => void;
  clearFilters: () => void;
  clearSelectedNotification: () => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  userNotifications: [],
  selectedNotification: null,
  unreadCount: 0,
  isLoading: false,
  error: null,
  pagination: null,
  filters: {},

  fetchNotifications: async (page = 1, limit = 10, filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const currentFilters = { ...get().filters, ...filters };
      
      const response = await notificationService.getAllNotifications(
        page,
        limit,
        currentFilters.search || '',
        currentFilters.status || '',
        currentFilters.type || '',
        currentFilters.priority || '',
        currentFilters.userId || '',
        currentFilters.sortBy || 'createdAt',
        currentFilters.sortOrder || 'desc'
      );
      
      set({
        notifications: response.data.data,
        pagination: response.data.pagination ? {
          currentPage: response.data.pagination.currentPage || page,
          totalPages: response.data.pagination.totalPages || 1,
          totalItems: response.data.pagination.totalItems || response.data.data.length,
          itemsPerPage: response.data.pagination.itemsPerPage || limit,
          hasNextPage: response.data.pagination.hasNextPage || false,
          hasPreviousPage: response.data.pagination.hasPreviousPage || false,
        } : null,
        filters: currentFilters,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
      });
    }
  },

  fetchUserNotifications: async (userId: string, page = 1, limit = 10, status = '', type = '', priority = '') => {
    try {
      set({ isLoading: true, error: null });
      const response = await notificationService.getUserNotifications(userId, page, limit, status, type, priority);
      
      set({
        userNotifications: response.data.data,
        pagination: response.data.pagination ? {
          currentPage: response.data.pagination.currentPage || page,
          totalPages: response.data.pagination.totalPages || 1,
          totalItems: response.data.pagination.totalItems || response.data.data.length,
          itemsPerPage: response.data.pagination.itemsPerPage || limit,
          hasNextPage: response.data.pagination.hasNextPage || false,
          hasPreviousPage: response.data.pagination.hasPreviousPage || false,
        } : null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user notifications',
      });
    }
  },

  fetchNotificationById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await notificationService.getNotificationById(id);
      set({
        selectedNotification: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching notification:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notification',
      });
    }
  },

  fetchUnreadCount: async (userId: string) => {
    try {
      const response = await notificationService.getUnreadCount(userId);
      set({
        unreadCount: response.data.data.unreadCount,
      });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Don't set error state for unread count as it's not critical
    }
  },

  createNotification: async (data: NotificationInput) => {
    try {
      set({ isLoading: true, error: null });
      const response = await notificationService.createNotification(data);
      const newNotification = response.data.data;
      
      set((state) => ({
        notifications: [...state.notifications, newNotification],
        isLoading: false,
      }));
      
      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create notification',
      });
      throw error;
    }
  },

  updateNotification: async (id: string, data: Partial<NotificationInput>) => {
    try {
      set({ isLoading: true, error: null });
      const response = await notificationService.updateNotification(id, data);
      const updatedNotification = response.data.data;
      
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id ? updatedNotification : notification
        ),
        userNotifications: state.userNotifications.map((notification) =>
          notification.id === id ? updatedNotification : notification
        ),
        selectedNotification: state.selectedNotification?.id === id ? updatedNotification : state.selectedNotification,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating notification:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update notification',
      });
      throw error;
    }
  },

  deleteNotification: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await notificationService.deleteNotification(id);
      set((state) => ({
        notifications: state.notifications.filter((notification) => notification.id !== id),
        userNotifications: state.userNotifications.filter((notification) => notification.id !== id),
        selectedNotification: state.selectedNotification?.id === id ? null : state.selectedNotification,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting notification:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete notification',
      });
      throw error;
    }
  },

  markAsRead: async (id: string) => {
    try {
      const response = await notificationService.markAsRead(id);
      const readNotification = response.data.data;
      
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id ? readNotification : notification
        ),
        userNotifications: state.userNotifications.map((notification) =>
          notification.id === id ? readNotification : notification
        ),
        selectedNotification: state.selectedNotification?.id === id ? readNotification : state.selectedNotification,
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to mark notification as read',
      });
      throw error;
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await notificationService.markAllAsRead(userId);
      
      // Update all unread notifications to read status
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.userId === userId && notification.status === NotificationStatus.UNREAD
            ? { ...notification, status: NotificationStatus.READ, readAt: new Date().toISOString() }
            : notification
        ),
        userNotifications: state.userNotifications.map((notification) =>
          notification.status === NotificationStatus.UNREAD
            ? { ...notification, status: NotificationStatus.READ, readAt: new Date().toISOString() }
            : notification
        ),
        unreadCount: 0,
        isLoading: false,
      }));
      
      return response.data.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
      });
      throw error;
    }
  },

  createBulkNotifications: async (userIds: string[], type: NotificationType, title: string, message: string, priority = 'NORMAL', relatedId?: string, relatedType?: string, actionUrl?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await notificationService.createBulkNotifications(userIds, type, title, message, priority, relatedId, relatedType, actionUrl);
      set({ isLoading: false });
      
      return response.data.data;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create bulk notifications',
      });
      throw error;
    }
  },

  setFilters: (filters: Partial<NotificationFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  clearSelectedNotification: () => set({ selectedNotification: null }),
  
  clearError: () => set({ error: null }),
}));