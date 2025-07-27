import React from 'react';
import ReportViewer from './ReportViewer';
import { FinancialReport } from '../../utils/apiClient';

// Example usage of ReportViewer component
const ReportViewerExample: React.FC = () => {
  const sampleFinancialReport: FinancialReport = {
    summary: {
      totalIncome: 15000,
      totalExpenses: 8000,
      netProfit: 7000,
      profitMargin: '46.7%',
    },
    incomeBreakdown: [
      {
        propertyId: '1',
        propertyName: 'Downtown Apartment Complex',
        totalIncome: 10000,
        paymentCount: 8,
      },
      {
        propertyId: '2',
        propertyName: 'Suburban House',
        totalIncome: 5000,
        paymentCount: 3,
      },
    ],
    expenseBreakdown: [
      {
        category: 'MAINTENANCE',
        totalAmount: 3500,
        count: 5,
      },
      {
        category: 'UTILITIES',
        totalAmount: 2500,
        count: 4,
      },
      {
        category: 'INSURANCE',
        totalAmount: 2000,
        count: 2,
      },
    ],
    period: {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    },
    generatedAt: '2024-01-31T15:30:00Z',
  };

  const handleExport = (format: 'pdf' | 'csv') => {
    console.log(`Exporting report as ${format}`);
  };

  const handleShare = (method: 'email' | 'link') => {
    console.log(`Sharing report via ${method}`);
  };

  const handlePrint = () => {
    console.log('Printing report');
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Report Viewer Example</h1>
      
      <div className="space-y-8">
        {/* Financial Report Example */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Financial Report</h2>
          <ReportViewer
            reportType="financial"
            reportData={sampleFinancialReport}
            onExport={handleExport}
            onShare={handleShare}
            onPrint={handlePrint}
          />
        </div>

        {/* Loading State Example */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Loading State</h2>
          <ReportViewer
            reportType="financial"
            reportData={null}
            isLoading={true}
          />
        </div>

        {/* No Data State Example */}
        <div>
          <h2 className="text-xl font-semibold mb-4">No Data State</h2>
          <ReportViewer
            reportType="financial"
            reportData={null}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportViewerExample;