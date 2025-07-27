import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  Switch, 
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Alert
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Add as AddIcon,
  DragIndicator as DragIcon,
  Palette as PaletteIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  ViewCompact as CompactIcon
} from '@mui/icons-material';
import { PaymentStatusWidget } from './widgets/PaymentStatusWidget';
import { MaintenanceRequestsWidget } from './widgets/MaintenanceRequestsWidget';
import { AnnouncementsWidget } from './widgets/AnnouncementsWidget';
import { DocumentsWidget } from './widgets/DocumentsWidget';
import { LeaseInfoWidget } from './widgets/LeaseInfoWidget';
import { WeatherWidget } from './widgets/WeatherWidget';
import { CalendarWidget } from './widgets/CalendarWidget';

interface DashboardWidget {
  id: string;
  type: 'payment_status' | 'maintenance_requests' | 'announcements' | 'documents' | 'lease_info' | 'weather' | 'calendar';
  position: { x: number; y: number; width: number; height: number };
  visible: boolean;
  settings: Record<string, any>;
}

interface DashboardConfig {
  id: string;
  tenantId: string;
  layout: 'grid' | 'list' | 'compact';
  theme: 'light' | 'dark' | 'auto';
  widgets: DashboardWidget[];
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    categories: {
      payments: boolean;
      maintenance: boolean;
      announcements: boolean;
      lease: boolean;
      emergencies: boolean;
    };
  };
  quickActions: string[];
}

interface PersonalizedDashboardProps {
  tenantId: string;
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({ tenantId }) => {
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [dashboardData, setDashboardData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);

  // Load dashboard data
  useEffect(() => {
    loadDashboard();
  }, [tenantId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tenant-portal/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }

      const data = await response.json();
      setConfig(data.data.config);
      setDashboardData(data.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateDashboardConfig = async (updates: Partial<DashboardConfig>) => {
    try {
      const response = await fetch('/api/tenant-portal/dashboard/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update dashboard configuration');
      }

      const data = await response.json();
      setConfig(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update configuration');
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !config) return;

    const newWidgets = Array.from(config.widgets);
    const [reorderedWidget] = newWidgets.splice(result.source.index, 1);
    newWidgets.splice(result.destination.index, 0, reorderedWidget);

    const updatedConfig = { ...config, widgets: newWidgets };
    setConfig(updatedConfig);
    updateDashboardConfig({ widgets: newWidgets });
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    if (!config) return;

    const updatedWidgets = config.widgets.map(widget =>
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
    );

    const updatedConfig = { ...config, widgets: updatedWidgets };
    setConfig(updatedConfig);
    updateDashboardConfig({ widgets: updatedWidgets });
  };

  const changeLayout = (layout: 'grid' | 'list' | 'compact') => {
    if (!config) return;

    const updatedConfig = { ...config, layout };
    setConfig(updatedConfig);
    updateDashboardConfig({ layout });
  };

  const changeTheme = (theme: 'light' | 'dark' | 'auto') => {
    if (!config) return;

    const updatedConfig = { ...config, theme };
    setConfig(updatedConfig);
    updateDashboardConfig({ theme });
  };

  const updateNotificationSettings = (category: string, enabled: boolean) => {
    if (!config) return;

    const updatedNotifications = {
      ...config.notifications,
      categories: {
        ...config.notifications.categories,
        [category]: enabled
      }
    };

    const updatedConfig = { ...config, notifications: updatedNotifications };
    setConfig(updatedConfig);
    updateDashboardConfig({ notifications: updatedNotifications });
  };

  const renderWidget = (widget: DashboardWidget) => {
    if (!widget.visible) return null;

    const widgetData = dashboardData[widget.type] || {};

    switch (widget.type) {
      case 'payment_status':
        return <PaymentStatusWidget data={widgetData} settings={widget.settings} />;
      case 'maintenance_requests':
        return <MaintenanceRequestsWidget data={widgetData} settings={widget.settings} />;
      case 'announcements':
        return <AnnouncementsWidget data={widgetData} settings={widget.settings} />;
      case 'documents':
        return <DocumentsWidget data={widgetData} settings={widget.settings} />;
      case 'lease_info':
        return <LeaseInfoWidget data={widgetData} settings={widget.settings} />;
      case 'weather':
        return <WeatherWidget data={widgetData} settings={widget.settings} />;
      case 'calendar':
        return <CalendarWidget data={widgetData} settings={widget.settings} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  const getLayoutComponent = () => {
    if (!config) return null;

    const visibleWidgets = config.widgets.filter(widget => widget.visible);

    switch (config.layout) {
      case 'grid':
        return (
          <Grid container spacing={3}>
            {visibleWidgets.map((widget) => (
              <Grid 
                key={widget.id} 
                item 
                xs={12} 
                sm={widget.position.width} 
                md={widget.position.width}
              >
                <Card>
                  <CardContent>
                    {customizing && (
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <DragIcon />
                        <IconButton
                          size="small"
                          onClick={() => toggleWidgetVisibility(widget.id)}
                        >
                          {widget.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                      </Box>
                    )}
                    {renderWidget(widget)}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 'list':
        return (
          <Box>
            {visibleWidgets.map((widget) => (
              <Card key={widget.id} sx={{ mb: 2 }}>
                <CardContent>
                  {customizing && (
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <DragIcon />
                      <IconButton
                        size="small"
                        onClick={() => toggleWidgetVisibility(widget.id)}
                      >
                        {widget.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    </Box>
                  )}
                  {renderWidget(widget)}
                </CardContent>
              </Card>
            ))}
          </Box>
        );

      case 'compact':
        return (
          <Grid container spacing={2}>
            {visibleWidgets.map((widget) => (
              <Grid key={widget.id} item xs={12} sm={6} md={4}>
                <Card sx={{ height: 200 }}>
                  <CardContent sx={{ height: '100%', overflow: 'hidden' }}>
                    {customizing && (
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <DragIcon />
                        <IconButton
                          size="small"
                          onClick={() => toggleWidgetVisibility(widget.id)}
                        >
                          {widget.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                      </Box>
                    )}
                    {renderWidget(widget)}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      default:
        return null;
    }
  };

  const renderQuickActions = () => {
    if (!config) return null;

    const actionButtons = {
      pay_rent: { label: 'Pay Rent', color: 'primary' as const },
      submit_maintenance: { label: 'Submit Request', color: 'secondary' as const },
      view_lease: { label: 'View Lease', color: 'info' as const },
      contact_manager: { label: 'Contact Manager', color: 'success' as const }
    };

    return (
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          {config.quickActions.map((action) => {
            const actionConfig = actionButtons[action as keyof typeof actionButtons];
            if (!actionConfig) return null;

            return (
              <Button
                key={action}
                variant="contained"
                color={actionConfig.color}
                onClick={() => {
                  // Handle quick action
                  console.log(`Quick action: ${action}`);
                }}
              >
                {actionConfig.label}
              </Button>
            );
          })}
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={loadDashboard} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (!config) {
    return (
      <Alert severity="warning">
        Dashboard configuration not found
      </Alert>
    );
  }

  return (
    <Box>
      {/* Dashboard Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          My Dashboard
        </Typography>
        <Box>
          <IconButton onClick={() => changeLayout('grid')} color={config.layout === 'grid' ? 'primary' : 'default'}>
            <GridIcon />
          </IconButton>
          <IconButton onClick={() => changeLayout('list')} color={config.layout === 'list' ? 'primary' : 'default'}>
            <ListIcon />
          </IconButton>
          <IconButton onClick={() => changeLayout('compact')} color={config.layout === 'compact' ? 'primary' : 'default'}>
            <CompactIcon />
          </IconButton>
          <IconButton onClick={() => setCustomizing(!customizing)} color={customizing ? 'primary' : 'default'}>
            <SettingsIcon />
          </IconButton>
          <IconButton onClick={() => setSettingsOpen(true)}>
            <PaletteIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Dashboard Content */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {getLayoutComponent()}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Dashboard Settings</DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Theme
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                value={config.theme}
                onChange={(e) => changeTheme(e.target.value as any)}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="auto">Auto</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Widget Visibility
            </Typography>
            {config.widgets.map((widget) => (
              <FormControlLabel
                key={widget.id}
                control={
                  <Switch
                    checked={widget.visible}
                    onChange={() => toggleWidgetVisibility(widget.id)}
                  />
                }
                label={widget.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              />
            ))}
          </Box>

          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            {Object.entries(config.notifications.categories).map(([category, enabled]) => (
              <FormControlLabel
                key={category}
                control={
                  <Switch
                    checked={enabled}
                    onChange={(e) => updateNotificationSettings(category, e.target.checked)}
                  />
                }
                label={category.replace(/\b\w/g, l => l.toUpperCase())}
              />
            ))}
          </Box>

          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {config.quickActions.map((action) => (
                <Chip
                  key={action}
                  label={action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  onDelete={() => {
                    const updatedActions = config.quickActions.filter(a => a !== action);
                    const updatedConfig = { ...config, quickActions: updatedActions };
                    setConfig(updatedConfig);
                    updateDashboardConfig({ quickActions: updatedActions });
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PersonalizedDashboard;