import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import ForgotPassword from '../ForgotPassword';
import { ToastProvider } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('ForgotPassword', () => {
  it('should display error message when email is invalid', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ToastProvider>
        <ForgotPassword />
      </ToastProvider>
    );

    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'invalidemail');
    fireEvent.press(screen.getByText('Send OTP'));

    await waitFor(() => {
      expect(getByText('Email is required')).toBeDefined();
    });
  });

  it('should send OTP successfully and navigate to the OTP verification screen', async () => {
    const navigateMock = jest.fn();
    useNavigation.mockReturnValue({ navigate: navigateMock });

    const { getByPlaceholderText, getByText } = render(
      <ToastProvider>
        <ForgotPassword />
      </ToastProvider>
    );

    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(screen.getByText('Send OTP'));

    await waitFor(() => {
      expect(getByText('OTP sent successfully')).toBeDefined();
      expect(navigateMock).toHaveBeenCalledWith('verify-otp', { email: 'test@example.com' });
    });
  });
});