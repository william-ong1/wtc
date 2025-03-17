"use client";

import { useState, useEffect, useRef, TouchEvent, MouseEvent } from "react";
import { FeatureCard } from "./Cards";

// Feature card data type
type FeatureCardData = {
  icon: string;
  title: string;
  description: string;
};

// Component props
interface HomeFeatureCardsProps {
  visible: boolean;
}

const HomeFeatureCards = ({ visible }: HomeFeatureCardsProps) => {
  // Feature cards state
  const [currentFeatureCard, setCurrentFeatureCard] = useState<number>(1);
  const [touchStartX, setTouchStartX] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  // Refs for smoother interaction
  const swipeOffsetRef = useRef<number>(0);
  const currentFeatureCardRef = useRef<number>(1);

  // Feature cards data
  const featureCards: FeatureCardData[] = [
    { icon: "🚗", title: "Instant Recognition", description: "Get results in seconds" },
    { icon: "🎯", title: "High Accuracy", description: "97% recognition rate" },
    { icon: "🔍", title: "Detailed Info", description: "Make, model, year & more" }
  ];

  // Update ref when state changes
  useEffect(() => {
    currentFeatureCardRef.current = currentFeatureCard;
  }, [currentFeatureCard]);

  useEffect(() => {
    swipeOffsetRef.current = swipeOffset;
  }, [swipeOffset]);

  // Touch event handlers for swiping
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (isAnimating) return;
    setTouchStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (isAnimating) return;
    setTouchStartX(e.clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isSwiping) return;
    
    const currentX = e.touches[0].clientX;
    updateSwipePosition(currentX);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isSwiping) return;
    e.preventDefault(); // Prevent text selection during swipe
    
    const currentX = e.clientX;
    updateSwipePosition(currentX);
  };

  const updateSwipePosition = (currentX: number) => {
    const diff = currentX - touchStartX;
    
    // Limit the swipe distance and add resistance at edges
    if ((currentFeatureCardRef.current === 0 && diff > 0) || 
        (currentFeatureCardRef.current === featureCards.length - 1 && diff < 0)) {
      setSwipeOffset(diff * 0.2); // Add resistance at edges
    } else {
      setSwipeOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    
    finishSwipe();
  };

  const handleMouseUp = () => {
    if (!isSwiping) return;
    
    finishSwipe();
  };

  const handleMouseLeave = () => {
    if (isSwiping) {
      finishSwipe();
    }
  };

  const finishSwipe = () => {
    setIsSwiping(false);
    
    // If swipe distance is significant, change card
    if (Math.abs(swipeOffsetRef.current) > 50) {
      setIsAnimating(true);
      
      if (swipeOffsetRef.current > 0 && currentFeatureCardRef.current > 0) {
        setCurrentFeatureCard(currentFeatureCardRef.current - 1);
      } else if (swipeOffsetRef.current < 0 && currentFeatureCardRef.current < featureCards.length - 1) {
        setCurrentFeatureCard(currentFeatureCardRef.current + 1);
      }
      
      // Reset animation flag after transition completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 350);
    }
    
    // Reset swipe offset
    setSwipeOffset(0);
  };

  return (
    <div className={`w-full transition-all duration-700 ease-out ${visible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
      {/* Desktop view - row of cards */}
      <div className="hidden lg:flex flex-row gap-8 mt-4 justify-center">
        {featureCards.map((card, index) => (
          <FeatureCard 
            key={index} 
            icon={card.icon} 
            title={card.title} 
            description={card.description} 
            large={false} 
          />
        ))}
      </div>

      {/* Mobile view - swipeable carousel */}
      <div className="lg:hidden mt-8 w-3/4 mx-auto">
        <div 
          className="relative overflow-hidden touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className={`flex ${isSwiping ? '' : 'transition-transform duration-350 ease-out'}`}
            style={{ 
              transform: `translateX(calc(-${currentFeatureCard * 100}% + ${swipeOffset}px))`,
            }}
          >
            {featureCards.map((card, index) => (
              <div 
                key={index} 
                className="w-full flex-shrink-0 px-4" 
                style={{ minWidth: '100%' }}
              >
                <div 
                  className={`transform transition-all duration-300 ${
                    Math.abs(currentFeatureCard - index) < 0.5 
                      ? 'scale-100 opacity-100' 
                      : 'scale-90 opacity-70'
                  }`}
                >
                  <FeatureCard 
                    key={index} 
                    icon={card.icon} 
                    title={card.title} 
                    description={card.description} 
                    large={false} 
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Dot indicator */}
          <div className="flex justify-center gap-3 mt-6">
            {featureCards.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentFeatureCard === index 
                    ? 'bg-indigo-500' 
                    : 'bg-gray-500/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeFeatureCards;
