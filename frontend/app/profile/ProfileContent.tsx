'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/app/providers/AmplifyProvider';
import AuthModals from '@/app/components/AuthModals';
import { fetchUserAttributes } from 'aws-amplify/auth';

interface UserProfile {
  username: string;
  email: string;
  bio?: string;
  profilePicture?: string;
}

const ProfileContent = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isSignupOpen, setIsSignupOpen] = useState<boolean>(false);
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

  if (!user) {
    return (
      <>
        <title> Profile | What's That Car? </title>
        <div className="flex flex-col flex-1 items-center justify-center w-full h-full p-4 gap-8 fade-in">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4 animate-gradient-text pt-8 pb-4">Sign In to View Your Profile</h2>
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="px-6 py-3 rounded-2xl text-white text-base font-semibold bg-[#3B03FF]/80 hover:bg-[#4B13FF] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-blue-500/20"
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
      <title> Profile | What's That Car? </title>
      <div className="flex flex-col flex-1 w-full max-w-5xl px-6 py-4 mb-8 lg:py-12 fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-500 mb-3 md:mb-0"> Your Profile </h1>
          
          <div className="flex space-x-3">
            <Link
              href="/profile/saved"
              className="flex items-center px-4 py-2 text-sm font-medium border border-blue-500/20 hover:border-blue-500/40 rounded-xl bg-white/5 hover:bg-blue-900/20 text-white transition-all duration-300 ease-in-out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Saved Cars
            </Link>
            <Link
              href="/profile/edit"
              className="flex items-center px-4 py-2 text-sm font-medium border border-blue-500/20 hover:border-blue-500/40 rounded-xl bg-white/5 hover:bg-blue-900/20 text-white transition-all duration-300 ease-in-out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-gray-900/60 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Profile Picture */}
              <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-blue-500/30 shadow-lg shadow-blue-500/20">
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
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-primary-blue flex items-center justify-center text-4xl text-white font-bold">
                    {profile?.username ? profile.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>

              {/* Profile Information */}
              <div className="flex-1 space-y-4 text-left md:mt-3">
                <div>
                  <h2 className="text-2xl font-bold text-white">{profile?.username}</h2>
                  <p className="text-sm text-gray-400">{profile?.email}</p>
                </div>

                <div className="pt-4 border-t border-blue-500/20">
                  <h3 className="text-md font-semibold text-blue-300 mb-2">Bio</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{profile?.bio}</p>
                </div>
              </div>
            </div>

            {/* <div className="mt-8 pt-6 border-t border-indigo-500/20 flex justify-center md:justify-end">
              <Link
                href="/profile/edit"
                className="flex items-center px-5 py-2.5 font-medium rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-md shadow-indigo-500/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </Link>
            </div> */}
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileContent; 