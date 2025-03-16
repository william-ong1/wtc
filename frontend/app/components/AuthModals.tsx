'use client';

import { useState } from 'react';
import { signIn, signUp, confirmSignUp } from 'aws-amplify/auth';

interface AuthModalsProps {
  isLoginOpen: boolean;
  isSignupOpen: boolean;
  onClose: () => void;
}

export default function AuthModals({ isLoginOpen, isSignupOpen, onClose }: AuthModalsProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);
    
    try {
      await signIn({ username, password });
      onClose();
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
    setIsProcessing(true);
    
    try {
      await confirmSignUp({
        username,
        confirmationCode
      });
      
      // Try to sign in automatically after confirmation
      try {
        await signIn({ username, password });
        onClose();
      } catch (signInError: any) {
        console.error('Auto sign-in after confirmation failed:', signInError);
        setShowConfirmation(false);
        setError('Account confirmed. Please sign in now.');
      }
    } catch (error: any) {
      console.error('Confirmation error:', error);
      setError(error.message || 'Failed to confirm sign up');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoginOpen && !isSignupOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0f0a2c] rounded-xl p-6 w-full max-w-md shadow-lg shadow-indigo-500/20 border border-indigo-500/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            {showConfirmation ? 'Confirm Sign Up' : isLoginOpen ? 'Log In' : 'Sign Up'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={isProcessing}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {isLoginOpen && !showConfirmation && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1245] border border-indigo-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isProcessing}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1245] border border-indigo-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isProcessing}
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-300 ease-in-out text-white font-medium disabled:opacity-50"
              disabled={isProcessing}
            >
              {isProcessing ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        )}

        {isSignupOpen && !showConfirmation && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1245] border border-indigo-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isProcessing}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1245] border border-indigo-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isProcessing}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1245] border border-indigo-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isProcessing}
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-300 ease-in-out text-white font-medium disabled:opacity-50"
              disabled={isProcessing}
            >
              {isProcessing ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        )}

        {showConfirmation && (
          <form onSubmit={handleConfirmSignup} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1245] border border-indigo-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isProcessing}
              />
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1">
                Confirmation Code
              </label>
              <input
                id="code"
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1245] border border-indigo-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isProcessing}
              />
              <p className="text-sm text-gray-400 mt-1">
                Please check your email for the confirmation code.
              </p>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-300 ease-in-out text-white font-medium disabled:opacity-50"
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