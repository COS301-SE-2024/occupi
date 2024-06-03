import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Onboarding3 from '../../screens/Login/Onboarding3';
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

jest.mock('@gluestack-style/react', () => ({
  StyledProvider: ({ children }) => children,
  useStyled: () => ({}),
  StyledText: 'Text',
  StyledView: 'View',
  StyledImage: 'Image',
  StyledButton: 'Button',
  // Mock other components if necessary
}));

jest.mock('@gluestack-ui/themed', () => ({
  Box: 'View',
  Image: 'Image',
  Center: 'View',
  Text: 'Text',
  Heading: 'Text',
  Button: 'Button',
}));

describe('Onboarding3', () => {
  it('renders the image correctly', () => {
    const { getByRole } = render(<Onboarding3 />);
    const image = getByRole('image', { name: 'logo' });
    expect(image).toBeTruthy();
  });

  it('renders the heading and text correctly', () => {
    const { getByText } = render(<Onboarding3 />);
    expect(getByText('Real time updates')).toBeTruthy();
    expect(getByText('Provides real time updates for occupancy and capacity')).toBeTruthy();
  });

  it('navigates to the welcome screen when the button is pressed', () => {
    const { getByText } = render(<Onboarding3 />);
    const button = getByText('Next');
    fireEvent.press(button);
    expect(router.push).toHaveBeenCalledWith('/welcome');
  });
});
