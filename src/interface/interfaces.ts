// Centralized TypeScript interfaces for the project

export interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

// Theme constants
export const fontSizeClasses = {
  small: 'text-xs',
  medium: 'text-sm',
  large: 'text-base'
};

export const fontFamilyClasses = {
  inter: 'font-inter',
  roboto: 'font-roboto',
  poppins: 'font-poppins'
};

export const colorSchemeClasses = {
  default: 'scheme-default',
  blue: 'scheme-blue',
  green: 'scheme-green',
  purple: 'scheme-purple'
};

export interface ThemeSettings {
  fontSize: keyof typeof fontSizeClasses;
  fontFamily: keyof typeof fontFamilyClasses;
  colorScheme: keyof typeof colorSchemeClasses;
  isDarkMode: boolean;
}

export interface RenterData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  documentType: string;
  documentNumber: string;
}

export interface RenterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (renter: RenterData) => void;
  editData?: RenterData;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  description?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  rooms?: Room[];
}

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'UNAVAILABLE';

export interface Room {
  id: string;
  name: string;
  number: string;
  floor: string;
  size: number;
  description?: string;
  status: RoomStatus;
  price: number;
  images?: string[];
  propertyId: string;
  renter?: Renter;
  contracts?: Contract[];
  roomServices?: RoomService[];
  created_at?: string;
  updated_at?: string;
}

export interface Renter {
  id: string;
  name: string;
  email: string;
  phone: string;
  emergencyContact?: string;
  identityNumber?: string;
  roomId?: string;
  room?: Room;
  documents?: Document[];
  contracts?: Contract[];
  payments?: Payment[];
}

export interface Service {
  id: string;
  name: string;
  icon: string;
  fee: number;
  feeType: 'Monthly' | 'One-time';
  description?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Contract {
  id: string;
  roomId: string;
  roomName: string;
  renterIds: string[];
  renterNames: string[];
  startDate: string;
  endDate: string;
  contractType: 'longTerm' | 'shortTerm';
  status: 'active' | 'expired' | 'terminated';
  amount: number;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface Task {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

export interface Statistics {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalRenters: number;
  monthlyIncome: number;
  overduePayments: number;
}

export interface MaintenanceEvent {
  // Define fields as needed, or leave as placeholder
  id: string;
}

export interface RoomService {
  // Define fields as needed, or leave as placeholder
  id: string;
}

export interface EventTarget {
  // Define fields as needed, or leave as placeholder
  id: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  path: string;
  renterId: string;
}

export interface Payment {
  id: string;
  name: string;  // The name of the payment method (e.g., "Main Bank Account")
  type: string;   // The type of payment (e.g., "Bank Transfer", "MoMo", "ZaloPay")
  accountNumber: string;  // The account number or identifier
  details?: string;  // Additional details about the payment method
  
  // Original payment fields
  amount?: number;
  status?: string;
  dueDate?: string;
  paidDate?: string;
  description?: string;
  renterId?: string;
}
