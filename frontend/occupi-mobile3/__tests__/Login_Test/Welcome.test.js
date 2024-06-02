import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Welcome from '../../screens/Login/Welcome';
import { router } from 'expo-router';

// Mock the router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('Welcome', () => {
  it('renders correctly', () => {
    const { getByText, getByAltText } = render(<Welcome />);

    // Check if the text elements are rendered
    expect(getByText("Log in. Let's Plan.")).toBeTruthy();
    expect(getByText("Predict. Plan. Perfect.")).toBeTruthy();
    expect(getByText("Login")).toBeTruthy();
    expect(getByText("Register")).toBeTruthy();

    // Check if the logo image is rendered
    expect(getByAltText("logo")).toBeTruthy();
  });

  it('navigates to login screen when Login button is pressed', () => {
    const { getByText } = render(<Welcome />);
    const loginButton = getByText("Login");

    fireEvent.press(loginButton);
    expect(router.push).toHaveBeenCalledWith('/login');
  });

  it('navigates to signup screen when Register text is pressed', () => {
    const { getByText } = render(<Welcome />);
    const registerText = getByText("Register");

    fireEvent.press(registerText);
    expect(router.push).toHaveBeenCalledWith('/signup');
  });
});
