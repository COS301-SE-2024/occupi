import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import OTPVerification from '../OtpVerification';
import { ToastProvider } from '@gluestack-ui/themed';
import { VerifyUserOtpLogin, verifyUserOtpRegister } from '@/utils/auth';

jest.mock('@/utils/auth', () => ({
  VerifyUserOtpLogin: jest.fn(),
  verifyUserOtpRegister: jest.fn(),
}));

describe('OTPVerification', () => {
  it('should display error message when OTP is invalid', async () => {
    (VerifyUserOtpLogin as jest.Mock).mockResolvedValue('Invalid OTP');

    const { getByText, getByPlaceholderText } = render(
      <ToastProvider>
        <OTPVerification />
      </ToastProvider>
    );

    const otpInput = getByPlaceholderText('OTP');
    fireEvent.changeText(otpInput, '123456');
    fireEvent.press(screen.getByText('Verify'));

    await waitFor(() => {
      expect(getByText('Invalid OTP')).toBeDefined();
    });
  });

  it('should verify OTP successfully and display a success message', async () => {
    (VerifyUserOtpLogin as jest.Mock).mockResolvedValue('Successful login!');

    const { getByText, getByPlaceholderText } = render(
      <ToastProvider>
        <OTPVerification />
      </ToastProvider>
    );

    const otpInput = getByPlaceholderText('OTP');
    fireEvent.changeText(otpInput, '123456');
    fireEvent.press(screen.getByText('Verify'));

    await waitFor(() => {
      expect(getByText('Successful login!')).toBeDefined();
    });
  });
});