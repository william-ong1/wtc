"use client";

import Link from "next/link";
import { FeatureCard } from "../components/Cards";
import { useState, useEffect, useRef } from "react";

const AboutContent = () => {
  const [aboutSectionVisible, setAboutSectionVisible] = useState(false);
  const [howItWorksSectionVisible, setHowItWorksSectionVisible] = useState(false);
  const [featureCardsVisible, setFeatureCardsVisible] = useState(false);
  const [ctaSectionVisible, setCtaSectionVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const aboutSectionRef = useRef(null);
  const howItWorksSectionRef = useRef(null);
  const featureCardsRef = useRef(null);
  const ctaSectionRef = useRef(null);
  
  // Simplified useEffect to avoid block statements
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    
    // Mobile behavior
    if (isMobile) {
      setAboutSectionVisible(true);
      setHowItWorksSectionVisible(true);
      setFeatureCardsVisible(true);
      setCtaSectionVisible(true);
      setTimeout(() => setIsLoading(false), 300);
      return;
    }
    
    // Desktop behavior with intersection observer
    setIsLoading(false);
    
    // Observer callback without block statements
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        
        const element = entry.target;
        if (element === aboutSectionRef.current) setAboutSectionVisible(true);
        if (element === howItWorksSectionRef.current) setHowItWorksSectionVisible(true);
        if (element === featureCardsRef.current) setFeatureCardsVisible(true);
        if (element === ctaSectionRef.current) setCtaSectionVisible(true);
        
        observer.unobserve(element);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -10% 0px" });
    
    // Observe all sections
    if (aboutSectionRef.current) observer.observe(aboutSectionRef.current);
    if (howItWorksSectionRef.current) observer.observe(howItWorksSectionRef.current);
    if (featureCardsRef.current) observer.observe(featureCardsRef.current);
    if (ctaSectionRef.current) observer.observe(ctaSectionRef.current);
    
    // Cleanup function
    return () => observer.disconnect();
  }, []);
  
  // Spinner component to avoid logical operator in JSX
  const LoadingSpinner = () => isLoading ? (
    <div className="animate-spin rounded-full mb-0.5 h-4 w-4 border-t-2 border-b-2 border-white ml-1"></div>
  ) : null;
  
  return (
    <div className="flex flex-col flex-1 items-center w-full lg:w-3/4 h-full py-4 lg:py-8 px-6 lg:px-12 gap-4 md:gap-8 overflow-visible pb-8">
      {/* About Us */}
      <section 
        ref={aboutSectionRef}
        className={`flex flex-col items-center text-center text-sm lg:text-base w-full lg:w-3/4 gap-2 lg:gap-4 transition-all duration-700 ease-out ${aboutSectionVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
        <h1 className="text-2xl font-bold animate-gradient-text"> About Us </h1>
        <p className="text-gray-300 leading-relaxed">
          We're passionate about helping car enthusiasts and curious minds identify vehicles using the latest AI technology.
        </p>
      </section>

      {/* How It Works */}
      <section 
        ref={howItWorksSectionRef}
        className={`flex flex-col items-center text-center w-full lg:w-3/4 gap-2 lg:gap-4 mt-2 transition-all duration-700 ease-out ${howItWorksSectionVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
        <h1 className="text-2xl font-bold animate-gradient-text"> How It Works </h1>
        <div ref={featureCardsRef} className="grid md:grid-cols-3 gap-6 mt-2 w-full md:w-4/5">
          <div className={`transition-all duration-700 ease-out ${featureCardsVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <FeatureCard icon="📸" title="Upload an Image" description="Take a photo of a car or upload one to our platform." large={true} />
          </div>
          
          <div className={`transition-all duration-700 delay-150 ease-out ${featureCardsVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <FeatureCard icon="🤖" title="AI Analysis" description="Latest AI models will identify the make, model, year, and more." large={true} />
          </div>
          
          <div className={`transition-all duration-700 delay-300 ease-out ${featureCardsVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <FeatureCard icon="📊" title="Get Results" description="Receive vehicle details in a clean and organized format." large={true} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section 
        ref={ctaSectionRef} 
        className={`flex flex-col items-center text-center w-full lg:w-3/4 gap-2 lg:gap-4 mt-6 mb-4 transition-all duration-700 ease-out ${ctaSectionVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
        <h1 className="text-2xl font-bold animate-gradient-text"> Ready to Identify A Car? </h1>
        <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-2xl text-white text-sm lg:text-base font-semibold bg-[#3B03FF]/80 hover:bg-[#4B13FF] transition-all duration-300 ease-in-out transform cursor-pointer hover:scale-105 shadow-lg hover:shadow-blue-500/20">
          Try It Now!
        </Link>
      </section>
    </div>
  );
};

export default AboutContent;
