import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface PaymentStatusTrackerProps {
  paymentId: string;
  method: 'ZALOPAY' | 'MOMO';
  initialStatus: string;
  paymentUrl?: string;
  qrCodeUrl?: string;
  onStatusUpdate?: (status: string) => void;
}

export const PaymentStatusTracker: React.FC<PaymentStatusTrackerProps> = ({
  paymentId,
  method,
  initialStatus,
  paymentUrl,
  qrCodeUrl,
  onStatusUpdate,
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkPaymentStatus = async () => {
    setLoading(true);
    try {
      const endpoint = method === 'ZALOPAY' 
        ? `/api/v1/payments/zalopay/status/${paymentId}`
        : `/api/v1/payments/momo/status/${paymentId}`;
      
      const response = await fetch(endpoint);
      const result = await response.json();
      
      if (result.status === 'success') {
        const newStatus = result.data.paymentStatus;
        setStatus(newStatus);
        setLastChecked(new Date());
        onStatusUpdate?.(newStatus);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 10 seconds for pending payments
  useEffect(() => {
    if (status === 'PENDING') {
      const interval = setInterval(checkPaymentStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const getStatusIcon = () => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'FAILED':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Đang chờ</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Thất bại</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'PAID':
        return 'Thanh toán đã được xử lý thành công. Cảm ơn bạn!';
      case 'PENDING':
        return 'Đang chờ xác nhận thanh toán. Vui lòng hoàn tất giao dịch.';
      case 'FAILED':
        return 'Thanh toán không thành công. Vui lòng thử lại.';
      default:
        return 'Đang kiểm tra trạng thái thanh toán...';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            Trạng thái thanh toán
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Message */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            {getStatusMessage()}
          </p>
        </div>

        {/* Payment Method Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Phương thức:</span>
            <span className="font-medium">
              {method === 'ZALOPAY' ? 'ZaloPay' : 'Momo'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Mã giao dịch:</span>
            <span className="font-mono text-xs">{paymentId}</span>
          </div>
          {lastChecked && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Cập nhật lần cuối:</span>
              <span className="text-xs">{lastChecked.toLocaleTimeString('vi-VN')}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {status === 'PENDING' && paymentUrl && (
            <Button 
              className="w-full" 
              onClick={() => window.open(paymentUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Tiếp tục thanh toán
            </Button>
          )}

          {status === 'PENDING' && qrCodeUrl && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Hoặc quét mã QR:</p>
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="mx-auto w-32 h-32 border rounded-lg"
              />
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={checkPaymentStatus}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Kiểm tra lại
          </Button>
        </div>

        {/* Auto-refresh indicator */}
        {status === 'PENDING' && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Tự động kiểm tra mỗi 10 giây
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};