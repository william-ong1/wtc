"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { useAuth } from '@/app/providers/AmplifyProvider';
import AuthModals from '@/app/components/AuthModals';
import rightArrow from '@/public/images/right-arrow.svg';

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
};

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

  return (
    <div className={`bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 border border-indigo-500/30 hover:scale-[1.01] fade-in ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="relative h-40 w-full">
        {imageError ? (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-3 text-center text-sm text-gray-500">
            Image unavailable
          </div>
        ) : (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}
            <Image
              src={car.imageUrl}
              alt={`${make} ${model}`}
              fill
              unoptimized={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
              className={`transition-all duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onError={(e) => {
                console.error(`Error loading image for ${make} ${model}:`, car.imageUrl);
                setImageError(true);
                setImageLoading(false);
              }}
              onLoad={() => setImageLoading(false)}
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
        </div>

        {/* Link for more details and delete button */}
        <div className="mt-3 flex justify-between items-center">
          <a 
            href={car.carInfo.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-indigo-400 text-sm hover:text-indigo-300 flex items-center group underline transition-all duration-300 ease-in-out hover:scale-[1.02]"
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
                {deleteState === 'confirm' ? 'Confirm Deletion' : 'Remove'}
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
  const { user, refreshAuthState } = useAuth();

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

  if (!user) {
    return (
      <>
        <title> Saved Cars | What's That Car? </title>
        <div className="flex flex-col flex-1 items-center justify-center w-full h-full p-4 gap-8 fade-in">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4 animate-gradient-text">Sign In to View Saved Cars</h2>
            <p className="text-gray-300 mb-6">Sign in to view your saved car collection.</p>
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="px-6 py-3 rounded-2xl text-white text-base font-semibold bg-[#3B03FF]/80 hover:bg-[#4B13FF] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-blue-500/20"
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
      <title> Saved Cars | What's That Car? </title>
      <div className="flex flex-col flex-1 w-full max-w-6xl px-6 py-4 lg:py-8 fade-in">
        <h1 className="text-2xl font-bold mb-6 animate-gradient-text">Your Saved Cars</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : cars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car, index) => (
              <CarCard 
                key={`${car.savedAt}-${index}`} 
                car={car} 
                onDelete={deleteCar}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6">You haven't saved any cars yet.</p>
            <a 
              href="/"
              className="px-6 py-3 rounded-2xl text-white text-base font-semibold bg-[#3B03FF]/80 hover:bg-[#4B13FF] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-blue-500/20"
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