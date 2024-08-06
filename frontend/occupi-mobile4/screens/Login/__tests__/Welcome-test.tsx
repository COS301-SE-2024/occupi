import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyledProvider, Theme } from '@gluestack-ui/themed';
import Welcome from '../Welcome'; // Adjust the path to your component

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper'); // To prevent warnings about Animated module
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

const renderWithProvider = (component) => {
  return render(
    <StyledProvider theme={Theme}>
      {component}
    </StyledProvider>
  );
};

describe('Welcome component', () => {
  it('renders correctly and matches snapshot', () => {
    const tree = renderWithProvider(<Welcome />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders text correctly', () => {
    const { getByText } = renderWithProvider(<Welcome />);
    expect(getByText("Log in. Let's Plan.")).toBeTruthy();
    expect(getByText('Predict. Plan. Perfect.')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
  });

  it('navigates to the login screen on login button press', () => {
    const { getByText } = renderWithProvider(<Welcome />);
    const loginButton = getByText('Login');

    fireEvent.press(loginButton);

    expect(require('expo-router').router.replace).toHaveBeenCalledWith('/login');
  });

  it('navigates to the signup screen on register text press', () => {
    const { getByText } = renderWithProvider(<Welcome />);
    const registerText = getByText('Register');

    fireEvent.press(registerText);

    expect(require('expo-router').router.push).toHaveBeenCalledWith('/signup');
  });
});
