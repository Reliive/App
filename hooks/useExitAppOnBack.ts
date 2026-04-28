import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { usePathname } from 'expo-router';
import { showExitDialog } from '@/dialogs/ConfirmationDialogs';

export function useExitAppOnBack() {
  const pathname = usePathname();

  useEffect(() => {
    const backAction = () => {
      // Intercept back button if we are at the root level of any tab
      const isRootScreen = [
        '/', 
        '/explore', 
        '/host', 
        '/events', 
        '/profile',
        '/auth/login'
      ].includes(pathname);

      if (isRootScreen) {
        showExitDialog();
        return true; // Return true to prevent default back behavior
      }
      
      // Let the default back behavior happen for nested screens
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [pathname]);
}
