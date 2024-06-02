import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUp from '../SignUp'; // Adjust the import path accordingly
import { useToast } from '@gluestack-ui/themed';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock('@gluestack-ui/themed', () => ({
  useToast: jest.fn(),
}));

describe('SignUp Component', () => {
  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<SignUp />);

    expect(getByText('Register for Occupi.')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Employee ID')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    expect(getByText('Signup')).toBeTruthy();
  });

  it('shows error message when passwords do not match', async () => {
    const mockToast = { show: jest.fn() };
    (useToast as jest.Mock).mockReturnValue(mockToast);

    const { getByPlaceholderText, getByText } = render(<SignUp />);

    const emailInput = getByPlaceholderText('Email');
    const employeeIdInput = getByPlaceholderText('Employee ID');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const signupButton = getByText('Signup');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(employeeIdInput, '123456');
    fireEvent.changeText(passwordInput, 'ValidPassword1!');
    fireEvent.changeText(confirmPasswordInput, 'InvalidPassword1!');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(mockToast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          render: expect.any(Function),
        })
      );
    });

    const toastRender = mockToast.show.mock.calls[0][0].render;
    const toastComponent = toastRender({ id: 'mockId' });
    const toastText = render(toastComponent).getByText('Passwords do not match');
    expect(toastText).toBeTruthy();
  });

  it('shows success message and navigates to verify-otp screen on valid submission', async () => {
    const mockToast = { show: jest.fn() };
    (useToast as jest.Mock).mockReturnValue(mockToast);

    const { getByPlaceholderText, getByText } = render(<SignUp />);

    const emailInput = getByPlaceholderText('Email');
    const employeeIdInput = getByPlaceholderText('Employee ID');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const signupButton = getByText('Signup');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(employeeIdInput, '123456');
    fireEvent.changeText(passwordInput, 'ValidPassword1!');
    fireEvent.changeText(confirmPasswordInput, 'ValidPassword1!');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(mockToast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          render: expect.any(Function),
        })
      );
      expect(router.replace).toHaveBeenCalledWith('/verify-otp');
    });

    const toastRender = mockToast.show.mock.calls[0][0].render;
    const toastComponent = toastRender({ id: 'mockId' });
    const toastText = render(toastComponent).getByText('Email verified');
    expect(toastText).toBeTruthy();
  });
});
