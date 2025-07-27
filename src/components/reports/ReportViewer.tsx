import React, { useState, useRef } from 'react';
import { 
  Download, 
  Share2, 
  Printer, 
  FileText, 
  Calendar,
  Building,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Wrench,
  Eye,
  Mail,
  Link,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useReportStore } from '../../stores/reportStore';
import { FinancialReport, OccupancyReport, MaintenanceReport } from '../../utils/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import { useToast } from '../../hooks/use-toast';

interface ReportViewerProps {
  reportType: 'financial' | 'occupancy' | 'maintenance';
  reportData: FinancialReport | OccupancyReport | MaintenanceReport | null;
  isLoading?: boolean;
  onExport?: (format: 'pdf' | 'csv') => void;
  onShare?: (method: 'email' | 'link') => void;
  onPrint?: () => void;
  className?: string;
}

const ReportViewer: React.FC<ReportViewerProps> = ({
  reportType,
  reportData,
  isLoading = false,
  onExport,
  onShare,
  onPrint,
  className = '',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { exportReportAsCSV } = useReportStore();

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      setIsExporting(true);
      
      if (format === 'csv') {
        const blob = await exportReportAsCSV(reportType);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Export Successful",
          description: `${reportType} report exported as CSV`,
        });
      } else if (format === 'pdf') {
        // For PDF export, we'll use the browser's print functionality
        handlePrint();
      }
      
      if (onExport) {
        onExport(format);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${getReportTitle()} - ${new Date().toLocaleDateString()}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ccc; padding-bottom: 20px; }
                .print-content { margin: 0; }
                .card { border: 1px solid #ddd; margin-bottom: 20px; padding: 15px; border-radius: 8px; }
                .card-header { margin-bottom: 15px; }
                .card-title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                .card-description { color: #666; font-size: 14px; }
                .grid { display: grid; gap: 15px; }
                .grid-cols-2 { grid-template-columns: 1fr 1fr; }
                .grid-cols-3 { grid-template-columns: 1fr 1fr 1fr; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .text-lg { font-size: 18px; }
                .text-sm { font-size: 14px; }
                .text-muted { color: #666; }
                .mb-4 { margin-bottom: 16px; }
                .mt-4 { margin-top: 16px; }
                .p-4 { padding: 16px; }
                .border { border: 1px solid #ddd; }
                .rounded { border-radius: 8px; }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="print-header">
                <h1>${getReportTitle()}</h1>
                <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              </div>
              <div class="print-content">${printContent}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
    
    if (onPrint) {
      onPrint();
    }
  };

  const handleShare = async (method: 'email' | 'link') => {
    try {
      if (method === 'link') {
        // Generate a shareable link (in a real app, this would be a backend endpoint)
        const shareableUrl = `${window.location.origin}/reports/shared/${reportType}/${Date.now()}`;
        setShareUrl(shareableUrl);
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareableUrl);
        toast({
          title: "Link Copied",
          description: "Shareable link copied to clipboard",
        });
      } else if (method === 'email') {
        const subject = `${getReportTitle()} - ${new Date().toLocaleDateString()}`;
        const body = `Please find the ${reportType} report attached.\n\nGenerated on: ${new Date().toLocaleString()}`;
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoUrl);
      }
      
      if (onShare) {
        onShare(method);
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Share Failed",
        description: "Failed to share report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
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

  const getReportIcon = () => {
    switch (reportType) {
      case 'financial':
        return <DollarSign className="h-5 w-5" />;
      case 'occupancy':
        return <Building className="h-5 w-5" />;
      case 'maintenance':
        return <Wrench className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number | string) => {
    if (typeof percentage === 'string') {
      return percentage.includes('%') ? percentage : `${percentage}%`;
    }
    return `${percentage.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Eye className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Report Data</h3>
            <p className="text-muted-foreground text-center">
              Generate a report to view the results here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Report Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getReportIcon()}
          <div>
            <h2 className="text-2xl font-bold">{getReportTitle()}</h2>
            <p className="text-muted-foreground">
              Generated on {formatDate(reportData.generatedAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Share Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleShare('link')}>
                <Link className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('email')}>
                <Mail className="h-4 w-4 mr-2" />
                Share via Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Print Button */}
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Report Period */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Report Period:</span>
            </div>
            <div className="text-sm">
              {formatDate(reportData.period.startDate)} - {formatDate(reportData.period.endDate)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Printable Content */}
      <div ref={printRef}>
        {reportType === 'financial' && (
          <FinancialReportContent reportData={reportData as FinancialReport} />
        )}
        {reportType === 'occupancy' && (
          <OccupancyReportContent reportData={reportData as OccupancyReport} />
        )}
        {reportType === 'maintenance' && (
          <MaintenanceReportContent reportData={reportData as MaintenanceReport} />
        )}
      </div>
    </div>
  );
};

// Financial Report Content Component
const FinancialReportContent: React.FC<{ reportData: FinancialReport }> = ({ reportData }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(reportData.summary.totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(reportData.summary.totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${reportData.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(reportData.summary.netProfit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${reportData.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {reportData.summary.profitMargin}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Income by Property</CardTitle>
          <CardDescription>Revenue breakdown by property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.incomeBreakdown.map((property, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{property.propertyName}</div>
                  <div className="text-sm text-muted-foreground">
                    {property.paymentCount} payments
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {formatCurrency(property.totalIncome)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>Cost breakdown by expense category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.expenseBreakdown.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium capitalize">{category.category.toLowerCase()}</div>
                  <div className="text-sm text-muted-foreground">
                    {category.count} expenses
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-red-600">
                    {formatCurrency(category.totalAmount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Occupancy Report Content Component
const OccupancyReportContent: React.FC<{ reportData: OccupancyReport }> = ({ reportData }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.summary.totalRooms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reportData.summary.occupiedRooms}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacant Rooms</CardTitle>
            <Building className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {reportData.summary.vacantRooms}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.summary.occupancyRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy by Property */}
      <Card>
        <CardHeader>
          <CardTitle>Occupancy by Property</CardTitle>
          <CardDescription>Detailed occupancy breakdown by property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.occupancyByProperty.map((property, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{property.propertyName}</h3>
                  <Badge variant={parseFloat(property.occupancyRate) >= 80 ? 'default' : 'secondary'}>
                    {property.occupancyRate} occupied
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">Total Rooms:</span>
                    <div className="font-medium">{property.totalRooms}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Occupied:</span>
                    <div className="font-medium text-green-600">{property.occupiedRooms}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vacant:</span>
                    <div className="font-medium text-red-600">{property.vacantRooms}</div>
                  </div>
                </div>
                
                <Progress 
                  value={parseFloat(property.occupancyRate)} 
                  className="h-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Maintenance Report Content Component
const MaintenanceReportContent: React.FC<{ reportData: MaintenanceReport }> = ({ reportData }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.summary.totalRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reportData.summary.completedRequests}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.summary.completionRate}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.summary.avgResolutionTimeDays} days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Requests by Category</CardTitle>
          <CardDescription>Maintenance request breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.requestsByCategory.map((category, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium capitalize">{category.category.toLowerCase()}</h3>
                  <div className="text-sm text-muted-foreground">
                    {category.total} total requests
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Completed:</span>
                    <div className="font-medium text-green-600">{category.completed}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">In Progress:</span>
                    <div className="font-medium text-blue-600">{category.inProgress}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pending:</span>
                    <div className="font-medium text-yellow-600">{category.pending}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requests by Priority */}
      <Card>
        <CardHeader>
          <CardTitle>Requests by Priority</CardTitle>
          <CardDescription>Priority distribution of maintenance requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData.requestsByPriority.map((priority, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={
                      priority.priority === 'URGENT' ? 'destructive' :
                      priority.priority === 'HIGH' ? 'default' :
                      priority.priority === 'MEDIUM' ? 'secondary' : 'outline'
                    }
                  >
                    {priority.priority}
                  </Badge>
                </div>
                <div className="font-semibold">{priority.count} requests</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportViewer;