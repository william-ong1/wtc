"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback, RefObject, Dispatch, SetStateAction } from "react";
import axios from "axios";
import placeholderImg from "@/public/images/placeholder.png";
import CarInfo from "./CarInfo";
import { StatCard } from "./Cards";
import { useAuth } from '../providers/AmplifyProvider';
import AuthModals from './AuthModals';
import SaveSettingsModal from './SaveSettingsModal';
import { fetchUserAttributes } from 'aws-amplify/auth';

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
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);

  const [headerVisible, setHeaderVisible] = useState<boolean>(false);
  const [statCardsVisible, setStatCardsVisible] = useState<boolean>(false);
  const [imageVisible, setImageVisible] = useState<boolean>(false);
  const [carInfoVisible, setCarInfoVisible] = useState<boolean>(false);

  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isSignupOpen, setIsSignupOpen] = useState<boolean>(false);
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState<boolean>(false);
  const [carPrivacy, setCarPrivacy] = useState<boolean>(false);
  const [carDescription, setCarDescription] = useState<string>('');
  const { user, refreshAuthState } = useAuth();

  const [shouldSaveAfterLogin, setShouldSaveAfterLogin] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const statCardsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const carInfoRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
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
  
  // Observer setup for animations
  useEffect(() => {
    const createObserver = (ref: RefObject<HTMLDivElement | null>, setVisible: Dispatch<SetStateAction<boolean>>) => {
      if (!ref.current) return null;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setVisible(true);
              observer.disconnect();
            }
          });
        },
      );
      
      observer.observe(ref.current);
      return observer;
    };
    
    // Observers for each section
    const headerObserver = createObserver(headerRef, setHeaderVisible);
    const statCardsObserver = createObserver(statCardsRef, setStatCardsVisible);
    const imageObserver = createObserver(imageRef, setImageVisible);
    const carInfoObserver = createObserver(carInfoRef, setCarInfoVisible);

    // Cleanup
    return () => {
      if (imageObserver) imageObserver.disconnect();
      if (carInfoObserver) carInfoObserver.disconnect();
      if (headerObserver) headerObserver.disconnect();
      if (statCardsObserver) statCardsObserver.disconnect();
    };
  }, []);

  // Process the uploaded image and update the car details
  const processImage = async (file: File) => {
    // Verify file is an image
    if (!file.type.startsWith('image/')) {
      return;
    }

    let processedFile = file;
    
    // Convert HEIC to JPEG if needed
    if (file.type.includes('heic')) {
      setIsConverting(true);
      try {
        const heic2any = (await import('heic2any')).default;
        const blob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 1.0
        });
        const singleBlob = Array.isArray(blob) ? blob[0] : blob;
        processedFile = new File([singleBlob], file.name.replace('.heic', '.jpg'), { type: 'image/jpeg' });
      } catch (error) {
        console.error('Error converting HEIC:', error);
        setIsConverting(false);
        return;
      } finally {
        setIsConverting(false);
      }
    }

    const objectUrl = URL.createObjectURL(processedFile);
    const formData = new FormData();
    formData.append("image", processedFile);

    setLoading(true);
    setImageTransitioning(true);

    try {
      setIsSaved(false);
      setImage(objectUrl);
      setDisplayImage(true);
      setFadeKey(fadeKey + 1);

      // Scroll to the image with header adjustment (center image in non-header space)
      scrollToElementWithHeaderAdjustment(imageRef, 100);

      const backendUrl = `http://${window.location.hostname}:8000/predict/`;
      const response = await axios.post(backendUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        // Update car info
        const { make, model, year, rarity, link } = response.data.car;
        setCar({make: make, model: model, year: year, rarity: rarity, link: link});
      } else {
        return;
      }
      
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
  
  const onSaveResultsClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Check if user is logged in
    if (user) {
      setIsPrivacyDialogOpen(true);
    } else {
      // If not logged in, display login modal and save afterwards
      setShouldSaveAfterLogin(true);
      setIsLoginOpen(true);
    }
  };

  // Save car data to AWS
  const saveCarData = useCallback(async () => {
    try {      
      // Only proceed if we have valid car data
      if (car.make === "n/a" || !image) {
        console.error("No valid car data to save");
        return;
      }
      
      setIsSaving(true);
      
      if (!user) {
        console.error("User must be logged in to save car data");
        setShouldSaveAfterLogin(true);
        setIsLoginOpen(true);
        return;
      }
      
      const userId = user.userId;
      let imageUrl = image;
      
      // Get the user's username
      let username = '';
      try {
        const attributes = await fetchUserAttributes();
        username = attributes.preferred_username || user.username;
      } catch (error) {
        console.error('Error fetching user attributes:', error);
        username = user.username || 'Anonymous';
      }
      
      // If we have a blob URL from an uploaded image, we need to convert it to a data URL
      if (image.startsWith('blob:')) {
        try {
          const response = await fetch(image);
          const blob = await response.blob();
          
          const reader = new FileReader();
          imageUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          console.error("Failed to convert blob URL to data URL:", err);
          alert("Failed to process the image. Please try again.");
          setIsSaving(false);
          return;
        }
      }
      
      // Prepare data to save - include privacy setting and description
      const carData = {
        userId,
        username,
        carInfo: {
          make: car.make,
          model: car.model,
          year: car.year,
          link: car.link,
        },
        imageUrl: imageUrl,
        savedAt: new Date().toISOString(),
        isPrivate: carPrivacy,
        description: carDescription.trim() || undefined
      };
      
      // Call backend API to save to DynamoDB and S3
      const backendUrl = `http://${window.location.hostname}:8000/save-car/`;
      const response = await axios.post(backendUrl, carData, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.data.success) {
        setIsSaved(true);
        setIsSaving(false);
        setIsPrivacyDialogOpen(false);
      } else {
        console.error("Failed to save car data:", response.data.error);
        alert("Failed to save car. Please try again.");
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Error saving car data:", error);
      alert("An error occurred while saving the car. Please try again.");
      setIsSaving(false);
    }
  }, [user, car, image, carPrivacy, carDescription]);

  // Reset saved state when a new image is uploaded
  useEffect(() => {
    setIsSaved(false);
  }, [image]);

  // Listen for changes in auth state
  useEffect(() => {
    // If user becomes authenticated and we have a pending save request
    if (user && shouldSaveAfterLogin) {
      setIsPrivacyDialogOpen(true);
      setShouldSaveAfterLogin(false);
    }
  }, [user, shouldSaveAfterLogin, saveCarData]);

  const handleClosePrivacyModal = (): void => {
    setIsPrivacyDialogOpen(false);
  };
  
  const handleSaveWithPrivacy = (): void => {
    setIsPrivacyDialogOpen(false);
    saveCarData();
  };
  
  const handleTogglePrivacy = (isPrivate: boolean): void => {
    setCarPrivacy(isPrivate);
  };
  
  const handleDescriptionChange = (description: string): void => {
    setCarDescription(description);
  };


  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    
    // Check if we're leaving the window
    if (e.clientX <= 0 || e.clientX >= window.innerWidth || 
        e.clientY <= 0 || e.clientY >= window.innerHeight) {
      setIsDragging(false);
      return;
    }
    
    // Check if we're leaving the drop target
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    
    // Check if we're dropping in the drop zone
    const dropZone = document.getElementById('drop-zone');
    if (!dropZone) return;
    
    const rect = dropZone.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setIsDragging(false);
      return;
    }
    
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    processImage(file);
  };


  return (
    <>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex flex-col flex-1 items-center w-full lg:w-3/4 h-full py-4 lg:py-8 px-6 lg:px-12 lg:gap-8 fade-in overflow-x-hidden max-w-full"
      >
        {/* Title + description */}
        <div ref={headerRef} className={`flex flex-col items-center text-center w-full lg:w-3/4 gap-2 lg:gap-4 transition-all duration-700 ease-out ${ headerVisible  ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10' }`}>
          <h1 className="text-2xl font-bold text-custom-blue">
            What's That Car?
          </h1>

          <p className="text-sm lg:text-base text-gray-300 leading-relaxed">
            From daily commuters to rare supercars, our AI-powered car recognition system can identify any vehicle with 97%<sup className="text-[0.6rem] relative mb-12">†</sup> accuracy. Whether you're a car enthusiast or just curious about a special car you spotted, we've got you covered.
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
            className={`flex flex-col flex-1 items-center justify-center relative md:border-r-[0.25px] border-gray-700/60 gap-8 p-4 py-8 lg:px-16 relative transition-all duration-700 ease-out max-w-full overflow-x-hidden ${ imageVisible  ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-10' }`}
          >
            {/* Image preview */}
            <label htmlFor="file-input" className="pt-2 lg:pt-0 cursor-pointer transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
              <div className="relative">
                <Image
                  key={fadeKey}
                  draggable={false}
                  src={displayImage ? image : placeholderImg}
                  alt="Uploaded Image"
                  width={300}
                  height={450}
                  style={{ objectFit: "contain" }}
                  className={`rounded-2xl border border-gray-700/80 bg-gray-950/80 shadow-md shadow-blue-300/10 transition-all duration-500 ease-in-out ${imageTransitioning ? 'opacity-70 scale-[0.98]' : 'opacity-100 scale-100'}`}
                />
              </div>
            </label>
            
            {/* Image upload */}
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
                {isDragging ? (
                  <div 
                    id="drop-zone"
                    className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 px-14 border-2 border-dashed border-white/50 text-white text-base text-nowrap"
                  >
                    Drop your image here
                  </div>
                ) : (
                  <>
                    <label
                      htmlFor="file-input"
                      className={`inline-block px-6 py-3 rounded-2xl text-white text-base font-semibold bg-primary-blue hover:bg-primary-blue-hover transition-all duration-300 ease-in-out transform ${loading || isConverting ? 'cursor-wait opacity-50 cursor-default hover:scale-100' : 'cursor-pointer hover:scale-105 shadow-lg hover:shadow-blue-500/20'}`}
                    >
                      {loading ? <div className="flex flex-row justify-center items-center gap-2"> Analyzing Image <div className="animate-spin rounded-full mb-0.5 mr-1 h-4 w-4 border-t-2 border-b-2 border-white ml-1"> </div> </div>
                      : isConverting ? <div className="flex flex-row justify-center items-center gap-2"> Uploading Image <div className="animate-spin rounded-full mb-0.5 mr-1 h-4 w-4 border-t-2 border-b-2 border-white ml-1"> </div> </div>
                      : <span> Upload Image </span>}
                    </label>

                    <div className="text-[0.6rem] lg:text-[0.7rem] mt-2 font-medium text-gray-400"> or drag and drop an image here </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right half (car info) */}
          <div 
            ref={carInfoRef} 
            className={`flex flex-col flex-1 items-center p-4 py-4 lg:py-8 lg:px-16 relative transition-all duration-700 ease-out max-w-full overflow-x-hidden ${ carInfoVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-10' }`} 
          >
            <div className={`transition-all duration-500 ease-in-out ${imageTransitioning ? 'opacity-70 scale-[0.98] blur-[1px]' : 'opacity-100 scale-100 blur-0'}`}>
              <CarInfo 
                make={car.make} 
                model={car.model} 
                year={car.year} 
                rarity={car.rarity} 
                link={car.link} 
                onSaveResults={onSaveResultsClick}
                isSaved={isSaved}
                isSaving={isSaving}
              />
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="flex flex-col text-[0.6rem] lg:text-[0.7rem] text-gray-700 mt-6 text-center max-w-2xl gap-1">
          <p><sup className="relative bottom-[0.3em]">†</sup> Predictions may vary based on image quality, lighting conditions, viewing angle, and model rarity. Accuracy was determined with clear, well-lit photos of vehicles from standard viewing angles.</p>
          <p> <span className="lg:text-[0.8rem]">‡</span> Rarity is AI-generated and may vary. It is a dynamic estimate based on the car's appearance and the data available. </p> 
        </div>
      </div>

      {/* Save Settings Modal */}
      <SaveSettingsModal 
        isOpen={isPrivacyDialogOpen}
        isPrivate={carPrivacy}
        description={carDescription}
        onClose={handleClosePrivacyModal}
        onSave={handleSaveWithPrivacy}
        onTogglePrivacy={handleTogglePrivacy}
        onDescriptionChange={handleDescriptionChange}
      />

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

export default HomeContent;