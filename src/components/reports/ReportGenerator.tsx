import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Filter, 
  Download, 
  Eye, 
  Settings, 
  TrendingUp, 
  Building, 
  Wrench,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useReportStore } from '../../stores/reportStore';
import { usePropertyStore } from '../../stores/propertyStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { useToast } from '../../hooks/use-toast';

export interface ReportGeneratorProps {
  onReportGenerated?: (reportType: string, reportData: any) => void;
  onPreviewRequested?: (reportType: string, filters: any) => void;
  className?: string;
}

interface ReportFilters {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  format?: string;
}

interface ReportConfig {
  type: 'financial' | 'occupancy' | 'maintenance';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  estimatedTime: string;
  features: string[];
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  onReportGenerated,
  onPreviewRequested,
  className = '',
}) => {
  const { toast } = useToast();
  const [selectedReportType, setSelectedReportType] = useState<'financial' | 'occupancy' | 'maintenance'>('financial');
  const [filters, setFilters] = useState<ReportFilters>({
    format: 'json',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    generateFinancialReport,
    generateOccupancyReport,
    generateMaintenanceReport,
    isLoading,
    error,
    clearError,
  } = useReportStore();

  const { properties, fetchProperties } = usePropertyStore();

  useEffect(() => {
    fetchProperties();
    
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setFilters(prev => ({
      ...prev,
      endDate: today.toISOString().split('T')[0],
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
    }));
  }, [fetchProperties]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const reportConfigs: Record<string, ReportConfig> = {
    financial: {
      type: 'financial',
      title: 'Financial Report',
      description: 'Comprehensive income, expense, and profitability analysis',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-green-600',
      estimatedTime: '2-3 minutes',
      features: [
        'Income breakdown by property',
        'Expense categorization',
        'Profit margin analysis',
        'Payment status tracking',
        'Financial trends over time'
      ],
    },
    occupancy: {
      type: 'occupancy',
      title: 'Occupancy Report',
      description: 'Room occupancy rates, vacancy tracking, and rental analytics',
      icon: <Building className="h-5 w-5" />,
      color: 'text-blue-600',
      estimatedTime: '1-2 minutes',
      features: [
        'Occupancy rate by property',
        'Vacancy duration tracking',
        'Room utilization metrics',
        'Contract status overview',
        'Rental rate comparisons'
      ],
    },
    maintenance: {
      type: 'maintenance',
      title: 'Maintenance Report',
      description: 'Maintenance request analytics and resolution performance',
      icon: <Wrench className="h-5 w-5" />,
      color: 'text-orange-600',
      estimatedTime: '1-2 minutes',
      features: [
        'Request volume by category',
        'Resolution time analysis',
        'Priority distribution',
        'Completion rate tracking',
        'Cost analysis by type'
      ],
    },
  };

  const validateFilters = (): string[] => {
    const errors: string[] = [];

    if (!filters.startDate) {
      errors.push('Start date is required');
    }

    if (!filters.endDate) {
      errors.push('End date is required');
    }

    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      
      if (startDate > endDate) {
        errors.push('Start date must be before end date');
      }

      // Check if date range is too large (more than 2 years)
      const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 730) {
        errors.push('Date range cannot exceed 2 years');
      }

      // Check if date range is in the future
      const today = new Date();
      if (startDate > today) {
        errors.push('Start date cannot be in the future');
      }
    }

    return errors;
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
    
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const simulateProgress = () => {
    setGenerationProgress(0);
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  };

  const handleGenerateReport = async () => {
    const errors = validateFilters();
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setValidationErrors([]);
    
    const progressInterval = simulateProgress();

    try {
      let reportData;
      
      switch (selectedReportType) {
        case 'financial':
          await generateFinancialReport(filters);
          break;
        case 'occupancy':
          await generateOccupancyReport(filters);
          break;
        case 'maintenance':
          await generateMaintenanceReport(filters);
          break;
      }

      // Complete progress
      setGenerationProgress(100);
      
      toast({
        title: "Report Generated Successfully",
        description: `${reportConfigs[selectedReportType].title} has been generated`,
      });

      if (onReportGenerated) {
        onReportGenerated(selectedReportType, reportData);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  const handlePreviewReport = () => {
    const errors = validateFilters();
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    if (onPreviewRequested) {
      onPreviewRequested(selectedReportType, filters);
    }
  };

  const currentConfig = reportConfigs[selectedReportType];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Select Report Type</span>
          </CardTitle>
          <CardDescription>
            Choose the type of report you want to generate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(reportConfigs).map((config) => (
              <div
                key={config.type}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedReportType === config.type
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50 hover:shadow-sm'
                }`}
                onClick={() => setSelectedReportType(config.type)}
              >
                <div className="flex items-start space-x-3">
                  <div className={config.color}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{config.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {config.description}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{config.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Report Filters</span>
            </CardTitle>
            <CardDescription>
              Configure the parameters for your report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className={validationErrors.some(e => e.includes('Start date')) ? 'border-red-500' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className={validationErrors.some(e => e.includes('End date')) ? 'border-red-500' : ''}
                  />
                </div>
              </div>

              {/* Quick Date Presets */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    handleFilterChange('startDate', lastWeek.toISOString().split('T')[0]);
                    handleFilterChange('endDate', today.toISOString().split('T')[0]);
                  }}
                >
                  Last 7 days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    handleFilterChange('startDate', lastMonth.toISOString().split('T')[0]);
                    handleFilterChange('endDate', today.toISOString().split('T')[0]);
                  }}
                >
                  Last 30 days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const lastQuarter = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                    handleFilterChange('startDate', lastQuarter.toISOString().split('T')[0]);
                    handleFilterChange('endDate', today.toISOString().split('T')[0]);
                  }}
                >
                  Last 3 months
                </Button>
              </div>
            </div>

            <Separator />

            {/* Property Filter */}
            <div className="space-y-2">
              <Label htmlFor="property">Property Filter</Label>
              <Select 
                value={filters.propertyId || ''} 
                onValueChange={(value) => handleFilterChange('propertyId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Export Format */}
            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select 
                value={filters.format || 'json'} 
                onValueChange={(value) => handleFilterChange('format', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">Web View (JSON)</SelectItem>
                  <SelectItem value="csv">CSV Export</SelectItem>
                  <SelectItem value="pdf">PDF Export</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-800 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Validation Errors</span>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Report Preview</span>
            </CardTitle>
            <CardDescription>
              Preview of the selected report configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Report Info */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className={currentConfig.color}>
                  {currentConfig.icon}
                </div>
                <div>
                  <h3 className="font-medium">{currentConfig.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentConfig.description}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date Range:</span>
                  <span>
                    {filters.startDate && filters.endDate
                      ? `${new Date(filters.startDate).toLocaleDateString()} - ${new Date(filters.endDate).toLocaleDateString()}`
                      : 'Not set'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property:</span>
                  <span>
                    {filters.propertyId
                      ? properties.find(p => p.id === filters.propertyId)?.name || 'Unknown'
                      : 'All Properties'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="capitalize">{filters.format || 'JSON'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Time:</span>
                  <span>{currentConfig.estimatedTime}</span>
                </div>
              </div>
            </div>

            {/* Report Features */}
            <div>
              <h4 className="font-medium mb-2">Report Features</h4>
              <ul className="space-y-1 text-sm">
                {currentConfig.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Generation Progress */}
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Generating report...</span>
                  <span>{Math.round(generationProgress)}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Ready to generate your {currentConfig.title.toLowerCase()}?
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handlePreviewReport}
                disabled={isGenerating || isLoading}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating || isLoading}
                className="flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Generate Report</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGenerator;