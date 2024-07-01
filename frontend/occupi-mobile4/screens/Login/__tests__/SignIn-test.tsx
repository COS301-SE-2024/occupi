import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { StyledProvider, Theme } from '@gluestack-ui/themed';
import SignIn from '../SignIn'; // Adjust the path to your component

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  supportedAuthenticationTypesAsync: jest.fn().mockResolvedValue([1, 2]), // Mocking fingerprint and facial recognition
  authenticateAsync: jest.fn().mockResolvedValue({ success: true }),
}));

const renderWithProvider = (component) => {
  return render(
    <StyledProvider theme={Theme}>
      {component}
    </StyledProvider>
  );
};

describe('SignIn component', () => {
  it('renders correctly and matches snapshot', () => {
    const tree = renderWithProvider(<SignIn />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders form inputs and buttons correctly', () => {
    const { getByPlaceholderText, getByText } = renderWithProvider(<SignIn />);

    expect(getByPlaceholderText('john.doe@gmail.com')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
  });

  it('shows biometric authentication button and handles biometric sign in', async () => {
    const { getByTestId } = renderWithProvider(<SignIn />);

    await waitFor(() => {
      const biometricButton = getByTestId('biometric-button');
      expect(biometricButton).toBeTruthy();
    });

    const biometricButton = getByTestId('biometric-button');
    fireEvent.press(biometricButton);

    await waitFor(() => {
      expect(require('expo-router').router.replace).toHaveBeenCalledWith('/home');
    });
  });

  it('handles form submission and shows success message', async () => {
    const { getByPlaceholderText, getByText } = renderWithProvider(<SignIn />);
    const emailInput = getByPlaceholderText('john.doe@gmail.com');
    const passwordInput = getByPlaceholderText('Enter your password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'Password123!');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(require('expo-router').router.replace).toHaveBeenCalledWith('/home');
    });
  });

  it('handles form submission and shows error message on failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      })
    );

    const { getByPlaceholderText, getByText } = renderWithProvider(<SignIn />);
    const emailInput = getByPlaceholderText('john.doe@gmail.com');
    const passwordInput = getByPlaceholderText('Enter your password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'Password123!');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });
});
