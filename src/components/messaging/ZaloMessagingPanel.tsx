import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send, Users, Template, Phone } from 'lucide-react';

interface Renter {
  id: string;
  name: string;
  phone: string;
  zaloPhone?: string;
  zaloUserId?: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
}

interface ZaloMessagingPanelProps {
  renters: Renter[];
  onSendMessage: (recipients: string[], message: string, templateId?: string) => Promise<void>;
}

export const ZaloMessagingPanel: React.FC<ZaloMessagingPanelProps> = ({
  renters,
  onSendMessage,
}) => {
  const [selectedRenters, setSelectedRenters] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [loading, setSending] = useState(false);
  const [messageType, setMessageType] = useState<'custom' | 'template'>('custom');

  // Mock templates - in real app, fetch from API
  const templates: MessageTemplate[] = [
    {
      id: 'payment_reminder',
      name: 'Nhắc nhở thanh toán',
      content: 'Xin chào {tenant_name}, tiền thuê phòng {room_name} đến hạn thanh toán vào {due_date}. Số tiền: {amount}. Vui lòng thanh toán đúng hạn.',
      variables: ['tenant_name', 'room_name', 'due_date', 'amount']
    },
    {
      id: 'maintenance_update',
      name: 'Cập nhật bảo trì',
      content: 'Xin chào {tenant_name}, yêu cầu bảo trì #{request_id} đã được {status}. Chi tiết: {details}',
      variables: ['tenant_name', 'request_id', 'status', 'details']
    },
    {
      id: 'lease_renewal',
      name: 'Gia hạn hợp đồng',
      content: 'Xin chào {tenant_name}, hợp đồng thuê phòng {room_name} sẽ hết hạn vào {expiry_date}. Vui lòng liên hệ để gia hạn.',
      variables: ['tenant_name', 'room_name', 'expiry_date']
    }
  ];

  const zaloEnabledRenters = renters.filter(r => r.zaloPhone || r.zaloUserId);

  const handleRenterSelect = (renterId: string) => {
    setSelectedRenters(prev => 
      prev.includes(renterId) 
        ? prev.filter(id => id !== renterId)
        : [...prev, renterId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRenters.length === zaloEnabledRenters.length) {
      setSelectedRenters([]);
    } else {
      setSelectedRenters(zaloEnabledRenters.map(r => r.id));
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMessage(template.content);
      // Reset template variables
      const variables: Record<string, string> = {};
      template.variables.forEach(variable => {
        variables[variable] = '';
      });
      setTemplateVariables(variables);
    }
  };

  const processMessage = () => {
    let processedMessage = message;
    
    if (messageType === 'template' && selectedTemplate) {
      // Replace template variables
      Object.entries(templateVariables).forEach(([key, value]) => {
        processedMessage = processedMessage.replace(`{${key}}`, value);
      });
    }
    
    return processedMessage;
  };

  const handleSendMessage = async () => {
    if (!selectedRenters.length || !message.trim()) return;

    setSending(true);
    try {
      const processedMessage = processMessage();
      await onSendMessage(
        selectedRenters, 
        processedMessage, 
        messageType === 'template' ? selectedTemplate : undefined
      );
      
      // Reset form
      setMessage('');
      setSelectedRenters([]);
      setSelectedTemplate('');
      setTemplateVariables({});
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const selectedTemplate_obj = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recipients Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Chọn người nhận ({selectedRenters.length}/{zaloEnabledRenters.length})
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSelectAll}
            className="w-fit"
          >
            {selectedRenters.length === zaloEnabledRenters.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {zaloEnabledRenters.map(renter => (
              <div
                key={renter.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedRenters.includes(renter.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleRenterSelect(renter.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{renter.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      {renter.zaloPhone || renter.phone}
                    </div>
                  </div>
                </div>
                {renter.zaloUserId && (
                  <Badge variant="secondary" className="text-xs">
                    Đã kết nối
                  </Badge>
                )}
              </div>
            ))}
            
            {zaloEnabledRenters.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có người thuê nào kết nối Zalo</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Template className="h-5 w-5" />
            Soạn tin nhắn
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={messageType === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('custom')}
            >
              Tin nhắn tự do
            </Button>
            <Button
              variant={messageType === 'template' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('template')}
            >
              Sử dụng mẫu
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {messageType === 'template' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Chọn mẫu tin nhắn</label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mẫu tin nhắn..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {messageType === 'template' && selectedTemplate_obj && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Điền thông tin:</label>
              {selectedTemplate_obj.variables.map(variable => (
                <div key={variable}>
                  <label className="text-xs text-gray-600 mb-1 block">
                    {variable.replace('_', ' ').toUpperCase()}
                  </label>
                  <Input
                    placeholder={`Nhập ${variable.replace('_', ' ')}`}
                    value={templateVariables[variable] || ''}
                    onChange={(e) => setTemplateVariables(prev => ({
                      ...prev,
                      [variable]: e.target.value
                    }))}
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Nội dung tin nhắn</label>
            <Textarea
              placeholder="Nhập nội dung tin nhắn..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {message.length}/1000 ký tự
            </div>
          </div>

          {messageType === 'template' && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Xem trước:
              </label>
              <p className="text-sm">{processMessage()}</p>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleSendMessage}
            disabled={!selectedRenters.length || !message.trim() || loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang gửi...
              </div>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Gửi tin nhắn ({selectedRenters.length})
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};