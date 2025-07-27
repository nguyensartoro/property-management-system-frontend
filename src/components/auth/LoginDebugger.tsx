import React, { useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';

interface TestResult {
  success: boolean;
  data?: any;
  status?: number;
  headers?: Record<string, string>;
  error?: string;
  response?: {
    data?: any;
    status?: number;
    headers?: Record<string, string>;
  };
}

const LoginDebugger: React.FC = () => {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState('debug');

  const runTest = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      let response;
      
      switch (selectedTest) {
        case 'debug':
          response = await axios.get('/api/v1/debug');
          break;
        case 'directLogin':
          response = await axios.post('/api/v1/auth/login', {
            email: 'admin@example.com',
            password: 'Admin@123'
          });
          break;
        case 'corsTest':
          response = await axios.get('http://localhost:5001/api/v1/debug', {
            withCredentials: true
          });
          break;
        case 'health':
          response = await axios.get('/api/v1/health');
          break;
        default:
          throw new Error('Unknown test');
      }
      
      setResult({
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers
      });
    } catch (error: any) {
      console.error('Test error:', error);
      setResult({
        success: false,
        error: error.message,
        response: error.response ? {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        } : 'No response'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 mt-8 bg-gray-50 rounded-md border border-gray-300">
      <h2 className="mb-4 text-lg font-semibold">API Connection Debugger</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Select Test:</label>
        <select 
          value={selectedTest}
          onChange={(e) => setSelectedTest(e.target.value)}
          className="p-2 w-full rounded border border-gray-300"
        >
          <option value="debug">Debug Endpoint</option>
          <option value="health">Health Check</option>
          <option value="directLogin">Direct Login Test</option>
          <option value="corsTest">CORS Test</option>
        </select>
      </div>
      
      <button
        onClick={runTest}
        disabled={loading}
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {loading ? 'Running...' : 'Run Test'}
      </button>
      
      {result && (
        <div className="mt-4">
          <h3 className="mb-2 font-medium">Result:</h3>
          <div className={`p-3 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <pre className="overflow-auto max-h-80 text-sm whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginDebugger; 