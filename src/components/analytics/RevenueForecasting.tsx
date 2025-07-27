import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { RevenueForecasting as RevenueForecastingData } from '../../services/financialAnalyticsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueForecastingProps {
  data: RevenueForecastingData;
  historicalData?: { month: string; revenue: number }[];
  className?: string;
}

const RevenueForecasting: React.FC<RevenueForecastingProps> = ({
  data,
  historicalData = [],
  className,
}) => {
  // Generate month labels for the forecast
  const generateMonthLabels = (count: number) => {
    const labels = [];
    const currentDate = new Date();
    
    for (let i = 1; i <= count; i++) {
      const futureDate = new Date(currentDate);
      futureDate.setMonth(currentDate.getMonth() + i);
      labels.push(futureDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }
    
    return labels;
  };

  const forecastLabels = generateMonthLabels(data.predictedRevenue.length);
  
  // Combine historical and forecast data for the chart
  const historicalLabels = historicalData.slice(-6).map(d => {
    const date = new Date(d.month + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  });
  
  const allLabels = [...historicalLabels, ...forecastLabels];
  const historicalRevenue = historicalData.slice(-6).map(d => d.revenue);
  const forecastRevenue = data.predictedRevenue;
  
  // Create chart data
  const chartData = {
    labels: allLabels,
    datasets: [
      {
        label: 'Historical Revenue',
        data: [...historicalRevenue, ...new Array(forecastRevenue.length).fill(null)],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      },
      {
        label: 'Forecasted Revenue',
        data: [...new Array(historicalRevenue.length).fill(null), ...forecastRevenue],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      },
      {
        label: 'Confidence Interval (Upper)',
        data: [
          ...new Array(historicalRevenue.length).fill(null),
          ...data.confidenceInterval.map(ci => ci.upper)
        ],
        borderColor: 'rgba(16, 185, 129, 0.3)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        fill: '+1',
        tension: 0.4,
      },
      {
        label: 'Confidence Interval (Lower)',
        data: [
          ...new Array(historicalRevenue.length).fill(null),
          ...data.confidenceInterval.map(ci => ci.lower)
        ],
        borderColor: 'rgba(16, 185, 129, 0.3)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          filter: (legendItem: any) => legendItem.text !== 'Confidence Interval (Upper)' && legendItem.text !== 'Confidence Interval (Lower)',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            if (context.datasetIndex === 2 || context.datasetIndex === 3) {
              return null; // Hide confidence interval tooltips
            }
            return `${context.dataset.label}: $${context.parsed.y?.toLocaleString() || 0}`;
          },
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
          text: 'Revenue ($)',
        },
        ticks: {
          callback: (value: any) => `$${value.toLocaleString()}`,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const getTrendIcon = () => {
    switch (data.trendDirection) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (data.trendDirection) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const averageForecast = data.predictedRevenue.reduce((sum, val) => sum + val, 0) / data.predictedRevenue.length;
  const totalForecast = data.predictedRevenue.reduce((sum, val) => sum + val, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Revenue Forecasting
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {data.trendDirection === 'up' ? 'Growing' : data.trendDirection === 'down' ? 'Declining' : 'Stable'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Forecast Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Avg Monthly Forecast</p>
                <p className="text-2xl font-bold text-blue-700">
                  ${averageForecast.toLocaleString()}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Forecast</p>
                <p className="text-2xl font-bold text-green-700">
                  ${totalForecast.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Forecast Accuracy</p>
                <p className="text-2xl font-bold text-purple-700">
                  {data.forecastAccuracy.toFixed(1)}%
                </p>
              </div>
              <Badge variant={data.forecastAccuracy > 80 ? 'default' : data.forecastAccuracy > 60 ? 'secondary' : 'destructive'}>
                {data.forecastAccuracy > 80 ? 'High' : data.forecastAccuracy > 60 ? 'Medium' : 'Low'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Seasonal Factors */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Seasonal Patterns</h4>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {data.seasonalFactors.map((factor, index) => {
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const isHigh = factor > 1.1;
              const isLow = factor < 0.9;
              
              return (
                <div
                  key={index}
                  className={`p-2 rounded text-center text-xs ${
                    isHigh ? 'bg-green-100 text-green-800' :
                    isLow ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="font-medium">{monthNames[index]}</div>
                  <div className="text-xs">{(factor * 100).toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-600">
            Seasonal factors show relative performance compared to average. 
            Green indicates above-average months, red indicates below-average months.
          </p>
        </div>

        {/* Forecast Details */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Next 6 Months Forecast</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.predictedRevenue.slice(0, 6).map((revenue, index) => {
              const confidence = data.confidenceInterval[index];
              const month = forecastLabels[index];
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{month}</p>
                    <p className="text-sm text-gray-600">
                      Range: ${confidence.lower.toLocaleString()} - ${confidence.upper.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">${revenue.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs">
                      ±{(((confidence.upper - confidence.lower) / 2 / revenue) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueForecasting;