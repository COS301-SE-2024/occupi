import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Onboarding2 from './Onboarding2';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
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
    const push = require('expo-router').useRouter().push;
    const { getByText } = render(<Onboarding2 />);
    const button = getByText('Next');

    fireEvent.press(button);
    expect(push).toHaveBeenCalledWith('/onboarding3');
  });
});