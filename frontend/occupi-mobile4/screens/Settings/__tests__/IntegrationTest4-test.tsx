import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChangePassword from '../ChangePassword';
import { ThemeProvider } from '@/components/ThemeContext';
import { router } from 'expo-router';
import { updateSecurity } from '@/utils/user';
import { Toast, ToastTitle, useToast } from '@gluestack-ui/themed';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

jest.mock('@/utils/user', () => ({
  updateSecurity: jest.fn(),
}));

jest.mock('@gluestack-ui/themed', () => ({
  Toast: jest.fn(),
  ToastTitle: jest.fn(),
  useToast: jest.fn(() => ({
    show: jest.fn(),
  })),
}));

describe('ChangePassword', () => {
  it('should render correctly', () => {
    const { toJSON } = render(
      <ThemeProvider>
        <ChangePassword />
      </ThemeProvider>
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should handle back button press', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ChangePassword />
      </ThemeProvider>
    );
    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);
    expect(router.back).toHaveBeenCalled();
  });

  it('should handle password change', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ChangePassword />
      </ThemeProvider>
    );
    const currentPasswordInput = getByTestId('currentpassword');
    const passwordInput = getByTestId('password');
    const confirmPasswordInput = getByTestId('confirmpassword');
    const submitButton = getByTestId('submit-button');

    fireEvent.changeText(currentPasswordInput, 'currentPassword123!');
    fireEvent.changeText(passwordInput, 'newPassword123!');
    fireEvent.changeText(confirmPasswordInput, 'newPassword123!');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(updateSecurity).toHaveBeenCalledWith('password', {
        currentPassword: 'currentPassword123!',
        newPassword: 'newPassword123!',
        newPasswordConfirm: 'newPassword123!',
      });
      expect(Toast.mock.calls[0][0].render().props.children.props.children).toBe(
        'Successfully changed password'
      );
    });
  });

  it('should handle password mismatch', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ChangePassword />
      </ThemeProvider>
    );
    const currentPasswordInput = getByTestId('currentpassword');
    const passwordInput = getByTestId('password');
    const confirmPasswordInput = getByTestId('confirmpassword');
    const submitButton = getByTestId('submit-button');

    fireEvent.changeText(currentPasswordInput, 'currentPassword123!');
    fireEvent.changeText(passwordInput, 'newPassword123!');
    fireEvent.changeText(confirmPasswordInput, 'wrongPassword123!');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(updateSecurity).not.toHaveBeenCalled();
      expect(Toast.mock.calls[0][0].render().props.children.props.children).toBe(
        'Passwords do not match'
      );
    });
  });

  it('should handle new password matching current password', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ChangePassword />
      </ThemeProvider>
    );
    const currentPasswordInput = getByTestId('currentpassword');
    const passwordInput = getByTestId('password');
    const confirmPasswordInput = getByTestId('confirmpassword');
    const submitButton = getByTestId('submit-button');

    fireEvent.changeText(currentPasswordInput, 'currentPassword123!');
    fireEvent.changeText(passwordInput, 'currentPassword123!');
    fireEvent.changeText(confirmPasswordInput, 'currentPassword123!');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(updateSecurity).not.toHaveBeenCalled();
      expect(Toast.mock.calls[0][0].render().props.children.props.children).toBe(
        'New password cannot be the same as the current password'
      );
    });
  });
});