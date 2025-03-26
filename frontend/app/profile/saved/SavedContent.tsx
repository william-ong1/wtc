"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { useAuth } from '@/app/providers/AmplifyProvider';
import AuthModals from '@/app/components/AuthModals';

// Define car type
type Car = {
  userId: string;
  savedAt: string;
  carInfo: {
    make: string;
    model: string;
    year: string;
    link: string;
  };
  imageUrl: string;
  description?: string;
};

// Define sort options
type SortOption = 'newest' | 'oldest';

type CarCardProps = {
  car: Car;
  onDelete: (userId: string, savedAt: string) => void;
};

const CarCard: React.FC<CarCardProps> = ({ car, onDelete }) => {
  const { make, model, year } = car.carInfo;
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [deleteState, setDeleteState] = useState<'default' | 'confirm'>("default");
  const [isPortraitImage, setIsPortraitImage] = useState<boolean>(false);
  const savedDate = new Date(car.savedAt).toLocaleDateString('en-US', {  year: 'numeric',  month: 'short',  day: 'numeric' });

  // Reset to default state after 3 seconds if user doesn't confirm
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (deleteState === 'confirm') {
      timeoutId = setTimeout(() => {
        setDeleteState('default');
      }, 3000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [deleteState]);

  const handleDeleteClick = (): void => {
    if (deleteState === 'default') {
      setDeleteState('confirm');
    } else {
      setIsDeleting(true);
      onDelete(car.userId, car.savedAt);
    }
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    setImageLoading(false);
    
    // Check if the image is portrait (typically phone photos) by comparing width and height
    const img = event.target as HTMLImageElement;
    const isPortrait = img.naturalHeight > img.naturalWidth;
    setIsPortraitImage(isPortrait);
  };

  return (
    <div className={`bg-gray-950/90 rounded-xl overflow-hidden shadow-md transition-all duration-300 border border-gray-900 hover:scale-[1.01] fade-in ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="relative h-40 w-full">
        {imageError ? (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-3 text-center text-sm text-gray-500">
            Image unavailable
          </div>
        ) : (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-custom-blue"></div>
              </div>
            )}
            <Image
              src={car.imageUrl}
              alt={`${make} ${model}`}
              fill
              unoptimized={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ 
                objectFit: isPortraitImage ? "cover" : "contain",
                backgroundColor: isPortraitImage ? "transparent" : "rgba(3, 7, 18, 0.9)"
              }}
              className={`transition-all duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onError={(e) => {
                console.error(`Error loading image for ${make} ${model}:`, car.imageUrl);
                setImageError(true);
                setImageLoading(false);
              }}
              onLoad={handleImageLoad}
            />
          </>
        )}
      </div>

      <div className="p-4">
        {/* Car info */}
        <div className="flex flex-col text-left">
          <h3 className="text-lg font-bold text-white"> {model} </h3>
          <p className="text-sm text-gray-400"> {make} · {year} </p>
          <p className="text-xs text-gray-500 mt-3"> Saved on {savedDate} </p>
          
          {/* Description if available */}
          {/* {car.description && (
            <div className="mt-2 p-2 bg-gray-800/50 rounded-md">
              <p className="text-sm text-gray-300 italic">"{car.description}"</p>
            </div>
          )} */}
        </div>

        {/* Link for more details and delete button */}
        <div className="mt-3 flex justify-between items-center">
          <a 
            href={car.carInfo.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-custom-blue/85 text-sm hover:text-custom-blue flex items-center group underline transition-all duration-300 ease-in-out hover:scale-[1.02]"
          >
            View More Details
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:translate-y-[-1.5px] group-hover:translate-x-[1.5px] transition-transform duration-200" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 7l-10 10" />
              <path d="M8 7l9 0l0 9" />
            </svg>
          </a>

          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className={`text-sm transition-all duration-300 flex items-center px-2 py-1 rounded-md hover:scale-[1.02] ease-in-out ${
              deleteState === 'confirm' 
                ? 'bg-red-700 text-white hover:bg-red-600 animate-bounce' 
                : 'text-red-400 hover:text-red-300'
            }`}
          >
            {isDeleting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Removing...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                {deleteState === 'confirm' ? 'Confirm' : 'Remove'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const SavedContent: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isSignupOpen, setIsSignupOpen] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, refreshAuthState } = useAuth();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUserCars = async (): Promise<void> => {
    if (!user) return;
    
    setLoading(true);
    try {
      const backendUrl = `http://${window.location.hostname}:8000/get-user-cars/${user.userId}`;
      const response = await axios.get(backendUrl);
      
      if (response.data.success) {
        // Process cars to ensure proper image URLs
        const processedCars = response.data.cars.map((car: Car) => {
          // Check if the car has a valid S3 image URL
          if (!car.imageUrl || !car.imageUrl.includes('.amazonaws.com')) {
            console.warn(`Car ${car.carInfo.make} ${car.carInfo.model} has invalid image URL: ${car.imageUrl}`);
            // You could set a default image or mark it for error handling
          }
          return car;
        });
        
        setCars(processedCars);
      } else {
        console.error("Failed to fetch cars:", response.data.error);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCar = async (userId: string, savedAt: string): Promise<void> => {
    try {
      const backendUrl = `http://${window.location.hostname}:8000/delete-car/${userId}/${encodeURIComponent(savedAt)}`;
      const response = await axios.delete(backendUrl);
      
      if (response.data.success) {
        setCars(prevCars => prevCars.filter(car => car.savedAt !== savedAt));
      } else {
        console.error("Failed to delete car:", response.data.error);
        alert("Failed to remove the car. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting car:", error);
      alert("Failed to remove the car. Please try again.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserCars();
    }
  }, [user]);

  const handleCloseModals = (): void => {
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

  const handleSortChange = (option: SortOption): void => {
    setSortOption(option);
    setDropdownOpen(false);
  };

  // Sort cars based on selected option
  const sortedCars = [...cars].sort((a: Car, b: Car): number => {
    switch (sortOption) {
      case 'newest':
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      case 'oldest':
        return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
      default:
        return 0;
    }
  });

  if (!user) {
    return (
      <>
        <title> Saved Cars | What's That Car? </title>
        <div className="flex flex-col flex-1 items-center justify-center w-full h-full p-4 gap-8 fade-in">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-custom-blue pt-8 pb-4">Sign In to View Saved Cars</h2>
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="px-6 py-3 rounded-2xl text-white text-base font-semibold bg-primary-blue hover:primary-blue-hover transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-blue-500/20"
            >
              Sign In
            </button>
          </div>
          <AuthModals 
            isLoginOpen={isLoginOpen}
            isSignupOpen={isSignupOpen}
            onClose={handleCloseModals}
            onSwitchToSignup={handleSwitchToSignup}
            onSwitchToLogin={handleSwitchToLogin}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <title> Saved | What's That Car? </title>
      <div className="flex flex-col flex-1 w-full max-w-5xl px-6 py-4 mb-8 lg:py-12 fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-custom-blue mb-3 md:mb-0 text-left"> Saved Cars </h1>
          
          <div className="flex items-center self-start md:self-auto">
            <span className="text-gray-300 font-medium text-sm mr-2">Sort by</span>
            <div className="relative inline-block" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-between text-sm min-w-[140px] border border-gray-800 text-white py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:border-indigo-500/30 hover:bg-indigo-950/20 hover:shadow-sm hover:shadow-indigo-500/10 transition-all duration-200"
              >
                <span className="flex items-center">
                  {sortOption === 'newest' && (
                    <Image src="/icons/sort-newest.svg" alt="Newest first" width={16} height={16} className="mr-2" />
                  )}
                  {sortOption === 'oldest' && (
                    <Image src="/icons/sort-oldest.svg" alt="Oldest first" width={16} height={16} className="mr-2" />
                  )}
                  {sortOption === 'newest' && 'Newest First'}
                  {sortOption === 'oldest' && 'Oldest First'}
                </span>
                <Image src="/icons/chevron-down.svg" alt="Toggle dropdown" width={16} height={16} className={`ml-2 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div 
                className={`absolute right-0 mt-2 z-50 bg-gray-950/95 backdrop-blur-md border-[0.25px] border-indigo-500/20 shadow-lg shadow-indigo-500/10 rounded-xl overflow-hidden transition-all duration-300 ease-in-out w-full
                  ${dropdownOpen ? 'max-h-[500px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4 pointer-events-none'}`}
              >
                <div className={`flex flex-col transition-all duration-300 ease-in-out
                  ${dropdownOpen ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 -translate-y-4'}`}
                >
                  <button 
                    onClick={() => handleSortChange('newest')}
                    className={`w-full text-left px-4 py-2.5 hover:bg-indigo-950/30 transition-colors text-sm flex items-center ${sortOption === 'newest' ? 'bg-indigo-950/40 text-white' : 'text-white'}`}
                  >
                    <Image src="/icons/sort-newest.svg" alt="Newest first" width={16} height={16} className="mr-2" />
                    Newest First
                  </button>
                  <button 
                    onClick={() => handleSortChange('oldest')}
                    className={`w-full text-left px-4 py-2.5 hover:bg-indigo-950/30 transition-colors text-sm flex items-center ${sortOption === 'oldest' ? 'bg-indigo-950/40 text-white' : 'text-white'}`}
                  >
                    <Image src="/icons/sort-oldest.svg" alt="Oldest first" width={16} height={16} className="mr-2" />
                    Oldest First
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-blue"></div>
          </div>
        ) : sortedCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 pt-4">
            {sortedCars.map((car, index) => (
              <div key={`${car.savedAt}-${index}`} className="flex flex-col">
                <CarCard 
                  key={`${car.savedAt}-${index}`} 
                  car={car} 
                  onDelete={deleteCar}
                />
                {/* Add divider only on small screens and not for the last item */}
                {index < sortedCars.length - 1 && (
                  <div className="mt-6 mb-2 flex justify-center items-center md:hidden">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-600/80 to-transparent"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 fade-in">
            <p className="text-gray-400 mb-6">You haven't saved any cars yet.</p>
            <a 
              href="/"
              className="px-6 py-3 rounded-2xl text-white text-base font-semibold bg-primary-blue hover:primary-blue-hover transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-blue-500/20"
            >
              Identify a Car
            </a>
          </div>
        )}
      </div>
    </>
  );
};

export default SavedContent; 