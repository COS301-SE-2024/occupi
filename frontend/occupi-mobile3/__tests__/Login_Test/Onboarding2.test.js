import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Onboarding2 from '../../screens/Login/Onboarding2';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

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

describe('Onboarding2', () => {
  it('renders the image correctly', () => {
    const { getByAltText } = render(<Onboarding2 />);
    const image = getByAltText('logo');
    expect(image).toBeTruthy();
  });

  it('renders the heading and text correctly', () => {
    const { getByText } = render(<Onboarding2 />);
    expect(getByText('Day to day Occupancy analysis')).toBeTruthy();
    expect(getByText('Uses historical data to provide day to day analysis and statistics')).toBeTruthy();
  });

  it('navigates to the onboarding3 screen when the button is pressed', () => {
    const { getByText } = render(<Onboarding2 />);
    const button = getByText('Next');
    fireEvent.press(button);
    expect(router.push).toHaveBeenCalledWith('/onboarding3');
  });
});
