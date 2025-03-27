'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/app/providers/AmplifyProvider';
import { fetchUserAttributes } from 'aws-amplify/auth';
import AuthPrompt from '@/app/components/AuthPrompt';

interface UserProfile {
  username: string;
  email: string;
  bio?: string;
  profilePicture?: string;
}

const ProfileContent = () => {  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user, isLoading } = useAuth();

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
          bio: attributes.profile || 'No bio added yet.',
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

  // Loading state
  if (isLoading || loading) {
    return (
      <>
        <title> Profile | What's That Car? </title>
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
        <title> Profile | What's That Car? </title>
        <AuthPrompt title="Log in to View Your Profile" />
      </>
    );
  }

  return (
    <>
      <title> Profile | What's That Car? </title>
      <div className="flex flex-col flex-1 w-full max-w-5xl px-6 py-4 mb-8 lg:py-8 fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-custom-blue mb-3 md:mb-0 text-left pb-6"> Your Profile </h1>
          
          {/* Navigation buttons */}
          {!loading && (
            <div className="flex space-x-3 pb-6">
              <Link
                href="/profile/saved"
                className="flex items-center px-3 py-2 text-sm border border-gray-800 hover:border-custom-blue/30 rounded-xl hover:bg-blue-950/20 text-white transition-all duration-300 ease-in-out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-custom-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Saved Cars
              </Link>

              <Link
                href="/profile/edit"
                className="flex items-center px-3 py-2 text-sm border border-gray-800 hover:border-custom-blue/30 rounded-xl hover:bg-blue-950/20 text-white transition-all duration-300 ease-in-out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-custom-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </Link>
            </div>
          )}
        </div>

        <div className="bg-gray-950/90 backdrop-blur-sm border border-gray-900 rounded-2xl p-6 shadow-md shadow-blue-300/10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start fade-in">

            {/* Profile picture */}
            <div className="relative h-40 w-40 rounded-full overflow-hidden border border-gray-700/50 shadow-lg shadow-black/20">
              {profile?.profilePicture ? (
                <Image
                  src={profile.profilePicture}
                  alt={profile.username}
                  fill
                  sizes="160px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-4xl text-gray-300 font-bold">
                  {profile?.username ? profile.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>

            {/* Profile info */}
            <div className="flex-1 space-y-4 text-left md:mt-3">
              <div>
                <h2 className="text-2xl font-bold text-white">{profile?.username || 'User'}</h2>
                <p className="text-sm text-gray-400">{profile?.email || 'Loading email...'}</p>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-md font-semibold text-blue-300 mb-2">Bio</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{profile?.bio}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileContent; 