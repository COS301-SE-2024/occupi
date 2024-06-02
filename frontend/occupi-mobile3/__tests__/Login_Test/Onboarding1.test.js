import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Onboarding1 from '../../screens/Login/Onboarding1';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

describe('Onboarding1', () => {
  it('renders the image correctly', () => {
    const { getByAltText } = render(<Onboarding1 />);
    const image = getByAltText('logo');
    expect(image).toBeTruthy();
  });

  it('renders the heading and text correctly', () => {
    const { getByText } = render(<Onboarding1 />);
    expect(getByText('Capacity Prediction')).toBeTruthy();
    expect(getByText('Predictive AI to help you plan when you go to the office better')).toBeTruthy();
  });

  it('navigates to the onboarding2 screen when the button is pressed', () => {
    const push = require('expo-router').useRouter().push;
    const { getByText } = render(<Onboarding1 />);
    const button = getByText('Next');

    fireEvent.press(button);
    expect(push).toHaveBeenCalledWith('/onboarding2');
  });
});
