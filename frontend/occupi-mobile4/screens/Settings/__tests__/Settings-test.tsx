import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Settings from '../Settings';
import { ThemeProvider } from '@/components/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import * as auth from '@/utils/auth';

// Mock necessary functions and components
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@/utils/auth');

let mockTheme = 'light';
jest.mock('@/components/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({ 
    theme: mockTheme, 
    setTheme: jest.fn(),
  }),
}));

// Mock the useNavBar hook
jest.mock('@/components/NavBarProvider', () => ({
  useNavBar: () => ({
    setCurrentTab: jest.fn(),
  }),
}));

const mockShowToast = jest.fn();
jest.mock('@gluestack-ui/themed', () => {
  const ReactNative = require('react-native');
  return {
    VStack: ReactNative.View,
    HStack: ReactNative.View,
    Box: ReactNative.View,
    Center: ReactNative.View,
    Icon: ReactNative.View,
    Divider: ReactNative.View,
    Pressable: ReactNative.TouchableOpacity,
    Toast: ({ children }) => children,
    ToastTitle: ReactNative.Text,
    Text: ReactNative.Text,
    useToast: () => ({
      show: mockShowToast,
    }),
  };
});

describe('Settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the settings options correctly', async () => {
    SecureStore.getItemAsync.mockResolvedValueOnce('{"name":"John Doe","position":"Software Engineer"}');
    const { getByText } = render(
      <ThemeProvider>
        <Settings />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('My account')).toBeTruthy();
      expect(getByText('Notifications')).toBeTruthy();
      expect(getByText('Security')).toBeTruthy();
      expect(getByText('Appearance')).toBeTruthy();
      expect(getByText('FAQ')).toBeTruthy();
      expect(getByText('About and Help')).toBeTruthy();
      expect(getByText('Log out')).toBeTruthy();
    });
  });

  it('logs out the user', async () => {
    SecureStore.getItemAsync.mockResolvedValueOnce('{"name":"John Doe","position":"Software Engineer"}');
    auth.UserLogout.mockResolvedValueOnce('Logged out successfully!');
    SecureStore.deleteItemAsync.mockResolvedValueOnce(undefined);

    const { getByText } = render(
      <ThemeProvider>
        <Settings />
      </ThemeProvider>
    );

    await waitFor(() => {
      fireEvent.press(getByText('Log out'));
    });

    await waitFor(() => {
      expect(auth.UserLogout).toHaveBeenCalled();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('UserData');
      expect(mockShowToast).toHaveBeenCalled();
    });
  });

  it('changes theme', async () => {
    SecureStore.getItemAsync.mockResolvedValueOnce('{"name":"John Doe","position":"Software Engineer"}');
    const setThemeMock = jest.fn();
    jest.spyOn(React, 'useContext').mockReturnValue({ theme: 'light', setTheme: setThemeMock });

    const { getByText } = render(
      <ThemeProvider>
        <Settings />
      </ThemeProvider>
    );

    await waitFor(() => {
      fireEvent.press(getByText('Appearance'));
      fireEvent.press(getByText('Dark'));
    });

    expect(setThemeMock).toHaveBeenCalledWith('dark');
  });

  it('handles SecureStore.getItemAsync error', async () => {
    SecureStore.getItemAsync.mockRejectedValueOnce(new Error('Storage error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ThemeProvider>
        <Settings />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching user data:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});