"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { useAuth } from '@/app/providers/AmplifyProvider';
import AuthModals from '@/app/components/AuthModals';

// Sort options
type SortOption = 'newest' | 'oldest' | 'mostLiked';

// Car info
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
  likedBy: string[];
  username: string;
  profilePicture: string;
  description?: string;
};

type CarCardProps = {
  car: Car;
  onLike: (userId: string, savedAt: string) => void;
  onUnlike: (userId: string, savedAt: string) => void;
  hasLiked?: boolean;
  currentUsernames: Record<string, string>;
  profilePhotos: Record<string, string>;
};

const CarCard = ({ car, onLike, onUnlike, hasLiked = false, currentUsernames, profilePhotos }: CarCardProps) => {
  const make = car.carInfo.make;
  const model = car.carInfo.model;
  const year = car.carInfo.year;
  const currentUsername = currentUsernames[car.userId] || car.username;
  const savedDate = new Date(car.savedAt).toLocaleDateString('en-US', {  year: 'numeric',  month: 'short',  day: 'numeric' });

  const [imageError, setImageError] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [isPortraitImage, setIsPortraitImage] = useState<boolean>(false);
  const [showDescription, setShowDescription] = useState<boolean>(false);

  // Like a car post
  const handleLikeClick = (): void => {
    if (isLiking) return;
    setIsLiking(true);
    if (hasLiked) {
      onUnlike(car.userId, car.savedAt);
    } else {
      onLike(car.userId, car.savedAt);
    }
    setTimeout(() => setIsLiking(false), 1000);
  };

  // Loads an image and checks if it's portrait or landscape
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    setImageLoading(false);
    const img = event.target as HTMLImageElement;
    const isPortrait = img.naturalHeight > img.naturalWidth;
    setIsPortraitImage(isPortrait);
  };

  return (
    <div className="bg-gray-950/90 rounded-xl overflow-hidden shadow-md transition-all duration-300 border border-gray-900 hover:scale-[1.01] fade-in">
      <div className="flex items-center gap-2 p-3">
        <div className="relative h-8 w-8 rounded-full overflow-hidden">
          {/* Profile photo */}
          {profilePhotos[car.userId] ? (
            <Image
              src={profilePhotos[car.userId]}
              alt={currentUsername}
              fill
              sizes="32px"
              style={{ objectFit: "cover" }}
            />
          ) : (
            // Letter avatar if profile photo not available
            <div className="w-full h-full bg-custom-blue/70 flex items-center justify-center text-xs text-white font-bold">
              {currentUsername.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Post info */}
        <div className="flex flex-col text-left">
          <span className="text-sm font-medium text-white">{currentUsername || 'Unknown User'}</span>
          <p className="text-xs text-gray-500"> Posted on {savedDate} </p>
        </div>

        {/* Like button */}
        <div className="flex-1"></div>
        <button
          onClick={handleLikeClick}
          disabled={isLiking}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={hasLiked ? "Unlike" : "Like"}
        >
          {isLiking ? (
            <svg className="w-5 h-5 text-pink-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" clipRule="evenodd" />
            </svg>
          ) : hasLiked ? (
            <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          )}

          <span className="text-xs font-medium text-pink-400">{car.likes || 0}</span>
        </button>
      </div>
      
      {/* Car image */}
      <div className="relative h-80 w-full bg-gray-900">
        {imageError ? (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-3 text-center text-sm text-gray-500">
            Image unavailable
          </div>
        ) : (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900 bg-opacity-60">
                <div className="animate-spin rounded-full h-4 w-4"></div>
              </div>
            )}

            <Image
              src={car.imageUrl}
              alt={`${make} ${model}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ 
                objectFit: isPortraitImage ? "cover" : "contain",
                backgroundColor: isPortraitImage ? "transparent" : "rgba(3, 7, 18, 0.9)"
              }}
              className="transition-all duration-500 border-b border-t border-gray-900"
              onError={() => setImageError(true)}
              onLoad={handleImageLoad}
            />

            {/* Year in bottom right of image */}
            <div className="absolute bottom-2 right-3 z-20">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-600/80 backdrop-blur-sm text-white border border-blue-500/30 shadow-lg shadow-blue-500/10">
                {year}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        {/* Car info */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-left text-custom-blue"> {model} </h3>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-400"> {make} · {year} </p>

          <div className="flex-1"></div>
          {/* Description buttons */}
          {car.description && (
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
              aria-label={showDescription ? "Hide description" : "Show description"}
            >
              {showDescription ? "Hide description" : "View description"}
            </button>
          )}
        </div>
        
        {/* Description */}
        {car.description && (
          <div className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
            showDescription 
              ? 'max-h-[500px] opacity-100' 
              : 'max-h-0 opacity-0'
          }`}>
            <div className={`p-3 bg-gray-800/50 mt-2 rounded-lg border border-gray-700/50 transition-all duration-300 ease-in-out ${
              showDescription ? 'opacity-100' : 'opacity-0'
            }`}>
              <p className="text-sm text-left text-gray-300">{car.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ExploreContent = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isSignupOpen, setIsSignupOpen] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [currentUsernames, setCurrentUsernames] = useState<Record<string, string>>({});
  const [profilePhotos, setProfilePhotos] = useState<Record<string, string>>({});
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

  // Fetch current usernames for all car posters
  const fetchCurrentUsernames = useCallback(async (userIds: string[]): Promise<void> => {
    try {
      const hostname = window.location.hostname;
      const backendUrl = `http://${hostname}:8000/get-current-usernames`;
      const response = await axios.post(backendUrl, userIds);
      
      if (response.data.success) {
        setCurrentUsernames(response.data.usernames);
      } else {
        console.error("Failed to fetch current usernames:", response.data.error);
      }
    } catch (error) {
      console.error("Error fetching current usernames:", error);
    }
  }, []);

  // Fetch profile photos for all car posts
  const fetchProfilePhotos = useCallback(async (userIds: string[]): Promise<void> => {
    try {
      const hostname = window.location.hostname;
      const backendUrl = `http://${hostname}:8000/get-profile-photos`;
      const response = await axios.post(backendUrl, userIds);
      
      if (response.data.success) {
        setProfilePhotos(response.data.photos);
      } else {
        console.error("Failed to fetch profile photos:", response.data.error);
      }
    } catch (error) {
      console.error("Error fetching profile photos:", error);
    }
  }, []);

  // Fetch all car posts
  const fetchAllCars = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const hostname = window.location.hostname;
      const backendUrl = `http://${hostname}:8000/get-all-cars`;
      const response = await axios.get(backendUrl);
      
      if (response.data.success) {
        setCars(response.data.cars);
        // Fetch current usernames and profile photos for all cars
        const userIds = response.data.cars.map((car: Car) => car.userId);
        await Promise.all([
          fetchCurrentUsernames(userIds),
          fetchProfilePhotos(userIds)
        ]);
      } else {
        console.error("Failed to fetch cars:", response.data.error);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchCurrentUsernames, fetchProfilePhotos]);

  // Like a car post
  const likeCar = async (userId: string, savedAt: string): Promise<void> => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    
    try {
      const hostname = window.location.hostname;
      const backendUrl = `http://${hostname}:8000/like-car/${userId}/${encodeURIComponent(savedAt)}/${user.userId}`;
      const response = await axios.post(backendUrl);
      
      if (response.data.success) {
        // Update the cars state with the new like count and likedBy list
        setCars(prevCars => 
          prevCars.map(car => 
            car.userId === userId && car.savedAt === savedAt 
              ? { 
                  ...car, 
                  likes: response.data.likes,
                  likedBy: [...(car.likedBy || []), user.userId]
                } 
              : car
          )
        );
      } else {
        console.error("Failed to like car:", response.data.error);
      }
    } catch (error) {
      console.error("Error liking car:", error);
    }
  };

  // Unlike a car post
  const unlikeCar = async (userId: string, savedAt: string): Promise<void> => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    
    try {
      const hostname = window.location.hostname;
      const backendUrl = `http://${hostname}:8000/unlike-car/${userId}/${encodeURIComponent(savedAt)}/${user.userId}`;
      const response = await axios.post(backendUrl);
      
      if (response.data.success) {
        // Update the cars state with the new like count and likedBy list
        setCars(prevCars => 
          prevCars.map(car => 
            car.userId === userId && car.savedAt === savedAt 
              ? { 
                  ...car, 
                  likes: response.data.likes,
                  likedBy: (car.likedBy || []).filter(id => id !== user.userId)
                } 
              : car
          )
        );
      } else {
        console.error("Failed to unlike car:", response.data.error);
      }
    } catch (error) {
      console.error("Error unliking car:", error);
    }
  };

  // Fetch cars on component mount
  useEffect((): void => { fetchAllCars(); }, [fetchAllCars]);

  // Auth modal handlers
  const handleCloseModals = (): void => { refreshAuthState(); setIsLoginOpen(false); setIsSignupOpen(false); };

  const handleSwitchToSignup = (): void => { setIsLoginOpen(false); setIsSignupOpen(true); };

  const handleSwitchToLogin = (): void => { setIsSignupOpen(false); setIsLoginOpen(true); };

  // Sort cars based on selected option
  const handleSortChange = (option: SortOption): void => {
    setSortOption(option);
    setDropdownOpen(false);
  };

  // Sort types
  const sortedCars = [...cars].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      case 'oldest':
        return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
      case 'mostLiked':
        return (b.likes || 0) - (a.likes || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="flex flex-col flex-1 w-full max-w-5xl px-6 py-4 mb-8 lg:py-8 fade-in">
      <div className="flex flex-row items-center justify-between mb-6">
        <div className="relative mb-4 md:mb-0 ">
          <h1 className="text-2xl font-bold text-custom-blue mb-0 md:mb-0 text-left"> Explore Cars </h1>
          <div className="absolute -bottom-2 left-0 w-20 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
        </div>
        
        <div className="flex items-center self-start md:self-auto">
          {/* <span className="text-gray-400 text-xs md:text-sm mr-2"> Sort by </span> */}
          
          {/* Dropdown */}
          <div className="relative inline-block" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-between text-xs md:text-sm min-w-[140px] border border-gray-800 text-white py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-custom-blue/30 hover:bg-blue-950/20 hover:shadow-sm hover:shadow-blue-500/10 transition-all duration-200"
            >
              <span className="flex items-center">
                {sortOption === 'newest' && ( <Image src="/icons/sort-newest.svg" alt="Newest first" width={16} height={16} className="mr-2" /> )}
                {sortOption === 'oldest' && ( <Image src="/icons/sort-oldest.svg" alt="Oldest first" width={16} height={16} className="mr-2" /> )}
                {sortOption === 'mostLiked' && ( <Image src="/icons/sort-most-liked.svg" alt="Most liked" width={16} height={16} className="mr-2" /> )}
                {sortOption === 'newest' && 'Newest First'}
                {sortOption === 'oldest' && 'Oldest First'}
                {sortOption === 'mostLiked' && 'Most Liked'}
              </span>
              <Image src="/icons/chevron-down.svg" alt="Toggle dropdown" width={16} height={16} className={`ml-2 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div 
              className={`absolute right-0 mt-2 z-50 bg-gray-950/95 backdrop-blur-md border-[0.25px] border-blue-500/20 shadow-lg shadow-blue-500/10 rounded-xl overflow-hidden transition-all duration-300 ease-in-out w-full
                ${dropdownOpen ? 'max-h-[500px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4 pointer-events-none'}`}
            >
              <div className={`flex flex-col transition-all duration-300 ease-in-out
                ${dropdownOpen ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 -translate-y-4'}`}
              >
                <button 
                  onClick={() => handleSortChange('newest')}
                  className={`w-full text-left px-4 py-2.5 hover:bg-blue-950/30 transition-colors text-xs md:text-sm flex items-center ${sortOption === 'newest' ? 'bg-blue-950/40 text-white' : 'text-white'}`}
                >
                  <Image src="/icons/sort-newest.svg" alt="Newest first" width={16} height={16} className="mr-2" />
                  Newest First
                </button>
                <button 
                  onClick={() => handleSortChange('oldest')}
                  className={`w-full text-left px-4 py-2.5 hover:bg-blue-950/30 transition-colors text-xs md:text-sm flex items-center ${sortOption === 'oldest' ? 'bg-blue-950/40 text-white' : 'text-white'}`}
                >
                  <Image src="/icons/sort-oldest.svg" alt="Oldest first" width={16} height={16} className="mr-2" />
                  Oldest First
                </button>
                <button 
                  onClick={() => handleSortChange('mostLiked')}
                  className={`w-full text-left px-4 py-2.5 hover:bg-blue-950/30 transition-colors text-xs md:text-sm flex items-center ${sortOption === 'mostLiked' ? 'bg-blue-950/40 text-white' : 'text-white'}`}
                >
                  <Image src="/icons/sort-most-liked.svg" alt="Most liked" width={16} height={16} className="mr-2" />
                  Most Liked
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
                car={car} 
                onLike={likeCar}
                onUnlike={unlikeCar}
                hasLiked={user ? (car.likedBy || []).includes(user.userId) : false}
                currentUsernames={currentUsernames}
                profilePhotos={profilePhotos}
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
          <p className="text-gray-400 mb-6"> No cars discovered. Be the first to share one! </p>
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
  );
};

export default ExploreContent;
