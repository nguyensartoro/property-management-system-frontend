import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Wallet, 
  Smartphone, 
  MessageCircle, 
  TestTube, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';

interface PaymentConfig {
  zalopay: {
    enabled: boolean;
    appId: string;
    key1: string;
    key2: string;
    endpoint: string;
    callbackUrl: string;
    redirectUrl: string;
  };
  momo: {
    enabled: boolean;
    partnerCode: string;
    accessKey: string;
    secretKey: string;
    endpoint: string;
    redirectUrl: string;
    ipnUrl: string;
  };
  zalo: {
    enabled: boolean;
    appId: string;
    appSecret: string;
    accessToken: string;
    endpoint: string;
  };
  general: {
    usdToVndRate: number;
    testMode: boolean;
  };
}

interface TestResult {
  service: string;
  status: 'success' | 'error' | 'pending';
  message: string;
}

export const VietnamesePaymentSettings: React.FC = () => {
  const [config, setConfig] = useState<PaymentConfig>({
    zalopay: {
      enabled: false,
      appId: '',
      key1: '',
      key2: '',
      endpoint: 'https://sb-openapi.zalopay.vn',
      callbackUrl: '',
      redirectUrl: '',
    },
    momo: {
      enabled: false,
      partnerCode: '',
      accessKey: '',
      secretKey: '',
      endpoint: 'https://test-payment.momo.vn',
      redirectUrl: '',
      ipnUrl: '',
    },
    zalo: {
      enabled: false,
      appId: '',
      appSecret: '',
      accessToken: '',
      endpoint: 'https://openapi.zalo.me',
    },
    general: {
      usdToVndRate: 23000,
      testMode: true,
    },
  });

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleConfigChange = (section: keyof PaymentConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const runConnectionTests = async () => {
    setTesting(true);
    setTestResults([]);

    const tests = [
      { service: 'ZaloPay', enabled: config.zalopay.enabled },
      { service: 'Momo', enabled: config.momo.enabled },
      { service: 'Zalo', enabled: config.zalo.enabled },
    ];

    for (const test of tests) {
      if (!test.enabled) continue;

      setTestResults(prev => [...prev, {
        service: test.service,
        status: 'pending',
        message: 'Đang kiểm tra kết nối...'
      }]);

      try {
        // Mock API call - replace with actual test endpoint
        const response = await fetch('/api/v1/test/vietnamese-payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: test.service.toLowerCase(),
            config: config[test.service.toLowerCase() as keyof PaymentConfig]
          })
        });

        const result = await response.json();
        
        setTestResults(prev => prev.map(r => 
          r.service === test.service 
            ? {
                ...r,
                status: result.success ? 'success' : 'error',
                message: result.message || (result.success ? 'Kết nối thành công' : 'Kết nối thất bại')
              }
            : r
        ));
      } catch (error) {
        setTestResults(prev => prev.map(r => 
          r.service === test.service 
            ? {
                ...r,
                status: 'error',
                message: 'Lỗi kết nối'
              }
            : r
        ));
      }

      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setTesting(false);
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/v1/settings/vietnamese-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        // Show success message
        console.log('Configuration saved successfully');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cấu hình thanh toán Việt Nam</h2>
          <p className="text-gray-600">Thiết lập ZaloPay, Momo và Zalo messaging</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runConnectionTests} disabled={testing}>
            <TestTube className="h-4 w-4 mr-2" />
            {testing ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
          </Button>
          <Button onClick={saveConfiguration} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </Button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Kết quả kiểm tra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {result.status === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    {result.status === 'pending' && (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    <span className="font-medium">{result.service}</span>
                  </div>
                  <span className="text-sm text-gray-600">{result.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            Chung
          </TabsTrigger>
          <TabsTrigger value="zalopay">
            <Wallet className="h-4 w-4 mr-2" />
            ZaloPay
          </TabsTrigger>
          <TabsTrigger value="momo">
            <Smartphone className="h-4 w-4 mr-2" />
            Momo
          </TabsTrigger>
          <TabsTrigger value="zalo">
            <MessageCircle className="h-4 w-4 mr-2" />
            Zalo
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usdToVndRate">Tỷ giá USD/VND</Label>
                  <Input
                    id="usdToVndRate"
                    type="number"
                    value={config.general.usdToVndRate}
                    onChange={(e) => handleConfigChange('general', 'usdToVndRate', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tỷ giá chuyển đổi từ USD sang VND
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="testMode"
                    checked={config.general.testMode}
                    onCheckedChange={(checked) => handleConfigChange('general', 'testMode', checked)}
                  />
                  <Label htmlFor="testMode">Chế độ thử nghiệm</Label>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Trong chế độ thử nghiệm, tất cả giao dịch sẽ sử dụng sandbox endpoints.
                  Tắt chế độ này khi triển khai production.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ZaloPay Settings */}
        <TabsContent value="zalopay">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Cấu hình ZaloPay
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.zalopay.enabled}
                    onCheckedChange={(checked) => handleConfigChange('zalopay', 'enabled', checked)}
                  />
                  <Badge variant={config.zalopay.enabled ? 'default' : 'secondary'}>
                    {config.zalopay.enabled ? 'Bật' : 'Tắt'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zalopay-appId">App ID</Label>
                  <Input
                    id="zalopay-appId"
                    value={config.zalopay.appId}
                    onChange={(e) => handleConfigChange('zalopay', 'appId', e.target.value)}
                    disabled={!config.zalopay.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="zalopay-endpoint">Endpoint</Label>
                  <Input
                    id="zalopay-endpoint"
                    value={config.zalopay.endpoint}
                    onChange={(e) => handleConfigChange('zalopay', 'endpoint', e.target.value)}
                    disabled={!config.zalopay.enabled}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zalopay-key1">Key 1</Label>
                  <div className="relative">
                    <Input
                      id="zalopay-key1"
                      type={showSecrets['zalopay-key1'] ? 'text' : 'password'}
                      value={config.zalopay.key1}
                      onChange={(e) => handleConfigChange('zalopay', 'key1', e.target.value)}
                      disabled={!config.zalopay.enabled}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility('zalopay-key1')}
                    >
                      {showSecrets['zalopay-key1'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="zalopay-key2">Key 2</Label>
                  <div className="relative">
                    <Input
                      id="zalopay-key2"
                      type={showSecrets['zalopay-key2'] ? 'text' : 'password'}
                      value={config.zalopay.key2}
                      onChange={(e) => handleConfigChange('zalopay', 'key2', e.target.value)}
                      disabled={!config.zalopay.enabled}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility('zalopay-key2')}
                    >
                      {showSecrets['zalopay-key2'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zalopay-callback">Callback URL</Label>
                  <Input
                    id="zalopay-callback"
                    value={config.zalopay.callbackUrl}
                    onChange={(e) => handleConfigChange('zalopay', 'callbackUrl', e.target.value)}
                    disabled={!config.zalopay.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="zalopay-redirect">Redirect URL</Label>
                  <Input
                    id="zalopay-redirect"
                    value={config.zalopay.redirectUrl}
                    onChange={(e) => handleConfigChange('zalopay', 'redirectUrl', e.target.value)}
                    disabled={!config.zalopay.enabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Momo Settings */}
        <TabsContent value="momo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Cấu hình Momo
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.momo.enabled}
                    onCheckedChange={(checked) => handleConfigChange('momo', 'enabled', checked)}
                  />
                  <Badge variant={config.momo.enabled ? 'default' : 'secondary'}>
                    {config.momo.enabled ? 'Bật' : 'Tắt'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="momo-partnerCode">Partner Code</Label>
                  <Input
                    id="momo-partnerCode"
                    value={config.momo.partnerCode}
                    onChange={(e) => handleConfigChange('momo', 'partnerCode', e.target.value)}
                    disabled={!config.momo.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="momo-endpoint">Endpoint</Label>
                  <Input
                    id="momo-endpoint"
                    value={config.momo.endpoint}
                    onChange={(e) => handleConfigChange('momo', 'endpoint', e.target.value)}
                    disabled={!config.momo.enabled}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="momo-accessKey">Access Key</Label>
                  <div className="relative">
                    <Input
                      id="momo-accessKey"
                      type={showSecrets['momo-accessKey'] ? 'text' : 'password'}
                      value={config.momo.accessKey}
                      onChange={(e) => handleConfigChange('momo', 'accessKey', e.target.value)}
                      disabled={!config.momo.enabled}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility('momo-accessKey')}
                    >
                      {showSecrets['momo-accessKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="momo-secretKey">Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="momo-secretKey"
                      type={showSecrets['momo-secretKey'] ? 'text' : 'password'}
                      value={config.momo.secretKey}
                      onChange={(e) => handleConfigChange('momo', 'secretKey', e.target.value)}
                      disabled={!config.momo.enabled}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility('momo-secretKey')}
                    >
                      {showSecrets['momo-secretKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="momo-redirect">Redirect URL</Label>
                  <Input
                    id="momo-redirect"
                    value={config.momo.redirectUrl}
                    onChange={(e) => handleConfigChange('momo', 'redirectUrl', e.target.value)}
                    disabled={!config.momo.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="momo-ipn">IPN URL</Label>
                  <Input
                    id="momo-ipn"
                    value={config.momo.ipnUrl}
                    onChange={(e) => handleConfigChange('momo', 'ipnUrl', e.target.value)}
                    disabled={!config.momo.enabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zalo Settings */}
        <TabsContent value="zalo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Cấu hình Zalo
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.zalo.enabled}
                    onCheckedChange={(checked) => handleConfigChange('zalo', 'enabled', checked)}
                  />
                  <Badge variant={config.zalo.enabled ? 'default' : 'secondary'}>
                    {config.zalo.enabled ? 'Bật' : 'Tắt'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zalo-appId">App ID</Label>
                  <Input
                    id="zalo-appId"
                    value={config.zalo.appId}
                    onChange={(e) => handleConfigChange('zalo', 'appId', e.target.value)}
                    disabled={!config.zalo.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="zalo-endpoint">Endpoint</Label>
                  <Input
                    id="zalo-endpoint"
                    value={config.zalo.endpoint}
                    onChange={(e) => handleConfigChange('zalo', 'endpoint', e.target.value)}
                    disabled={!config.zalo.enabled}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="zalo-appSecret">App Secret</Label>
                <div className="relative">
                  <Input
                    id="zalo-appSecret"
                    type={showSecrets['zalo-appSecret'] ? 'text' : 'password'}
                    value={config.zalo.appSecret}
                    onChange={(e) => handleConfigChange('zalo', 'appSecret', e.target.value)}
                    disabled={!config.zalo.enabled}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleSecretVisibility('zalo-appSecret')}
                  >
                    {showSecrets['zalo-appSecret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="zalo-accessToken">Access Token</Label>
                <div className="relative">
                  <Input
                    id="zalo-accessToken"
                    type={showSecrets['zalo-accessToken'] ? 'text' : 'password'}
                    value={config.zalo.accessToken}
                    onChange={(e) => handleConfigChange('zalo', 'accessToken', e.target.value)}
                    disabled={!config.zalo.enabled}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleSecretVisibility('zalo-accessToken')}
                  >
                    {showSecrets['zalo-accessToken'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Access token từ Zalo Official Account
                </p>
              </div>

              <Alert>
                <MessageCircle className="h-4 w-4" />
                <AlertDescription>
                  Để sử dụng Zalo messaging, bạn cần tạo Zalo Official Account và lấy access token.
                  Tham khảo tài liệu Zalo Developer để biết thêm chi tiết.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};