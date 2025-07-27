import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Smartphone, CreditCard, Wallet } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  status: string;
  contract: {
    renter: {
      name: string;
      preferredPaymentMethod?: string;
    };
    room: {
      name: string;
      property: {
        name: string;
      };
    };
  };
}

interface VietnamesePaymentSelectorProps {
  payment: Payment;
  onPaymentMethodSelect: (method: 'ZALOPAY' | 'MOMO', paymentId: string) => void;
  loading?: boolean;
}

export const VietnamesePaymentSelector: React.FC<VietnamesePaymentSelectorProps> = ({
  payment,
  onPaymentMethodSelect,
  loading = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'ZALOPAY' | 'MOMO' | null>(
    payment.contract.renter.preferredPaymentMethod as 'ZALOPAY' | 'MOMO' || null
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount * 23000); // Convert USD to VND
  };

  const handlePaymentSelect = (method: 'ZALOPAY' | 'MOMO') => {
    setSelectedMethod(method);
    onPaymentMethodSelect(method, payment.id);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Chọn phương thức thanh toán
        </CardTitle>
        <div className="text-sm text-gray-600">
          <p><strong>Thuê phòng:</strong> {payment.contract.room.property.name} - {payment.contract.room.name}</p>
          <p><strong>Người thuê:</strong> {payment.contract.renter.name}</p>
          <p><strong>Số tiền:</strong> {formatCurrency(payment.amount)}</p>
          <p><strong>Hạn thanh toán:</strong> {new Date(payment.dueDate).toLocaleDateString('vi-VN')}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ZaloPay Option */}
        <div
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            selectedMethod === 'ZALOPAY'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedMethod('ZALOPAY')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">ZaloPay</h3>
                <p className="text-sm text-gray-600">Ví điện tử ZaloPay</p>
              </div>
            </div>
            <Badge variant={selectedMethod === 'ZALOPAY' ? 'default' : 'secondary'}>
              Phổ biến
            </Badge>
          </div>
        </div>

        {/* Momo Option */}
        <div
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            selectedMethod === 'MOMO'
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedMethod('MOMO')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Momo</h3>
                <p className="text-sm text-gray-600">Ví điện tử Momo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-gray-500" />
              <Badge variant={selectedMethod === 'MOMO' ? 'default' : 'secondary'}>
                QR Code
              </Badge>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <Button
          className="w-full"
          onClick={() => selectedMethod && handlePaymentSelect(selectedMethod)}
          disabled={!selectedMethod || loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang xử lý...
            </div>
          ) : (
            `Thanh toán với ${selectedMethod === 'ZALOPAY' ? 'ZaloPay' : 'Momo'}`
          )}
        </Button>

        {/* Payment Info */}
        <div className="text-xs text-gray-500 text-center">
          <p>Bằng cách tiếp tục, bạn đồng ý với điều khoản sử dụng</p>
          <p>Giao dịch được bảo mật và mã hóa</p>
        </div>
      </CardContent>
    </Card>
  );
};