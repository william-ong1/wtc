"use client";

import Image from "next/image";
import { useState, useEffect, useRef, RefObject, Dispatch, SetStateAction } from "react";
import axios from "axios";
import placeholderImg from "@/public/images/placeholder.png";
import CarInfo from "./CarInfo";
import { StatCard } from "./Cards";
import HomeFeatureCards from "./HomeFeatureCards";
import DragAndDrop from "./DragAndDrop";

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
  
  // Reusable function to scroll to an element with header adjustment
  const scrollToElementWithHeaderAdjustment = (elementRef: RefObject<HTMLElement | null>, delay: number = 0) => {
    setTimeout(() => {
      const element = elementRef.current;
      const header = document.getElementById('header');
      
      if (element) {
        // Get dimensions
        const headerHeight = header?.offsetHeight || 0;
        const elementRect = element.getBoundingClientRect();
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
    }, delay);
  };
  
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
        { threshold: 0.1 } // Trigger when 10% of the element is visible
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

      // Scroll to the image with header adjustment
      scrollToElementWithHeaderAdjustment(imageRef, 100);

      // Use the same host as the frontend but with the backend port
      const backendUrl = `http://${window.location.hostname}:8000/predict/`;
      const result = await axios.post(backendUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { make, model, year, rarity, link } = result.data;
      
      // Update car info with a smooth transition
      setCar({make: make, model: model, year: year, rarity: rarity, link: link});
      
      // Allow time for the car info to update before ending transition
      setTimeout(() => {
        setImageTransitioning(false);
        scrollToElementWithHeaderAdjustment(carInfoRef, 100);
      }, 300);

    } catch (error) {
      console.error("Error uploading image:", error);
      setImageTransitioning(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle file input change
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processImage(file);
  };

  return (
    <div className="flex flex-col flex-1 items-center w-full lg:w-3/4 h-full py-4 lg:py-8 px-6 lg:px-12 lg:gap-8 fade-in overflow-x-hidden max-w-full">
      {/* Title + description */}
      <div 
        ref={headerRef}
        className={`flex flex-col items-center text-center w-full lg:w-3/4 gap-2 lg:gap-4 transition-all duration-700 ease-out ${ headerVisible  ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10' }`}
      >
        <h1 className="text-xl lg:text-2xl font-bold animate-gradient-text">
          What's That Car?
        </h1>

        <p className="text-sm lg:text-base text-gray-300 leading-relaxed">
          From daily commuters to rare supercars, our AI-powered car recognition system can identify any vehicle with 97%<sup className="text-[0.6rem]">†</sup> accuracy. Whether you're a car enthusiast or just curious about a special car you spotted, we've got you covered.
        </p>

        {/* Stat cards */}
        <div 
          ref={statCardsRef}
          className="flex flex-row gap-8 text-xs lg:text-sm text-gray-400"
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
      <div className="md:flex md:justify-between w-auto max-w-full overflow-x-hidden">
        {/* Left half */}
        <div 
          ref={imageRef} 
          className={`flex flex-col flex-1 items-center justify-center relative md:border-r-[0.25px] border-gray-600/50 gap-8 p-4 py-8 lg:px-16 relative transition-all duration-700 ease-out max-w-full overflow-x-hidden ${ imageVisible  ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-10' }`}
        >
          <DragAndDrop 
            onFileDrop={processImage}
            disabled={loading}
            className="flex flex-col items-center justify-center w-full"
          >
            {/* Image preview */}
            <label htmlFor="file-input" className="cursor-pointer transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
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
            <div className="text-center flex flex-col mt-8">
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
                  className={`inline-block px-6 py-3 rounded-2xl text-white text-base font-semibold bg-[#3B03FF]/80 hover:bg-[#4B13FF] transition-all duration-300 ease-in-out transform ${loading ? 'animate-gradient opacity-50 cursor-default hover:scale-100' : 'cursor-pointer hover:scale-105 shadow-lg hover:shadow-blue-500/20'}`}
                  >
                  {loading ? <span> Analyzing Image... </span> : <span> Upload Image </span>}
                </label>

                <div className="text-[0.6rem] lg:text-[0.7rem] mt-2 font-medium text-gray-400"> or drag and drop an image here </div>
              </div>
            </div>
          </DragAndDrop>
        </div>

        {/* Right half (car info) */}
        <div 
          ref={carInfoRef} 
          className={`flex flex-col flex-1 items-center p-4 py-4 lg:py-8 lg:px-16 relative transition-all duration-700 ease-out max-w-full overflow-x-hidden ${ carInfoVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-10' }`} 
        >
          <div className={`transition-all duration-500 ease-in-out ${imageTransitioning ? 'opacity-70 scale-[0.98] blur-[1px]' : 'opacity-100 scale-100 blur-0'}`}>
            <CarInfo make={car.make} model={car.model} year={car.year} rarity={car.rarity} link={car.link} />
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div ref={featureCardsRef}>
        <HomeFeatureCards visible={featureCardsVisible} />
      </div>

      {/* Footnote */}
      <div className="flex flex-col text-[0.5rem] lg:text-[0.7rem] text-gray-700 mt-6 text-center max-w-2xl gap-1">
        <p><sup>†</sup> Predictions may vary based on image quality, lighting conditions, viewing angle, and model rarity. Accuracy was determined with clear, well-lit photos of vehicles from standard viewing angles.</p>
        <p> <span className="text-[0.6rem] lg:text-[0.8rem]">‡</span> Rarity is AI-generated and may vary. It is a dynamic estimate based on the car's appearance and the data available. </p> 
      </div>
    </div>
  );
};

export default HomeContent;