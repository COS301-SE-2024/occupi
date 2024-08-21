import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import SignIn from '../SignIn';
import { ToastProvider } from '@gluestack-ui/themed';
import { UserLogin } from '@/utils/auth';

jest.mock('@/utils/auth', () => ({
  UserLogin: jest.fn(),
}));

describe('SignIn', () => {
  it('should display error message when email or password is invalid', async () => {
    (UserLogin as jest.Mock).mockResolvedValue('Invalid email or password');

    const { getByPlaceholderText, getByText } = render(
      <ToastProvider>
        <SignIn />
      </ToastProvider>
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(emailInput, 'invalidemail@example.com');
    fireEvent.changeText(passwordInput, 'invalidpassword');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(getByText('Invalid email or password')).toBeDefined();
    });
  });

  it('should login successfully and display a success message', async () => {
    (UserLogin as jest.Mock).mockResolvedValue('Successful login!');

    const { getByPlaceholderText, getByText } = render(
      <ToastProvider>
        <SignIn />
      </ToastProvider>
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(emailInput, 'validuser@example.com');
    fireEvent.changeText(passwordInput, 'ValidPassword123!');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(getByText('Successful login!')).toBeDefined();
    });
  });
});