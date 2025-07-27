import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, Check, CheckCheck, Trash2, X, AlertCircle, Clock, Calendar, User, Wrench, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { useAuth } from '../../hooks/useAuth';
import { NotificationType, NotificationStatus } from '../../utils/apiClient';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../../hooks/use-toast';

interface NotificationCenterProps {
  isOpen?: boolean;
  onClose?: () => void;
  showAsModal?: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen = false,
  onClose,
  showAsModal = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('unread');

  const {
    userNotifications,
    unreadCount,
    isLoading,
    error,
    pagination,
    fetchUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError
  } = useNotificationStore();

  useEffect(() => {
    if (user?.id) {
      fetchUserNotifications(
        user.id,
        1,
        10,
        activeTab === 'unread' ? NotificationStatus.UNREAD : '',
        selectedType,
        selectedPriority
      );
    }
  }, [user?.id, activeTab, selectedType, selectedPriority, fetchUserNotifications]);

  const handleSearch = () => {
    if (user?.id) {
      fetchUserNotifications(
        user.id,
        1,
        10,
        activeTab === 'unread' ? NotificationStatus.UNREAD : selectedStatus,
        selectedType,
        selectedPriority
      );
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      toast({
        title: 'Success',
        description: 'Notification marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await markAllAsRead(user.id);
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      toast({
        title: 'Success',
        description: 'Notification deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  const handleNotificationAction = (notification: any) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    if (notification.status === NotificationStatus.UNREAD) {
      handleMarkAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.PAYMENT_DUE:
      case NotificationType.PAYMENT_OVERDUE:
      case NotificationType.PAYMENT_RECEIVED:
        return <Clock className="h-4 w-4" />;
      case NotificationType.MAINTENANCE_REQUEST:
        return <Wrench className="h-4 w-4" />;
      case NotificationType.MAINTENANCE_UPDATE:
      case NotificationType.MAINTENANCE_ASSIGNED:
      case NotificationType.MAINTENANCE_REMINDER:
        return <AlertCircle className="h-4 w-4" />;
      case NotificationType.MAINTENANCE_COMPLETED:
        return <CheckCircle className="h-4 w-4" />;
      case NotificationType.MAINTENANCE_EMERGENCY:
        return <AlertTriangle className="h-4 w-4" />;
      case NotificationType.CONTRACT_EXPIRING:
      case NotificationType.CONTRACT_EXPIRED:
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: NotificationType, priority: string) => {
    if (priority === 'HIGH' || priority === 'URGENT') {
      return 'destructive';
    }
    
    switch (type) {
      case NotificationType.PAYMENT_OVERDUE:
        return 'destructive';
      case NotificationType.PAYMENT_DUE:
        return 'secondary';
      case NotificationType.PAYMENT_RECEIVED:
        return 'default';
      case NotificationType.MAINTENANCE_REQUEST:
        return 'secondary';
      case NotificationType.MAINTENANCE_UPDATE:
      case NotificationType.MAINTENANCE_ASSIGNED:
        return 'secondary';
      case NotificationType.MAINTENANCE_COMPLETED:
        return 'default';
      case NotificationType.MAINTENANCE_EMERGENCY:
        return 'destructive';
      case NotificationType.MAINTENANCE_REMINDER:
        return 'secondary';
      case NotificationType.CONTRACT_EXPIRING:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredNotifications = userNotifications.filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const NotificationContent = () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
        {showAsModal && onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value={NotificationType.PAYMENT_DUE}>Payment Due</SelectItem>
              <SelectItem value={NotificationType.PAYMENT_OVERDUE}>Payment Overdue</SelectItem>
              <SelectItem value={NotificationType.PAYMENT_RECEIVED}>Payment Received</SelectItem>
              <SelectItem value={NotificationType.MAINTENANCE_REQUEST}>Maintenance Request</SelectItem>
              <SelectItem value={NotificationType.MAINTENANCE_UPDATE}>Maintenance Update</SelectItem>
              <SelectItem value={NotificationType.MAINTENANCE_COMPLETED}>Maintenance Completed</SelectItem>
              <SelectItem value={NotificationType.MAINTENANCE_EMERGENCY}>Emergency Maintenance</SelectItem>
              <SelectItem value={NotificationType.CONTRACT_EXPIRING}>Contract</SelectItem>
              <SelectItem value={NotificationType.SYSTEM_ALERT}>System Alert</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleSearch}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unread')} className="mb-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        <TabsContent value="unread" className="mt-4">
          <NotificationList notifications={filteredNotifications} />
        </TabsContent>
        
        <TabsContent value="all" className="mt-4">
          <NotificationList notifications={filteredNotifications} />
        </TabsContent>
      </Tabs>
    </div>
  );

  const NotificationList = ({ notifications }: { notifications: unknown[] }) => (
    <div className="space-y-2">
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading notifications...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={clearError}>
            Dismiss
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">
            {activeTab === 'unread' ? 'No unread notifications' : 'No notifications found'}
          </p>
        </div>
      ) : (
        notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`cursor-pointer transition-colors hover:bg-gray-50 ${
              notification.status === NotificationStatus.UNREAD ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
            }`}
            onClick={() => handleNotificationAction(notification)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-full ${
                    notification.status === NotificationStatus.UNREAD ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${
                        notification.status === NotificationStatus.UNREAD ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h4>
                      <Badge 
                        variant={getNotificationColor(notification.type, notification.priority)}
                        className="text-xs"
                      >
                        {notification.type.replace('_', ' ')}
                      </Badge>
                      {notification.priority !== 'NORMAL' && (
                        <Badge 
                          variant={notification.priority === 'HIGH' || notification.priority === 'URGENT' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {notification.priority}
                        </Badge>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-2 ${
                      notification.status === NotificationStatus.UNREAD ? 'text-gray-800' : 'text-gray-600'
                    }`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatDate(notification.createdAt)}</span>
                      {notification.user && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{notification.user.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  {notification.status === NotificationStatus.UNREAD && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  if (showAsModal) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notification Center</DialogTitle>
          </DialogHeader>
          <NotificationContent />
        </DialogContent>
      </Dialog>
    );
  }

  return <NotificationContent />;
};

export default NotificationCenter;