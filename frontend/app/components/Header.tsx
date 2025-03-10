"use client";

import Image from "next/image";
import logo from "@/public/images/logo_actual.png";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname(); // Get the current path

  return (
    <div className="relative flex flex-row items-center justify-between w-full p-2 border-b-[0.25px] border-[#3B03FF]/50 shadow-md shadow-white/10 text-white text-sm">

      {/* Logo and title */}
      <div className="flex flex-row items-center justify-center gap-4">
        <Image onClick={() => { window.location.href = '/' }} src={logo} alt="Logo" className="w-10 h-10 ml-1 cursor-pointer" />
        <div className="flex items-center mt-1"> What's That Car? </div>
      </div>

      {/* Nav bar links */}
      <div className="flex flex-row absolute left-1/2 transform -translate-x-1/2 text-center cursor-default gap-12 font-medium">
        {/* Home Link */}
        <Link
          href="/"
          className={`${
            pathname === '/' ? 'text-blue-500' : 'text-white'
          } hover:text-blue-500 transition duration-200 ease-in-out h`}
        >
          Home
        </Link>
        |
        {/* Explore Link */}
        <Link
          href="/explore"
          className={`${
            pathname === '/explore' ? 'text-blue-500' : 'text-white'
          } hover:text-blue-500 transition duration-200 ease-in-out`}
        >
          Explore
        </Link>
        |
        {/* About Us Link */}
        <Link
          href="/about"
          className={`${
            pathname === '/about' ? 'text-blue-500' : 'text-white'
          } hover:text-blue-500 transition duration-200 ease-in-out`}
        >
          About
        </Link>
      </div>

      <button className="px-4 py-2 bg-blue-700/60 hover:bg-blue-600/80 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:bg-blue-600/80 hover:scale-105 font-medium text-xs">
        Log in
      </button>

    </div>
  ); 
};

export default Header;