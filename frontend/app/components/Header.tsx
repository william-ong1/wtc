"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import logo from "@/public/images/logo.png";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthButtons from './AuthButtons';

interface NavLinkProps {
  label: string;
  onClick?: () => void;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

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

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCloseMenu = (): void => {
    setIsMenuOpen(false);
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
        {/* Gradient background with blur effect */}
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

          {/* Hamburger menu button (mobile only) */}
          <button 
            id="hamburger-button"
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-indigo-900/10 transition-all duration-300 ease-in-out"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <span className="block w-5 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 mb-1"></span>
            <span className="block w-5 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 mb-1"></span>
            <span className="block w-5 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400"></span>
          </button>

          {/* Desktop navigation */}
          <div className="hidden lg:flex mr-1">
            {/* Nav bar links */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-4 max-w-[90%] overflow-x-hidden">
              <NavLink label="Home" />
              <div className="text-gray-500 mx-1"> | </div>
              <NavLink label="Explore" />
              <div className="text-gray-500 mx-1"> | </div>
              <NavLink label="About" />
            </div>

            {/* Auth buttons - Desktop */}
            <AuthButtons />
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      <div 
        id="mobile-menu"
        className={`lg:hidden fixed right-0 top-[60px] z-[99] bg-gray-950 backdrop-blur-md border-l-[0.25px] border-b-[0.25px] border-indigo-500/30 shadow-lg shadow-indigo-500/20 rounded-bl-2xl overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-[500px] w-[250px] opacity-100 translate-y-0' : 'max-h-0 w-[250px] opacity-0 -translate-y-4'}`}
      >
        <div className={`p-4 flex flex-col gap-4 transition-all duration-500 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 -translate-y-4'}`}>
          {/* Mobile navigation links */}
          <div className="flex flex-col gap-2 border-b border-indigo-500/20 pb-4">
            <NavLink label="Home" onClick={() => setIsMenuOpen(false)} />
            <NavLink label="Explore" onClick={() => setIsMenuOpen(false)} />
            <NavLink label="About" onClick={() => setIsMenuOpen(false)} />
          </div>
          
          {/* Auth buttons - Mobile */}
          <AuthButtons isMobile onLoginClick={handleCloseMenu} onSignupClick={handleCloseMenu} />
        </div>
      </div>
    </>
  ); 
};

export default Header;