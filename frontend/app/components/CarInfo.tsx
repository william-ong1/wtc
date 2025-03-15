"use client";

import Image from 'next/image';
import tempLogo from "@/public/images/temp-logo.png";
import React, { useState, useEffect } from 'react';

interface CarInfoProps {
  make: string;
  model: string;
  year: string;
  rarity: string;
  link: string;
};

const CarInfo: React.FC<CarInfoProps> = ({ make, model, year, rarity, link }) => {
  const [imageExists, setImageExists] = useState(false);

  const checkImageExists = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const checkLogo = async () => {
      if (make && make !== "n/a") {
        const doesExist = await checkImageExists(`https://raw.githubusercontent.com/dangnelson/car-makes-icons/2a7f574ce813e1eeddcca955c87847bc5baa28b6/svgs/${make.toLowerCase().replace(/ /g, "%20")}.svg`);
        setImageExists(doesExist);
      } else {
        setImageExists(false);
      }
    };
    checkLogo();
  }, [make]);
  
  const imageUrl = make && make !== "n/a" && imageExists ? `https://raw.githubusercontent.com/dangnelson/car-makes-icons/2a7f574ce813e1eeddcca955c87847bc5baa28b6/svgs/${make.toLowerCase().replace(/ /g, "%20")}.svg` : tempLogo;

  const getRarityColor = (rarity: string) => {
    const rarityNum = parseInt(rarity);
    if (isNaN(rarityNum)) return 'text-gray-400';
    if (rarityNum >= 90) return 'text-red-500';
    if (rarityNum >= 70) return 'text-orange-500';
    if (rarityNum >= 50) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const getRarityLabel = (rarity: string) => {
    const rarityNum = parseInt(rarity);
    if (isNaN(rarityNum)) return 'Unknown';
    if (rarityNum >= 90) return 'Extremely Rare';
    if (rarityNum >= 70) return 'Very Rare';
    if (rarityNum >= 50) return 'Rare';
    return 'Common';
  };

  return (
    <div 
      id="info" 
      className={`bg-gray-950 text-white w-[300px] rounded-2xl overflow-hidden transform transition-all duration-500 ease-in-out p-8 text-md border border-indigo-500/30 shadow-lg shadow-indigo-500/20 hover:scale-[1.01]`}
    >
      <div className="flex justify-center">
        <div className="relative p-1">
          <Image
            draggable={false}
            src={imageUrl}
            alt={`${make} logo`}
            width={160}
            height={160}
            style={{ 
              objectFit: "contain", 
              filter: `${imageExists ? 'invert(1) brightness(1)' : ''}`,
            }}
            className="pointer-events-none fade-in"
          />
        </div>
      </div>

      <div className="text-center p-2">
        <h2 className="text-2xl font-bold animate-gradient-text">
          {model !== "n/a" ? model : ""}
        </h2>
        <p className="text-lg text-gray-400 mt-1">
          {year !== "n/a" ? year : ""}
        </p>
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
          <span className="font-medium text-gray-300"> Make </span>
          <span className="text-white"> {make !== "n/a" ? make : "-"} </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
          <span className="font-medium text-gray-300"> Model </span>
          <span className="text-white"> {model !== "n/a" ? model : "-"} </span>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
          <span className="font-medium text-gray-300"> Year </span>
          <span className="text-white"> {year !== "n/a" ? year : "-"} </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
          <span className="font-medium text-gray-300"> Rarity </span>
          <div className="flex items-center gap-2">
            <span className={getRarityColor(rarity)}> {rarity !== "n/a" ? `${rarity}/100` : "-"} </span>
            <span className="text-xs px-2 py-1 rounded-full bg-white/10">
              {getRarityLabel(rarity)}
            </span>
          </div>
        </div>

        {make !== "n/a" && (
        <div className="text-center">
          <a 
            href={link} 
            target="_blank" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-[#3B03FF]/80 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            View Details
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
      </div>
    </div>
  );
};

export default CarInfo;
