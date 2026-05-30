import { useContext } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';

/**
 * Accesses the global authentication context.
 * Guards against usage outside the <AuthProvider> wrapper tree.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be consumed inside a matching <AuthProvider> scope.');
  }
  return context;
};
