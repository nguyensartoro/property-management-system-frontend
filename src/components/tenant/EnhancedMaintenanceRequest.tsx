import React, { useState, useEffect, useRef } from 'react';
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
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  LinearProgress,
  Alert,
  Paper,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Rating,
  Divider,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Add as AddIcon,
  PhotoCamera as CameraIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  Feedback as FeedbackIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { CameraCapture } from '../camera/CameraCapture';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
  photos: string[];
  submittedAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  estimatedCompletion?: Date;
  feedback?: {
    rating: number;
    comment: string;
    categories: {
      timeliness: number;
      quality: number;
      communication: number;
      professionalism: number;
    };
    submittedAt: Date;
  };
}

interface EnhancedMaintenanceRequestProps {
  tenantId: string;
}

export const EnhancedMaintenanceRequest: React.FC<EnhancedMaintenanceRequestProps> = ({ tenantId }) => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as MaintenanceRequest['priority'],
    preferredTime: '',
    allowEntry: false
  });

  // Feedback form state
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: '',
    categories: {
      timeliness: 5,
      quality: 5,
      communication: 5,
      professionalism: 5
    }
  });

  const categories = [
    'Plumbing',
    'Electrical',
    'HVAC',
    'Appliances',
    'Flooring',
    'Windows/Doors',
    'Painting',
    'Pest Control',
    'Security',
    'Other'
  ];

  const priorityColors = {
    low: 'success',
    medium: 'warning',
    high: 'error',
    urgent: 'error'
  } as const;

  const statusColors = {
    submitted: 'info',
    acknowledged: 'warning',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'error'
  } as const;

  useEffect(() => {
    loadMaintenanceRequests();
  }, [tenantId]);

  const loadMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tenant-portal/maintenance/requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load maintenance requests');
      }

      const data = await response.json();
      setRequests(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  const submitMaintenanceRequest = async () => {
    try {
      const requestData = {
        ...formData,
        photos: uploadedPhotos
      };

      const response = await fetch('/api/tenant-portal/maintenance/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit maintenance request');
      }

      await loadMaintenanceRequests();
      setSubmitDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit maintenance request');
    }
  };

  const submitFeedback = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/tenant-portal/maintenance/requests/${selectedRequest.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      await loadMaintenanceRequests();
      setFeedbackDialogOpen(false);
      setSelectedRequest(null);
      resetFeedbackForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch('/api/tenant-portal/maintenance/photos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload photo');
    }

    const data = await response.json();
    return data.data.url;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      const uploadPromises = Array.from(files).map(file => uploadPhoto(file));
      const photoUrls = await Promise.all(uploadPromises);
      setUploadedPhotos([...uploadedPhotos, ...photoUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photos');
    }
  };

  const handleCameraCapture = async (photoBlob: Blob) => {
    try {
      const file = new File([photoBlob], 'camera-photo.jpg', { type: 'image/jpeg' });
      const photoUrl = await uploadPhoto(file);
      setUploadedPhotos([...uploadedPhotos, photoUrl]);
      setCameraOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload camera photo');
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
    setUploadedPhotos(newPhotos);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      preferredTime: '',
      allowEntry: false
    });
    setUploadedPhotos([]);
  };

  const resetFeedbackForm = () => {
    setFeedbackData({
      rating: 5,
      comment: '',
      categories: {
        timeliness: 5,
        quality: 5,
        communication: 5,
        professionalism: 5
      }
    });
  };

  const getStatusStep = (status: MaintenanceRequest['status']) => {
    const steps = ['submitted', 'acknowledged', 'in_progress', 'completed'];
    return steps.indexOf(status);
  };

  const renderRequestCard = (request: MaintenanceRequest) => (
    <Card key={request.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {request.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {request.description}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Chip
              label={request.priority.toUpperCase()}
              color={priorityColors[request.priority]}
              size="small"
            />
            <Chip
              label={request.status.replace('_', ' ').toUpperCase()}
              color={statusColors[request.status]}
              size="small"
            />
          </Box>
        </Box>

        {/* Status Stepper */}
        <Stepper activeStep={getStatusStep(request.status)} sx={{ mb: 2 }}>
          <Step>
            <StepLabel>Submitted</StepLabel>
          </Step>
          <Step>
            <StepLabel>Acknowledged</StepLabel>
          </Step>
          <Step>
            <StepLabel>In Progress</StepLabel>
          </Step>
          <Step>
            <StepLabel>Completed</StepLabel>
          </Step>
        </Stepper>

        {/* Photos */}
        {request.photos.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Photos
            </Typography>
            <ImageList cols={4} rowHeight={100}>
              {request.photos.map((photo, index) => (
                <ImageListItem key={index}>
                  <img
                    src={photo}
                    alt={`Maintenance photo ${index + 1}`}
                    loading="lazy"
                    style={{ objectFit: 'cover' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        )}

        {/* Request Details */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Category
            </Typography>
            <Typography variant="body2">
              {request.category}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Submitted
            </Typography>
            <Typography variant="body2">
              {new Date(request.submittedAt).toLocaleDateString()}
            </Typography>
          </Grid>
          {request.assignedTo && (
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Assigned To
              </Typography>
              <Typography variant="body2">
                {request.assignedTo}
              </Typography>
            </Grid>
          )}
          {request.estimatedCompletion && (
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Estimated Completion
              </Typography>
              <Typography variant="body2">
                {new Date(request.estimatedCompletion).toLocaleDateString()}
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* Feedback Section */}
        {request.status === 'completed' && (
          <Box>
            <Divider sx={{ mb: 2 }} />
            {request.feedback ? (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Your Feedback
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Rating value={request.feedback.rating} readOnly size="small" />
                  <Typography variant="body2">
                    ({request.feedback.rating}/5)
                  </Typography>
                </Box>
                {request.feedback.comment && (
                  <Typography variant="body2" color="text.secondary">
                    "{request.feedback.comment}"
                  </Typography>
                )}
              </Box>
            ) : (
              <Button
                startIcon={<FeedbackIcon />}
                onClick={() => {
                  setSelectedRequest(request);
                  setFeedbackDialogOpen(true);
                }}
              >
                Leave Feedback
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Loading maintenance requests...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Maintenance Requests</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setSubmitDialogOpen(true)}
        >
          Submit Request
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Requests List */}
      {requests.length > 0 ? (
        requests.map(renderRequestCard)
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BuildIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Maintenance Requests
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Submit your first maintenance request to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setSubmitDialogOpen(true)}
          >
            Submit Request
          </Button>
        </Paper>
      )}

      {/* Submit Request Dialog */}
      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submit Maintenance Request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={4}
            required
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Preferred Time (optional)"
            value={formData.preferredTime}
            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
            margin="normal"
            placeholder="e.g., Weekdays after 2 PM"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.allowEntry}
                onChange={(e) => setFormData({ ...formData, allowEntry: e.target.checked })}
              />
            }
            label="Allow entry when not home"
            sx={{ mt: 2, mb: 2 }}
          />

          {/* Photo Upload Section */}
          <Box mb={2}>
            <Typography variant="subtitle1" gutterBottom>
              Photos (optional)
            </Typography>
            <Box display="flex" gap={2} mb={2}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photos
              </Button>
              <Button
                variant="outlined"
                startIcon={<CameraIcon />}
                onClick={() => setCameraOpen(true)}
              >
                Take Photo
              </Button>
            </Box>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            {uploadedPhotos.length > 0 && (
              <ImageList cols={4} rowHeight={100}>
                {uploadedPhotos.map((photo, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={photo}
                      alt={`Upload ${index + 1}`}
                      loading="lazy"
                      style={{ objectFit: 'cover' }}
                    />
                    <ImageListItemBar
                      actionIcon={
                        <IconButton
                          sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                          onClick={() => removePhoto(index)}
                        >
                          <CloseIcon />
                        </IconButton>
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submitMaintenanceRequest} variant="contained" startIcon={<SendIcon />}>
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Camera Capture Dialog */}
      <Dialog open={cameraOpen} onClose={() => setCameraOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Take Photo</DialogTitle>
        <DialogContent>
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setCameraOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onClose={() => setFeedbackDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Leave Feedback</DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Overall Rating
            </Typography>
            <Rating
              value={feedbackData.rating}
              onChange={(_, value) => setFeedbackData({ ...feedbackData, rating: value || 1 })}
              size="large"
            />
          </Box>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Detailed Ratings
            </Typography>
            {Object.entries(feedbackData.categories).map(([category, rating]) => (
              <Box key={category} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
                <Rating
                  value={rating}
                  onChange={(_, value) => setFeedbackData({
                    ...feedbackData,
                    categories: {
                      ...feedbackData.categories,
                      [category]: value || 1
                    }
                  })}
                  size="small"
                />
              </Box>
            ))}
          </Box>

          <TextField
            fullWidth
            label="Comments (optional)"
            value={feedbackData.comment}
            onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
            multiline
            rows={4}
            placeholder="Share your experience with the maintenance service..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submitFeedback} variant="contained" startIcon={<StarIcon />}>
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedMaintenanceRequest;