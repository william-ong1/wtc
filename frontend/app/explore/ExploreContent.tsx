"use client";

import { useState, useEffect } from "react";
import type { FC } from "react";
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
  likes: number;
  username: string;
  profilePicture: string;
};

type CarCardProps = {
  car: Car;
  onLike: (userId: string, savedAt: string) => void;
};

const CarCard: FC<CarCardProps> = ({ car, onLike }: CarCardProps) => {
  const make = car.carInfo.make;
  const model = car.carInfo.model;
  const year = car.carInfo.year;
  const [imageError, setImageError] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const savedDate = new Date(car.savedAt).toLocaleDateString('en-US', {  year: 'numeric',  month: 'short',  day: 'numeric' });

  const handleLikeClick = (): void => !isLiking && (setIsLiking(true), onLike(car.userId, car.savedAt), setTimeout(() => setIsLiking(false), 1000));

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 border border-indigo-500/30 hover:scale-[1.01] fade-in">
      {/* User info */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-800">
        <div className="relative h-8 w-8 rounded-full overflow-hidden">
          {car.profilePicture ? (
            <Image
              src={car.profilePicture}
              alt={car.username}
              fill
              sizes="32px"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-xs text-white font-bold">
              {car.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-white">{car.username}</span>
      </div>
      
      {/* Car image */}
      <div className="relative h-40 w-full">
        {imageError ? (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-3 text-center text-sm text-gray-500">
            Image unavailable
          </div>
        ) : (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900 bg-opacity-60">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
            <Image
              src={car.imageUrl}
              alt={`${make} ${model}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
              className="transition-all duration-500"
              onError={() => setImageError(true)}
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
          <p className="text-xs text-gray-500 mt-3"> Posted on {savedDate} </p>
        </div>

        {/* Like button and more details link */}
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
            onClick={handleLikeClick}
            disabled={isLiking}
            className="text-sm transition-all duration-300 flex items-center px-2 py-1 rounded-md hover:scale-[1.02] ease-in-out text-pink-400 hover:text-pink-300"
            aria-label="Like"
          >
            <span className="flex items-center">
              {isLiking ? (
                <svg className="w-5 h-5 mr-1 text-pink-400 animate-ping" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              )}
              {car.likes || 0}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ExploreContent: FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isSignupOpen, setIsSignupOpen] = useState<boolean>(false);
  const auth = useAuth();
  const user = auth.user;
  const refreshAuthState = auth.refreshAuthState;

  const fetchAllCars = async (): Promise<void> => {
    setLoading(true);
    try {
      const hostname = window.location.hostname;
      const backendUrl = `http://${hostname}:8000/get-all-cars`;
      const response = await axios.get(backendUrl);
      
      if (response.data.success) {
        setCars(response.data.cars);
      } else {
        console.error("Failed to fetch cars:", response.data.error);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false);
    }
  };

  const likeCar = async (userId: string, savedAt: string): Promise<void> => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    
    try {
      const hostname = window.location.hostname;
      const backendUrl = `http://${hostname}:8000/like-car/${userId}/${encodeURIComponent(savedAt)}`;
      const response = await axios.post(backendUrl);
      
      if (response.data.success) {
        setCars((prevCars: Car[]): Car[] => prevCars.map((car: Car): Car => car.userId === userId && car.savedAt === savedAt ? { ...car, likes: response.data.likes } : car));
      } else {
        console.error("Failed to like car:", response.data.error);
      }
    } catch (error) {
      console.error("Error liking car:", error);
    }
  };

  useEffect((): void => { fetchAllCars(); }, []);

  const handleCloseModals = (): void => { refreshAuthState(); setIsLoginOpen(false); setIsSignupOpen(false); };

  const handleSwitchToSignup = (): void => { setIsLoginOpen(false); setIsSignupOpen(true); };

  const handleSwitchToLogin = (): void => { setIsSignupOpen(false); setIsLoginOpen(true); };

  return (
    <>
      <title> Explore | What's That Car? </title>
      <div className="flex flex-col flex-1 w-full max-w-5xl px-6 py-4 mb-8 lg:py-8 fade-in">
        <h1 className="text-2xl font-bold mb-6 animate-gradient-text"> Explore Other Cars </h1>
        
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
                onLike={likeCar}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6">No car discoveries found. Be the first to share one!</p>
          </div>
        )}

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
};

export default ExploreContent;
