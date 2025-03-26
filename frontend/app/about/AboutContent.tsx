"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const AboutContent = () => {
  const [aboutSectionVisible, setAboutSectionVisible] = useState(false);
  const [howItWorksSectionVisible, setHowItWorksSectionVisible] = useState(false);
  const [step1Visible, setStep1Visible] = useState(false);
  const [step2Visible, setStep2Visible] = useState(false);
  const [step3Visible, setStep3Visible] = useState(false);
  const [ctaSectionVisible, setCtaSectionVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    
    // Mobile behavior
    if (isMobile) {
      setAboutSectionVisible(true);
      setTimeout(() => setHowItWorksSectionVisible(true), 200);
      setTimeout(() => setStep1Visible(true), 400);
      setTimeout(() => setStep2Visible(true), 600);
      setTimeout(() => setStep3Visible(true), 800);
      setTimeout(() => setCtaSectionVisible(true), 1000);
      setTimeout(() => setIsLoading(false), 1200);
      return;
    }
    
    // Desktop behavior with sequential animation
    setIsLoading(false);
    
    // Show About section first
    setAboutSectionVisible(true);
    
    // Show How It Works section after a delay
    setTimeout(() => {
      setHowItWorksSectionVisible(true);
      
      // Show steps with sequential delays
      setTimeout(() => setStep1Visible(true), 200);
      setTimeout(() => setStep2Visible(true), 400);
      setTimeout(() => setStep3Visible(true), 600);
    }, 200);
    
    // Show CTA section last, after all steps are complete
    setTimeout(() => {
      setCtaSectionVisible(true);
    }, 1000);
  }, []);
  

  return (
    
    <div className="flex flex-col flex-1 w-full max-w-5xl px-6 py-4 mb-8 lg:py-8 gap-8 md:gap-12 overflow-visible pb-8 fade-in">
      {/* About Us */}
      <section 
        className={`flex flex-col text-left text-sm lg:text-base w-full max-w-5xl gap-2 lg:gap-4 transition-all duration-700 ease-out ${aboutSectionVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform'}`}>
        <h1 className="text-2xl font-bold text-custom-blue"> About Us </h1>
        <p className="text-gray-300 leading-relaxed">
          We're passionate about helping car enthusiasts and curious minds identify vehicles using the latest AI technology.
        </p>
      </section>

      {/* How It Works */}
      <section 
        className={`flex flex-col text-left text-sm lg:text-base w-full max-w-5xl gap-2 lg:gap-4 mt-2 transition-all duration-700 ease-out ${howItWorksSectionVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform'}`}>
        <h1 className="text-2xl font-bold text-custom-blue"> How It Works </h1>
        <div className="relative flex flex-col gap-8 w-full max-w-3xl ml-4 mt-4">
          
          {/* Step 1 */}
          <div className={`flex items-start gap-6 transition-all duration-700 ease-out relative z-10 ${step1Visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-900/90 border border-white/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white mb-2">Upload an Image</h3>
              <p className="text-gray-300 text-sm break-words">Take a photo of a car or upload one to our platform.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`flex items-start gap-6 transition-all duration-700 ease-out relative z-10 ${step2Visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-900/90 border border-white/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white mb-2">AI Analysis</h3>
              <p className="text-gray-300 text-sm break-words">The latest AI models will identify the make, model, year, and more.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`flex items-start gap-6 transition-all duration-700 ease-out relative z-10 ${step3Visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-900/90 border border-white/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white mb-2">Get Results</h3>
              <p className="text-gray-300 text-sm break-words">Receive vehicle details in a clean and organized format.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section 
        className={`flex flex-col text-left text-sm lg:text-base w-full max-w-5xl gap-2 lg:gap-4 mt-2 mb-4 transition-all duration-700 ease-out ${ctaSectionVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform'}`}>
        <h1 className="text-2xl font-bold text-custom-blue"> Ready to Identify a Car? </h1>
        <Link href="/" className="inline-flex items-center justify-center px-5 py-3 rounded-2xl text-white text-sm lg:text-base font-semibold bg-primary-blue hover:bg-primary-blue-hover transition-all duration-300 ease-in-out transform cursor-pointer hover:scale-105 shadow-lg hover:shadow-indigo-500/20 w-fit">
          Try It Now!
        </Link>
      </section>
    </div>
  );
};

export default AboutContent;
