import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import {
  Build as BuildIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  PlayArrow as InProgressIcon
} from '@mui/icons-material';

interface MaintenanceRequest {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
  submittedAt: string;
  estimatedCompletion?: string;
}

interface MaintenanceRequestsData {
  requests: MaintenanceRequest[];
}

interface MaintenanceRequestsWidgetProps {
  data: MaintenanceRequestsData;
  settings: Record<string, any>;
}

export const MaintenanceRequestsWidget: React.FC<MaintenanceRequestsWidgetProps> = ({ 
  data, 
  settings 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <ScheduleIcon />;
      case 'acknowledged':
        return <WarningIcon />;
      case 'in_progress':
        return <InProgressIcon />;
      case 'completed':
        return <CheckIcon />;
      default:
        return <BuildIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'info';
      case 'acknowledged':
        return 'warning';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'urgent':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const limit = settings.limit || 5;
  const displayRequests = data.requests?.slice(0, limit) || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Maintenance Requests
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            // Navigate to maintenance request form
            console.log('Navigate to maintenance request form');
          }}
        >
          New Request
        </Button>
      </Box>

      {displayRequests.length > 0 ? (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <List>
              {displayRequests.map((request, index) => (
                <ListItem key={request.id} divider={index < displayRequests.length - 1}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: `${getStatusColor(request.status)}.main`, width: 32, height: 32 }}>
                      {getStatusIcon(request.status)}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={request.title}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {request.category} • Submitted {formatDate(request.submittedAt)}
                        </Typography>
                        {request.estimatedCompletion && (
                          <Typography variant="caption" color="text.secondary">
                            Est. completion: {formatDate(request.estimatedCompletion)}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
                      <Chip
                        label={request.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                      <Chip
                        label={request.priority.toUpperCase()}
                        color={getPriorityColor(request.priority) as any}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <BuildIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No maintenance requests
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => {
                // Navigate to maintenance request form
                console.log('Navigate to maintenance request form');
              }}
            >
              Submit Request
            </Button>
          </CardContent>
        </Card>
      )}

      {data.requests && data.requests.length > limit && (
        <Box mt={2} textAlign="center">
          <Button
            variant="text"
            size="small"
            onClick={() => {
              // Navigate to full maintenance requests page
              console.log('Navigate to maintenance requests page');
            }}
          >
            View All ({data.requests.length})
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default MaintenanceRequestsWidget;