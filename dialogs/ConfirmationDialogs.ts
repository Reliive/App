import { Alert, BackHandler } from 'react-native';

export const showExitDialog = () => {
  Alert.alert('Hold on!', 'Are you sure you want to exit the app?', [
    {
      text: 'Cancel',
      onPress: () => null,
      style: 'cancel',
    },
    { 
      text: 'Exit', 
      onPress: () => BackHandler.exitApp(),
      style: 'destructive'
    },
  ]);
};

export const showLogoutDialog = (onConfirm: () => void) => {
  Alert.alert('Log Out', 'Are you sure you want to log out?', [
    { text: 'Cancel', style: 'cancel' },
    { 
      text: 'Log Out', 
      style: 'destructive',
      onPress: onConfirm
    },
  ]);
};

export const showDeleteAccountDialog = (onConfirm: () => void) => {
  Alert.alert(
    'Delete Account',
    'This action is permanent and cannot be undone. All your data will be erased.',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: onConfirm
      },
    ]
  );
};

export const showUpcomingFeatureDialog = (
  title = 'Upcoming Feature',
  message = 'This feature will be available in an upcoming update!'
) => {
  Alert.alert(`✨ ${title}`, message, [
    { text: 'Got it!', style: 'default' }
  ]);
};

