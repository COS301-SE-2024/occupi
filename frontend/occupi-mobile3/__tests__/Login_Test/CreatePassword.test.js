import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreatePassword from '../../screens/Login/CreatePassword';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('@gluestack-ui/themed', () => ({
  VStack: 'View',
  Box: 'View',
  HStack: 'View',
  Icon: 'View',
  Text: 'Text',
  Button: 'View',
  Image: 'Image',
  Center: 'View',
  ArrowLeftIcon: 'View',
  FormControl: 'View',
  Heading: 'Text',
  FormControlHelperText: 'Text',
  EyeIcon: 'View',
  EyeOffIcon: 'View',
  ButtonText: 'Text',
  Input: 'TextInput',
  useToast: () => ({
    show: jest.fn(),
  }),
  Toast: 'View',
  InputField: 'TextInput',
  ToastTitle: 'Text',
  FormControlHelper: 'Text',
  FormControlError: 'View',
  FormControlErrorIcon: 'View',
  FormControlErrorText: 'Text',
  InputIcon: 'View',
  InputSlot: 'View',
  ScrollView: 'View',
  FormControlLabel: 'View',
  FormControlLabelText: 'Text',
}));

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: jest.fn(),
    formState: { errors: {} },
    handleSubmit: (fn) => fn,
    reset: jest.fn(),
  }),
  Controller: ({ render }) => render({ field: { onChange: jest.fn(), onBlur: jest.fn(), value: '' } }),
}));

describe('CreatePassword', () => {
  it('renders the main text correctly', () => {
    const { getByText } = render(<CreatePassword />);
    expect(getByText('Create new password')).toBeTruthy();
    expect(getByText('Your new password must be different from previous used passwords and must be of at least 8 characters.')).toBeTruthy();
  });

  it('renders the image correctly', () => {
    const { getByRole } = render(<CreatePassword />);
    const image = getByRole('image', { name: 'logo' });
    expect(image).toBeTruthy();
  });

  it('displays error message when passwords do not match', async () => {
    const { getByText, getByPlaceholderText } = render(<CreatePassword />);

    fireEvent.changeText(getByPlaceholderText('Password'), 'Password1!');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password2!');

    fireEvent.press(getByText('Update Password'));

    await waitFor(() => {
      expect(getByText('Passwords do not match')).toBeTruthy();
    });
  });

  it('navigates to the home screen when passwords match', async () => {
    const { getByText, getByPlaceholderText } = render(<CreatePassword />);

    fireEvent.changeText(getByPlaceholderText('Password'), 'Password1!');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password1!');

    fireEvent.press(getByText('Update Password'));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/');
    });
  });

  it('validates password input correctly', async () => {
    const { getByText, getByPlaceholderText, findByText } = render(<CreatePassword />);

    fireEvent.changeText(getByPlaceholderText('Password'), 'short');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'short');

    fireEvent.press(getByText('Update Password'));

    expect(await findByText('Must be at least 8 characters in length')).toBeTruthy();
  });

  it('toggles password visibility', () => {
    const { getByPlaceholderText, getByTestId } = render(<CreatePassword />);

    const passwordInput = getByPlaceholderText('Password');
    const toggleButton = getByTestId('togglePasswordVisibility');

    fireEvent.press(toggleButton);

    expect(passwordInput.props.secureTextEntry).toBe(false);
  });
});
