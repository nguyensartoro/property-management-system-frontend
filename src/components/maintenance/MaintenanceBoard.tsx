import React, { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { MaintenanceRequest, MaintenanceStatus, MaintenancePriority, MaintenanceCategory } from '../../utils/apiClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  User,
  MapPin,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  UserCheck,
  Trash2,
  Image as ImageIcon,
  MessageSquare,
  Wrench
} from 'lucide-react';

interface MaintenanceBoardProps {
  requests: MaintenanceRequest[];
  onStatusChange: (requestId: string, newStatus: MaintenanceStatus) => Promise<void>;
  onRequestClick: (request: MaintenanceRequest) => void;
  onAssignRequest: (requestId: string) => void;
  onEditRequest: (requestId: string) => void;
  onDeleteRequest: (requestId: string) => void;
  isLoading?: boolean;
}

// Priority badge component
const PriorityBadge: React.FC<{ priority: MaintenancePriority; size?: 'sm' | 'default' }> = ({ 
  priority, 
  size = 'default' 
}) => {
  const getPriorityConfig = (priority: MaintenancePriority) => {
    switch (priority) {
      case MaintenancePriority.URGENT:
        return { variant: 'destructive' as const, icon: AlertTriangle, className: 'bg-red-100 text-red-800' };
      case MaintenancePriority.HIGH:
        return { variant: 'destructive' as const, icon: AlertCircle, className: 'bg-orange-100 text-orange-800' };
      case MaintenancePriority.MEDIUM:
        return { variant: 'secondary' as const, icon: Clock, className: 'bg-yellow-100 text-yellow-800' };
      case MaintenancePriority.LOW:
        return { variant: 'outline' as const, icon: Clock, className: 'bg-green-100 text-green-800' };
      default:
        return { variant: 'secondary' as const, icon: Clock, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <Badge variant={config.variant} className={`${config.className} ${size === 'sm' ? 'text-xs' : ''}`}>
      <Icon className={`${iconSize} mr-1`} />
      {size === 'sm' ? priority.charAt(0) : priority}
    </Badge>
  );
};

// Category badge component
const CategoryBadge: React.FC<{ category: MaintenanceCategory; size?: 'sm' | 'default' }> = ({ 
  category, 
  size = 'default' 
}) => {
  const getCategoryConfig = (category: MaintenanceCategory) => {
    switch (category) {
      case MaintenanceCategory.PLUMBING:
        return { icon: Wrench, className: 'bg-blue-100 text-blue-800' };
      case MaintenanceCategory.ELECTRICAL:
        return { icon: AlertTriangle, className: 'bg-yellow-100 text-yellow-800' };
      case MaintenanceCategory.HVAC:
        return { icon: Settings, className: 'bg-purple-100 text-purple-800' };
      case MaintenanceCategory.APPLIANCES:
        return { icon: Settings, className: 'bg-green-100 text-green-800' };
      case MaintenanceCategory.CLEANING:
        return { icon: Wrench, className: 'bg-pink-100 text-pink-800' };
      case MaintenanceCategory.REPAIRS:
        return { icon: Wrench, className: 'bg-orange-100 text-orange-800' };
      default:
        return { icon: Wrench, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const config = getCategoryConfig(category);
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <Badge variant="outline" className={`${config.className} ${size === 'sm' ? 'text-xs' : ''}`}>
      <Icon className={`${iconSize} mr-1`} />
      {size === 'sm' ? category.substring(0, 3) : category}
    </Badge>
  );
};

// Request card component
const RequestCard: React.FC<{
  request: MaintenanceRequest;
  onStatusChange: (requestId: string, newStatus: MaintenanceStatus) => Promise<void>;
  onRequestClick: (request: MaintenanceRequest) => void;
  onAssignRequest: (requestId: string) => void;
  onEditRequest: (requestId: string) => void;
  onDeleteRequest: (requestId: string) => void;
  isDragging?: boolean;
}> = ({
  request,
  onStatusChange,
  onRequestClick,
  onAssignRequest,
  onEditRequest,
  onDeleteRequest,
  isDragging = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', request.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const getStatusActions = (currentStatus: MaintenanceStatus) => {
    const actions = [];
    
    if (currentStatus === MaintenanceStatus.SUBMITTED) {
      actions.push({
        label: 'Start Work',
        icon: Settings,
        action: () => onStatusChange(request.id, MaintenanceStatus.IN_PROGRESS),
      });
    }
    
    if (currentStatus === MaintenanceStatus.IN_PROGRESS) {
      actions.push({
        label: 'Mark Complete',
        icon: CheckCircle,
        action: () => onStatusChange(request.id, MaintenanceStatus.COMPLETED),
      });
    }
    
    if (currentStatus !== MaintenanceStatus.CANCELLED) {
      actions.push({
        label: 'Cancel',
        icon: XCircle,
        action: () => onStatusChange(request.id, MaintenanceStatus.CANCELLED),
        destructive: true,
      });
    }
    
    return actions;
  };

  const statusActions = getStatusActions(request.status);

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isDragging ? 'opacity-50 rotate-2' : ''
      } ${
        request.priority === MaintenancePriority.URGENT ? 'border-red-300 bg-red-50' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onClick={() => onRequestClick(request)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{request.title}</h4>
            <div className="flex items-center space-x-1 mt-1">
              <PriorityBadge priority={request.priority} size="sm" />
              <CategoryBadge category={request.category} size="sm" />
            </div>
          </div>
          
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(true);
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onRequestClick(request)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditRequest(request.id)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignRequest(request.id)}>
                <UserCheck className="w-4 h-4 mr-2" />
                Assign
              </DropdownMenuItem>
              {statusActions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={action.action}
                  className={action.destructive ? 'text-red-600' : ''}
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => onDeleteRequest(request.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Renter and Room Info */}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span className="truncate">{request.renter?.name || 'Unknown'}</span>
            <span>•</span>
            <MapPin className="w-3 h-3" />
            <span>Room {request.room?.number || 'N/A'}</span>
          </div>
          
          {/* Description Preview */}
          <p className="text-xs text-muted-foreground overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.2em',
            maxHeight: '2.4em'
          }}>
            {request.description}
          </p>
          
          {/* Assignment Info */}
          {request.assignedTo && (
            <div className="flex items-center space-x-2 text-xs">
              <Avatar className="w-4 h-4">
                <AvatarFallback className="text-xs">
                  {request.assignedTo.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground truncate">
                {request.assignedTo}
              </span>
            </div>
          )}
          
          {/* Footer */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center space-x-2">
              {request.images && request.images.length > 0 && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <ImageIcon className="w-3 h-3" />
                  <span>{request.images.length}</span>
                </div>
              )}
              
              {request.notes && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <MessageSquare className="w-3 h-3" />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(request.submittedAt), 'MMM dd')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Column component
const BoardColumn: React.FC<{
  title: string;
  status: MaintenanceStatus;
  requests: MaintenanceRequest[];
  onStatusChange: (requestId: string, newStatus: MaintenanceStatus) => Promise<void>;
  onRequestClick: (request: MaintenanceRequest) => void;
  onAssignRequest: (requestId: string) => void;
  onEditRequest: (requestId: string) => void;
  onDeleteRequest: (requestId: string) => void;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = ({
  title,
  status,
  requests,
  onStatusChange,
  onRequestClick,
  onAssignRequest,
  onEditRequest,
  onDeleteRequest,
  icon: Icon,
  color,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const requestId = e.dataTransfer.getData('text/plain');
    if (requestId) {
      await onStatusChange(requestId, status);
    }
  }, [onStatusChange, status]);

  const urgentCount = requests.filter(r => r.priority === MaintenancePriority.URGENT).length;

  return (
    <div
      className={`flex-1 min-w-80 ${
        isDragOver ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
      } border-2 border-dashed rounded-lg p-4 transition-colors duration-200`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <h3 className="font-medium">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {requests.length}
          </Badge>
          {urgentCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {urgentCount} urgent
            </Badge>
          )}
        </div>
      </div>
      
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon className={`w-8 h-8 mx-auto mb-2 ${color} opacity-50`} />
            <p className="text-sm">No requests</p>
          </div>
        ) : (
          requests
            .sort((a, b) => {
              // Sort by priority first (urgent first), then by date
              const priorityOrder = {
                [MaintenancePriority.URGENT]: 0,
                [MaintenancePriority.HIGH]: 1,
                [MaintenancePriority.MEDIUM]: 2,
                [MaintenancePriority.LOW]: 3,
              };
              
              const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
              if (priorityDiff !== 0) return priorityDiff;
              
              return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
            })
            .map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onStatusChange={onStatusChange}
                onRequestClick={onRequestClick}
                onAssignRequest={onAssignRequest}
                onEditRequest={onEditRequest}
                onDeleteRequest={onDeleteRequest}
              />
            ))
        )}
      </div>
    </div>
  );
};

export const MaintenanceBoard: React.FC<MaintenanceBoardProps> = ({
  requests,
  onStatusChange,
  onRequestClick,
  onAssignRequest,
  onEditRequest,
  onDeleteRequest,
  isLoading = false,
}) => {
  // Group requests by status
  const requestsByStatus = {
    [MaintenanceStatus.SUBMITTED]: requests.filter(r => r.status === MaintenanceStatus.SUBMITTED),
    [MaintenanceStatus.IN_PROGRESS]: requests.filter(r => r.status === MaintenanceStatus.IN_PROGRESS),
    [MaintenanceStatus.COMPLETED]: requests.filter(r => r.status === MaintenanceStatus.COMPLETED),
    [MaintenanceStatus.CANCELLED]: requests.filter(r => r.status === MaintenanceStatus.CANCELLED),
  };

  const columns = [
    {
      title: 'Submitted',
      status: MaintenanceStatus.SUBMITTED,
      requests: requestsByStatus[MaintenanceStatus.SUBMITTED],
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'In Progress',
      status: MaintenanceStatus.IN_PROGRESS,
      requests: requestsByStatus[MaintenanceStatus.IN_PROGRESS],
      icon: Settings,
      color: 'text-blue-600',
    },
    {
      title: 'Completed',
      status: MaintenanceStatus.COMPLETED,
      requests: requestsByStatus[MaintenanceStatus.COMPLETED],
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Cancelled',
      status: MaintenanceStatus.CANCELLED,
      requests: requestsByStatus[MaintenanceStatus.CANCELLED],
      icon: XCircle,
      color: 'text-red-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex space-x-4 h-96">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Board Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Maintenance Board</h2>
          <p className="text-sm text-muted-foreground">
            Drag and drop requests between columns to update their status
          </p>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded" />
            <span>Urgent Priority</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded" />
            <span>Drop Zone Active</span>
          </div>
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <BoardColumn
            key={column.status}
            title={column.title}
            status={column.status}
            requests={column.requests}
            onStatusChange={onStatusChange}
            onRequestClick={onRequestClick}
            onAssignRequest={onAssignRequest}
            onEditRequest={onEditRequest}
            onDeleteRequest={onDeleteRequest}
            icon={column.icon}
            color={column.color}
          />
        ))}
      </div>

      {/* Board Footer */}
      <div className="text-center text-sm text-muted-foreground pt-4 border-t">
        <p>
          Total: {requests.length} requests • 
          Urgent: {requests.filter(r => r.priority === MaintenancePriority.URGENT).length} • 
          Completed: {requestsByStatus[MaintenanceStatus.COMPLETED].length}
        </p>
      </div>
    </div>
  );
};

export default MaintenanceBoard;