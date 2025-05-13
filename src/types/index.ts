import React from 'react';
import type { LucideIcon, IconProps } from 'lucide-react';
import { Room, Renter, Service, Contract, Notification, Task, Statistics } from '../interface/interfaces';

export interface Transaction {
  id: string;
  roomId: string;
  renterId: string;
  type: 'Income' | 'Expense';
  category: 'Rent' | 'Service' | 'Maintenance' | 'Other';
  amount: number;
  date: string;
  description: string;
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

export type ButtonVariant = 'default' | 'primary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export interface LinkButtonProps extends React.ButtonHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  asChild?: boolean;
}

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'neutral';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Common component props
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

// Layout types
export interface SidebarItemProps {
  icon?: LucideIcon;
  children?: React.ReactNode;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  ref?: React.RefObject<HTMLDivElement>;
}

export interface CardProps extends BaseProps {
  title?: string;
  description?: string;
}

// Table types
export interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (value: T[keyof T]) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
}

// Form types
export interface FormFieldProps extends BaseProps {
  label?: string;
  error?: string;
  required?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, FormFieldProps {}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, FormFieldProps {
  options: { value: string; label: string }[];
}

// Toast/Notification types
export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

// Modal/Dialog types
export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

// Navigation types
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends BaseProps {
  items: BreadcrumbItem[];
}

export interface FormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export interface NavigationItem {
  title?: string;
  href: string;
  icon: React.ComponentType<IconProps>;
  children?: React.ReactNode;
  isActive?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

export type { Room, Renter, Service, Contract, Notification, Task, Statistics };