import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Onboarding3 from './Onboarding3';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

describe('Onboarding3', () => {
  it('renders the image correctly', () => {
    const { getByAltText } = render(<Onboarding3 />);
    const image = getByAltText('logo');
    expect(image).toBeTruthy();
  });

  it('renders the heading and text correctly', () => {
    const { getByText } = render(<Onboarding3 />);
    expect(getByText('Real time updates')).toBeTruthy();
    expect(getByText('Provides real time updates for occupancy and capacity')).toBeTruthy();
  });

  it('navigates to the welcome screen when the button is pressed', () => {
    const push = require('expo-router').useRouter().push;
    const { getByText } = render(<Onboarding3 />);
    const button = getByText('Next');

    fireEvent.press(button);
    expect(push).toHaveBeenCalledWith('/welcome');
  });
});