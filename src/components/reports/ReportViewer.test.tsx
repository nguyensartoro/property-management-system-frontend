import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ReportViewer from './ReportViewer';
import { FinancialReport, OccupancyReport, MaintenanceReport } from '../../utils/apiClient';

// Mock the toast hook
vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the report store
vi.mock('../../stores/reportStore', () => ({
  useReportStore: () => ({
    exportReportAsCSV: vi.fn().mockResolvedValue(new Blob(['test'], { type: 'text/csv' })),
  }),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock window.open
global.open = vi.fn();

const mockFinancialReport: FinancialReport = {
  summary: {
    totalIncome: 10000,
    totalExpenses: 6000,
    netProfit: 4000,
    profitMargin: '40%',
  },
  incomeBreakdown: [
    {
      propertyId: '1',
      propertyName: 'Test Property',
      totalIncome: 10000,
      paymentCount: 5,
    },
  ],
  expenseBreakdown: [
    {
      category: 'MAINTENANCE',
      totalAmount: 3000,
      count: 3,
    },
    {
      category: 'UTILITIES',
      totalAmount: 3000,
      count: 2,
    },
  ],
  period: {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  },
  generatedAt: '2024-01-31T12:00:00Z',
};

const mockOccupancyReport: OccupancyReport = {
  summary: {
    totalRooms: 10,
    occupiedRooms: 8,
    vacantRooms: 2,
    occupancyRate: 80,
  },
  occupancyByProperty: [
    {
      propertyId: '1',
      propertyName: 'Test Property',
      totalRooms: 10,
      occupiedRooms: 8,
      vacantRooms: 2,
      occupancyRate: '80%',
    },
  ],
  contractHistory: [],
  period: {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  },
  generatedAt: '2024-01-31T12:00:00Z',
};

const mockMaintenanceReport: MaintenanceReport = {
  summary: {
    totalRequests: 15,
    completedRequests: 10,
    pendingRequests: 3,
    inProgressRequests: 2,
    completionRate: '66.7%',
    avgResolutionTimeDays: '3.5',
  },
  requestsByCategory: [
    {
      category: 'PLUMBING',
      total: 8,
      completed: 6,
      pending: 1,
      inProgress: 1,
    },
    {
      category: 'ELECTRICAL',
      total: 7,
      completed: 4,
      pending: 2,
      inProgress: 1,
    },
  ],
  requestsByPriority: [
    {
      priority: 'HIGH',
      count: 5,
    },
    {
      priority: 'MEDIUM',
      count: 8,
    },
    {
      priority: 'LOW',
      count: 2,
    },
  ],
  recentRequests: [],
  period: {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  },
  generatedAt: '2024-01-31T12:00:00Z',
};

describe('ReportViewer', () => {
  it('renders loading state correctly', () => {
    render(
      <ReportViewer
        reportType="financial"
        reportData={null}
        isLoading={true}
      />
    );

    expect(screen.getByTestId('loading-skeleton') || document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders no data state correctly', () => {
    render(
      <ReportViewer
        reportType="financial"
        reportData={null}
        isLoading={false}
      />
    );

    expect(screen.getByText('No Report Data')).toBeInTheDocument();
    expect(screen.getByText('Generate a report to view the results here.')).toBeInTheDocument();
  });

  it('renders financial report correctly', () => {
    render(
      <ReportViewer
        reportType="financial"
        reportData={mockFinancialReport}
        isLoading={false}
      />
    );

    expect(screen.getByText('Financial Report')).toBeInTheDocument();
    expect(screen.getByText('$10,000')).toBeInTheDocument(); // Total Income
    expect(screen.getByText('$6,000')).toBeInTheDocument(); // Total Expenses
    expect(screen.getByText('$4,000')).toBeInTheDocument(); // Net Profit
    expect(screen.getByText('40%')).toBeInTheDocument(); // Profit Margin
    expect(screen.getByText('Test Property')).toBeInTheDocument();
  });

  it('renders occupancy report correctly', () => {
    render(
      <ReportViewer
        reportType="occupancy"
        reportData={mockOccupancyReport}
        isLoading={false}
      />
    );

    expect(screen.getByText('Occupancy Report')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Total Rooms
    expect(screen.getByText('8')).toBeInTheDocument(); // Occupied Rooms
    expect(screen.getByText('2')).toBeInTheDocument(); // Vacant Rooms
    expect(screen.getByText('80.0%')).toBeInTheDocument(); // Occupancy Rate
  });

  it('renders maintenance report correctly', () => {
    render(
      <ReportViewer
        reportType="maintenance"
        reportData={mockMaintenanceReport}
        isLoading={false}
      />
    );

    expect(screen.getByText('Maintenance Report')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // Total Requests
    expect(screen.getByText('10')).toBeInTheDocument(); // Completed Requests
    expect(screen.getByText('66.7%')).toBeInTheDocument(); // Completion Rate
    expect(screen.getByText('3.5 days')).toBeInTheDocument(); // Avg Resolution
  });

  it('handles export functionality', async () => {
    const onExport = vi.fn();
    
    render(
      <ReportViewer
        reportType="financial"
        reportData={mockFinancialReport}
        onExport={onExport}
      />
    );

    // Click export button
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    // Click CSV export option
    const csvOption = screen.getByText('Export as CSV');
    fireEvent.click(csvOption);

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledWith('csv');
    });
  });

  it('handles share functionality', async () => {
    const onShare = vi.fn();
    
    render(
      <ReportViewer
        reportType="financial"
        reportData={mockFinancialReport}
        onShare={onShare}
      />
    );

    // Click share button
    const shareButton = screen.getByText('Share');
    fireEvent.click(shareButton);

    // Click copy link option
    const linkOption = screen.getByText('Copy Link');
    fireEvent.click(linkOption);

    await waitFor(() => {
      expect(onShare).toHaveBeenCalledWith('link');
    });
  });

  it('handles print functionality', () => {
    const onPrint = vi.fn();
    
    render(
      <ReportViewer
        reportType="financial"
        reportData={mockFinancialReport}
        onPrint={onPrint}
      />
    );

    // Click print button
    const printButton = screen.getByText('Print');
    fireEvent.click(printButton);

    expect(onPrint).toHaveBeenCalled();
  });

  it('displays correct report period', () => {
    render(
      <ReportViewer
        reportType="financial"
        reportData={mockFinancialReport}
      />
    );

    expect(screen.getByText('January 1, 2024 - January 31, 2024')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ReportViewer
        reportType="financial"
        reportData={mockFinancialReport}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});