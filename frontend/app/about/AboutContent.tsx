"use client";

import Link from "next/link";
import { FeatureCard } from "../components/Cards";
import { useState, useEffect, useRef, RefObject, Dispatch, SetStateAction } from "react";

const AboutContent = () => {

  const [aboutSectionVisible, setAboutSectionVisible] = useState<boolean>(false);
  const [howItWorksSectionVisible, setHowItWorksSectionVisible] = useState<boolean>(false);
  const [featureCardsVisible, setFeatureCardsVisible] = useState<boolean>(false);
  const [ctaSectionVisible, setCtaSectionVisible] = useState<boolean>(false);
  
  const aboutSectionRef = useRef<HTMLDivElement>(null);
  const howItWorksSectionRef = useRef<HTMLDivElement>(null);
  const featureCardsRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);
  
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
    
    const aboutSectionObserver = createObserver(aboutSectionRef, setAboutSectionVisible);
    const howItWorksSectionObserver = createObserver(howItWorksSectionRef, setHowItWorksSectionVisible);
    const featureCardsObserver = createObserver(featureCardsRef, setFeatureCardsVisible);
    const ctaSectionObserver = createObserver(ctaSectionRef, setCtaSectionVisible);
    
    // Cleanup function
    return () => {
      if (aboutSectionObserver) aboutSectionObserver.disconnect();
      if (howItWorksSectionObserver) howItWorksSectionObserver.disconnect();
      if (featureCardsObserver) featureCardsObserver.disconnect();
      if (ctaSectionObserver) ctaSectionObserver.disconnect();
    };
  }, []);
  
  
  return (
    <div className="flex flex-col flex-1 items-center w-3/4 h-full p-8 px-12 gap-12 fade-in">

      {/* About Us */}
      <section 
        ref={aboutSectionRef}
        className={`flex flex-col items-center text-center w-3/4 gap-4 transition-all duration-700 ease-out ${ aboutSectionVisible  ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10' }`}>
        <h1 className="text-2xl font-bold animate-gradient-text"> About Us </h1>
        <p className="text-gray-300 leading-relaxed">
          We're passionate about helping car enthusiasts and curious minds identify vehicles using the latest AI technology.
        </p>
      </section>

      {/* How It Works */}
      <section 
        ref={howItWorksSectionRef}
        className={`flex flex-col items-center text-center w-3/4 gap-4 transition-all duration-700 ease-out ${ howItWorksSectionVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10' }`}>
        <h1 className="text-2xl font-bold animate-gradient-text"> How It Works </h1>
        <div ref={featureCardsRef} className="grid md:grid-cols-3 gap-8 w-4/5" >
          <div className={`transition-all duration-700 ease-out ${ featureCardsVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10' }`}>
            <FeatureCard icon="📸" title="Upload an Image" description="Take a photo of a car or upload one to our platform." large={true} />
          </div>
          
          <div className={`transition-all duration-700 delay-150 ease-out ${ featureCardsVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10' }`}>
            <FeatureCard icon="🤖" title="AI Analysis" description="The latest AI models will identify the make, model, year, and more." large={true} />
          </div>
          
          <div className={`transition-all duration-700 delay-300 ease-out ${ featureCardsVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10' }`}>
            <FeatureCard icon="📊" title="Get Results" description="Receive vehicle details in a clean and organized format." large={true} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaSectionRef} className={`flex flex-col items-center text-center w-3/4 gap-4 transition-all duration-700 ease-out ${ ctaSectionVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10' }`}>
        <h1 className="text-2xl font-bold animate-gradient-text"> Ready to Identify A Car? </h1>
        <Link href="/" className="inline-block px-6 py-3 rounded-2xl text-white text-md font-semibold bg-[#3B03FF]/80 transition-all duration-300 ease-in-out transform cursor-pointer hover:scale-105 shadow-lg hover:shadow-blue-500/20">
          Try It Now!
        </Link>
      </section>

    </div>
  );
};

export default AboutContent;
