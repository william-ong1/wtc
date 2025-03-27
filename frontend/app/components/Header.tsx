"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../providers/AmplifyProvider';
import AuthModals from './AuthModals';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { profile } from "console";

interface NavLinkProps {
  label: string;
  link?: string;
  onClick?: () => void;
}

const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isSignupOpen, setIsSignupOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const { user, isLoading, signOut, refreshAuthState } = useAuth();

  useEffect(() => {
    const getUserInfo = async (): Promise<void> => {
      if (user) {
        try {
          // Only fetch attributes if we have a user
          const attributes = await fetchUserAttributes();
          // Use preferred_username if available, otherwise use the username from user object
          setUsername(attributes.preferred_username || "");
          setProfilePicture(attributes.picture || "");
        } catch (error) {
          console.error('Error fetching user attributes:', error);
        }
      } else {
        setUsername(null);
      }
      
      // Mark auth as ready once we've processed the user state
      setAuthReady(true);
    };

    // Only run getUserInfo when isLoading is false
    if (!isLoading) {
      getUserInfo();
    }
  }, [user, isLoading]);

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

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isProfileMenuOpen && !target.closest('#profile-menu') && !target.closest('#profile-button')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLoginClick = (): void => {
    setIsLoginOpen(true);
    setIsSignupOpen(false);
    setIsMenuOpen(false);
    document.body.style.overflow = 'hidden';
  };

  const handleSignupClick = (): void => {
    setIsSignupOpen(true);
    setIsLoginOpen(false);
    setIsMenuOpen(false);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModals = (): void => {
    // Close the modals first
    setIsLoginOpen(false);
    setIsSignupOpen(false);
    document.body.style.overflow = 'unset';
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

  const toggleProfileMenu = (): void => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleAuthSuccess = (): void => {
    setAuthReady(false);
    // Small delay to allow for smooth transition
    setTimeout(() => {
      refreshAuthState();
    }, 300);
  };

  const NavLink = ({ label, link, onClick }: NavLinkProps) => {
    const pathname = usePathname();
    const isActive = label.toLowerCase() === "home" 
      ? pathname === "/" 
      : pathname === `/${label.toLowerCase()}`;
    
    return (
      <Link 
        href={link ? (link.startsWith('/') ? link : `/${link}`) : (`/${label.toLowerCase() === "home" ? "" : label.toLowerCase()}`)} 
        className={`px-3 py-2 text-sm font-medium relative group ${
          isActive ? 'text-white' : 'text-gray-300 hover:text-white'
        }`}
        onClick={onClick}
      >
        <span className="relative inline-block">
          {label}
          <span className={`absolute bottom-[-6px] left-[-4px] right-[-4px] h-[2px] transform transition-transform duration-300 ease-out ${
            isActive 
              ? 'bg-white scale-x-100' 
              : 'bg-gray-300 scale-x-0 group-hover:scale-x-100'
          }`} />
        </span>
      </Link>
    );
  };

  return (
    <>
      <div id="header" className="fixed top-0 z-[100] w-full px-5 lg:px-3 py-1 lg:py-2 lg:pt-3">
        
        {/* Background with blur effect */}
        <div className="absolute inset-0 backdrop-blur-md bg-black/80"></div>
        
        <div className="relative flex items-center justify-between h-full max-w-full">
          {/* Logo and title */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Link href="/">
                <Image 
                  draggable={false}
                  src="/images/logo.png" 
                  alt="Logo" 
                  width={100}
                  height={100}
                  className="relative w-8 h-8 cursor-pointer p-0.5 mb-1 transition-all duration-300 ease-in-out transform hover:scale-105"
                />

              </Link>
            </div>
            <div className="hidden lg:flex items-center mt-0.25">
              What's That Car?
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

            {/* Auth buttons or profile picture - desktop */}
            <div className="flex items-center gap-3 min-w-[150px] justify-end h-full">
              {(!isLoading && authReady) ? (
                <div className="transition-all duration-300 ease-in-out">
                  {username ? (
                    <div className="flex items-center gap-3 fade-in relative">
                      <button 
                        id="profile-button"
                        onClick={toggleProfileMenu} 
                        className="relative h-10 w-10 rounded-full overflow-hidden border border-gray-700/50 shadow-lg shadow-black/20 hover:shadow-md hover:shadow-black/30 transition-all duration-200 ease-in-out transform hover:scale-105"
                        aria-label="Open profile menu"
                      >
                        {profilePicture ? (
                          <Image 
                            src={profilePicture} 
                            alt="Profile" 
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-300 font-bold">
                            {username[0].toUpperCase()}
                          </div>
                        )}
                      </button>
                      
                      {/* Profile dropdown menu */}
                      <div 
                        id="profile-menu"
                        className={`absolute right-0 top-12 z-50 backdrop-blur-md border-l-[0.25px] border-b-[0.25px] border-gray-800 shadow-md shadow-blue-300/10 rounded-bl-2xl overflow-hidden transition-all duration-300 ease-in-out ${isProfileMenuOpen ? 'max-h-[500px] w-[200px] opacity-100 translate-y-0' : 'max-h-0 w-[200px] opacity-0'}`}
                      >
                        <div className={`p-4 flex flex-col gap-4 transition-all duration-300 ease-in-out ${isProfileMenuOpen ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 -translate-y-4'}`}>
                          
                          <div className="flex flex-col items-left justify-left gap-2 border-b border-gray-900 pb-4">
                            <NavLink label="Saved" link="/profile/saved" onClick={() => setIsProfileMenuOpen(false)} />
                            <NavLink label="Profile" link="/profile" onClick={() => setIsProfileMenuOpen(false)} />
                          </div>
                          
                          <div className="pt-2">
                            <button 
                              onClick={handleSignOut}
                              className="w-full px-4 py-2 text-sm font-medium border border-gray-900 hover:border-gray-700 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all duration-300 ease-in-out"
                            >
                              Sign out
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 fade-in">
                      <div className="w-10 h-10"></div>
                      <button onClick={handleLoginClick} className="px-4 py-2 text-sm font-medium border border-blue-500/20 hover:border-blue-500/40 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all duration-300 ease-in-out hover:scale-105 transform hover:shadow-sm hover:shadow-blue-500/10">
                        Log in
                      </button>
                      <button onClick={handleSignupClick} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-primary-blue hover:from-blue-500 hover:to-primary-blue-hover rounded-2xl shadow-lg shadow-blue-900/20 transition-all duration-300 ease-in-out transform hover:scale-105 text-sm font-medium">
                        Sign up
                      </button>
                    </div>
                  )}
                </div>
              ) :  (<div className="w-10 h-10"></div>) }
            </div>
          </div>

          {/* Hamburger menu button - mobile */}
          <button 
            id="hamburger-button"
            className="pl-3 lg:hidden flex flex-col justify-center items-center w-10 h-10 transition-all duration-300 ease-in-out fade-in"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <span className="block w-5 h-0.5 bg-custom-blue/95 mb-1"></span>
            <span className="block w-5 h-0.5 bg-custom-blue/95 mb-1"></span>
            <span className="block w-5 h-0.5 bg-custom-blue/95"></span>
          </button>
        </div>
      </div>
      
      {/* Mobile menu dropdown */}
      <div 
        id="mobile-menu"
        className={`lg:hidden fixed right-0 top-10 z-[99] bg-black backdrop-blur-md border-l-[0.25px] border-b-[0.25px] border-gray-900 shadow-md shadow-blue-300/10 rounded-bl-2xl overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-[500px] w-[250px] opacity-100 translate-y-0' : 'max-h-0 w-[250px] opacity-0'}`}
      >
        <div className={`p-4 flex flex-col gap-4 transition-all duration-500 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 -translate-y-4'}`}>

          <div className="flex flex-col gap-2 border-b border-blue-500/20 pb-4">
            <NavLink label="Home" onClick={() => setIsMenuOpen(false)} />
            <NavLink label="Explore" onClick={() => setIsMenuOpen(false)} />
            <NavLink label="About" onClick={() => setIsMenuOpen(false)} />
            {!isLoading && authReady && username && (<NavLink label="Saved" link="/profile/saved" onClick={() => setIsMenuOpen(false)} /> )}
            {!isLoading && authReady && username && (<NavLink label="Profile" link="/profile" onClick={() => setIsMenuOpen(false)} /> )}
          </div>
          
          <div className="flex flex-col gap-3 pt-2">
            {/* Skeleton loader while auth is loading */}
            {(!isLoading && authReady) ? (
              username ? (
                <>
                  <button 
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-medium border border-blue-500/20 hover:border-blue-500/40 rounded-xl bg-white/5 hover:bg-blue-900/20 text-white transition-all duration-300 ease-in-out"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleLoginClick}
                    className="px-4 py-2 text-sm font-medium border border-blue-500/20 hover:border-blue-500/40 rounded-xl bg-white/5 hover:bg-blue-900/20 text-white transition-all duration-300 ease-in-out"
                  >
                    Log in
                  </button>
                  <button 
                    onClick={handleSignupClick}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-primary-blue hover:from-blue-500 hover:to-primary-blue-hover rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-300 ease-in-out text-sm font-medium"
                  >
                    Sign up
                  </button>
                </>
              )
            ) : (
              <div> </div>
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
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  ); 
};

export default Header;