import React, { useState, useEffect } from 'react';
import { Calendar, FileText, TrendingUp, Building, Wrench, Filter, Clock, Download, Plus, History, Mail, Settings, Trash2, Edit } from 'lucide-react';
import { useReportStore } from '../stores/reportStore';
import { usePropertyStore } from '../stores/propertyStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ReportViewer } from '../components/reports';
import { useToast } from '../hooks/use-toast';

const ReportsPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedReportType, setSelectedReportType] = useState<'financial' | 'occupancy' | 'maintenance'>('financial');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Scheduling state
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    reportType: 'financial' as 'financial' | 'occupancy' | 'maintenance',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly',
    email: '',
    propertyId: '',
    isActive: true,
  });

  const {
    reportTypes,
    financialReport,
    occupancyReport,
    maintenanceReport,
    isLoading,
    error,
    lastGeneratedReport,
    reportHistory,
    scheduledReports,
    fetchReportTypes,
    generateFinancialReport,
    generateOccupancyReport,
    generateMaintenanceReport,
    createScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    fetchScheduledReports,
    clearError,
  } = useReportStore();

  const { properties, fetchProperties } = usePropertyStore();

  useEffect(() => {
    fetchReportTypes();
    fetchProperties();
    fetchScheduledReports();
    
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, [fetchReportTypes, fetchProperties, fetchScheduledReports]);

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

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: "Validation Error",
        description: "Start date must be before end date",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const filters = {
        propertyId: selectedProperty || undefined,
        startDate,
        endDate,
      };

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

      toast({
        title: "Report Generated",
        description: `${selectedReportType} report has been generated successfully`,
      });

      // Switch to view tab after generation
      setActiveTab('view');
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'financial':
        return <TrendingUp className="h-5 w-5" />;
      case 'occupancy':
        return <Building className="h-5 w-5" />;
      case 'maintenance':
        return <Wrench className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getReportTitle = (type: string) => {
    switch (type) {
      case 'financial':
        return 'Financial Report';
      case 'occupancy':
        return 'Occupancy Report';
      case 'maintenance':
        return 'Maintenance Report';
      default:
        return 'Report';
    }
  };

  const getReportDescription = (type: string) => {
    switch (type) {
      case 'financial':
        return 'Income, expenses, and profitability analysis';
      case 'occupancy':
        return 'Room occupancy rates and vacancy tracking';
      case 'maintenance':
        return 'Maintenance request analytics and resolution times';
      default:
        return 'Report description';
    }
  };

  const getCurrentReportData = () => {
    switch (lastGeneratedReport) {
      case 'financial':
        return financialReport;
      case 'occupancy':
        return occupancyReport;
      case 'maintenance':
        return maintenanceReport;
      default:
        return null;
    }
  };

  const handleScheduleReport = async () => {
    if (!scheduleForm.name || !scheduleForm.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createScheduledReport({
        name: scheduleForm.name,
        reportType: scheduleForm.reportType,
        frequency: scheduleForm.frequency,
        email: scheduleForm.email,
        propertyId: scheduleForm.propertyId || undefined,
        isActive: scheduleForm.isActive,
      });

      toast({
        title: "Schedule Created",
        description: `Report "${scheduleForm.name}" has been scheduled successfully`,
      });

      setIsScheduleDialogOpen(false);
      setScheduleForm({
        name: '',
        reportType: 'financial',
        frequency: 'monthly',
        email: '',
        propertyId: '',
        isActive: true,
      });
    } catch (error) {
      console.error('Error scheduling report:', error);
    }
  };

  const handleDeleteScheduledReport = async (id: string) => {
    try {
      await deleteScheduledReport(id);
      toast({
        title: "Schedule Deleted",
        description: "Scheduled report has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting scheduled report:', error);
    }
  };

  const handleToggleScheduledReport = async (id: string, isActive: boolean) => {
    try {
      await updateScheduledReport(id, { isActive });
      toast({
        title: isActive ? "Schedule Activated" : "Schedule Deactivated",
        description: `Scheduled report has been ${isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error updating scheduled report:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate and view comprehensive property management reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{reportHistory.length} reports generated</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{scheduledReports?.filter(s => s.isActive).length || 0} active schedules</span>
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Generate Report</span>
          </TabsTrigger>
          <TabsTrigger value="view" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>View Report</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Scheduled Reports</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Report History</span>
          </TabsTrigger>
        </TabsList>

        {/* Generate Report Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Type Selection */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Report Type</span>
                </CardTitle>
                <CardDescription>
                  Select the type of report you want to generate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(['financial', 'occupancy', 'maintenance'] as const).map((type) => (
                  <div
                    key={type}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReportType === type
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedReportType(type)}
                  >
                    <div className="flex items-center space-x-3">
                      {getReportIcon(type)}
                      <div>
                        <h3 className="font-medium">{getReportTitle(type)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getReportDescription(type)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Report Configuration */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Report Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure the parameters for your report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Property Filter */}
                <div className="space-y-2">
                  <Label htmlFor="property">Property (Optional)</Label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
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

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center space-x-2"
                        onClick={() => {
                          setScheduleForm(prev => ({
                            ...prev,
                            reportType: selectedReportType,
                            propertyId: selectedProperty,
                          }));
                        }}
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Schedule Report</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Schedule Report</DialogTitle>
                        <DialogDescription>
                          Set up automatic report generation and email delivery
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="scheduleName">Schedule Name</Label>
                          <Input
                            id="scheduleName"
                            placeholder="e.g., Monthly Financial Report"
                            value={scheduleForm.name}
                            onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scheduleEmail">Email Address</Label>
                          <Input
                            id="scheduleEmail"
                            type="email"
                            placeholder="your@email.com"
                            value={scheduleForm.email}
                            onChange={(e) => setScheduleForm(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scheduleFrequency">Frequency</Label>
                          <Select
                            value={scheduleForm.frequency}
                            onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'quarterly') =>
                              setScheduleForm(prev => ({ ...prev, frequency: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scheduleReportType">Report Type</Label>
                          <Select
                            value={scheduleForm.reportType}
                            onValueChange={(value: 'financial' | 'occupancy' | 'maintenance') =>
                              setScheduleForm(prev => ({ ...prev, reportType: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="financial">Financial Report</SelectItem>
                              <SelectItem value="occupancy">Occupancy Report</SelectItem>
                              <SelectItem value="maintenance">Maintenance Report</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scheduleProperty">Property (Optional)</Label>
                          <Select
                            value={scheduleForm.propertyId}
                            onValueChange={(value) => setScheduleForm(prev => ({ ...prev, propertyId: value }))}
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
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleScheduleReport}>
                          Create Schedule
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* View Report Tab */}
        <TabsContent value="view" className="space-y-6">
          {lastGeneratedReport && getCurrentReportData() ? (
            <ReportViewer
              reportType={lastGeneratedReport as 'financial' | 'occupancy' | 'maintenance'}
              reportData={getCurrentReportData()}
              isLoading={isLoading}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Report Generated</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Generate a report from the "Generate Report" tab to view it here.
                </p>
                <Button onClick={() => setActiveTab('generate')}>
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Scheduled Reports</span>
                  </CardTitle>
                  <CardDescription>
                    Manage automatic report generation and email delivery
                  </CardDescription>
                </div>
                <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>New Schedule</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Schedule Report</DialogTitle>
                      <DialogDescription>
                        Set up automatic report generation and email delivery
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="scheduleName">Schedule Name</Label>
                        <Input
                          id="scheduleName"
                          placeholder="e.g., Monthly Financial Report"
                          value={scheduleForm.name}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scheduleEmail">Email Address</Label>
                        <Input
                          id="scheduleEmail"
                          type="email"
                          placeholder="your@email.com"
                          value={scheduleForm.email}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scheduleFrequency">Frequency</Label>
                        <Select
                          value={scheduleForm.frequency}
                          onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'quarterly') =>
                            setScheduleForm(prev => ({ ...prev, frequency: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scheduleReportType">Report Type</Label>
                        <Select
                          value={scheduleForm.reportType}
                          onValueChange={(value: 'financial' | 'occupancy' | 'maintenance') =>
                            setScheduleForm(prev => ({ ...prev, reportType: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="financial">Financial Report</SelectItem>
                            <SelectItem value="occupancy">Occupancy Report</SelectItem>
                            <SelectItem value="maintenance">Maintenance Report</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scheduleProperty">Property (Optional)</Label>
                        <Select
                          value={scheduleForm.propertyId}
                          onValueChange={(value) => setScheduleForm(prev => ({ ...prev, propertyId: value }))}
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
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleScheduleReport}>
                        Create Schedule
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {scheduledReports && scheduledReports.length > 0 ? (
                <div className="space-y-4">
                  {scheduledReports.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getReportIcon(schedule.reportType)}
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{schedule.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{getReportTitle(schedule.reportType)}</span>
                            <span>•</span>
                            <span className="capitalize">{schedule.frequency}</span>
                            <span>•</span>
                            <span>{schedule.email}</span>
                            {schedule.propertyId && (
                              <>
                                <span>•</span>
                                <span>
                                  {properties.find(p => p.id === schedule.propertyId)?.name || 'Unknown Property'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={schedule.isActive ? "default" : "secondary"}>
                          {schedule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleScheduledReport(schedule.id, !schedule.isActive)}
                        >
                          {schedule.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteScheduledReport(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Scheduled Reports</h3>
                  <p className="text-muted-foreground mb-4">
                    Create scheduled reports to receive them automatically via email.
                  </p>
                  <Button onClick={() => setIsScheduleDialogOpen(true)}>
                    Create Schedule
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Report History</span>
              </CardTitle>
              <CardDescription>
                View and access previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportHistory.length > 0 ? (
                <div className="space-y-4">
                  {reportHistory.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        {getReportIcon(report.type)}
                        <div>
                          <h3 className="font-medium">{getReportTitle(report.type)}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Generated: {formatDateTime(report.generatedAt)}</span>
                            {report.filters.propertyId && (
                              <span>
                                Property: {properties.find(p => p.id === report.filters.propertyId)?.name || 'Unknown'}
                              </span>
                            )}
                            {report.filters.startDate && report.filters.endDate && (
                              <span>
                                Period: {formatDate(report.filters.startDate)} - {formatDate(report.filters.endDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {report.type}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Load the historical report data
                            setSelectedReportType(report.type as 'financial' | 'occupancy' | 'maintenance');
                            setActiveTab('view');
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Report History</h3>
                  <p className="text-muted-foreground">
                    Generated reports will appear here for easy access.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;