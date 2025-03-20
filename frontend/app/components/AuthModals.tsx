'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { signIn, signUp, confirmSignUp, resetPassword, confirmResetPassword } from 'aws-amplify/auth';

interface AuthModalsProps {
  isLoginOpen: boolean;
  isSignupOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToLogin: () => void;
}

export default function AuthModals({ isLoginOpen, isSignupOpen, onClose, onSwitchToSignup, onSwitchToLogin }: AuthModalsProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPasswordConfirmation, setShowResetPasswordConfirmation] = useState(false);

  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Handle animation when opening/closing the modal
  useEffect(() => {
    if (isLoginOpen || isSignupOpen) {
      setIsVisible(true);
      setIsClosing(false);
      // Prevent scrolling on the body when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoginOpen, isSignupOpen]);

  const handleCloseWithAnimation = () => {
    setIsClosing(true);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match this with the animation duration
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsProcessing(true);
    
    try {
      await signIn({ username, password });
      handleCloseWithAnimation();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.name === 'UserNotConfirmedException') {
        setError('Please confirm your account first. Check your email for a confirmation code.');
        setShowConfirmation(true);
      } else {
        setError(error.message || 'Failed to sign in');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsProcessing(true);
    
    try {
      await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email
          },
          autoSignIn: true
        }
      });
      setShowConfirmation(true);
      setSuccessMessage('Please check your email for a confirmation code.');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to sign up');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsProcessing(true);
    
    try {
      await confirmSignUp({
        username,
        confirmationCode
      });
      
      // Try to sign in automatically after confirmation
      try {
        await signIn({ username, password });
        handleCloseWithAnimation();
      } catch (signInError: any) {
        console.error('Auto sign-in after confirmation failed:', signInError);
        setShowConfirmation(false);
        setSuccessMessage('Account confirmed. Please sign in now.');
      }
    } catch (error: any) {
      console.error('Confirmation error:', error);
      setError(error.message || 'Failed to confirm sign up');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsProcessing(true);
    
    try {
      await resetPassword({ username });
      setShowResetPasswordConfirmation(true);
      setShowForgotPassword(false);
      setSuccessMessage('Password reset code sent to your email.');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to initiate password reset');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPasswordConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsProcessing(true);
    
    try {
      await confirmResetPassword({
        username,
        confirmationCode,
        newPassword
      });
      setShowResetPasswordConfirmation(false);
      setSuccessMessage('Password has been reset successfully. You can now log in with your new password.');
    } catch (error: any) {
      console.error('Reset password confirmation error:', error);
      setError(error.message || 'Failed to reset password');
    } finally {
      setIsProcessing(false);
    }
  };

  const switchToSignup = () => {
    setError('');
    setSuccessMessage('');
    setShowConfirmation(false);
    setShowForgotPassword(false);
    setShowResetPasswordConfirmation(false);
    onSwitchToSignup();
  };

  const switchToLogin = () => {
    setError('');
    setSuccessMessage('');
    setShowConfirmation(false);
    setShowForgotPassword(false);
    setShowResetPasswordConfirmation(false);
    onSwitchToLogin();
  };

  const handleForgotPasswordClick = () => {
    setError('');
    setSuccessMessage('');
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setError('');
    setSuccessMessage('');
    setShowForgotPassword(false);
    setShowResetPasswordConfirmation(false);
  };

  if (!isLoginOpen && !isSignupOpen && !isClosing) return null;

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
        className={`bg-gray-950 rounded-3xl p-6 w-full max-w-xs shadow-lg shadow-indigo-500/20 border border-indigo-500/30 relative transition-all duration-300 ease-in-out
          ${isVisible && !isClosing ? 'opacity-100 scale-100 ' : 'opacity-0 scale-100'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={handleCloseWithAnimation}
          className="absolute right-4 top-4 text-gray-400 hover:text-white p-1 z-10 transition-colors duration-200"
          disabled={isProcessing}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Logo at the top center */}
        <div className="flex justify-center">
          <Image
            src="/images/logo.png" 
            alt="Logo" 
            width={100} 
            height={100} 
            className="mb-2"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white text-center w-full">
            {showConfirmation ? 'Confirm Your Account' : 
             showForgotPassword ? 'Reset Your Password' : 
             showResetPasswordConfirmation ? 'Enter New Password' :
             isLoginOpen ? 'Welcome Back' : 'Create an Account'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 fade-in text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4 fade-in text-sm">
            {successMessage}
          </div>
        )}

        {isLoginOpen && !showConfirmation && !showForgotPassword && !showResetPasswordConfirmation && (
          <>
            <form onSubmit={handleLogin} className="space-y-4 fade-in">
              <div>
                <label htmlFor="email" className="block text-md font-medium text-gray-300 mb-1 text-left">
                  Email or Username
                </label>
                <input
                  id="email"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900/90 border border-indigo-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                  disabled={isProcessing}
                  placeholder="Email or Username"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1 text-left">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900/90 border border-indigo-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                  disabled={isProcessing}
                  placeholder="Password"
                />
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="button" 
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                  onClick={handleForgotPasswordClick}
                >
                  Forgot password?
                </button>
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-2 bg-[#3B03FF]/80 hover:bg-[#4B13FF] rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-300 ease-in-out text-white font-medium disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] text-sm"
                disabled={isProcessing}
              >
                {isProcessing ? 'Logging in...' : 'Log In'}
              </button>
            </form>
            
            <div className="mt-6 text-center fade-in">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <button 
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-200 text-sm"
                  onClick={switchToSignup}
                >
                  Sign up
                </button>
              </p>
            </div>
          </>
        )}

        {isSignupOpen && !showConfirmation && (
          <>
            <form onSubmit={handleSignup} className="space-y-4 fade-in">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1 text-left">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900/90 border border-indigo-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                  disabled={isProcessing}
                  placeholder="Choose a username"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1 text-left">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900/90 border border-indigo-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                  disabled={isProcessing}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1 text-left">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900/90 border border-indigo-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                  disabled={isProcessing}
                  placeholder="Create a password"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-[#3B03FF]/80 hover:bg-[#4B13FF] rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-300 ease-in-out text-white font-medium disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] text-sm"
                disabled={isProcessing}
              >
                {isProcessing ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
            
            <div className="mt-6 text-center fade-in">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <button 
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-200 text-sm"
                  onClick={switchToLogin}
                >
                  Log in
                </button>
              </p>
            </div>
          </>
        )}

        {showForgotPassword && (
          <>
            <form onSubmit={handleForgotPassword} className="space-y-4 fade-in">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-300 mb-1 text-left">
                  Email
                </label>
                <input
                  id="reset-email"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900/90 border border-indigo-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                  disabled={isProcessing}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="flex-1 px-4 py-2 bg-gray-900/90 hover:bg-gray-800/70 hover:border-indigo-500/30 rounded-xl text-white font-medium disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm"
                  disabled={isProcessing}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#3B03FF]/80 hover:bg-[#4B13FF] rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-300 ease-in-out text-white font-medium disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] text-sm"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Sending...' : 'Send Reset Code'}
                </button>
              </div>
            </form>
          </>
        )}

        {showResetPasswordConfirmation && (
          <>
            <form onSubmit={handleResetPasswordConfirmation} className="space-y-4 fade-in">
              <div>
                <label htmlFor="reset-code" className="block text-sm font-medium text-gray-300 mb-1 text-left">
                  Reset Code
                </label>
                <input
                  id="reset-code"
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1245] border border-indigo-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                  disabled={isProcessing}
                  placeholder="Enter the code from your email"
                />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-300 mb-1 text-left">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1245] border border-indigo-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                  disabled={isProcessing}
                  placeholder="Enter your new password"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600/90 hover:border-indigo-500/30 rounded-xl text-white font-medium disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm"
                  disabled={isProcessing}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-[#4B13FF] rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-300 ease-in-out text-white font-medium disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] text-sm"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        )}

        {showConfirmation && (
          <form onSubmit={handleConfirmSignup} className="space-y-4 fade-in">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1 text-left">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1245] border border-indigo-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                required
                disabled={isProcessing}
              />
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1 text-left">
                Confirmation Code
              </label>
              <input
                id="code"
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1245] border border-indigo-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                required
                disabled={isProcessing}
                placeholder="Enter the code from your email"
              />
              <p className="text-sm text-gray-400 mt-1">
                Please check your email for the confirmation code.
              </p>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-[#4B13FF] rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-300 ease-in-out text-white font-medium disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] text-sm"
              disabled={isProcessing}
            >
              {isProcessing ? 'Confirming...' : 'Confirm Sign Up'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 