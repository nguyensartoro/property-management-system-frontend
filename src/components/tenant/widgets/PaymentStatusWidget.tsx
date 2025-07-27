import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface PaymentStatusData {
  nextPaymentDue: string;
  amount: number;
  status: 'pending' | 'overdue' | 'paid' | 'scheduled';
  paymentHistory: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
    method: string;
  }>;
  autoPayEnabled?: boolean;
  daysUntilDue?: number;
}

interface PaymentStatusWidgetProps {
  data: PaymentStatusData;
  settings: Record<string, any>;
}

export const PaymentStatusWidget: React.FC<PaymentStatusWidgetProps> = ({ data, settings }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'scheduled':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckIcon />;
      case 'pending':
        return <ScheduleIcon />;
      case 'overdue':
        return <WarningIcon />;
      case 'scheduled':
        return <PaymentIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Status
      </Typography>

      {/* Current Payment Status */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">
              Next Payment
            </Typography>
            <Chip
              icon={getStatusIcon(data.status)}
              label={data.status.toUpperCase()}
              color={getStatusColor(data.status) as any}
              size="small"
            />
          </Box>

          <Typography variant="h4" gutterBottom>
            {formatCurrency(data.amount)}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Due: {formatDate(data.nextPaymentDue)}
          </Typography>

          {data.daysUntilDue !== undefined && (
            <Box mb={2}>
              {data.daysUntilDue > 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {data.daysUntilDue} days remaining
                </Typography>
              ) : data.daysUntilDue === 0 ? (
                <Typography variant="body2" color="warning.main">
                  Due today
                </Typography>
              ) : (
                <Typography variant="body2" color="error.main">
                  {Math.abs(data.daysUntilDue)} days overdue
                </Typography>
              )}
              
              <LinearProgress
                variant="determinate"
                value={Math.max(0, Math.min(100, ((30 - (data.daysUntilDue || 0)) / 30) * 100))}
                color={data.daysUntilDue && data.daysUntilDue < 0 ? 'error' : 'primary'}
                sx={{ mt: 1 }}
              />
            </Box>
          )}

          {data.autoPayEnabled && (
            <Chip
              icon={<ScheduleIcon />}
              label="Auto Pay Enabled"
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />
          )}

          <Button
            variant="contained"
            fullWidth
            startIcon={<PaymentIcon />}
            disabled={data.status === 'paid'}
          >
            {data.status === 'paid' ? 'Payment Complete' : 'Pay Now'}
          </Button>
        </CardContent>
      </Card>

      {/* Payment History */}
      {data.paymentHistory && data.paymentHistory.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Recent Payments
            </Typography>
            <List dense>
              {data.paymentHistory.slice(0, 3).map((payment, index) => (
                <React.Fragment key={payment.id}>
                  <ListItem>
                    <ListItemText
                      primary={formatCurrency(payment.amount)}
                      secondary={`${formatDate(payment.date)} • ${payment.method}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={payment.status}
                        color={getStatusColor(payment.status) as any}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < Math.min(2, data.paymentHistory.length - 1) && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PaymentStatusWidget;