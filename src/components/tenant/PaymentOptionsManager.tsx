import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Grid,
  Divider,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { VietnamesePaymentSelector } from '../payments/VietnamesePaymentSelector';

interface PaymentOption {
  id: string;
  type: 'credit_card' | 'bank_transfer' | 'auto_pay' | 'vietnamese_payment';
  name: string;
  details: Record<string, any>;
  isDefault: boolean;
  isActive: boolean;
}

interface AutoPayConfig {
  paymentMethodId: string;
  amount?: number;
  dayOfMonth: number;
  isActive: boolean;
}

interface PaymentOptionsManagerProps {
  tenantId: string;
}

export const PaymentOptionsManager: React.FC<PaymentOptionsManagerProps> = ({ tenantId }) => {
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [autoPayDialogOpen, setAutoPayDialogOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentOption['type']>('credit_card');
  const [autoPayConfig, setAutoPayConfig] = useState<AutoPayConfig>({
    paymentMethodId: '',
    dayOfMonth: 1,
    isActive: false
  });

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    vietnameseProvider: '',
    phoneNumber: '',
    isDefault: false
  });

  useEffect(() => {
    loadPaymentOptions();
  }, [tenantId]);

  const loadPaymentOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tenant-portal/payments/options', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load payment options');
      }

      const data = await response.json();
      setPaymentOptions(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment options');
    } finally {
      setLoading(false);
    }
  };

  const addPaymentOption = async () => {
    try {
      let details: Record<string, any> = {};

      switch (selectedPaymentType) {
        case 'credit_card':
          details = {
            cardNumber: formData.cardNumber.replace(/\s/g, ''),
            expiryDate: formData.expiryDate,
            lastFourDigits: formData.cardNumber.slice(-4),
            cardType: detectCardType(formData.cardNumber)
          };
          break;
        case 'bank_transfer':
          details = {
            accountNumber: formData.accountNumber,
            routingNumber: formData.routingNumber,
            bankName: formData.bankName,
            lastFourDigits: formData.accountNumber.slice(-4)
          };
          break;
        case 'vietnamese_payment':
          details = {
            provider: formData.vietnameseProvider,
            phoneNumber: formData.phoneNumber
          };
          break;
      }

      const newOption = {
        type: selectedPaymentType,
        name: formData.name,
        details,
        isDefault: formData.isDefault,
        isActive: true
      };

      const response = await fetch('/api/tenant-portal/payments/options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newOption)
      });

      if (!response.ok) {
        throw new Error('Failed to add payment option');
      }

      await loadPaymentOptions();
      setAddDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add payment option');
    }
  };

  const scheduleAutomaticPayment = async () => {
    try {
      const response = await fetch('/api/tenant-portal/payments/auto-pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(autoPayConfig)
      });

      if (!response.ok) {
        throw new Error('Failed to schedule automatic payment');
      }

      setAutoPayDialogOpen(false);
      // Show success message
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule automatic payment');
    }
  };

  const detectCardType = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    return 'Unknown';
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      vietnameseProvider: '',
      phoneNumber: '',
      isDefault: false
    });
  };

  const getPaymentIcon = (type: PaymentOption['type']) => {
    switch (type) {
      case 'credit_card':
        return <CreditCardIcon />;
      case 'bank_transfer':
        return <BankIcon />;
      case 'auto_pay':
        return <ScheduleIcon />;
      case 'vietnamese_payment':
        return <PaymentIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  const formatPaymentDetails = (option: PaymentOption) => {
    switch (option.type) {
      case 'credit_card':
        return `**** **** **** ${option.details.lastFourDigits} (${option.details.cardType})`;
      case 'bank_transfer':
        return `${option.details.bankName} - ****${option.details.lastFourDigits}`;
      case 'vietnamese_payment':
        return `${option.details.provider} - ${option.details.phoneNumber}`;
      default:
        return 'Payment method';
    }
  };

  const renderAddPaymentForm = () => {
    switch (selectedPaymentType) {
      case 'credit_card':
        return (
          <>
            <TextField
              fullWidth
              label="Card Holder Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Card Number"
              value={formData.cardNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                setFormData({ ...formData, cardNumber: value });
              }}
              margin="normal"
              required
              inputProps={{ maxLength: 19 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date (MM/YY)"
                  value={formData.expiryDate}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
                    setFormData({ ...formData, expiryDate: value });
                  }}
                  margin="normal"
                  required
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                  margin="normal"
                  required
                  inputProps={{ maxLength: 4 }}
                />
              </Grid>
            </Grid>
          </>
        );

      case 'bank_transfer':
        return (
          <>
            <TextField
              fullWidth
              label="Account Holder Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Bank Name"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Account Number"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Routing Number"
              value={formData.routingNumber}
              onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
              margin="normal"
              required
            />
          </>
        );

      case 'vietnamese_payment':
        return (
          <>
            <TextField
              fullWidth
              label="Account Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Provider</InputLabel>
              <Select
                value={formData.vietnameseProvider}
                onChange={(e) => setFormData({ ...formData, vietnameseProvider: e.target.value })}
                required
              >
                <MenuItem value="momo">MoMo</MenuItem>
                <MenuItem value="zalopay">ZaloPay</MenuItem>
                <MenuItem value="vietqr">VietQR</MenuItem>
                <MenuItem value="vnpay">VNPay</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              margin="normal"
              required
            />
          </>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Loading payment options...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Payment Options</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            onClick={() => setAutoPayDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Auto Pay
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Payment Method
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Payment Options List */}
      <Grid container spacing={3}>
        {paymentOptions.map((option) => (
          <Grid item xs={12} md={6} key={option.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  {getPaymentIcon(option.type)}
                  <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                    {option.name}
                  </Typography>
                  {option.isDefault && (
                    <Chip
                      icon={<StarIcon />}
                      label="Default"
                      color="primary"
                      size="small"
                    />
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formatPaymentDetails(option)}
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Chip
                    label={option.type.replace('_', ' ').toUpperCase()}
                    variant="outlined"
                    size="small"
                  />
                  <Box>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {paymentOptions.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PaymentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Payment Methods Added
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Add a payment method to make rent payments easier
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Your First Payment Method
          </Button>
        </Paper>
      )}

      {/* Add Payment Method Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Type</InputLabel>
            <Select
              value={selectedPaymentType}
              onChange={(e) => setSelectedPaymentType(e.target.value as PaymentOption['type'])}
            >
              <MenuItem value="credit_card">Credit Card</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="vietnamese_payment">Vietnamese Payment</MenuItem>
            </Select>
          </FormControl>

          {renderAddPaymentForm()}

          <FormControlLabel
            control={
              <Switch
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
            }
            label="Set as default payment method"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={addPaymentOption} variant="contained">
            Add Payment Method
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auto Pay Setup Dialog */}
      <Dialog open={autoPayDialogOpen} onClose={() => setAutoPayDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Setup Automatic Payment</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={autoPayConfig.paymentMethodId}
              onChange={(e) => setAutoPayConfig({ ...autoPayConfig, paymentMethodId: e.target.value })}
            >
              {paymentOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name} - {formatPaymentDetails(option)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Amount (leave empty for full rent amount)"
            type="number"
            value={autoPayConfig.amount || ''}
            onChange={(e) => setAutoPayConfig({ 
              ...autoPayConfig, 
              amount: e.target.value ? parseFloat(e.target.value) : undefined 
            })}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Day of Month (1-28)"
            type="number"
            value={autoPayConfig.dayOfMonth}
            onChange={(e) => setAutoPayConfig({ 
              ...autoPayConfig, 
              dayOfMonth: parseInt(e.target.value) 
            })}
            margin="normal"
            inputProps={{ min: 1, max: 28 }}
            required
          />

          <FormControlLabel
            control={
              <Switch
                checked={autoPayConfig.isActive}
                onChange={(e) => setAutoPayConfig({ ...autoPayConfig, isActive: e.target.checked })}
              />
            }
            label="Enable automatic payment"
            sx={{ mt: 2 }}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            Automatic payments will be processed on the selected day of each month. 
            You will receive a notification before each payment is processed.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoPayDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={scheduleAutomaticPayment} variant="contained">
            Setup Auto Pay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentOptionsManager;