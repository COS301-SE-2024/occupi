import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import OTPVerification from '../../screens/Login/OTPVerification';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
  router: {
    push: jest.fn(),
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => children,
}));

jest.mock('@gluestack-ui/themed', () => ({
  VStack: 'View',
  Box: 'View',
  HStack: 'View',
  Text: 'Text',
  Button: 'Button',
  Image: 'Image',
  Center: 'View',
  FormControl: 'View',
  Input: 'TextInput',
  LinkText: 'Text',
  FormControlHelperText: 'Text',
  InputField: 'TextInput',
  ButtonText: 'Text',
  FormControlError: 'View',
  FormControlErrorIcon: 'View',
  FormControlErrorText: 'Text',
  Toast: 'View',
  ToastTitle: 'Text',
  useToast: () => ({
    show: jest.fn(),
  }),
  Heading: 'Text',
}));

jest.mock('expo-random', () => ({
  getRandomBytesAsync: jest.fn().mockResolvedValue(new Uint8Array(3)),
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
}));

describe('OTPVerification', () => {
  it('renders the main text correctly', () => {
    const { getByText } = render(<OTPVerification />);
    expect(getByText('We sent you an email code')).toBeTruthy();
    expect(getByText('We have sent the OTP code to kamo@gmail.com')).toBeTruthy();
  });

  it('renders the image correctly', () => {
    const { getByRole } = render(<OTPVerification />);
    const image = getByRole('image', { name: 'occupi' });
    expect(image).toBeTruthy();
  });

  it('renders the countdown timer correctly', () => {
    const { getByText } = render(<OTPVerification />);
    expect(getByText('60 seconds remaining')).toBeTruthy();
  });

  it('updates the countdown timer every second', () => {
    jest.useFakeTimers();
    const { getByText } = render(<OTPVerification />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(getByText('59 seconds remaining')).toBeTruthy();

    jest.useRealTimers();
  });

  it('validates OTP input correctly', async () => {
    const { getByText, getByPlaceholderText, findByText } = render(<OTPVerification />);

    const input = getByPlaceholderText('');

    fireEvent.changeText(input, '1');
    fireEvent.changeText(input, '12');
    fireEvent.changeText(input, '123');
    fireEvent.changeText(input, '1234');
    fireEvent.changeText(input, '12345');
    fireEvent.changeText(input, '123456');

    const button = getByText('Verify');
    fireEvent.press(button);

    expect(await findByText('OTP must be at least 6 characters in length')).toBeTruthy();
  });

  it('navigates to the home screen when OTP is correct', async () => {
    const { getByText, getAllByPlaceholderText } = render(<OTPVerification />);
    
    const inputs = getAllByPlaceholderText('');
    inputs.forEach((input, index) => {
      fireEvent.changeText(input, (index + 1).toString());
    });

    const button = getByText('Verify');
    fireEvent.press(button);

    await act(async () => {
      expect(router.push).toHaveBeenCalledWith('/home');
    });
  });
});
