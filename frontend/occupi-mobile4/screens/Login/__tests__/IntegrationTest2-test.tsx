import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as WebBrowser from 'expo-web-browser';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { retrievePushToken } from '@/utils/notifications';
import { userRegister, VerifyUserOtpLogin, verifyUserOtpRegister, UserLogin } from '@/utils/auth';
import CreatePassword from '../CreatePassword';
import ForgotPassword from '../ForgotPassword';
import OTPVerification from '../OtpVerification';
import SignIn from '../SignIn';
import SignUp from '../SignUp';

jest.mock('expo-local-authentication');
jest.mock('expo-web-browser');
jest.mock('@/utils/notifications');
jest.mock('@/utils/auth');

describe('Integration Tests', () => {
  const createPasswordSchema = z.object({
    password: z
      .string()
      .min(6, 'Must be at least 8 characters in length')
      .regex(new RegExp('.*[A-Z].*'), 'One uppercase character')
      .regex(new RegExp('.*[a-z].*'), 'One lowercase character')
      .regex(new RegExp('.*\\d.*'), 'One number')
      .regex(
        new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
        'One special character'
      ),
    confirmpassword: z
      .string()
      .min(6, 'Must be at least 8 characters in length')
      .regex(new RegExp('.*[A-Z].*'), 'One uppercase character')
      .regex(new RegExp('.*[a-z].*'), 'One lowercase character')
      .regex(new RegExp('.*\\d.*'), 'One number')
      .regex(
        new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
        'One special character'
      ),
  });

  const forgotPasswordSchema = z.object({
    email: z.string().min(1, 'Email is required').email(),
  });

  const signUpSchema = z.object({
    email: z.string().min(1, 'Email is required').email(),
    password: z
      .string()
      .min(6, 'Must be at least 8 characters in length')
      .regex(new RegExp('.*[A-Z].*'), 'One uppercase character')
      .regex(new RegExp('.*[a-z].*'), 'One lowercase character')
      .regex(new RegExp('.*\\d.*'), 'One number')
      .regex(
        new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
        'One special character'
      ),
    confirmpassword: z
      .string()
      .min(6, 'Must be at least 8 characters in length')
      .regex(new RegExp('.*[A-Z].*'), 'One uppercase character')
      .regex(new RegExp('.*[a-z].*'), 'One lowercase character')
      .regex(new RegExp('.*\\d.*'), 'One number')
      .regex(
        new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
        'One special character'
      ),
    employeeId: z.string().min(1, 'Employee ID is required').regex(/^\d+$/, 'Employee ID must be numerical'),
  });

  const signInSchema = z.object({
    email: z.string().min(1, 'Email is required').email(),
    password: z
      .string()
      .min(6, 'Must be at least 8 characters in length')
      .regex(new RegExp('.*[A-Z].*'), 'One uppercase character')
      .regex(new RegExp('.*[a-z].*'), 'One lowercase character')
      .regex(new RegExp('.*\\d.*'), 'One number')
      .regex(
        new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
        'One special character'
      ),
    rememberme: z.boolean().optional(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new password', async () => {
    const { getByPlaceholderText, getByText, handleSubmit } = render(<CreatePassword />);
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');

    fireEvent.changeText(passwordInput, 'Password123!');
    fireEvent.changeText(confirmPasswordInput, 'Password123!');
    fireEvent.press(getByText('Update Password'));

    await waitFor(() => {
      expect(screen.getByText('Password updated successfully')).toBeDefined();
    });
  });

  it('should reset the password', async () => {
    const { getByPlaceholderText, getByText, handleSubmit } = render(<ForgotPassword />);
    const emailInput = getByPlaceholderText('Email');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(getByText('Send OTP'));

    await waitFor(() => {
      expect(screen.getByText('OTP sent successfully')).toBeDefined();
    });
  });

  it('should verify the OTP', async () => {
    const { getByPlaceholderText, getByText } = render(<OTPVerification />);
    jest.spyOn(LocalAuthentication, 'hasHardwareAsync').mockResolvedValue(true);
    jest.spyOn(LocalAuthentication, 'authenticateAsync').mockResolvedValue({ success: true });

    const otp1 = getByPlaceholderText('*');
    const otp2 = getByPlaceholderText('*');
    const otp3 = getByPlaceholderText('*');
    const otp4 = getByPlaceholderText('*');
    const otp5 = getByPlaceholderText('*');
    const otp6 = getByPlaceholderText('*');

    fireEvent.changeText(otp1, '1');
    fireEvent.changeText(otp2, '2');
    fireEvent.changeText(otp3, '3');
    fireEvent.changeText(otp4, '4');
    fireEvent.changeText(otp5, '5');
    fireEvent.changeText(otp6, '6');

    fireEvent.press(getByText('Verify'));

    await waitFor(() => {
      expect(screen.getByText('Successful login!')).toBeDefined();
    });
  });

  it('should sign in a user', async () => {
    const { getByPlaceholderText, getByText, handleSubmit } = render(<SignIn />);
    jest.spyOn(LocalAuthentication, 'hasHardwareAsync').mockResolvedValue(true);
    jest.spyOn(LocalAuthentication, 'authenticateAsync').mockResolvedValue({ success: true });
    jest.spyOn(UserLogin, 'UserLogin').mockResolvedValue('Successful login!');

    const emailInput = getByPlaceholderText('john.doe@gmail.com');
    const passwordInput = getByPlaceholderText('Enter your password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'Password123!');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Successful login!')).toBeDefined();
    });
  });

  it('should register a new user', async () => {
    const { getByPlaceholderText, getByText, getByLabelText } = render(<SignUp />);
    jest.spyOn(retrievePushToken, 'retrievePushToken').mockResolvedValue();
    jest.spyOn(userRegister, 'userRegister').mockResolvedValue('Successful login!');

    const emailInput = getByPlaceholderText('Email');
    const employeeIdInput = getByPlaceholderText('Employee ID');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const termsCheckbox = getByLabelText('I accept the Terms of Service and Privacy Policy');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(employeeIdInput, '12345');
    fireEvent.changeText(passwordInput, 'Password123!');
    fireEvent.changeText(confirmPasswordInput, 'Password123!');
    fireEvent.press(termsCheckbox);
    fireEvent.press(getByText('Signup'));

    await waitFor(() => {
      expect(screen.getByText('Successful login!')).toBeDefined();
    });
  });
});