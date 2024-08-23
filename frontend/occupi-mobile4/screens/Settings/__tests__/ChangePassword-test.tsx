import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChangePassword from '../ChangePassword';
import { ThemeProvider } from '@/components/ThemeContext';
import { updateSecurity } from '@/utils/user';
import { useToast } from '@gluestack-ui/themed';

// Mocking expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

// Mocking updateSecurity function
jest.mock('@/utils/user', () => ({
  updateSecurity: jest.fn(),
}));

// Mocking useToast hook from gluestack-ui
jest.mock('@gluestack-ui/themed', () => ({
  useToast: jest.fn(() => ({
    show: jest.fn(),
  })),
}));

describe('ChangePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the ChangePassword component correctly', () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider>
        <ChangePassword />
      </ThemeProvider>
    );

    expect(getByTestId('back-button')).toBeTruthy();
    expect(getByText('Change Password')).toBeTruthy();
  });

  it('should handle password change correctly', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ThemeProvider>
        <ChangePassword />
      </ThemeProvider>
    );

    fireEvent.changeText(getByPlaceholderText('Password'), 'NewPassword123!');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'NewPassword123!');
    fireEvent.press(getByText('Change Password'));

    await waitFor(() => {
      expect(updateSecurity).toHaveBeenCalledWith('password', {
        currentPassword: 'NewPassword123!',
        newPassword: 'NewPassword123!',
        newPasswordConfirm: 'NewPassword123!',
      });
    });
  });

  it('should handle password mismatch error', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ThemeProvider>
        <ChangePassword />
      </ThemeProvider>
    );

    fireEvent.changeText(getByPlaceholderText('Password'), 'NewPassword123!');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'OtherPassword123!');
    fireEvent.press(getByText('Change Password'));

    await waitFor(() => {
      expect(useToast().show).toHaveBeenCalledWith(
        expect.objectContaining({
          render: expect.any(Function),
        })
      );
    });
  });
});
