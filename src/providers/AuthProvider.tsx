import React from 'react';

// AuthProvider is now a passthrough. All auth logic is handled by Zustand in store/authStore.ts
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default AuthProvider;