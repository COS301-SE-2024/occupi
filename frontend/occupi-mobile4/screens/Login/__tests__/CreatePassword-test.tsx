import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import CreatePassword from '../CreatePassword';
import { ToastProvider } from '@gluestack-ui/themed';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

describe('CreatePassword', () => {
  it('should display error message when password and confirm password do not match', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ToastProvider>
        <CreatePassword />
      </ToastProvider>
    );

    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');

    fireEvent.changeText(passwordInput, 'Password123!');
    fireEvent.changeText(confirmPasswordInput, 'Password456!');
    fireEvent.press(screen.getByText('Update Password'));

    await waitFor(() => {
      expect(getByText('Passwords do not match')).toBeDefined();
    });
  });

  it('should update password successfully and navigate to the home screen', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ToastProvider>
        <CreatePassword />
      </ToastProvider>
    );

    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');

    fireEvent.changeText(passwordInput, 'Password123!');
    fireEvent.changeText(confirmPasswordInput, 'Password123!');
    fireEvent.press(screen.getByText('Update Password'));

    await waitFor(() => {
      expect(getByText('Password updated successfully')).toBeDefined();
      expect(router.replace).toHaveBeenCalledWith('/');
    });
  });
});