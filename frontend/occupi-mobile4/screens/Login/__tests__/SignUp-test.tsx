import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import SignUp from '../SignUp';
import { ToastProvider } from '@gluestack-ui/themed';
import { userRegister } from '@/utils/auth';

jest.mock('@/utils/auth', () => ({
  userRegister: jest.fn(),
}));

describe('SignUp', () => {
  it('should display error message when email or password is invalid', async () => {
    (userRegister as jest.Mock).mockResolvedValue('Invalid email');

    const { getByPlaceholderText, getByText } = render(
      <ToastProvider>
        <SignUp />
      </ToastProvider>
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const employeeIdInput = getByPlaceholderText('Employee ID');

    fireEvent.changeText(emailInput, 'invalidemail');
    fireEvent.changeText(passwordInput, 'invalidpassword');
    fireEvent.changeText(confirmPasswordInput, 'invalidpassword');
    fireEvent.changeText(employeeIdInput, '1234');
    fireEvent.press(screen.getByText('Signup'));

    await waitFor(() => {
      expect(getByText('Invalid email')).toBeDefined();
    });
  });

  it('should register successfully and display a success message', async () => {
    (userRegister as jest.Mock).mockResolvedValue('Successful login!');

    const { getByPlaceholderText, getByText } = render(
      <ToastProvider>
        <SignUp />
      </ToastProvider>
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const employeeIdInput = getByPlaceholderText('Employee ID');

    fireEvent.changeText(emailInput, 'validuser@example.com');
    fireEvent.changeText(passwordInput, 'ValidPassword123!');
    fireEvent.changeText(confirmPasswordInput, 'ValidPassword123!');
    fireEvent.changeText(employeeIdInput, '12345');
    fireEvent.press(screen.getByText('Signup'));

    await waitFor(() => {
      expect(getByText('Successful login!')).toBeDefined();
    });
  });
});