import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import Settings from '../Settings';
import { ThemeProvider } from '@/components/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import * as auth from '@/utils/auth';
import { ToastProvider } from '@gluestack-ui/themed';

jest.mock('expo-secure-store');
jest.mock('@/utils/auth');

describe('Settings', () => {
  test('renders the settings options correctly', async () => {
    jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce('{"name":"John Doe","position":"Software Engineer"}');

    render(
      <ThemeProvider>
        <ToastProvider>
          <Settings />
        </ToastProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('My account')).toBeTruthy();
      expect(screen.getByText('Notifications')).toBeTruthy();
      expect(screen.getByText('Security')).toBeTruthy();
      expect(screen.getByText('Appearance')).toBeTruthy();
      expect(screen.getByText('FAQ')).toBeTruthy();
      expect(screen.getByText('About and Help')).toBeTruthy();
      expect(screen.getByText('Log out')).toBeTruthy();
    });
  });

  test('logs out the user', async () => {
    jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce('{"name":"John Doe","position":"Software Engineer"}');
    jest.spyOn(auth, 'UserLogout').mockResolvedValueOnce('Logged out successfully!');
    jest.spyOn(SecureStore, 'deleteItemAsync').mockResolvedValueOnce(undefined);

    render(
      <ThemeProvider>
        <ToastProvider>
          <Settings />
        </ToastProvider>
      </ThemeProvider>
    );

    fireEvent.press(screen.getByText('Log out'));
    await waitFor(() => {
      expect(auth.UserLogout).toHaveBeenCalled();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('UserData');
      expect(screen.getByText('Logged out successfully!')).toBeTruthy();
    });
  });
});