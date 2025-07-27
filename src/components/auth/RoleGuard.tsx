import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../utils/roleBasedAccess';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL roles, if false, user needs ANY role
}

/**
 * RoleGuard component that conditionally renders children based on user roles
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = null,
  requireAll = false
}) => {
  const { user } = useAuthStore();

  if (!user) {
    return <>{fallback}</>;
  }

  const hasAccess = requireAll
    ? allowedRoles.every(role => user.role === role)
    : allowedRoles.includes(user.role);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Hook to check if current user has required roles
 */
export const useRoleCheck = (allowedRoles: UserRole[], requireAll = false): boolean => {
  const { user } = useAuthStore();

  if (!user) {
    return false;
  }

  return requireAll
    ? allowedRoles.every(role => user.role === role)
    : allowedRoles.includes(user.role);
};

/**
 * Higher-order component for role-based access control
 */
export const withRoleGuard = <P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[],
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <RoleGuard allowedRoles={allowedRoles} fallback={fallback}>
      <Component {...props} />
    </RoleGuard>
  );
};

export default RoleGuard;