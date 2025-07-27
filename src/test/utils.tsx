import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock the toast provider
const MockToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Mock auth store
export const mockAuthStore = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'ADMIN' as const,
  },
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
};

// Mock stores
export const createMockStore = (initialState: any = {}) => ({
  ...initialState,
  isLoading: false,
  error: null,
  fetchData: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  clearError: vi.fn(),
});

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <MockToastProvider>
        {children}
      </MockToastProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock API responses
export const mockApiResponse = <T>(data: T) => ({
  data: {
    status: 'success',
    data,
    message: 'Success',
  },
});

export const mockApiError = (message: string, status: number = 400) => ({
  response: {
    status,
    data: {
      status: 'error',
      message,
    },
  },
});

// Mock form data
export const mockFormData = {
  contract: {
    id: '1',
    renterId: 'renter-1',
    roomId: 'room-1',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    monthlyRent: 1000,
    securityDeposit: 1000,
    status: 'ACTIVE',
    terms: 'Standard rental terms',
  },
  payment: {
    id: '1',
    contractId: 'contract-1',
    amount: 1000,
    dueDate: '2024-01-01',
    paymentDate: '2024-01-01',
    method: 'BANK_TRANSFER',
    status: 'PAID',
    notes: 'Monthly rent payment',
  },
  maintenanceRequest: {
    id: '1',
    renterId: 'renter-1',
    roomId: 'room-1',
    title: 'Leaky faucet',
    description: 'The bathroom faucet is leaking',
    priority: 'MEDIUM',
    status: 'SUBMITTED',
    category: 'PLUMBING',
    submittedAt: '2024-01-01T10:00:00Z',
  },
  expense: {
    id: '1',
    propertyId: 'property-1',
    category: 'MAINTENANCE',
    amount: 500,
    description: 'Plumbing repair',
    date: '2024-01-01',
    vendor: 'ABC Plumbing',
  },
};

// Test helpers
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export const createMockEvent = (overrides: any = {}) => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  target: { value: '' },
  ...overrides,
});

// Mock file for testing file uploads
export const createMockFile = (
  name: string = 'test.pdf',
  type: string = 'application/pdf',
  size: number = 1024
) => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};