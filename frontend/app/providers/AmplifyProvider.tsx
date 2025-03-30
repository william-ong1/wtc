'use client';

import { ReactNode, useEffect, useState, useCallback, createContext, useContext } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { getCurrentUser, signOut, AuthUser } from 'aws-amplify/auth';
import AmplifyInitializer from '../components/AmplifyInitializer';

// Context for authentication
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
  refreshAuthState: async () => {},
});

// Hook for auth context
export const useAuth = () => useContext(AuthContext);

export default function AmplifyProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated and update state
  const checkUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh auth state - can be called after login/logout
  const refreshAuthState = useCallback(async () => {
    setIsLoading(true);
    await checkUser();
  }, [checkUser]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      signOut: handleSignOut,
      refreshAuthState 
    }}>
      <Authenticator.Provider>
        <AmplifyInitializer />
        {children}
      </Authenticator.Provider>
    </AuthContext.Provider>
  );
} 