'use client';

import { useState, useEffect, useRef, ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/app/providers/AmplifyProvider';
import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';
import axios from 'axios';
import AuthPrompt from '@/app/components/AuthPrompt';

interface UserProfile {
  username: string;
  email: string;
  bio?: string;
  profilePicture?: string;
}

const ProfileEditContent = () => {
  const [profile, setProfile] = useState<UserProfile>({ username: '', email: '', bio: '', profilePicture: '' });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoading, refreshAuthState } = useAuth();

  // Retrieve user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user attributes and create profile
        const attributes = await fetchUserAttributes();
        setProfile({
          username: attributes.preferred_username || 'User',
          email: attributes.email || '',
          bio: attributes.profile || '',
          profilePicture: attributes.picture || '',
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Handles file uploads and image preview
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // File size validation (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size must be less than 5MB');
        return;
      }

      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setNewProfilePicture(file);
    }
  };

  // Handles name change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  // Save profile information
  const handleSaveProfile = async () => {
    setSaving(true);

    try {
      // Upload profile photo if changed
      let pictureUrl = profile.profilePicture;
      
      if (newProfilePicture && user) {
        const formData = new FormData();
        formData.append("file", newProfilePicture);
        
        const hostname = window.location.hostname;
        const backendUrl = `http://${hostname}:8000/upload-profile-photo/${user.userId}`;
        const response = await axios.post(backendUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.success) {
          pictureUrl = response.data.photo_url;
        } else {
          throw new Error('Failed to upload profile photo');
        }
      }
      
      // Update user attributes in Cognito
      await updateUserAttributes({
        userAttributes: {
          preferred_username: profile.username,
          profile: profile.bio,
          ...(pictureUrl ? { picture: pictureUrl } : {})
        }
      });

      // Update username in the database
      if (user && profile.username !== user.username) {
        const hostname = window.location.hostname;
        const backendUrl = `http://${hostname}:8000/update-username`;
        await axios.post(backendUrl, {
          user_id: user.userId,
          new_username: profile.username
        });
      }
            
      setTimeout(() => {
        refreshAuthState();
      }, 1000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Loading state
  if (isLoading || loading) {
    return (
      <>
        <title> Saved Cars | What's That Car? </title>
        <div className="flex flex-col flex-1 items-center justify-center w-full h-full py-20 gap-8 fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-blue"></div>
        </div>
      </>
    );
  }

  // User not logged in
  if (!user) {
    return (
      <>
        <title> Edit Profile | What's That Car? </title>
        <AuthPrompt title="Log in to Edit Your Profile" />
      </>
    );
  }

  return (
    <>
      <title> Edit Profile | What's That Car? </title>
      <div className="flex flex-col flex-1 w-full max-w-5xl px-6 py-4 mb-8 lg:py-8 fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-custom-blue mb-3 md:mb-0 text-left pb-6"> Edit Your Profile </h1>
          
          <div className="flex space-x-3 pb-6">
            <Link
              href="/profile"
              className="flex items-center px-3 pl-2 py-2 text-sm border border-gray-800 hover:border-custom-blue/30 rounded-xl hover:bg-blue-950/20 text-white transition-all duration-300 ease-in-out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-custom-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Profile
            </Link>
          </div>
        </div>

        <div className="bg-gray-950/90 backdrop-blur-sm border border-gray-900 rounded-2xl p-6 shadow-md shadow-blue-300/10">
  
          <div className="flex flex-col md:flex-row gap-8">

            {/* Profile picture upload */}
            <div className="flex flex-col items-center mt-1">
              <div className="relative h-40 w-40 rounded-full overflow-hidden border border-gray-700/50 shadow-lg shadow-black/20 mb-4">
                {(previewUrl || profile?.profilePicture) ? (
                  <Image
                    src={previewUrl || profile.profilePicture || ''}
                    alt={profile.username}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-4xl text-gray-300 font-bold">
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
                className="px-4 py-2 mt-1.5 text-sm font-medium bg-primary-blue hover:bg-primary-blue-hover rounded-xl text-white transition-all duration-300 mb-2 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Change Photo
              </button>
              <p className="text-xs text-gray-500"> Max file size: 5MB </p>
            </div>

            {/* Form input fields */}
            <div className="flex-1 space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm text-left font-medium text-custom-blue mb-1"> Username </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={profile.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-900/90 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-custom-blue/60 resize-none"
                  placeholder="Enter a username"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm text-left font-medium text-custom-blue mb-1"> Bio </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-900/90 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-custom-blue/60 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
            <div className="flex space-x-3">
              {/* Cancel and save buttons */}
              <Link href="/profile" className="flex px-5 py-2.5 border border-gray-800 rounded-xl text-white transition-all duration-300 hover:bg-gray-800/50 transition-all duration-300 ease-in-out transform hover:scale-[1.05]"> Cancel </Link>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center px-5 py-2.5 font-medium rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:hover:scale-100"
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
                    {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg> */}
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileEditContent; 