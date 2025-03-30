'use client';

import { useState } from 'react';
import AuthModals from '@/app/components/AuthModals';
import { useAuth } from '@/app/providers/AmplifyProvider';

interface AuthPromptProps {
  title: string;
  buttonText?: string;
  className?: string;
}

// Component with a title and a button underneath to prompt users to log in
const AuthPrompt = ({ title, buttonText = "Log in" }: AuthPromptProps) => {
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isSignupOpen, setIsSignupOpen] = useState<boolean>(false);
  const { refreshAuthState } = useAuth();

  // Close the modals
  const handleCloseModals = (): void => {
    refreshAuthState();
    setIsLoginOpen(false);
    setIsSignupOpen(false);
  };

  // Handlers to switch between signup/login modals
  const handleSwitchToSignup = (): void => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const handleSwitchToLogin = (): void => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  return (
    <div className = "flex flex-col flex-1 items-center w-full h-full p-8 gap-8 fade-in">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-custom-blue pt-8 pb-4"> {title} </h2>
        <button 
          onClick={() => setIsLoginOpen(true)}
          className="px-6 py-3 rounded-2xl text-white text-base font-semibold bg-primary-blue hover:bg-primary-blue-hover transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-blue-500/20"
        >
          {buttonText}
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
  );
};

export default AuthPrompt; 