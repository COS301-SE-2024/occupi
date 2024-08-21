import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import Security from '../Security';
import { ThemeProvider } from '@/components/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import * as user from '@/utils/user';
import * as LocalAuthentication from 'expo-local-authentication';

jest.mock('expo-secure-store');
jest.mock('@/utils/user');
jest.mock('expo-local-authentication');

describe('Security', () => {
  test('renders the security options correctly', async () => {
    jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce('{"mfa":"on","forceLogout":"on"}');

    render(
      <ThemeProvider>
        <Security />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Use 2fa to login')).toBeTruthy();
      expect(screen.getByText('Force logout on app close')).toBeTruthy();
      expect(screen.getByText('Back Tap')).toBeTruthy();
      expect(screen.getByText('Change Password')).toBeTruthy();
    });
  });

  test('updates the security settings', async () => {
    jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce('{"mfa":"off","forceLogout":"off"}');
    jest.spyOn(user, 'updateSecurity').mockResolvedValueOnce('Settings updated successfully');

    render(
      <ThemeProvider>
        <Security />
      </ThemeProvider>
    );

    fireEvent.press(screen.getByText('Use 2fa to login'));
    fireEvent.press(screen.getByText('Force logout on app close'));
    fireEvent.press(screen.getByText('Back Tap'));
    fireEvent.press(screen.getByText('Save'));

    await waitFor(() => {
      expect(user.updateSecurity).toHaveBeenCalledWith('settings', {
        mfa: 'on',
        forceLogout: 'on',
        backTap: 'on',
      });
    });
  });

  test('handles biometric authentication', async () => {
    jest.spyOn(LocalAuthentication, 'hasHardwareAsync').mockResolvedValueOnce(true);
    jest.spyOn(LocalAuthentication, 'isEnrolledAsync').mockResolvedValueOnce(true);
    jest.spyOn(LocalAuthentication, 'authenticateAsync').mockResolvedValueOnce({ success: true });

    const mockedRouter = {
      push: jest.fn(),
    };

    jest.mock('expo-router', () => ({
      router: mockedRouter,
    }));

    render(
      <ThemeProvider>
        <Security />
      </ThemeProvider>
    );

    fireEvent.press(screen.getByText('Change Password'));
    await waitFor(() => {
      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled();
      expect(mockedRouter.push).toHaveBeenCalledWith('/changepassword');
    });
  });
});