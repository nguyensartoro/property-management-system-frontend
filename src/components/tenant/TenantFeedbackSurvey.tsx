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
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  Slider,
  Rating,
  LinearProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Survey as SurveyIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface SurveyQuestion {
  id: string;
  type: 'text' | 'rating' | 'multiple_choice' | 'checkbox' | 'scale';
  question: string;
  options?: string[];
  required: boolean;
}

interface SurveyResponse {
  questionId: string;
  answer: string | number | string[];
}

interface TenantSurvey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  isActive: boolean;
  expiresAt?: Date;
  responses?: SurveyResponse[];
}

interface TenantFeedbackSurveyProps {
  tenantId: string;
}

export const TenantFeedbackSurvey: React.FC<TenantFeedbackSurveyProps> = ({ tenantId }) => {
  const [surveys, setSurveys] = useState<TenantSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<TenantSurvey | null>(null);
  const [surveyDialogOpen, setSurveyDialogOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAvailableSurveys();
  }, [tenantId]);

  const loadAvailableSurveys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tenant-portal/surveys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load surveys');
      }

      const data = await response.json();
      setSurveys(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const startSurvey = (survey: TenantSurvey) => {
    setSelectedSurvey(survey);
    setCurrentQuestionIndex(0);
    setResponses({});
    setSurveyDialogOpen(true);
  };

  const submitSurveyResponse = async () => {
    if (!selectedSurvey) return;

    try {
      setSubmitting(true);

      // Convert responses to the expected format
      const surveyResponses: SurveyResponse[] = Object.entries(responses).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      const response = await fetch(`/api/tenant-portal/surveys/${selectedSurvey.id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ responses: surveyResponses })
      });

      if (!response.ok) {
        throw new Error('Failed to submit survey response');
      }

      // Remove completed survey from list
      setSurveys(surveys.filter(s => s.id !== selectedSurvey.id));
      setSurveyDialogOpen(false);
      setSelectedSurvey(null);
      setResponses({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit survey response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResponseChange = (questionId: string, answer: any) => {
    setResponses({
      ...responses,
      [questionId]: answer
    });
  };

  const canProceedToNext = () => {
    if (!selectedSurvey) return false;
    
    const currentQuestion = selectedSurvey.questions[currentQuestionIndex];
    if (!currentQuestion.required) return true;
    
    const response = responses[currentQuestion.id];
    return response !== undefined && response !== '' && response !== null;
  };

  const canSubmitSurvey = () => {
    if (!selectedSurvey) return false;
    
    const requiredQuestions = selectedSurvey.questions.filter(q => q.required);
    return requiredQuestions.every(q => {
      const response = responses[q.id];
      return response !== undefined && response !== '' && response !== null;
    });
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const currentResponse = responses[question.id];

    switch (question.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={currentResponse || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Enter your response..."
            variant="outlined"
          />
        );

      case 'rating':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Rating
              value={currentResponse || 0}
              onChange={(_, value) => handleResponseChange(question.id, value)}
              size="large"
              precision={1}
            />
            <Typography variant="body2" color="text.secondary">
              Rate from 1 to 5 stars
            </Typography>
          </Box>
        );

      case 'multiple_choice':
        return (
          <FormControl component="fieldset">
            <RadioGroup
              value={currentResponse || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
            >
              {question.options?.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormGroup>
            {question.options?.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={(currentResponse || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = currentResponse || [];
                      if (e.target.checked) {
                        handleResponseChange(question.id, [...currentValues, option]);
                      } else {
                        handleResponseChange(question.id, currentValues.filter((v: string) => v !== option));
                      }
                    }}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
        );

      case 'scale':
        return (
          <Box px={2}>
            <Slider
              value={currentResponse || 5}
              onChange={(_, value) => handleResponseChange(question.id, value)}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="on"
            />
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="caption">1 - Poor</Typography>
              <Typography variant="caption">10 - Excellent</Typography>
            </Box>
          </Box>
        );

      default:
        return <Typography>Unsupported question type</Typography>;
    }
  };

  const renderSurveyCard = (survey: TenantSurvey) => {
    const isExpiringSoon = survey.expiresAt && 
      new Date(survey.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days

    return (
      <Card key={survey.id} sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {survey.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {survey.description}
              </Typography>
            </Box>
            {isExpiringSoon && (
              <Chip
                icon={<ScheduleIcon />}
                label="Expires Soon"
                color="warning"
                size="small"
              />
            )}
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="text.secondary">
                {survey.questions.length} questions
              </Typography>
              {survey.expiresAt && (
                <Typography variant="caption" color="text.secondary">
                  Expires: {new Date(survey.expiresAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<SurveyIcon />}
              onClick={() => startSurvey(survey)}
            >
              Take Survey
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Loading surveys...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Feedback & Surveys
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {surveys.length > 0 ? (
        <Box>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Help us improve by sharing your feedback
          </Typography>
          {surveys.map(renderSurveyCard)}
        </Box>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            All Caught Up!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No surveys available at the moment. Thank you for your previous feedback!
          </Typography>
        </Paper>
      )}

      {/* Survey Dialog */}
      <Dialog 
        open={surveyDialogOpen} 
        onClose={() => setSurveyDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        disableEscapeKeyDown={submitting}
      >
        {selectedSurvey && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  {selectedSurvey.title}
                </Typography>
                <IconButton 
                  onClick={() => setSurveyDialogOpen(false)}
                  disabled={submitting}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              {/* Progress Bar */}
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">
                    Question {currentQuestionIndex + 1} of {selectedSurvey.questions.length}
                  </Typography>
                  <Typography variant="body2">
                    {Math.round(((currentQuestionIndex + 1) / selectedSurvey.questions.length) * 100)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={((currentQuestionIndex + 1) / selectedSurvey.questions.length) * 100}
                />
              </Box>

              {/* Current Question */}
              <Box mb={4}>
                <Typography variant="h6" gutterBottom>
                  {selectedSurvey.questions[currentQuestionIndex].question}
                  {selectedSurvey.questions[currentQuestionIndex].required && (
                    <Typography component="span" color="error"> *</Typography>
                  )}
                </Typography>
                
                {renderQuestion(selectedSurvey.questions[currentQuestionIndex])}
              </Box>

              {/* Question Navigation */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button
                  startIcon={<BackIcon />}
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0 || submitting}
                >
                  Previous
                </Button>

                {currentQuestionIndex < selectedSurvey.questions.length - 1 ? (
                  <Button
                    endIcon={<NextIcon />}
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                    disabled={!canProceedToNext() || submitting}
                    variant="contained"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    endIcon={<SendIcon />}
                    onClick={submitSurveyResponse}
                    disabled={!canSubmitSurvey() || submitting}
                    variant="contained"
                    color="success"
                  >
                    {submitting ? 'Submitting...' : 'Submit Survey'}
                  </Button>
                )}
              </Box>

              {/* Question Overview */}
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Survey Progress
                </Typography>
                <Stepper activeStep={currentQuestionIndex} orientation="horizontal" sx={{ mt: 2 }}>
                  {selectedSurvey.questions.map((question, index) => (
                    <Step key={question.id}>
                      <StepLabel 
                        optional={
                          responses[question.id] ? (
                            <CheckIcon color="success" fontSize="small" />
                          ) : question.required ? (
                            <Typography variant="caption" color="error">Required</Typography>
                          ) : (
                            <Typography variant="caption">Optional</Typography>
                          )
                        }
                      >
                        Q{index + 1}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TenantFeedbackSurvey;