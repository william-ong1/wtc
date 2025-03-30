"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const AboutContent = () => {
  const [aboutSectionVisible, setAboutSectionVisible] = useState(false);
  const [howItWorksSectionVisible, setHowItWorksSectionVisible] = useState(false);
  const [ctaSectionVisible, setCtaSectionVisible] = useState(false);
  const [comingSoonSectionVisible, setComingSoonSectionVisible] = useState(false);
  
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    
    // Mobile behavior
    if (isMobile) {
      setAboutSectionVisible(true);
      setTimeout(() => setHowItWorksSectionVisible(true), 200);
      setTimeout(() => setComingSoonSectionVisible(true), 600);
      setTimeout(() => setCtaSectionVisible(true), 800);
      return;
    }
    
    // Show About section first
    setAboutSectionVisible(true);
    
    // Show How It Works section after a delay
    setTimeout(() => {
      setHowItWorksSectionVisible(true);
    }, 400);
    
    // Show Coming Soon section
    setTimeout(() => {
      setComingSoonSectionVisible(true);
    }, 800);

    // Show CTA section
    setTimeout(() => {
      setCtaSectionVisible(true);
    }, 1200);
  }, []);
  

  return (
    
    <div className="flex flex-col flex-1 w-full max-w-5xl px-6 py-4 mb-8 lg:py-8 gap-8 md:gap-12 overflow-visible pb-8 fade-in">
      {/* About Us - Fade In */}
      <section 
        className={`flex flex-col text-left text-sm lg:text-base w-full max-w-5xl gap-2 lg:gap-4 transition-all duration-700 ease-out ${aboutSectionVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform'}`}>
          <div className="relative">
            <h1 className="text-2xl font-bold text-custom-blue pt-1"> About Us </h1>
            <div className="absolute -bottom-2 left-0 w-20 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
          </div>

        <p className="text-gray-300 leading-relaxed mt-5">
          We're passionate about helping car enthusiasts and curious minds identify vehicles using the latest AI technology.
        </p>
      </section>

      {/* How It Works - Slide In From Right */}
      <section 
        className={`flex flex-col text-left text-sm lg:text-base w-full max-w-5xl gap-2 lg:gap-4 mt-2 transition-all duration-700 ease-out ${howItWorksSectionVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-10'}`}>
          <div className="relative">
            <h1 className="text-2xl font-bold text-custom-blue"> How It Works </h1>
            <div className="absolute -bottom-2 left-0 w-20 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
          </div>

        <div className="relative flex flex-col gap-8 w-full max-w-3xl ml-4 mt-4">
          
          {/* Step 1 */}
          <div className="flex items-center gap-6 transition-all duration-700 ease-out relative z-10">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-900/70 border border-white/10 flex items-center justify-center mt-1.5">
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
          <div className="flex items-center gap-6 transition-all duration-700 ease-out relative z-10">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-900/70 border border-white/10 flex items-center justify-center mt-1.5">
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
          <div className="flex items-center gap-6 transition-all duration-700 ease-out relative z-10">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-900/70 border border-white/10 flex items-center justify-center mt-1.5">
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

      {/* Coming Soon - Slide In From Left */}
      <section 
        className={`flex flex-col text-left text-sm lg:text-base w-full max-w-5xl mt-2 gap-2 lg:gap-4 transition-all duration-700 ease-out ${comingSoonSectionVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-10'}`}>
          <div className="relative">
            <h1 className="text-2xl font-bold text-custom-blue mt-2"> Coming Soon... </h1>
            <div className="absolute -bottom-2 left-0 w-20 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
          </div>
        
        <div className="relative flex flex-col gap-8 w-full max-w-4xl ml-4 mt-4">
          {/* Comments Feature */}
          <div className="flex items-center gap-6 transition-all duration-700 ease-out relative z-10">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-900/70 border border-white/10 flex items-center justify-center mt-1.5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white mb-2"> Comment Sections </h3>
              <p className="text-gray-300 text-sm break-words"> Engage with the community in comment threads. Share your knowledge, ask questions, and connect with others. </p>
            </div>
          </div>
          
          {/* Similar Cars Feature */}
          <div className="flex items-center gap-6 transition-all duration-700 ease-out relative z-10">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-900/70 border border-white/10 flex items-center justify-center mt-1.5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white mb-2"> View Similar Results </h3>
              <p className="text-gray-300 text-sm break-words"> View vehicles that other users found that are similar to yours. </p>
            </div>
          </div>
          
          {/* Have ideas? Contact us */}
          <div className="flex items-center gap-6 transition-all duration-700 ease-out relative z-10">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-900/70 border border-white/10 flex items-center justify-center mt-1.5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white mb-2"> Have Any Other Ideas? </h3>
              <p className="text-gray-300 text-sm break-words"> 
                We'd love to hear your suggestions for new features! Visit our 
                <Link href="/contact" className="text-custom-blue hover:text-custom-blue/85 transition-colors mx-1">
                  contact
                </Link> 
                page to share your ideas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Slide Up From Bottom */}
      <section 
        className={`flex flex-col text-left text-sm lg:text-base w-full max-w-5xl gap-2 lg:gap-4 mt-2 mb-4 transition-all duration-700 ease-out ${ctaSectionVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
          <div className="relative">
            <h1 className="text-2xl font-bold text-custom-blue"> Ready to Identify a Car? </h1>
            <div className="absolute -bottom-2 left-0 w-20 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
          </div>

        <Link href="/" className="inline-flex items-center justify-center px-5 py-3 rounded-2xl text-white text-sm mt-4 lg:text-base font-semibold bg-primary-blue hover:bg-primary-blue-hover transition-all duration-300 ease-in-out transform cursor-pointer hover:scale-105 shadow-lg hover:shadow-indigo-500/20 w-fit">
          Try It Now!
        </Link>
      </section>
    </div>
  );
};

export default AboutContent;
