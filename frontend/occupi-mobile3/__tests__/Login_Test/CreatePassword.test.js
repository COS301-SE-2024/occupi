import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useToast } from '@gluestack-ui/themed';
import { useForm } from 'react-hook-form';
import CreatePassword from '../../screens/Login/CreatePassword';

// Mock the react-hook-form
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: jest.fn(),
}));

// Mock the useToast hook
jest.mock('@gluestack-ui/themed', () => ({
  useToast: jest.fn(),
}));

// Mock the expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

describe('CreatePassword', () => {
  let control;
  let handleSubmit;
  let reset;
  let formState;

  beforeEach(() => {
    control = jest.fn();
    handleSubmit = jest.fn((fn) => fn());
    reset = jest.fn();
    formState = { errors: {} };

    useForm.mockReturnValue({
      control,
      handleSubmit,
      reset,
      formState,
    });
  });

  it('renders correctly', () => {
    const { getByPlaceholderText } = render(<CreatePassword />);
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
  });

  it('shows error message if passwords do not match', async () => {
    const mockToast = { show: jest.fn() };
    useToast.mockReturnValue(mockToast);

    const { getByPlaceholderText, getByText } = render(<CreatePassword />);
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const submitButton = getByText('Update Password');

    fireEvent.changeText(passwordInput, 'Password1!');
    fireEvent.changeText(confirmPasswordInput, 'Password2!');
    fireEvent.press(submitButton);

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

  it('shows success message if passwords match', async () => {
    const mockToast = { show: jest.fn() };
    const mockRouter = require('expo-router').useRouter();
    useToast.mockReturnValue(mockToast);

    const { getByPlaceholderText, getByText } = render(<CreatePassword />);
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const submitButton = getByText('Update Password');

    fireEvent.changeText(passwordInput, 'Password1!');
    fireEvent.changeText(confirmPasswordInput, 'Password1!');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockToast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          render: expect.any(Function),
        })
      );
      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });

    const toastRender = mockToast.show.mock.calls[0][0].render;
    const toastComponent = toastRender({ id: 'mockId' });
    const toastText = render(toastComponent).getByText('Password updated successfully');
    expect(toastText).toBeTruthy();
  });

  it('toggles password visibility', () => {
    const { getByPlaceholderText, getByTestId } = render(<CreatePassword />);
    const passwordInput = getByPlaceholderText('Password');
    const toggleButton = getByTestId('toggle-password-visibility');

    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(false);

    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });
});
