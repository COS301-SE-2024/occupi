import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPassword from '../../screens/Login/ForgotPassword'; // Adjust the import path accordingly
import { useToast } from '@gluestack-ui/themed';
import { router } from 'expo-router';

// Mock the router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock the useToast hook
jest.mock('@gluestack-ui/themed', () => ({
  useToast: jest.fn(),
}));

describe('ForgotPassword Component', () => {
  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPassword />);

    expect(getByText('Forgot Password?')).toBeTruthy();
    expect(getByText("Not to worry! Enter email address associated with your account and we'll send a link to reset your password.")).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByText('Send OTP')).toBeTruthy();
  });

  it('shows error message when email is invalid', async () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPassword />);

    const emailInput = getByPlaceholderText('Email');
    const sendOtpButton = getByText('Send OTP');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(sendOtpButton);

    await waitFor(() => {
      expect(getByText('Invalid email address')).toBeTruthy();
    });
  });

  it('shows success message and navigates to verify-otp screen on valid submission', async () => {
    const mockToast = { show: jest.fn() };
    useToast.mockReturnValue(mockToast);

    const { getByText, getByPlaceholderText } = render(<ForgotPassword />);

    const emailInput = getByPlaceholderText('Email');
    const sendOtpButton = getByText('Send OTP');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(sendOtpButton);

    await waitFor(() => {
      expect(mockToast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          render: expect.any(Function),
        })
      );
      expect(router.push).toHaveBeenCalledWith('/verify-otp');
    });

    const toastRender = mockToast.show.mock.calls[0][0].render;
    const toastComponent = toastRender({ id: 'mockId' });
    const toastText = render(toastComponent).getByText('OTP sent successfully');
    expect(toastText).toBeTruthy();
  });
});
