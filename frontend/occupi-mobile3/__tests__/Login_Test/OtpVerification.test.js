import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OTPVerification from '../../screens/Login/OTPVerification'; // Adjust the import path accordingly
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

describe('OTPVerification Component', () => {
  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<OTPVerification />);

    expect(getByText('We sent you an email code')).toBeTruthy();
    expect(getByText('Verify')).toBeTruthy();
  });

  it('shows error message when OTP is less than 6 characters', async () => {
    const { getByText, getByPlaceholderText } = render(<OTPVerification />);

    const otpInput = getByPlaceholderText('OTP');
    const verifyButton = getByText('Verify');

    fireEvent.changeText(otpInput, '12345');
    fireEvent.press(verifyButton);

    await waitFor(() => {
      expect(getByText('OTP must be at least 6 characters in length')).toBeTruthy();
    });
  });

  it('shows success message and navigates to home screen on valid OTP', async () => {
    const mockToast = { show: jest.fn() };
    useToast.mockReturnValue(mockToast);

    const { getByText, getByPlaceholderText } = render(<OTPVerification />);

    const otpInput = getByPlaceholderText('OTP');
    const verifyButton = getByText('Verify');

    fireEvent.changeText(otpInput, '123456');
    fireEvent.press(verifyButton);

    await waitFor(() => {
      expect(mockToast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          render: expect.any(Function),
        })
      );
      expect(router.push).toHaveBeenCalledWith('/home');
    });

    const toastRender = mockToast.show.mock.calls[0][0].render;
    const toastComponent = toastRender({ id: 'mockId' });
    const toastText = render(toastComponent).getByText('OTP sent successfully');
    expect(toastText).toBeTruthy();
  });
});
