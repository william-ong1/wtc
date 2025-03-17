'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../providers/AmplifyProvider';
import AuthModals from './AuthModals';
import { fetchUserAttributes } from 'aws-amplify/auth';

interface AuthButtonsProps {
  isMobile?: boolean;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

const AuthButtons = ({ isMobile = false, onLoginClick, onSignupClick }: AuthButtonsProps) => {
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isSignupOpen, setIsSignupOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const { user, isLoading, signOut, refreshAuthState } = useAuth();

  useEffect(() => {
    const getUserInfo = async (): Promise<void> => {
      if (user) {
        try {
          // Only fetch attributes if we have a user
          const attributes = await fetchUserAttributes();
          // Use preferred_username if available, otherwise use the username from user object
          setUsername(attributes.preferred_username || user.username);
        } catch (error) {
          console.error('Error fetching user attributes:', error);
          // Fallback to username from user object if available
          if (user.username) {
            setUsername(user.username);
          } else {
            setUsername('User');
          }
        }
      } else {
        setUsername(null);
      }
      
      // Mark auth as ready once we've processed the user state
      setAuthReady(true);
    };

    getUserInfo();
  }, [user]);

  const handleLoginClick = (): void => {
    setIsLoginOpen(true);
    setIsSignupOpen(false);
    if (onLoginClick) onLoginClick();
  };

  const handleSignupClick = (): void => {
    setIsSignupOpen(true);
    setIsLoginOpen(false);
    if (onSignupClick) onSignupClick();
  };

  const handleCloseModals = (): void => {
    // Refresh auth state when modals are closed to ensure UI is updated
    refreshAuthState();
    setIsLoginOpen(false);
    setIsSignupOpen(false);
  };

  const handleSwitchToSignup = (): void => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const handleSwitchToLogin = (): void => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      // Set authReady to false during sign out to prevent UI flashing
      setAuthReady(false);
      await signOut();
      // Refresh auth state after signing out
      await refreshAuthState();
      // Auth is ready again
      setAuthReady(true);
      if (onLoginClick) onLoginClick(); // Close mobile menu if on mobile
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthReady(true); // Ensure we set authReady back to true even if there's an error
    }
  };

  // Mobile version of auth buttons
  if (isMobile) {
    return (
      <>
        <div className="flex flex-col gap-3 pt-2">
          {authReady && !isLoading ? (
            username ? (
              <>
                <div className="text-sm font-medium text-indigo-300">
                  Hello, {username}
                </div>
                <Link 
                  href="/profile" 
                  className="px-4 py-2 text-sm font-medium border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl bg-white/5 hover:bg-indigo-900/20 text-white transition-all duration-300 ease-in-out text-center"
                  onClick={onLoginClick}
                >
                  Profile
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl bg-white/5 hover:bg-indigo-900/20 text-white transition-all duration-300 ease-in-out"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleLoginClick}
                  className="px-4 py-2 text-sm font-medium border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl bg-white/5 hover:bg-indigo-900/20 text-white transition-all duration-300 ease-in-out"
                >
                  Log in
                </button>
                <button 
                  onClick={handleSignupClick}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-300 ease-in-out text-sm font-medium"
                >
                  Sign up
                </button>
              </>
            )
          ) : (
            <div className="h-20 animate-pulse flex flex-col gap-3">
              <div className="w-full h-9 rounded-xl bg-white/5"></div>
              <div className="w-full h-9 rounded-xl bg-white/5"></div>
            </div>
          )}
        </div>

        {/* Auth Modals */}
        <AuthModals 
          isLoginOpen={isLoginOpen}
          isSignupOpen={isSignupOpen}
          onClose={handleCloseModals}
          onSwitchToSignup={handleSwitchToSignup}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </>
    );
  }

  // Desktop version of auth buttons
  return (
    <>
      <div className="flex items-center gap-3 min-w-[150px] justify-end">
        {/* Only show auth UI when auth is ready to prevent flashing */}
        {authReady && !isLoading ? (
          <div className="transition-all duration-500 ease-in-out">
            {username ? (
              <div className="flex items-center gap-3 animate-fadeIn">
                <Link href="/profile" className="text-sm font-medium text-white hover:text-indigo-300 transition-colors duration-300">
                  Hello, {username}
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium border border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all duration-300 ease-in-out hover:scale-105 transform hover:shadow-sm hover:shadow-indigo-500/10"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 animate-fadeIn">
                <button 
                  onClick={handleLoginClick}
                  className="px-4 py-2 text-sm font-medium border border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all duration-300 ease-in-out hover:scale-105 transform hover:shadow-sm hover:shadow-indigo-500/10"
                >
                  Log in
                </button>
                <button 
                  onClick={handleSignupClick}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl shadow-lg shadow-blue-900/20 transition-all duration-300 ease-in-out transform hover:scale-105 text-sm font-medium"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-24 h-9 rounded-2xl bg-white/5"></div>
          </div>
        )}
      </div>

      {/* Auth Modals */}
      <AuthModals 
        isLoginOpen={isLoginOpen}
        isSignupOpen={isSignupOpen}
        onClose={handleCloseModals}
        onSwitchToSignup={handleSwitchToSignup}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
};

export default AuthButtons; 