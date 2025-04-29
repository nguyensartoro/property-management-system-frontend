export interface Unit {
  id: string;
  roomNumber: string;
  type: 'Single' | 'Double' | 'Suite' | 'Studio';
  status: 'Occupied' | 'Available' | 'Reserved' | 'Maintenance';
  price: number;
  size?: number;
  floor?: string;
  checkInDate?: string;
  checkOutDate?: string;
  services: string[];
  rentalTerm: 'Short' | 'Long';
  renter?: Renter;
  electricUsage?: number;
  waterUsage?: number;
}

export interface Renter {
  id: string;
  name: string;
  email: string;
  phone: string;
  personalId: string;
  avatar?: string;
  personalIdImage?: string;
  unitId?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export interface Service {
  id: string;
  name: string;
  icon: string;
  fee: number;
  feeType: 'Monthly' | 'One-time';
  information?: string;
  phone?: string;
}

export interface Transaction {
  id: string;
  unitId: string;
  renterId: string;
  type: 'Income' | 'Expense';
  category: 'Rent' | 'Service' | 'Maintenance' | 'Other';
  amount: number;
  date: string;
  description: string;
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
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  totalRenters: number;
  monthlyIncome: number;
  overduePayments: number;
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