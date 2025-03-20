"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import logo from "@/public/images/logo.png";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../providers/AmplifyProvider';
import AuthModals from './AuthModals';
import { fetchUserAttributes } from 'aws-amplify/auth';

interface NavLinkProps {
  label: string;
  onClick?: () => void;
}

const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isSignupOpen, setIsSignupOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('#mobile-menu') && !target.closest('#hamburger-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLoginClick = (): void => {
    setIsLoginOpen(true);
    setIsSignupOpen(false);
    setIsMenuOpen(false);
  };

  const handleSignupClick = (): void => {
    setIsSignupOpen(true);
    setIsLoginOpen(false);
    setIsMenuOpen(false);
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
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthReady(true); // Ensure we set authReady back to true even if there's an error
    }
  };

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const NavLink = ({ label, onClick }: NavLinkProps) => {
    const pathname = usePathname();
    const isActive = label.toLowerCase() === "home" 
      ? pathname === "/" 
      : pathname === `/${label.toLowerCase()}`;
    
    return (
      <Link 
        href={`/${label.toLowerCase() === "home" ? "" : label.toLowerCase()}`} 
        className={isActive
          ? 'px-3 py-2 rounded-lg text-sm font-medium text-white bg-white/10 shadow-sm shadow-white/5 transition-all duration-300 ease-in-out'
          : 'px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 ease-in-out'
        }
        onClick={onClick}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <div id="header" className="fixed top-0 z-[100] w-full text-white">
        
        {/* Background with blur effect */}
        <div className="absolute inset-0 bg-[#0f0a2c]/30 backdrop-blur-md border-b-[0.25px] border-indigo-500/30 shadow-md shadow-indigo-500/20"></div>
        
        <div className="relative flex items-center justify-between p-1 lg:p-3 max-w-full">
          {/* Logo and title */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Link href="/">
                <Image 
                  draggable={false}
                  src={logo} 
                  alt="Logo" 
                  className="relative w-10 h-10 cursor-pointer p-0.5 transition-all duration-300 ease-in-out transform hover:scale-105" 
                />
              </Link>
            </div>
            <div className="hidden lg:flex items-center mt-1">
              {/* <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300"> */}
                What's That Car?
              {/* </span> */}
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex mr-1 items-center justify-center">
            {/* Nav bar links */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-4 max-w-[90%] overflow-x-hidden">
              <NavLink label="Home" />
              <div className="text-gray-500 mx-1"> | </div>
              <NavLink label="Explore" />
              <div className="text-gray-500 mx-1"> | </div>
              <NavLink label="About" />
            </div>

            {/* Auth buttons or user info */}
            <div className="flex items-center gap-3 min-w-[150px] justify-end">
              {/* Only show auth UI when auth is ready to prevent flashing */}
              {authReady && !isLoading ? (
                <div className="transition-all duration-500 ease-in-out">
                  {username ? (
                    <div className="flex items-center gap-3 fade-in">
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
                    <div className="flex items-center gap-3 fade-in">
                      <button onClick={handleLoginClick} className="px-4 py-2 text-sm font-medium border border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all duration-300 ease-in-out hover:scale-105 transform hover:shadow-sm hover:shadow-indigo-500/10">
                        Log in
                      </button>
                      <button onClick={handleSignupClick} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl shadow-lg shadow-blue-900/20 transition-all duration-300 ease-in-out transform hover:scale-105 text-sm font-medium">
                        Sign up
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div> </div>
              )}
            </div>
          </div>

          {/* Hamburger menu button - mobile */}
          <button 
            id="hamburger-button"
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-indigo-900/10 transition-all duration-300 ease-in-out fade-in"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <span className="block w-5 h-0.5 bg-blue-500 mb-1"></span>
            <span className="block w-5 h-0.5 bg-blue-500 mb-1"></span>
            <span className="block w-5 h-0.5 bg-blue-500"></span>
          </button>
        </div>
      </div>
      
      {/* Mobile menu dropdown */}
      <div 
        id="mobile-menu"
        className={`lg:hidden fixed right-0 top-[60px] z-[99] bg-gray-950 backdrop-blur-md border-l-[0.25px] border-b-[0.25px] border-indigo-500/30 shadow-lg shadow-indigo-500/20 rounded-bl-2xl overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-[500px] w-[250px] opacity-100 translate-y-0' : 'max-h-0 w-[250px] opacity-0 -translate-y-4'}`}
      >
        <div className={`p-4 flex flex-col gap-4 transition-all duration-500 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 -translate-y-4'}`}>

          <div className="flex flex-col gap-2 border-b border-indigo-500/20 pb-4">
            <NavLink label="Home" onClick={() => setIsMenuOpen(false)} />
            <NavLink label="Explore" onClick={() => setIsMenuOpen(false)} />
            <NavLink label="About" onClick={() => setIsMenuOpen(false)} />
          </div>
          
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
                    onClick={() => setIsMenuOpen(false)}
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
        </div>
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

export default Header;