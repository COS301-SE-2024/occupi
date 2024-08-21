import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Onboarding1 from '../Onboarding1';
import Onboarding2 from '../Onboarding2';
import Onboarding3 from '../Onboarding3';
import SplashScreen from '../SplashScreen';
import Welcome from '../Welcome';

describe('Onboarding1', () => {
  it('renders correctly', () => {
    const { getByText, getByAltText } = render(<Onboarding1 />);
    expect(getByText('Capacity Prediction')).toBeTruthy();
    expect(getByText('Predictive AI to help you plan when you go to the office better')).toBeTruthy();
    expect(getByAltText('logo')).toBeTruthy();
  });

  it('navigates to Onboarding2 when "Next" button is pressed', () => {
    const { getByText } = render(<Onboarding1 />);
    fireEvent.press(getByText('Next'));
    expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding2');
  });
});

describe('Onboarding2', () => {
  it('renders correctly', () => {
    const { getByText, getByAltText } = render(<Onboarding2 />);
    expect(getByText('Day to day Occupancy analysis')).toBeTruthy();
    expect(getByText('Uses historical data to provide day to day analysis and statistics')).toBeTruthy();
    expect(getByAltText('logo')).toBeTruthy();
  });

  it('navigates to Onboarding3 when "Next" button is pressed', () => {
    const { getByText } = render(<Onboarding2 />);
    fireEvent.press(getByText('Next'));
    expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding3');
  });
});

describe('Onboarding3', () => {
  it('renders correctly', () => {
    const { getByText, getByAltText } = render(<Onboarding3 />);
    expect(getByText('Real time updates')).toBeTruthy();
    expect(getByText('Provides real time updates for occupancy and capacity')).toBeTruthy();
    expect(getByAltText('logo')).toBeTruthy();
  });

  it('navigates to Welcome screen when "Next" button is pressed', () => {
    const { getByText } = render(<Onboarding3 />);
    fireEvent.press(getByText('Next'));
    expect(mockRouter.replace).toHaveBeenCalledWith('/welcome');
  });
});

describe('SplashScreen', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<SplashScreen />);
    expect(getByTestId('logo-container')).toBeTruthy();
  });

  it('navigates to Onboarding1 after 5 seconds', () => {
    const { getByTestId } = render(<SplashScreen />);
    jest.advanceTimersByTime(5000);
    expect(mockRouter.replace).toHaveBeenCalledWith('/home');
  });
});

describe('Welcome', () => {
  it('renders correctly', () => {
    const { getByText, getByAltText } = render(<Welcome />);
    expect(getByText('Log in. Let\'s Plan.')).toBeTruthy();
    expect(getByText('Predict. Plan. Perfect.')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
    expect(getByAltText('logo')).toBeTruthy();
  });

  it('navigates to Login screen when "Login" button is pressed', () => {
    const { getByText } = render(<Welcome />);
    fireEvent.press(getByText('Login'));
    expect(mockRouter.replace).toHaveBeenCalledWith('/login');
  });

  it('navigates to Signup screen when "Register" text is pressed', () => {
    const { getByText } = render(<Welcome />);
    fireEvent.press(getByText('Register'));
    expect(mockRouter.push).toHaveBeenCalledWith('/signup');
  });
});