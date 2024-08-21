import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Info from '../Info';
import Notifications from '../Notifications';
import Profile from '../Profile';
import Security from '../Security';
import Settings from '../Settings';
import { updateDetails, updateNotifications, updateSecurity } from '@/utils/user';
import { UserLogout } from '@/utils/auth';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock('@/utils/user', () => ({
  updateNotifications: jest.fn().mockResolvedValue('Settings updated successfully'),
  updateDetails: jest.fn().mockResolvedValue('Details updated successfully'),
  updateSecurity: jest.fn().mockResolvedValue('Settings updated successfully'),
}));

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
  authenticateAsync: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('{"invites":"on","bookingReminder":"on"}'),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    get: jest.fn(),
    post: jest.fn(),
  }),
}));

describe('Integration Tests', () => {
  test('Info screen', async () => {
    const { getByTestId, getByText } = render(<Info />);
    expect(getByTestId('back-button')).toBeDefined();
    fireEvent.press(getByTestId('back-button'));
    expect(router.back).toHaveBeenCalled();
  });

  test('Notifications screen', async () => {
    const { getByTestId, getByText } = render(<Notifications />);
    expect(getByTestId('back-button')).toBeDefined();
    fireEvent.press(getByTestId('back-button'));
    expect(router.back).toHaveBeenCalled();

    fireEvent.press(getByText('Save'));
    await waitFor(() => expect(updateNotifications).toHaveBeenCalled());
  });

  test('Profile screen', async () => {
    const { getByText, getByPlaceholderText } = render(<Profile />);
    fireEvent.changeText(getByPlaceholderText('John Doe'), 'Jane Doe');
    fireEvent.press(getByText('Save'));
    await waitFor(() => expect(updateDetails).toHaveBeenCalledWith('Jane Doe', expect.any(String), expect.any(String), expect.any(String), expect.any(String)));
  });

  test('Security screen', async () => {
    const { getByTestId, getByText } = render(<Security />);
    expect(getByTestId('back-button')).toBeDefined();
    fireEvent.press(getByTestId('back-button'));
    expect(router.back).toHaveBeenCalled();

    fireEvent.press(getByText('Change Password'));
    await waitFor(() => expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled());
    expect(router.push).toHaveBeenCalledWith('/changepassword');

    fireEvent.press(getByText('Save'));
    await waitFor(() => expect(updateSecurity).toHaveBeenCalledWith('settings', expect.any(Object)));
  });

  test('Settings screen', async () => {
    const { getByText } = render(<Settings />);
    fireEvent.press(getByText('Log out'));
    await waitFor(() => expect(UserLogout).toHaveBeenCalled());
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('UserData');
    expect(router.setCurrentTab).toHaveBeenCalledWith('Home');
  });
});