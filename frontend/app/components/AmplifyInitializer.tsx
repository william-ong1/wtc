'use client';

import { useEffect } from 'react';
import { Amplify } from 'aws-amplify';

export default function AmplifyInitializer() {
  useEffect(() => {
    const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "";
    const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "";
    
    try {
      // Configure Amplify on the client side
      Amplify.configure({
        Auth: {
          Cognito: {
            userPoolId,
            userPoolClientId,
            loginWith: {
              username: true,
              email: true,
            },
          }
        }
      }, {
        ssr: false // Client-side only
      });
    } catch (error) {
      console.error('Error configuring Amplify:', error);
    }
  }, []);
  
  return null;
};