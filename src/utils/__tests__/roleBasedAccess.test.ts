import { describe, it, expect } from 'vitest';
import {
  hasRole,
  isAdmin,
  isRenter,
  canAccessContracts,
  canManageContracts,
  canAccessPayments,
  canManagePayments,
  canAccessMaintenance,
  canManageMaintenance,
  canAccessExpenses,
  canAccessReports,
  canAccessNotifications,
  getAllowedActions,
  getNavigationItems,
  filterMenuItems,
  User
} from '../roleBasedAccess';

describe('roleBasedAccess', () => {
  const adminUser: User = {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN'
  };

  const renterUser: User = {
    id: '2',
    email: 'renter@example.com',
    name: 'Renter User',
    role: 'RENTER'
  };

  describe('hasRole', () => {
    it('should return true for user with required role', () => {
      expect(hasRole(adminUser, ['ADMIN'])).toBe(true);
      expect(hasRole(renterUser, ['RENTER'])).toBe(true);
      expect(hasRole(adminUser, ['ADMIN', 'RENTER'])).toBe(true);
    });

    it('should return false for user without required role', () => {
      expect(hasRole(renterUser, ['ADMIN'])).toBe(false);
      expect(hasRole(adminUser, ['RENTER'])).toBe(false);
    });

    it('should return false for null user', () => {
      expect(hasRole(null, ['ADMIN'])).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      expect(isAdmin(adminUser)).toBe(true);
    });

    it('should return false for non-admin user', () => {
      expect(isAdmin(renterUser)).toBe(false);
      expect(isAdmin(null)).toBe(false);
    });
  });

  describe('isRenter', () => {
    it('should return true for renter user', () => {
      expect(isRenter(renterUser)).toBe(true);
    });

    it('should return false for non-renter user', () => {
      expect(isRenter(adminUser)).toBe(false);
      expect(isRenter(null)).toBe(false);
    });
  });

  describe('contract permissions', () => {
    it('should allow both admin and renter to access contracts', () => {
      expect(canAccessContracts(adminUser)).toBe(true);
      expect(canAccessContracts(renterUser)).toBe(true);
      expect(canAccessContracts(null)).toBe(false);
    });

    it('should only allow admin to manage contracts', () => {
      expect(canManageContracts(adminUser)).toBe(true);
      expect(canManageContracts(renterUser)).toBe(false);
      expect(canManageContracts(null)).toBe(false);
    });
  });

  describe('payment permissions', () => {
    it('should allow both admin and renter to access payments', () => {
      expect(canAccessPayments(adminUser)).toBe(true);
      expect(canAccessPayments(renterUser)).toBe(true);
      expect(canAccessPayments(null)).toBe(false);
    });

    it('should only allow admin to manage payments', () => {
      expect(canManagePayments(adminUser)).toBe(true);
      expect(canManagePayments(renterUser)).toBe(false);
      expect(canManagePayments(null)).toBe(false);
    });
  });

  describe('maintenance permissions', () => {
    it('should allow both admin and renter to access maintenance', () => {
      expect(canAccessMaintenance(adminUser)).toBe(true);
      expect(canAccessMaintenance(renterUser)).toBe(true);
      expect(canAccessMaintenance(null)).toBe(false);
    });

    it('should only allow admin to manage maintenance', () => {
      expect(canManageMaintenance(adminUser)).toBe(true);
      expect(canManageMaintenance(renterUser)).toBe(false);
      expect(canManageMaintenance(null)).toBe(false);
    });
  });

  describe('expense permissions', () => {
    it('should only allow admin to access expenses', () => {
      expect(canAccessExpenses(adminUser)).toBe(true);
      expect(canAccessExpenses(renterUser)).toBe(false);
      expect(canAccessExpenses(null)).toBe(false);
    });
  });

  describe('report permissions', () => {
    it('should only allow admin to access reports', () => {
      expect(canAccessReports(adminUser)).toBe(true);
      expect(canAccessReports(renterUser)).toBe(false);
      expect(canAccessReports(null)).toBe(false);
    });
  });

  describe('notification permissions', () => {
    it('should allow both admin and renter to access notifications', () => {
      expect(canAccessNotifications(adminUser)).toBe(true);
      expect(canAccessNotifications(renterUser)).toBe(true);
      expect(canAccessNotifications(null)).toBe(false);
    });
  });

  describe('getAllowedActions', () => {
    it('should return correct actions for admin user on contracts', () => {
      const actions = getAllowedActions(adminUser, 'contracts');
      
      expect(actions.view).toBe(true);
      expect(actions.create).toBe(true);
      expect(actions.edit).toBe(true);
      expect(actions.delete).toBe(true);
      expect(actions.export).toBe(true);
      expect(actions.manage).toBe(true);
    });

    it('should return limited actions for renter user on contracts', () => {
      const actions = getAllowedActions(renterUser, 'contracts');
      
      expect(actions.view).toBe(true);
      expect(actions.create).toBe(false);
      expect(actions.edit).toBe(false);
      expect(actions.delete).toBe(false);
      expect(actions.export).toBe(false);
      expect(actions.manage).toBe(false);
    });

    it('should return no actions for null user', () => {
      const actions = getAllowedActions(null, 'contracts');
      
      expect(actions.view).toBe(false);
      expect(actions.create).toBe(false);
      expect(actions.edit).toBe(false);
      expect(actions.delete).toBe(false);
      expect(actions.export).toBe(false);
      expect(actions.manage).toBe(false);
    });

    it('should handle expenses correctly', () => {
      const adminActions = getAllowedActions(adminUser, 'expenses');
      const renterActions = getAllowedActions(renterUser, 'expenses');
      
      expect(adminActions.view).toBe(true);
      expect(adminActions.manage).toBe(true);
      expect(renterActions.view).toBe(false);
      expect(renterActions.manage).toBe(false);
    });
  });

  describe('getNavigationItems', () => {
    it('should return admin navigation items', () => {
      const items = getNavigationItems(adminUser);
      
      expect(items.length).toBeGreaterThan(5);
      expect(items.some(item => item.name === 'Properties')).toBe(true);
      expect(items.some(item => item.name === 'Expenses')).toBe(true);
      expect(items.some(item => item.name === 'Reports')).toBe(true);
    });

    it('should return renter navigation items', () => {
      const items = getNavigationItems(renterUser);
      
      expect(items.length).toBeLessThan(6);
      expect(items.some(item => item.name === 'My Contract')).toBe(true);
      expect(items.some(item => item.name === 'My Payments')).toBe(true);
      expect(items.some(item => item.name === 'Properties')).toBe(false);
      expect(items.some(item => item.name === 'Expenses')).toBe(false);
    });

    it('should return empty array for null user', () => {
      const items = getNavigationItems(null);
      expect(items).toEqual([]);
    });
  });

  describe('filterMenuItems', () => {
    const menuItems = [
      { name: 'Dashboard', roles: ['ADMIN', 'RENTER'] },
      { name: 'Admin Panel', roles: ['ADMIN'] },
      { name: 'Profile', roles: undefined },
    ];

    it('should filter items for admin user', () => {
      const filtered = filterMenuItems(menuItems, adminUser);
      
      expect(filtered).toHaveLength(3);
      expect(filtered.some(item => item.name === 'Admin Panel')).toBe(true);
    });

    it('should filter items for renter user', () => {
      const filtered = filterMenuItems(menuItems, renterUser);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.some(item => item.name === 'Admin Panel')).toBe(false);
      expect(filtered.some(item => item.name === 'Dashboard')).toBe(true);
      expect(filtered.some(item => item.name === 'Profile')).toBe(true);
    });

    it('should return items without roles for any user', () => {
      const filtered = filterMenuItems(menuItems, null);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Profile');
    });
  });
});