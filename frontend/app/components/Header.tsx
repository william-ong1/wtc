"use client";

import Image from "next/image";
import logo from "@/public/images/logo.png";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname(); // Get the current path

  return (
    <div className="sticky top-0 z-50 w-full text-white">
      {/* Gradient background with blur effect */}
      <div className="absolute inset-0 bg-[#0f0a2c]/30 backdrop-blur-md border-b-[0.25px] border-indigo-500/30 shadow-md shadow-indigo-500/20"></div>
      
      <div className="relative flex items-center justify-between px-4 py-3">
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
          <div className="flex items-center mt-1">
            {/* <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300"> */}
              What's That Car?
            {/* </span> */}
          </div>
        </div>

        {/* Nav bar links */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-4">
          <Link href="/" className={pathname === '/' 
            ? 'px-3 py-2 rounded-lg text-sm font-medium text-white bg-white/10 shadow-sm shadow-white/5 transition-all duration-300 ease-in-out'
            : 'px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 ease-in-out'}>
            Home
          </Link>
          <div className="text-gray-500 mx-1"> | </div>
          <Link href="/explore" className={pathname === '/explore'
            ? 'px-3 py-2 rounded-lg text-sm font-medium text-white bg-white/10 shadow-sm shadow-white/5 transition-all duration-300 ease-in-out'
            : 'px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 ease-in-out'}>
            Explore
          </Link>
          <div className="text-gray-500 mx-1"> | </div>
          <Link href="/about" className={pathname === '/about'
            ? 'px-3 py-2 rounded-lg text-sm font-medium text-white bg-white/10 shadow-sm shadow-white/5 transition-all duration-300 ease-in-out'
            : 'px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 ease-in-out'}>
            About
          </Link>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium border border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all duration-300 ease-in-out hover:scale-105 transform hover:shadow-sm hover:shadow-indigo-500/10">
            Log in
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl shadow-lg shadow-blue-900/20 transition-all duration-300 ease-in-out transform hover:scale-105 text-sm font-medium">
            Sign up
          </button>
        </div>
      </div>
    </div>
  ); 
};

export default Header;