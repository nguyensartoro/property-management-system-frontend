import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Button
} from '@mui/material';
import {
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

interface LeaseInfoData {
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  securityDeposit: number;
  propertyAddress?: string;
  leaseType?: string;
  renewalOption?: boolean;
}

interface LeaseInfoWidgetProps {
  data: LeaseInfoData;
  settings: Record<string, any>;
}

export const LeaseInfoWidget: React.FC<LeaseInfoWidgetProps> = ({ data, settings }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateLeaseProgress = () => {
    const start = new Date(data.leaseStart);
    const end = new Date(data.leaseEnd);
    const now = new Date();
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const getDaysRemaining = () => {
    const end = new Date(data.leaseEnd);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const progress = calculateLeaseProgress();
  const daysRemaining = getDaysRemaining();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Lease Information
      </Typography>

      <Card>
        <CardContent>
          {/* Lease Progress */}
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2">
                Lease Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Lease expired'}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={daysRemaining < 30 ? 'warning' : 'primary'}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Lease Details Grid */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" mb={1}>
                <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Lease Start
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="medium">
                {formatDate(data.leaseStart)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Box display="flex" alignItems="center" mb={1}>
                <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Lease End
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="medium">
                {formatDate(data.leaseEnd)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Box display="flex" alignItems="center" mb={1}>
                <MoneyIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Monthly Rent
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(data.rentAmount)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Box display="flex" alignItems="center" mb={1}>
                <SecurityIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Security Deposit
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(data.securityDeposit)}
              </Typography>
            </Grid>
          </Grid>

          {/* Property Address */}
          {data.propertyAddress && (
            <Box mt={2}>
              <Box display="flex" alignItems="center" mb={1}>
                <HomeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Property Address
                </Typography>
              </Box>
              <Typography variant="body2">
                {data.propertyAddress}
              </Typography>
            </Box>
          )}

          {/* Lease Type and Renewal Option */}
          <Box mt={2} display="flex" gap={1} flexWrap="wrap">
            {data.leaseType && (
              <Chip
                label={data.leaseType}
                size="small"
                variant="outlined"
              />
            )}
            {data.renewalOption && (
              <Chip
                label="Renewal Available"
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </Box>

          {/* Renewal Reminder */}
          {daysRemaining <= 60 && daysRemaining > 0 && (
            <Box mt={2}>
              <Chip
                label={`Renewal reminder: ${daysRemaining} days left`}
                color="warning"
                size="small"
                sx={{ mb: 2 }}
              />
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => {
                  // Navigate to lease renewal
                  console.log('Navigate to lease renewal');
                }}
              >
                Discuss Renewal
              </Button>
            </Box>
          )}

          {/* View Full Lease */}
          <Box mt={2}>
            <Button
              variant="text"
              size="small"
              fullWidth
              onClick={() => {
                // View full lease document
                console.log('View full lease document');
              }}
            >
              View Full Lease Agreement
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LeaseInfoWidget;