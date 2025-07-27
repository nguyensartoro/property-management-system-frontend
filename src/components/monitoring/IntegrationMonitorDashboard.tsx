import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as HealthyIcon,
  Warning as DegradedIcon,
  Error as UnhealthyIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Notifications as AlertIcon,
  Timeline as MetricsIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface IntegrationStatus {
  id: string;
  name: string;
  type: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastChecked: string;
  lastHealthy: string;
  consecutiveFailures: number;
  averageResponseTime: number;
  uptime: number;
  errorRate: number;
  alerts: IntegrationAlert[];
  metrics: {
    totalChecks: number;
    successfulChecks: number;
    failedChecks: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
  };
}

interface IntegrationAlert {
  id: string;
  integrationId: string;
  type: 'response_time' | 'error_rate' | 'consecutive_failures' | 'service_down';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggeredAt: string;
  resolvedAt?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  totalIntegrations: number;
  healthyIntegrations: number;
  degradedIntegrations: number;
  unhealthyIntegrations: number;
  criticalIssues: number;
  averageUptime: number;
  lastChecked: string;
}

interface MonitoringStats {
  isMonitoring: boolean;
  totalIntegrations: number;
  enabledIntegrations: number;
  totalChecks: number;
  totalAlerts: number;
  activeAlerts: number;
  uptime: number;
}

const IntegrationMonitorDashboard: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<IntegrationAlert[]>([]);
  const [monitoringStats, setMonitoringStats] = useState<MonitoringStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<IntegrationAlert | null>(null);

  // Fetch all monitoring data
  const fetchMonitoringData = async () => {
    try {
      setRefreshing(true);
      
      const [statusResponse, healthResponse, alertsResponse, statsResponse] = await Promise.all([
        fetch('/api/integration-monitor/status'),
        fetch('/api/integration-monitor/health'),
        fetch('/api/integration-monitor/alerts'),
        fetch('/api/integration-monitor/stats'),
      ]);

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setIntegrations(statusData.data);
      }

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSystemHealth(healthData.data);
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setActiveAlerts(alertsData.data);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setMonitoringStats(statsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Perform manual health check
  const performHealthCheck = async (integrationId: string) => {
    try {
      const response = await fetch('/api/integration-monitor/health-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ integrationId }),
      });

      if (response.ok) {
        await fetchMonitoringData(); // Refresh data after health check
      }
    } catch (error) {
      console.error('Failed to perform health check:', error);
    }
  };

  // Start/stop monitoring
  const toggleMonitoring = async () => {
    try {
      const endpoint = monitoringStats?.isMonitoring ? '/stop' : '/start';
      const response = await fetch(`/api/integration-monitor${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ intervalMs: 60000 }),
      });

      if (response.ok) {
        await fetchMonitoringData();
      }
    } catch (error) {
      console.error('Failed to toggle monitoring:', error);
    }
  };

  // Resolve alert
  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/integration-monitor/alerts/${alertId}/resolve`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchMonitoringData();
        setAlertDialogOpen(false);
        setSelectedAlert(null);
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'healthy':
        return { icon: <HealthyIcon />, color: 'success', label: 'Healthy' };
      case 'degraded':
        return { icon: <DegradedIcon />, color: 'warning', label: 'Degraded' };
      case 'unhealthy':
        return { icon: <UnhealthyIcon />, color: 'error', label: 'Unhealthy' };
      default:
        return { icon: <UnhealthyIcon />, color: 'default', label: 'Unknown' };
    }
  };

  // Get alert severity color
  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
          Loading monitoring data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Integration Monitoring
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchMonitoringData}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant={monitoringStats?.isMonitoring ? 'contained' : 'outlined'}
            startIcon={monitoringStats?.isMonitoring ? <StopIcon /> : <StartIcon />}
            onClick={toggleMonitoring}
            color={monitoringStats?.isMonitoring ? 'error' : 'success'}
          >
            {monitoringStats?.isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
        </Box>
      </Box>

      {/* System Health Overview */}
      {systemHealth && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    System Health Overview
                  </Typography>
                  <Chip
                    icon={getStatusDisplay(systemHealth.status).icon}
                    label={getStatusDisplay(systemHealth.status).label}
                    color={getStatusDisplay(systemHealth.status).color as any}
                    variant="outlined"
                  />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total Integrations
                    </Typography>
                    <Typography variant="h6">
                      {systemHealth.totalIntegrations}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Healthy
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {systemHealth.healthyIntegrations}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Degraded
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {systemHealth.degradedIntegrations}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Unhealthy
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {systemHealth.unhealthyIntegrations}
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Average Uptime: {systemHealth.averageUptime.toFixed(2)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last Checked: {format(new Date(systemHealth.lastChecked), 'PPpp')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Monitoring Statistics
                </Typography>
                {monitoringStats && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Status: {monitoringStats.isMonitoring ? 'Active' : 'Inactive'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Checks: {monitoringStats.totalChecks.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Alerts: {monitoringStats.activeAlerts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      System Uptime: {monitoringStats.uptime.toFixed(2)}%
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              <Badge badgeContent={activeAlerts.length} color="error">
                <AlertIcon sx={{ mr: 1 }} />
              </Badge>
              Active Alerts
            </Typography>
            {activeAlerts.slice(0, 5).map((alert) => (
              <Alert
                key={alert.id}
                severity={getAlertSeverityColor(alert.severity) as any}
                sx={{ mb: 1 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setSelectedAlert(alert);
                      setAlertDialogOpen(true);
                    }}
                  >
                    View
                  </Button>
                }
              >
                <AlertTitle>{alert.type.replace('_', ' ').toUpperCase()}</AlertTitle>
                {alert.message}
                <Typography variant="caption" display="block">
                  {alert.integrationId} • {format(new Date(alert.triggeredAt), 'PPpp')}
                </Typography>
              </Alert>
            ))}
            {activeAlerts.length > 5 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                ... and {activeAlerts.length - 5} more alerts
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Integration Status Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Integration Status
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Integration</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Response Time</TableCell>
                  <TableCell>Uptime</TableCell>
                  <TableCell>Failures</TableCell>
                  <TableCell>Last Checked</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {integrations.map((integration) => {
                  const statusDisplay = getStatusDisplay(integration.status);
                  return (
                    <TableRow key={integration.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight="medium">
                            {integration.name}
                          </Typography>
                          {integration.alerts.filter(a => a.isActive).length > 0 && (
                            <Badge
                              badgeContent={integration.alerts.filter(a => a.isActive).length}
                              color="error"
                              sx={{ ml: 1 }}
                            >
                              <AlertIcon fontSize="small" />
                            </Badge>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={integration.type} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={statusDisplay.icon}
                          label={statusDisplay.label}
                          color={statusDisplay.color as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {integration.averageResponseTime.toFixed(0)}ms
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          avg
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {integration.uptime.toFixed(2)}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={integration.consecutiveFailures > 0 ? 'error.main' : 'text.primary'}
                        >
                          {integration.consecutiveFailures}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(integration.lastChecked), 'PPpp')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Perform Health Check">
                          <IconButton
                            size="small"
                            onClick={() => performHealthCheck(integration.id)}
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Metrics">
                          <IconButton size="small">
                            <MetricsIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Alert Detail Dialog */}
      <Dialog
        open={alertDialogOpen}
        onClose={() => setAlertDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Alert Details
        </DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Integration
                  </Typography>
                  <Typography variant="body1">
                    {selectedAlert.integrationId}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1">
                    {selectedAlert.type.replace('_', ' ').toUpperCase()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Severity
                  </Typography>
                  <Chip
                    label={selectedAlert.severity.toUpperCase()}
                    color={getAlertSeverityColor(selectedAlert.severity) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Triggered At
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(selectedAlert.triggeredAt), 'PPpp')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Message
                  </Typography>
                  <Typography variant="body1">
                    {selectedAlert.message}
                  </Typography>
                </Grid>
                {selectedAlert.metadata && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Additional Information
                    </Typography>
                    <Box component="pre" sx={{ fontSize: '0.875rem', mt: 1 }}>
                      {JSON.stringify(selectedAlert.metadata, null, 2)}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialogOpen(false)}>
            Close
          </Button>
          {selectedAlert && (
            <Button
              onClick={() => resolveAlert(selectedAlert.id)}
              color="primary"
              variant="contained"
            >
              Resolve Alert
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntegrationMonitorDashboard;