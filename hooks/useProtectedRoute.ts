import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export function useProtectedRoute() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // If still loading the token from secure storage, do nothing.
    if (isLoading) return;

    // Check if the user is in an authentication group/screen.
    // Assuming 'auth' is a directory and 'index' is the root redirector.
    const inAuthGroup = segments[0] === 'auth';
    const isRoot = segments.length === 0;

    if (!session && !inAuthGroup) {
      // Redirect to sign in page
      router.replace('/auth/login');
    } else if (session && (inAuthGroup || isRoot)) {
      // If user is already signed in and on an auth screen or root, send them to the home tabs
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments]);
}
