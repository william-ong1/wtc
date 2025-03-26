'use client';

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/app/providers/AmplifyProvider';
import AuthModals from '@/app/components/AuthModals';
import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';
import axios from 'axios';

interface UserProfile {
  username: string;
  email: string;
  bio: string;
  profilePicture?: string;
}

const ProfileEditContent = () => {
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    email: '',
    bio: '',
    profilePicture: ''
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isSignupOpen, setIsSignupOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user, refreshAuthState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user attributes
        const attributes = await fetchUserAttributes();
        
        // Create profile from attributes
        setProfile({
          username: attributes.preferred_username || user.username || 'User',
          email: attributes.email || '',
          bio: attributes.profile || '',
          profilePicture: attributes.picture || '',
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setErrorMessage('Unable to load your profile information');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // File size validation (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image file size must be less than 5MB');
        return;
      }

      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setNewProfilePicture(file);
      setErrorMessage('');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
    setErrorMessage('');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // In a real app, you would upload the image to a storage service 
      // and get back a URL. Here we're just simulating this.
      let pictureUrl = profile.profilePicture;
      
      if (newProfilePicture) {
        // Simulating image upload - in a real app, you would upload to S3 or similar
        // and get back the URL
        pictureUrl = previewUrl; // Using the data URL as a placeholder for demo purposes
      }
      
      // Update user attributes in Cognito
      await updateUserAttributes({
        userAttributes: {
          preferred_username: profile.username,
          profile: profile.bio,
          // Only include picture if it exists
          ...(pictureUrl ? { picture: pictureUrl } : {})
        }
      });

      // Update username in our database if it has changed
      if (user && profile.username !== user.username) {
        const hostname = window.location.hostname;
        const backendUrl = `http://${hostname}:8000/update-username`;
        await axios.post(backendUrl, {
          user_id: user.userId,
          new_username: profile.username
        });
      }
      
      setSuccessMessage('Profile updated successfully!');
      
      // Refresh auth state after 1 second to update UI
      setTimeout(() => {
        refreshAuthState();
      }, 1000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrorMessage(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModals = (): void => {
    refreshAuthState();
    setIsLoginOpen(false);
    setIsSignupOpen(false);
  };

  const handleSwitchToSignup = (): void => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const handleSwitchToLogin = (): void => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!user) {
    return (
      <>
        <title> Edit Profile | What's That Car? </title>
        <div className="flex flex-col flex-1 items-center justify-center w-full h-full p-4 gap-8 fade-in">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-custom-blue pt-8 pb-4">Sign In to Edit Your Profile</h2>
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="px-6 py-3 rounded-2xl text-white text-base font-semibold bg-primary-blue hover:bg-primary-blue-hover transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-blue-500/20"
            >
              Sign In
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
      </>
    );
  }

  return (
    <>
      <title> Edit Profile | What's That Car? </title>
      <div className="flex flex-col flex-1 w-full max-w-4xl px-6 py-4 mb-8 lg:py-8 fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl font-bold animate-gradient-text mb-3 md:mb-0"> Edit Your Profile </h1>
          
          <div className="flex space-x-3">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm font-medium border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl bg-white/5 hover:bg-indigo-900/20 text-white transition-all duration-300 ease-in-out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Profile
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-gray-900/60 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-6 shadow-lg shadow-indigo-500/10">
            {successMessage && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/40 rounded-xl text-green-200">
                {successMessage}
              </div>
            )}
            
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200">
                {errorMessage}
              </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center">
                <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-lg shadow-indigo-500/20 mb-4">
                  {(previewUrl || profile?.profilePicture) ? (
                    <Image
                      src={previewUrl || profile.profilePicture || ''}
                      alt={profile.username}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-4xl text-white font-bold">
                      {profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="px-4 py-2 text-sm font-medium bg-indigo-600/60 hover:bg-indigo-600/80 rounded-xl text-white transition-all duration-300 mb-2 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Change Photo
                </button>
                <p className="text-xs text-gray-500">Max file size: 5MB</p>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-indigo-300 mb-1">
                    Display Name
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={profile.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900/90 border border-indigo-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your display name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-indigo-300 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-800/50 border border-indigo-500/20 rounded-xl text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-indigo-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={profile.bio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900/90 border border-indigo-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-indigo-500/20 flex justify-end">
              <div className="flex space-x-3">
                <Link
                  href="/profile"
                  className="px-5 py-2.5 border border-indigo-500/30 rounded-xl text-white transition-all duration-300 hover:bg-gray-800/50"
                >
                  Cancel
                </Link>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center px-5 py-2.5 font-medium rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileEditContent; 