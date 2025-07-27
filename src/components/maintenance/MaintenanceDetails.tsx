import React, { useState } from 'react';
import { format } from 'date-fns';
import { MaintenanceRequest, MaintenanceStatus, MaintenancePriority, MaintenanceCategory } from '../../utils/apiClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  FileText,
  Image as ImageIcon,
  Edit,
  Save,
  X,
  UserCheck,
  MessageSquare,
  History,
  Phone,
  Mail,
  Home,
  Wrench
} from 'lucide-react';

interface MaintenanceDetailsProps {
  request: MaintenanceRequest;
  onClose?: () => void;
  onStatusChange?: (requestId: string, newStatus: MaintenanceStatus) => Promise<void>;
  onAssign?: (requestId: string) => void;
  onEdit?: (requestId: string) => void;
  onDelete?: (requestId: string) => void;
  onStatusUpdate?: (id: string, status: MaintenanceStatus, notes?: string) => Promise<void>;
  onComplete?: (id: string, completionNotes?: string, completionImages?: string[]) => Promise<void>;
  onUpdate?: (id: string, data: Partial<MaintenanceRequest>) => Promise<void>;
  isLoading?: boolean;
  canEdit?: boolean;
  canAssign?: boolean;
  currentUserId?: string;
}

// Priority badge component
const PriorityBadge: React.FC<{ priority: MaintenancePriority }> = ({ priority }) => {
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

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {priority}
    </Badge>
  );
};

// Status badge component
const StatusBadge: React.FC<{ status: MaintenanceStatus }> = ({ status }) => {
  const getStatusConfig = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.COMPLETED:
        return { variant: 'default' as const, icon: CheckCircle, className: 'bg-green-100 text-green-800' };
      case MaintenanceStatus.IN_PROGRESS:
        return { variant: 'secondary' as const, icon: Settings, className: 'bg-blue-100 text-blue-800' };
      case MaintenanceStatus.SUBMITTED:
        return { variant: 'outline' as const, icon: Clock, className: 'bg-yellow-100 text-yellow-800' };
      case MaintenanceStatus.CANCELLED:
        return { variant: 'destructive' as const, icon: XCircle, className: 'bg-red-100 text-red-800' };
      default:
        return { variant: 'secondary' as const, icon: Clock, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {status.replace('_', ' ')}
    </Badge>
  );
};

// Category badge component
const CategoryBadge: React.FC<{ category: MaintenanceCategory }> = ({ category }) => {
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

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {category}
    </Badge>
  );
};

export const MaintenanceDetails: React.FC<MaintenanceDetailsProps> = ({
  request,
  onClose,
  onStatusChange,
  onAssign,
  onEdit,
  onDelete,
  onStatusUpdate,
  onComplete,
  onUpdate,
  isLoading = false,
  canEdit = true,
  canAssign = true,
  currentUserId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [editedTitle, setEditedTitle] = useState(request.title);
  const [editedDescription, setEditedDescription] = useState(request.description);
  const [editedPriority, setEditedPriority] = useState(request.priority);
  const [editedCategory, setEditedCategory] = useState(request.category);
  const [statusNotes, setStatusNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState(request.assignedTo || '');
  const [estimatedCompletion, setEstimatedCompletion] = useState(
    request.estimatedCompletion ? format(new Date(request.estimatedCompletion), 'yyyy-MM-dd') : ''
  );
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  // Handle edit save
  const handleSaveEdit = async () => {
    if (!onUpdate) return;
    
    try {
      await onUpdate(request.id, {
        title: editedTitle,
        description: editedDescription,
        priority: editedPriority,
        category: editedCategory,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus: MaintenanceStatus) => {
    if (onStatusChange) {
      try {
        await onStatusChange(request.id, newStatus);
        setStatusNotes('');
      } catch (error) {
        console.error('Error updating status:', error);
      }
    } else if (onStatusUpdate) {
      try {
        await onStatusUpdate(request.id, newStatus, statusNotes);
        setStatusNotes('');
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }
  };

  // Handle assignment
  const handleAssignment = async () => {
    if (onAssign) {
      onAssign(request.id);
      setIsAssigning(false);
      setAssignmentNotes('');
    }
  };

  // Handle completion
  const handleCompletion = async () => {
    if (!onComplete) return;
    
    try {
      await onComplete(request.id, completionNotes || undefined);
      setIsCompleting(false);
      setCompletionNotes('');
    } catch (error) {
      console.error('Error completing request:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          {isEditing ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-lg font-semibold"
            />
          ) : (
            <h2 className="text-lg font-semibold">{request.title}</h2>
          )}
          <div className="flex items-center space-x-2">
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
            <CategoryBadge category={request.category} />
          </div>
        </div>
        
        <div className="flex space-x-2">
          {canEdit && (
            <>
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSaveEdit} disabled={isLoading}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {onEdit && (
                    <Button size="sm" variant="outline" onClick={() => onEdit(request.id)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit Request
                    </Button>
                  )}
                  {onDelete && (
                    <Button size="sm" variant="destructive" onClick={() => onDelete(request.id)}>
                      Delete
                    </Button>
                  )}
                </>
              )}
            </>
          )}
          {onClose && (
            <Button size="sm" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-1" />
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Request Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Description</Label>
                {isEditing ? (
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {request.description}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Select value={editedPriority} onValueChange={setEditedPriority}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(MaintenancePriority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Select value={editedCategory} onValueChange={setEditedCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(MaintenanceCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {request.notes && (
                <div>
                  <Label className="text-sm font-medium">Additional Notes</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {request.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          {request.images && request.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5" />
                  <span>Photos ({request.images.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {request.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Issue photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => window.open(image, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Management */}
          {canEdit && request.status !== MaintenanceStatus.COMPLETED && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Status Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {request.status === MaintenanceStatus.SUBMITTED && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(MaintenanceStatus.IN_PROGRESS)}
                        disabled={isLoading}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Start Work
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAssigning(true)}
                        disabled={isLoading}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Assign
                      </Button>
                    </>
                  )}
                  
                  {request.status === MaintenanceStatus.IN_PROGRESS && (
                    <Button
                      size="sm"
                      onClick={() => setIsCompleting(true)}
                      disabled={isLoading}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Complete
                    </Button>
                  )}
                  
                  {request.status !== MaintenanceStatus.CANCELLED && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleStatusUpdate(MaintenanceStatus.CANCELLED)}
                      disabled={isLoading}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Status Update Notes</Label>
                  <Textarea
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Add notes about the status change..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assignment Modal */}
          {isAssigning && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5" />
                  <span>Assign Request</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Assign To</Label>
                  <Input
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="Enter assignee name or ID"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Estimated Completion Date</Label>
                  <Input
                    type="date"
                    value={estimatedCompletion}
                    onChange={(e) => setEstimatedCompletion(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Assignment Notes</Label>
                  <Textarea
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    placeholder="Add notes for the assignee..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleAssignment} disabled={isLoading || !assignedTo}>
                    <UserCheck className="w-4 h-4 mr-1" />
                    Assign
                  </Button>
                  <Button variant="outline" onClick={() => setIsAssigning(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion Modal */}
          {isCompleting && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Complete Request</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Completion Notes</Label>
                  <Textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Describe what was done to resolve the issue..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleCompletion} disabled={isLoading}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Complete
                  </Button>
                  <Button variant="outline" onClick={() => setIsCompleting(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Renter Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Renter Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm">{request.renter?.name || 'N/A'}</p>
              </div>
              
              {request.renter?.email && (
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a
                      href={`mailto:${request.renter.email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {request.renter.email}
                    </a>
                  </div>
                </div>
              )}
              
              {request.renter?.phone && (
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a
                      href={`tel:${request.renter.phone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {request.renter.phone}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="w-5 h-5" />
                <span>Property Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Room</Label>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Room {request.room?.number || 'N/A'}</span>
                </div>
              </div>
              
              {request.room?.property && (
                <>
                  <div>
                    <Label className="text-sm font-medium">Property</Label>
                    <p className="text-sm">{request.room.property.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <p className="text-sm text-muted-foreground">
                      {request.room.property.address}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Submitted</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(request.submittedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              
              {request.assignedTo && (
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Assigned to {request.assignedTo}</p>
                    {request.estimatedCompletion && (
                      <p className="text-xs text-muted-foreground">
                        Est. completion: {format(new Date(request.estimatedCompletion), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {request.completedAt && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(request.completedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(request.updatedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetails;