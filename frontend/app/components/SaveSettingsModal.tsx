"use client";

import { useEffect, useState, useRef } from "react";

type SaveSettingsModalProps = {
  isOpen: boolean;
  isPrivate: boolean;
  description: string;
  onClose: () => void;
  onSave: () => void;
  onTogglePrivacy: (isPrivate: boolean) => void;
  onDescriptionChange: (description: string) => void;
};

const SaveSettingsModal = ({ 
  isOpen, 
  isPrivate, 
  description, 
  onClose, 
  onSave, 
  onTogglePrivacy,
  onDescriptionChange 
}: SaveSettingsModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const scrollYRef = useRef(0);

  // Handle animation when opening/closing the modal
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);

      // Save the current scroll position and prevent scrolling
      scrollYRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = '100%';
    } else {
      setIsVisible(false);
      
      // Re-enable scrolling when modal is closed
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      // Restore scroll position
      window.scrollTo(0, scrollYRef.current);
    }

    return () => {
      // In case component unmounts while modal is open
      if (document.body.style.position === 'fixed') {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollYRef.current);
      }
    };
  }, [isOpen]);
  
  const handleCloseWithAnimation = () => {
    setIsClosing(true);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match this with the animation duration
  };

  const handleSave = () => {
    setIsClosing(true);
    // Wait for animation to complete before actually saving
    setTimeout(() => {
      onSave();
      setIsClosing(false);
    }, 300); // Match this with the animation duration
  };
  
  if (!isOpen && !isClosing) return null;
  
  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out
        ${isVisible && !isClosing ? 'opacity-100' : 'opacity-0'}
        ${isVisible || isClosing ? 'pointer-events-auto' : 'pointer-events-none'}
      `}
      onClick={(e) => {
        // Close modal when clicking outside
        if (e.target === e.currentTarget) handleCloseWithAnimation();
      }}
    >
      <div 
        className={`bg-gray-950 rounded-3xl p-6 max-w-md w-full shadow-md shadow-blue-300/20 border border-gray-800 relative transition-all duration-300 ease-in-out
          ${isVisible && !isClosing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Description field */}
        <div className="mb-6 fade-in">
          <label htmlFor="description" className="block text-base font-medium text-white mb-2">
            Description (Optional)
          </label>
          <div className="group relative">
            <textarea
              id="description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Add details about this car..."
              className="text-sm w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors duration-200"
              rows={3}
              maxLength={200}
            />
            <div className="absolute inset-0 pointer-events-none rounded-xl ring-2 ring-blue-500/10 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100"></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {description.length}/200 characters
          </p>
        </div>
        
        <div className="flex justify-center space-x-8 mb-4 fade-in">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => onTogglePrivacy(false)}
          >
            <div className={`h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center mr-2 ${!isPrivate ? 'border-blue-400' : 'border-gray-600'}`}>
              {!isPrivate && <div className="h-3 w-3 rounded-full bg-blue-400"></div>}
            </div>
            <div>
              <span className="font-medium text-white">Public</span>
            </div>
          </div>
          
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => onTogglePrivacy(true)}
          >
            <div className={`h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center mr-2 ${isPrivate ? 'border-blue-400' : 'border-gray-600'}`}>
              {isPrivate && <div className="h-3 w-3 rounded-full bg-blue-400"></div>}
            </div>
            <div>
              <span className="font-medium text-white">Private</span>
            </div>
          </div>
        </div>
        
        <div className="text-gray-400 text-sm text-center mb-6 px-4 py-3 bg-gray-800/50 rounded-lg fade-in">
          {isPrivate ? 
            "Only visible to you in your saved cars" : 
            "Visible to everyone on the Explore page"}
        </div>
        
        <div className="flex gap-3 justify-end fade-in">
          <button
            onClick={handleCloseWithAnimation}
            className="flex-1 px-4 py-2 bg-gray-900/90 hover:bg-gray-800/70 hover:border-blue-500/30 rounded-xl text-white font-medium disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-300 ease-in-out text-white font-medium disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveSettingsModal; 