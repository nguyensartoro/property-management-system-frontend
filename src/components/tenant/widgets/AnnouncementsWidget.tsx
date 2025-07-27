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
  Announcement as AnnouncementIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent' | 'maintenance';
  publishedAt: string;
  expiresAt?: string;
}

interface AnnouncementsData {
  announcements: Announcement[];
}

interface AnnouncementsWidgetProps {
  data: AnnouncementsData;
  settings: Record<string, any>;
}

export const AnnouncementsWidget: React.FC<AnnouncementsWidgetProps> = ({ data, settings }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <InfoIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'urgent':
        return <ErrorIcon />;
      case 'maintenance':
        return <CheckIcon />;
      default:
        return <AnnouncementIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'urgent':
        return 'error';
      case 'maintenance':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const limit = settings.limit || 3;
  const displayAnnouncements = data.announcements?.slice(0, limit) || [];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Announcements
      </Typography>

      {displayAnnouncements.length > 0 ? (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <List>
              {displayAnnouncements.map((announcement, index) => (
                <ListItem key={announcement.id} divider={index < displayAnnouncements.length - 1}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: `${getTypeColor(announcement.type)}.main`, width: 32, height: 32 }}>
                      {getTypeIcon(announcement.type)}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">
                          {announcement.title}
                        </Typography>
                        <Chip
                          label={announcement.type.toUpperCase()}
                          color={getTypeColor(announcement.type) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {announcement.content.length > 100 
                            ? `${announcement.content.substring(0, 100)}...`
                            : announcement.content
                          }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(announcement.publishedAt)}
                          {announcement.expiresAt && (
                            <> • Expires {formatDate(announcement.expiresAt)}</>
                          )}
                        </Typography>
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
            <AnnouncementIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No announcements
            </Typography>
          </CardContent>
        </Card>
      )}

      {data.announcements && data.announcements.length > limit && (
        <Box mt={2} textAlign="center">
          <Button
            variant="text"
            size="small"
            onClick={() => {
              // Navigate to full announcements page
              console.log('Navigate to announcements page');
            }}
          >
            View All ({data.announcements.length})
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default AnnouncementsWidget;