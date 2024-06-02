import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignIn from '../../screens/Login/SignIn'; // Adjust the import path accordingly
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

describe('SignIn Component', () => {
  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<SignIn />);

    expect(getByText('Welcome back to Occupi.')).toBeTruthy();
    expect(getByPlaceholderText('john.doe@gmail.com')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('shows error message when email is invalid', async () => {
    const { getByText, getByPlaceholderText } = render(<SignIn />);

    const emailInput = getByPlaceholderText('john.doe@gmail.com');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Invalid email address')).toBeTruthy();
    });
  });

  it('shows success message and navigates to home screen on valid submission', async () => {
    const mockToast = { show: jest.fn() };
    useToast.mockReturnValue(mockToast);

    const { getByText, getByPlaceholderText } = render(<SignIn />);

    const emailInput = getByPlaceholderText('john.doe@gmail.com');
    const passwordInput = getByPlaceholderText('Enter your password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'ValidPassword1!');
    fireEvent.press(loginButton);

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
    const toastText = render(toastComponent).getByText('Signed in successfully');
    expect(toastText).toBeTruthy();
  });
});
