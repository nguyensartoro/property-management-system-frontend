import React, { useState, useEffect } from 'react';
import { Bell, BellRing, AlertTriangle, DollarSign, Wrench, FileText, X } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationType, NotificationPriority } from '../../utils/apiClient';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';

interface NotificationBadgeProps {
  className?: string;
  showPreview?: boolean;
  maxPreviewItems?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onNotificationClick?: (notificationId: string) => void;
  onViewAllClick?: () => void;
}

interface NotificationPreviewItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  createdAt: string;
  isRead: boolean;
  relatedType?: string;
  actionUrl?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  className = '',
  showPreview = true,
  maxPreviewItems = 5,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  onNotificationClick,
  onViewAllClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<NotificationPreviewItem[]>([]);

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotificationStore();

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType, priority: NotificationPriority) => {
    const iconClass = cn(
      'w-4 h-4',
      priority === NotificationPriority.HIGH ? 'text-red-600' : 
      priority === NotificationPriority.MEDIUM ? 'text-yellow-600' : 
      'text-blue-600'
    );

    switch (type) {
      case NotificationType.PAYMENT_DUE:
      case NotificationType.PAYMENT_OVERDUE:
      case NotificationType.PAYMENT_RECEIVED:
        return <DollarSign className={iconClass} />;
      case NotificationType.MAINTENANCE_REQUEST:
      case NotificationType.MAINTENANCE_UPDATE:
        return <Wrench className={iconClass} />;
      case NotificationType.CONTRACT_EXPIRATION:
      case NotificationType.CONTRACT_RENEWAL:
      case NotificationType.CONTRACT_STATUS_CHANGE:
      case NotificationType.CONTRACT_DOCUMENT:
        return <FileText className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  // Get priority indicator color
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.HIGH:
        return 'bg-red-500';
      case NotificationPriority.MEDIUM:
        return 'bg-yellow-500';
      case NotificationPriority.LOW:
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: NotificationPreviewItem) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification.id);
    }
    
    setIsOpen(false);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  // Update recent notifications when notifications change
  useEffect(() => {
    const recent = notifications
      .slice(0, maxPreviewItems)
      .map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        createdAt: notification.createdAt,
        isRead: notification.status === 'READ',
        relatedType: notification.relatedType,
        actionUrl: notification.actionUrl,
      }));
    
    setRecentNotifications(recent);
  }, [notifications, maxPreviewItems]);

  // Auto-refresh notifications
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchNotifications();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const hasUrgentNotifications = recentNotifications.some(n => 
    n.priority === NotificationPriority.HIGH && !n.isRead
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'relative p-2 hover:bg-muted/50 transition-colors',
            className
          )}
        >
          {hasUrgentNotifications ? (
            <BellRing className="w-5 h-5 text-red-600 animate-pulse" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          
          {unreadCount > 0 && (
            <Badge
              variant={hasUrgentNotifications ? 'destructive' : 'default'}
              className={cn(
                'absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold',
                hasUrgentNotifications && 'animate-pulse'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          
          {/* Priority indicator dot */}
          {hasUrgentNotifications && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          )}
        </Button>
      </PopoverTrigger>

      {showPreview && (
        <PopoverContent className="w-80 p-0" align="end">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {unreadCount} new
                    </Badge>
                  )}
                </CardTitle>
                
                <div className="flex items-center space-x-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs h-6 px-2"
                    >
                      Mark all read
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading notifications...
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <ScrollArea className="max-h-80">
                  <div className="divide-y">
                    {recentNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-3 hover:bg-muted/50 cursor-pointer transition-colors',
                          !notification.isRead && 'bg-blue-50/50'
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className={cn(
                                'text-sm font-medium truncate',
                                !notification.isRead && 'text-foreground',
                                notification.isRead && 'text-muted-foreground'
                              )}>
                                {notification.title}
                              </p>
                              
                              <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                {!notification.isRead && (
                                  <div className={cn(
                                    'w-2 h-2 rounded-full',
                                    getPriorityColor(notification.priority)
                                  )} />
                                )}
                                
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeTime(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            
                            {notification.priority === NotificationPriority.HIGH && (
                              <div className="flex items-center space-x-1 mt-1">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                <span className="text-xs text-red-600 font-medium">
                                  Urgent
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>

            {recentNotifications.length > 0 && (
              <>
                <Separator />
                <div className="p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsOpen(false);
                      if (onViewAllClick) {
                        onViewAllClick();
                      }
                    }}
                    className="w-full text-xs"
                  >
                    View all notifications
                  </Button>
                </div>
              </>
            )}
          </Card>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default NotificationBadge;