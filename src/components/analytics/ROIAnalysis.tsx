import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Award, AlertTriangle, BarChart3 } from 'lucide-react';
import { ROIAnalysis as ROIAnalysisData } from '../../services/financialAnalyticsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ROIAnalysisProps {
  data: ROIAnalysisData;
  propertyNames?: Record<string, string>;
  className?: string;
}

const ROIAnalysis: React.FC<ROIAnalysisProps> = ({
  data,
  propertyNames = {},
  className,
}) => {
  // Prepare data for property ROI bar chart
  const propertyROIData = {
    labels: data.propertyROI.map(p => propertyNames[p.propertyId] || `Property ${p.propertyId.slice(-4)}`),
    datasets: [
      {
        label: 'ROI (%)',
        data: data.propertyROI.map(p => p.roi),
        backgroundColor: data.propertyROI.map(p => 
          p.roi > 15 ? 'rgba(34, 197, 94, 0.8)' :
          p.roi > 5 ? 'rgba(59, 130, 246, 0.8)' :
          p.roi > 0 ? 'rgba(251, 191, 36, 0.8)' :
          'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: data.propertyROI.map(p => 
          p.roi > 15 ? 'rgb(34, 197, 94)' :
          p.roi > 5 ? 'rgb(59, 130, 246)' :
          p.roi > 0 ? 'rgb(251, 191, 36)' :
          'rgb(239, 68, 68)'
        ),
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for ROI trend line chart
  const roiTrendData = {
    labels: Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 11 + i);
      return date.toLocaleDateString('en-US', { month: 'short' });
    }),
    datasets: [
      {
        label: 'Overall ROI Trend (%)',
        data: data.roiTrend,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const property = data.propertyROI[context.dataIndex];
            return [
              `ROI: ${context.parsed.y.toFixed(2)}%`,
              `Investment: $${property.investment.toLocaleString()}`,
              `Returns: $${property.returns.toLocaleString()}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Properties',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'ROI (%)',
        },
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `ROI: ${context.parsed.y.toFixed(2)}%`,
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'ROI (%)',
        },
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  const getROIBadgeVariant = (roi: number) => {
    if (roi > 15) return 'default';
    if (roi > 5) return 'secondary';
    if (roi > 0) return 'outline';
    return 'destructive';
  };

  const getROILabel = (roi: number) => {
    if (roi > 15) return 'Excellent';
    if (roi > 5) return 'Good';
    if (roi > 0) return 'Fair';
    return 'Poor';
  };

  const bestProperty = data.propertyROI.find(p => p.propertyId === data.bestPerformingProperty);
  const worstProperty = data.propertyROI.find(p => p.propertyId === data.worstPerformingProperty);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          ROI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall ROI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Overall ROI</p>
                <p className="text-2xl font-bold text-blue-700">
                  {data.overallROI.toFixed(2)}%
                </p>
              </div>
              <Badge variant={getROIBadgeVariant(data.overallROI)}>
                {getROILabel(data.overallROI)}
              </Badge>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Best Performer</p>
                <p className="text-lg font-bold text-green-700">
                  {propertyNames[data.bestPerformingProperty] || `Property ${data.bestPerformingProperty.slice(-4)}`}
                </p>
                <p className="text-sm text-green-600">
                  {bestProperty?.roi.toFixed(2)}% ROI
                </p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Needs Attention</p>
                <p className="text-lg font-bold text-red-700">
                  {propertyNames[data.worstPerformingProperty] || `Property ${data.worstPerformingProperty.slice(-4)}`}
                </p>
                <p className="text-sm text-red-600">
                  {worstProperty?.roi.toFixed(2)}% ROI
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Property ROI Comparison */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Property ROI Comparison</h4>
          <div className="h-64">
            <Bar data={propertyROIData} options={barChartOptions} />
          </div>
        </div>

        {/* ROI Trend */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">ROI Trend (Last 12 Months)</h4>
          <div className="h-64">
            <Line data={roiTrendData} options={lineChartOptions} />
          </div>
        </div>

        {/* Detailed Property Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Property Performance Details</h4>
          <div className="space-y-3">
            {data.propertyROI
              .sort((a, b) => b.roi - a.roi)
              .map((property, index) => (
                <div key={property.propertyId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      property.roi > 15 ? 'bg-green-500' :
                      property.roi > 5 ? 'bg-blue-500' :
                      property.roi > 0 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium">
                        {propertyNames[property.propertyId] || `Property ${property.propertyId.slice(-4)}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Investment: ${property.investment.toLocaleString()} | 
                        Returns: ${property.returns.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-semibold ${
                        property.roi > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {property.roi.toFixed(2)}%
                      </span>
                      {property.roi > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <Badge variant={getROIBadgeVariant(property.roi)} className="text-xs">
                      {getROILabel(property.roi)}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ROI Insights */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">ROI Insights</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              • Your overall portfolio ROI of {data.overallROI.toFixed(2)}% is{' '}
              {data.overallROI > 10 ? 'excellent' : data.overallROI > 5 ? 'good' : 'below average'} 
              {' '}for real estate investments.
            </p>
            <p>
              • {data.propertyROI.filter(p => p.roi > 10).length} out of {data.propertyROI.length} properties 
              are generating strong returns (>10% ROI).
            </p>
            {worstProperty && worstProperty.roi < 0 && (
              <p>
                • Consider reviewing the strategy for {propertyNames[data.worstPerformingProperty] || 'your underperforming property'} 
                as it's currently generating negative returns.
              </p>
            )}
            <p>
              • Focus on replicating the success factors from your best-performing property 
              ({propertyNames[data.bestPerformingProperty] || 'top performer'}) across your portfolio.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ROIAnalysis;