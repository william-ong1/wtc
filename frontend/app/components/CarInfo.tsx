"use client";

import Image from 'next/image';
import tempLogo from "@/public/images/temp-logo.png";
import React, { useState, useEffect } from 'react';
import cloudSave from "@/public/images/cloud-save.svg";

interface CarInfoProps {
  make: string;
  model: string;
  year: string;
  rarity: string;
  link: string;
  onSaveResults: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isSaved?: boolean;
  isSaving?: boolean;
};

const CarInfo: React.FC<CarInfoProps> = ({ 
  make, model, year, rarity, link, onSaveResults, isSaved = false, isSaving = false 
}) => {
  const [imageExists, setImageExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animateContent, setAnimateContent] = useState(false);
  const [prevProps, setPrevProps] = useState({ make, model, year, rarity });

  const checkImageExists = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Check if props have changed to trigger animations
  useEffect(() => {
    if (make !== prevProps.make || model !== prevProps.model || 
        year !== prevProps.year || rarity !== prevProps.rarity) {
      // Content is changing, trigger exit animation
      setAnimateContent(false);
      setIsLoading(true);
      
      const timer = setTimeout(() => {
        setPrevProps({ make, model, year, rarity });
        setAnimateContent(true);
        setIsLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [make, model, year, rarity, prevProps]);

  // Initial animation on mount
  useEffect(() => {
    setAnimateContent(true);
  }, []);

  useEffect(() => {
    const checkLogo = async () => {
      if (make && make !== "n/a") {
        setIsLoading(true);
        const doesExist = await checkImageExists(`https://raw.githubusercontent.com/dangnelson/car-makes-icons/2a7f574ce813e1eeddcca955c87847bc5baa28b6/svgs/${make.toLowerCase().replace(/ /g, "%20")}.svg`);
        setImageExists(doesExist);
        setIsLoading(false);
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

  // SVG for checkmark icon
  const CheckmarkSVG = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
    </svg>
  );

  return (
    <div 
      id="info" 
      className={`bg-gray-950 text-white w-[300px] rounded-2xl overflow-hidden transform transition-all duration-500 ease-in-out p-8 text-base border border-indigo-500/30 shadow-lg shadow-indigo-500/20 hover:scale-[1.01]`}
    >
      <div className="flex justify-center">
        <div className={`relative items-center justify-center transition-all duration-300 ease-in-out ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <Image
            draggable={false}
            src={imageUrl}
            alt={`${make} logo`}
            width={120}
            height={120}
            style={{ 
              objectFit: "contain", 
              filter: `${imageExists ? 'invert(1) brightness(1)' : ''}`,
            }}
            className={`pointer-events-none transition-all duration-500 ease-in-out ${animateContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}
        </div>
      </div>

      <div className={`text-center p-4 transition-all duration-300 ease-in-out ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h2 className="text-2xl font-bold animate-gradient-text">
          {model !== "n/a" ? model : ""}
        </h2>
        <p className="text-lg text-gray-400 mt-1">
          {year !== "n/a" ? year : ""}
        </p>
      </div>

      <div className="space-y-4 text-sm">
        <div className={`flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 ease-in-out ${animateContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '50ms' }}>
          <span className="font-medium text-gray-300"> Make </span>
          <span className="text-white"> {make !== "n/a" ? make : "-"} </span>
        </div>

        <div className={`flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 ease-in-out ${animateContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '100ms' }}>
          <span className="font-medium text-gray-300"> Model </span>
          <span className="text-white"> {model !== "n/a" ? model : "-"} </span>
        </div>
        
        <div className={`flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 ease-in-out ${animateContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '150ms' }}>
          <span className="font-medium text-gray-300"> Year </span>
          <span className="text-white"> {year !== "n/a" ? year : "-"} </span>
        </div>

        <div className={`flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 ease-in-out ${animateContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '200ms' }}>
          <span className="font-medium text-gray-300"> Rarity<sup className='text-[0.6rem]'>‡</sup> </span>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(rarity)} bg-white/10`}>
              {getRarityLabel(rarity)}
            </span>
          </div>
        </div>

        {make !== "n/a" && (
        <div className={`flex flex-col items-center text-center transition-all duration-500 ease-in-out gap-4 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '250ms' }}>
          <a href={link} target="_blank" className="text-white underline transition-all duration-300 ease-in-out text-sm hover:text-indigo-400 hover:scale-105">
            View More Details
          </a>

          <button 
            onClick={onSaveResults} 
            disabled={isSaved || isSaving}
            className={`inline-flex text-base items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out transform 
              ${isSaved 
                ? 'bg-[#16A34A]/80 cursor-default' 
                : isSaving 
                  ? 'bg-[#3B03FF]/60 cursor-wait'
                  : 'bg-[#3B03FF]/80 hover:scale-105'
              }`}
          >
            {isSaved 
              ? 'Saved' 
              : isSaving 
                ? 'Saving...' 
                : 'Save Results'
            }
            
            {isSaved 
              ? <CheckmarkSVG /> 
              : isSaving
                ? <div className="animate-spin rounded-full mb-0.5 mr-1 h-4 w-4 border-t-2 border-b-2 border-white ml-1"></div>
                : <Image src={cloudSave} alt="Save icon" width={16} height={16} />
            }
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default CarInfo;
