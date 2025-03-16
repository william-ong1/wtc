"use client";

import Image from "next/image";
import { useState, useEffect, useRef, RefObject, Dispatch, SetStateAction } from "react";
import axios from "axios";
import placeholderImg from "@/public/images/placeholder.png";
import CarInfo from "./CarInfo";
import { FeatureCard, StatCard } from "./Cards";

type Car = {
  make: string;
  model: string;
  year: string;
  rarity: string;
  link: string;
};

const HomeContent = () => {
  const [image, setImage] = useState<string>("");
  const [displayImage, setDisplayImage] = useState<boolean>(false);
  const [fadeKey, setFadeKey] = useState<number>(0);
  const [car, setCar] = useState<Car>({make: "n/a", model: "n/a", year: "n/a", rarity: "n/a", link: "n/a"});
  const [loading, setLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [imageTransitioning, setImageTransitioning] = useState<boolean>(false);

  const [headerVisible, setHeaderVisible] = useState<boolean>(false);
  const [statCardsVisible, setStatCardsVisible] = useState<boolean>(false);
  const [imageVisible, setImageVisible] = useState<boolean>(false);
  const [carInfoVisible, setCarInfoVisible] = useState<boolean>(false);
  const [featureCardsVisible, setFeatureCardsVisible] = useState<boolean>(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const statCardsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const carInfoRef = useRef<HTMLDivElement>(null);
  const featureCardsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Observer setup for animations
    const createObserver = (ref: RefObject<HTMLDivElement | null>, setVisible: Dispatch<SetStateAction<boolean>>) => {
      if (!ref.current) return null;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setVisible(true);
              observer.disconnect(); // Stop observing once visible
            }
          });
        },
        { threshold: 0.2 } // Trigger when 20% of the element is visible
      );
      
      observer.observe(ref.current);
      return observer;
    };
    
    // Observers for each section
    const headerObserver = createObserver(headerRef, setHeaderVisible);
    const statCardsObserver = createObserver(statCardsRef, setStatCardsVisible);
    const imageObserver = createObserver(imageRef, setImageVisible);
    const carInfoObserver = createObserver(carInfoRef, setCarInfoVisible);
    const featureCardsObserver = createObserver(featureCardsRef, setFeatureCardsVisible);

    // Cleanup
    return () => {
      if (featureCardsObserver) featureCardsObserver.disconnect();
      if (imageObserver) imageObserver.disconnect();
      if (carInfoObserver) carInfoObserver.disconnect();
      if (headerObserver) headerObserver.disconnect();
      if (statCardsObserver) statCardsObserver.disconnect();
    };
  }, []);

  // Process the uploaded image and update the car details
  const processImage = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setImageTransitioning(true);

    try {
      setImage(objectUrl);
      setDisplayImage(true);
      setFadeKey(fadeKey + 1);

      setTimeout(() => {
        imageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      const result = await axios.post("http://localhost:8000/predict/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { make, model, year, rarity, link } = result.data;
      
      // Update car info with a smooth transition
      setCar({make: make, model: model, year: year, rarity: rarity, link: link});
      
      // Allow time for the car info to update before ending transition
      setTimeout(() => {
        setImageTransitioning(false);
        
        // Wait for the transition to complete before scrolling
        setTimeout(() => {
          // Get the car info element and header
          const carInfoElement = carInfoRef.current;
          const header = document.getElementById('header');
          
          if (carInfoElement && header) {
            // Get dimensions
            const headerHeight = header.offsetHeight;
            const elementRect = carInfoElement.getBoundingClientRect();
            const elementTop = window.scrollY + elementRect.top;
            const elementHeight = elementRect.height;
            const windowHeight = window.innerHeight;
            
            // Calculate the position that would place the element in the center
            // of the available space below the header
            const availableHeight = windowHeight - headerHeight;
            const targetPosition = elementTop - headerHeight - (availableHeight / 2 - elementHeight / 2);
            
            // Scroll to position
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }, 300);
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageTransitioning(false);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop functionality event handlers
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processImage(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Get the drop target element
    const dropTarget = e.target as HTMLElement;
    const uploadBox = dropTarget.closest('.upload-box');
    
    // Only process the drop if it's in the upload box
    if (!uploadBox) return;

    const file = e.dataTransfer.files[0];
    if (!file) return;
    await processImage(file);
  };

  return (
    <div
      className="flex flex-col flex-1 items-center w-3/4 h-full py-8 px-12 gap-8 fade-in"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >

      {/* Title + description */}
      <div 
        ref={headerRef}
        className={`flex flex-col items-center text-center w-3/4 gap-4 transition-all duration-700 ease-out ${ headerVisible  ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10' }`}
      >
        <h1 className="text-2xl font-bold animate-gradient-text">
          What's That Car?
        </h1>

        <p className="text-md text-gray-300 leading-relaxed">
          From daily commuters to rare supercars, our AI-powered car recognition system can identify any vehicle with 97%<sup className="text-[0.6rem]">†</sup> accuracy. Whether you're a car enthusiast or just curious about a special car you spotted, we've got you covered.
        </p>

        {/* Stat cards */}
        <div 
          ref={statCardsRef}
          className="flex flex-row gap-8 text-sm text-gray-400"
        >
          <div className={`transition-all duration-700 ease-out ${ statCardsVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10' }`}>
            <StatCard stat="97%" criteria="Accuracy" superscript="†"/>
          </div>
          
          <div className={`transition-all duration-700 delay-150 ease-out ${ statCardsVisible  ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10' }`}>
            <StatCard stat="5K+" criteria="Models" />
          </div>
          
          <div className={`transition-all duration-700 delay-300 ease-out ${ statCardsVisible  ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10' }`}>
            <StatCard stat="80+" criteria="Brands" />
          </div>
        </div>
      </div>

      {/* Image upload + car info results */}
      <div className="flex justify-between">
        {/* Left half */}
        <div 
          ref={imageRef} 
          className={`flex flex-col flex-1 items-center justify-center relative border-r-[0.25px] border-gray-600/50 gap-8 p-8 px-16 relative transition-all duration-700 ease-out ${ imageVisible  ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-10' }`}
        >

          {/* Image preview */}
          <label htmlFor="file-input" className={`cursor-pointer transform hover:scale-[1.01] transition-all duration-300 ease-in-out ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
            <div className="relative">
              <Image
                key={fadeKey}
                draggable={false}
                src={displayImage ? image : placeholderImg}
                alt="Uploaded Image"
                width={300}
                height={450}
                style={{ objectFit: "contain" }}
                className={`rounded-2xl border border-indigo-500/30 shadow-lg shadow-indigo-500/20 transition-all duration-500 ease-in-out ${imageTransitioning ? 'opacity-70 scale-[0.98]' : 'opacity-100 scale-100'}`}
              />
            </div>
          </label>
          
          {/* Image upload */}
          {!isDragging && (
            <div className="text-center flex flex-col">
              <input
                type="file"
                accept="image/*"
                id="file-input"
                className="hidden"
                onChange={handleImageUpload}
                disabled={loading}
              />

              <div>
                <label
                  htmlFor="file-input"
                  className={`inline-block px-6 py-3 rounded-2xl text-white text-md font-semibold bg-[#3B03FF]/80 transition-all duration-300 ease-in-out transform ${loading ? 'animate-gradient opacity-50 cursor-default hover:scale-100' : 'cursor-pointer hover:scale-105 shadow-lg hover:shadow-blue-500/20'}`}
                  >
                  {loading ? <span> Analyzing Image... </span> : <span> Upload Image </span>}
                </label>

                <div className="text-[0.7rem] mt-3 font-medium text-gray-400"> or drag and drop an image here </div>
              </div>
            </div>
          )}

          {/* Drag and drop */}
          {isDragging && (
            <div className="inset-0 bg-[#101827] backdrop-blur-md z-50 flex items-center justify-center upload-box rounded-2xl">
              <div className="bg-white/10 p-8 rounded-2xl border-2 border-dashed border-white/50 text-white text-lg">
                Drop your image here
              </div>
            </div>
          )}
        </div>

        {/* Right half (car info) */}
        <div 
          ref={carInfoRef} 
          className={`flex flex-col flex-1 items-center p-8 px-16 relative transition-all duration-700 ease-out ${ carInfoVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-10' }`} 
        >
          <div className={`transition-all duration-500 ease-in-out ${imageTransitioning ? 'opacity-70 scale-[0.98] blur-[1px]' : 'opacity-100 scale-100 blur-0'}`}>
            <CarInfo make={car.make} model={car.model} year={car.year} rarity={car.rarity} link={car.link} />
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div ref={featureCardsRef} className={`flex flex-row gap-12 mt-4 transition-all duration-700 ease-out ${ featureCardsVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10' }`}>
        <FeatureCard icon="🚗" title="Instant Recognition" description="Get results in seconds" large={false} />
        <FeatureCard icon="🎯" title="High Accuracy" description="97% recognition rate" large={false} />
        <FeatureCard icon="🔍" title="Detailed Info" description="Make, model, year & more" large={false} />
      </div>

      {/* Footnote */}
      <div className="text-[0.7rem] text-gray-600 mt-6 text-center max-w-2xl">
        <p><sup>†</sup> Predictions may vary based on image quality, lighting conditions, viewing angle, and model rarity. <br/> Accuracy was determined with clear, well-lit photos of vehicles from standard viewing angles.</p>
      </div>
    </div>
  );
};


export default HomeContent;