import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Button
} from '@mui/material';
import {
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Build as MaintenanceIcon,
  Payment as PaymentIcon,
  Announcement as AnnouncementIcon
} from '@mui/icons-material';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'maintenance' | 'payment' | 'inspection' | 'meeting' | 'other';
  description?: string;
}

interface CalendarData {
  events: CalendarEvent[];
}

interface CalendarWidgetProps {
  data: CalendarData;
  settings: Record<string, any>;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ data, settings }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <MaintenanceIcon />;
      case 'payment':
        return <PaymentIcon />;
      case 'inspection':
        return <ScheduleIcon />;
      case 'meeting':
        return <AnnouncementIcon />;
      default:
        return <EventIcon />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'warning';
      case 'payment':
        return 'error';
      case 'inspection':
        return 'info';
      case 'meeting':
        return 'success';
      default:
        return 'primary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  const upcomingEvents = data.events?.filter(event => isUpcoming(event.date)).slice(0, 5) || [];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upcoming Events
      </Typography>

      {upcomingEvents.length > 0 ? (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <List>
              {upcomingEvents.map((event, index) => (
                <ListItem key={event.id} divider={index < upcomingEvents.length - 1}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: `${getEventColor(event.type)}.main`, width: 32, height: 32 }}>
                      {getEventIcon(event.type)}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">
                          {event.title}
                        </Typography>
                        <Chip
                          label={event.type.toUpperCase()}
                          color={getEventColor(event.type) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(event.date)}
                          {event.time && ` at ${formatTime(event.time)}`}
                        </Typography>
                        {event.description && (
                          <Typography variant="caption" color="text.secondary">
                            {event.description}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <EventIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No upcoming events
            </Typography>
          </CardContent>
        </Card>
      )}

      {data.events && data.events.length > 5 && (
        <Box mt={2} textAlign="center">
          <Button
            variant="text"
            size="small"
            onClick={() => {
              // Navigate to full calendar
              console.log('Navigate to full calendar');
            }}
          >
            View Full Calendar
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CalendarWidget;