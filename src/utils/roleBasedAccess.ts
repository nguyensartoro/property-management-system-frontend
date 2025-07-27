/**
 * Role-based access control utilities for frontend components
 */

export type UserRole = 'ADMIN' | 'RENTER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

/**
 * Check if user has required role
 */
export const hasRole = (user: User | null, requiredRoles: UserRole[]): boolean => {
  if (!user) return false;
  return requiredRoles.includes(user.role);
};

/**
 * Check if user is admin
 */
export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user is renter
 */
export const isRenter = (user: User | null): boolean => {
  return hasRole(user, ['RENTER']);
};

/**
 * Check if user can access contracts
 */
export const canAccessContracts = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN', 'RENTER']);
};

/**
 * Check if user can manage contracts (create, edit, delete)
 */
export const canManageContracts = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can view contract details
 */
export const canViewContractDetails = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN', 'RENTER']);
};

/**
 * Check if user can upload contract documents
 */
export const canUploadContractDocuments = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can access payments
 */
export const canAccessPayments = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN', 'RENTER']);
};

/**
 * Check if user can manage payments (create, edit, delete)
 */
export const canManagePayments = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can record payments
 */
export const canRecordPayments = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can view payment analytics
 */
export const canViewPaymentAnalytics = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can export payment data
 */
export const canExportPaymentData = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can access maintenance requests
 */
export const canAccessMaintenance = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN', 'RENTER']);
};

/**
 * Check if user can manage maintenance requests (assign, complete)
 */
export const canManageMaintenance = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can create maintenance requests
 */
export const canCreateMaintenance = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN', 'RENTER']);
};

/**
 * Check if user can assign maintenance requests
 */
export const canAssignMaintenance = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can complete maintenance requests
 */
export const canCompleteMaintenance = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can delete maintenance requests
 */
export const canDeleteMaintenance = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can access expenses
 */
export const canAccessExpenses = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can manage expenses (create, edit, delete)
 */
export const canManageExpenses = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can view expense analytics
 */
export const canViewExpenseAnalytics = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can export expense data
 */
export const canExportExpenseData = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can access reports
 */
export const canAccessReports = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can generate reports
 */
export const canGenerateReports = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can export reports
 */
export const canExportReports = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can schedule reports
 */
export const canScheduleReports = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can access notifications
 */
export const canAccessNotifications = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN', 'RENTER']);
};

/**
 * Check if user can manage notifications (create, delete)
 */
export const canManageNotifications = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can create bulk notifications
 */
export const canCreateBulkNotifications = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can access properties
 */
export const canAccessProperties = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can access renters
 */
export const canAccessRenters = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can access rooms
 */
export const canAccessRooms = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Get navigation items based on user role
 */
export const getNavigationItems = (user: User | null) => {
  const baseItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: 'Home',
      roles: ['ADMIN', 'RENTER'] as UserRole[]
    }
  ];

  const adminItems = [
    {
      name: 'Properties',
      href: '/properties',
      icon: 'Building',
      roles: ['ADMIN'] as UserRole[]
    },
    {
      name: 'Rooms',
      href: '/rooms',
      icon: 'Door',
      roles: ['ADMIN'] as UserRole[]
    },
    {
      name: 'Renters',
      href: '/renters',
      icon: 'Users',
      roles: ['ADMIN'] as UserRole[]
    },
    {
      name: 'Contracts',
      href: '/contracts',
      icon: 'FileText',
      roles: ['ADMIN'] as UserRole[]
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: 'CreditCard',
      roles: ['ADMIN'] as UserRole[]
    },
    {
      name: 'Maintenance',
      href: '/maintenance',
      icon: 'Wrench',
      roles: ['ADMIN'] as UserRole[]
    },
    {
      name: 'Expenses',
      href: '/expenses',
      icon: 'Receipt',
      roles: ['ADMIN'] as UserRole[]
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: 'BarChart',
      roles: ['ADMIN'] as UserRole[]
    }
  ];

  const renterItems = [
    {
      name: 'My Contract',
      href: '/my-contract',
      icon: 'FileText',
      roles: ['RENTER'] as UserRole[]
    },
    {
      name: 'My Payments',
      href: '/my-payments',
      icon: 'CreditCard',
      roles: ['RENTER'] as UserRole[]
    },
    {
      name: 'Maintenance',
      href: '/maintenance',
      icon: 'Wrench',
      roles: ['RENTER'] as UserRole[]
    }
  ];

  const allItems = [...baseItems, ...adminItems, ...renterItems];

  return allItems.filter(item => 
    user && item.roles.includes(user.role)
  );
};

/**
 * Filter menu items based on user permissions
 */
export const filterMenuItems = (items: any[], user: User | null) => {
  return items.filter(item => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });
};

/**
 * Check if user can access specific resource based on ownership
 */
export const canAccessOwnResource = (user: User | null, resourceUserId: string): boolean => {
  if (!user) return false;
  if (isAdmin(user)) return true; // Admins can access all resources
  return user.id === resourceUserId;
};

/**
 * Check if user can perform bulk operations
 */
export const canPerformBulkOperations = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can access financial data
 */
export const canAccessFinancialData = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can view sensitive information
 */
export const canViewSensitiveInfo = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can modify system settings
 */
export const canModifySystemSettings = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Check if user can access user management
 */
export const canAccessUserManagement = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

/**
 * Get allowed actions for a user on a specific resource
 */
export const getAllowedActions = (user: User | null, resourceType: string) => {
  const actions = {
    view: false,
    create: false,
    edit: false,
    delete: false,
    export: false,
    manage: false
  };

  if (!user) return actions;

  switch (resourceType) {
    case 'contracts':
      actions.view = canViewContractDetails(user);
      actions.create = canManageContracts(user);
      actions.edit = canManageContracts(user);
      actions.delete = canManageContracts(user);
      actions.export = canManageContracts(user);
      actions.manage = canManageContracts(user);
      break;
    
    case 'payments':
      actions.view = canAccessPayments(user);
      actions.create = canRecordPayments(user);
      actions.edit = canManagePayments(user);
      actions.delete = canManagePayments(user);
      actions.export = canExportPaymentData(user);
      actions.manage = canManagePayments(user);
      break;
    
    case 'maintenance':
      actions.view = canAccessMaintenance(user);
      actions.create = canCreateMaintenance(user);
      actions.edit = canManageMaintenance(user);
      actions.delete = canDeleteMaintenance(user);
      actions.export = canManageMaintenance(user);
      actions.manage = canManageMaintenance(user);
      break;
    
    case 'expenses':
      actions.view = canAccessExpenses(user);
      actions.create = canManageExpenses(user);
      actions.edit = canManageExpenses(user);
      actions.delete = canManageExpenses(user);
      actions.export = canExportExpenseData(user);
      actions.manage = canManageExpenses(user);
      break;
    
    case 'reports':
      actions.view = canAccessReports(user);
      actions.create = canGenerateReports(user);
      actions.edit = canGenerateReports(user);
      actions.delete = canGenerateReports(user);
      actions.export = canExportReports(user);
      actions.manage = canGenerateReports(user);
      break;
    
    case 'notifications':
      actions.view = canAccessNotifications(user);
      actions.create = canManageNotifications(user);
      actions.edit = canManageNotifications(user);
      actions.delete = canManageNotifications(user);
      actions.export = canManageNotifications(user);
      actions.manage = canManageNotifications(user);
      break;
    
    default:
      break;
  }

  return actions;
};