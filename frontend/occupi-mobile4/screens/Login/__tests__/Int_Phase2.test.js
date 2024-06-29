import React from 'react';
import renderer, { act } from 'react-test-renderer';
import Welcome from '../Welcome';
import SignIn from '../SignIn';
import SignUp from '../SignUp';
import { router } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    navigate: jest.fn(),
  },
}));

jest.mock('../SignIn', () => (props) => <div {...props} />);
jest.mock('../SignUp', () => (props) => <div {...props} />);

// Mocking fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
);

jest.useFakeTimers();

describe('App Navigation from Welcome', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to login when Login button is pressed', () => {
    const welcome = renderer.create(<Welcome />);
    const button = welcome.root.findByProps({ testID: 'login-button' });

    act(() => {
      button.props.onPress();
    });

    expect(router.push).toHaveBeenCalledWith('/login');
  });

  it('should navigate to signup when Register text is pressed', () => {
    const welcome = renderer.create(<Welcome />);
    const registerText = welcome.root.findByProps({ testID: 'register-text' });

    act(() => {
      registerText.props.onPress();
    });

    expect(router.push).toHaveBeenCalledWith('/signup');
  });

  it('should perform login API call and navigate to dashboard', async () => {
    const signIn = renderer.create(<SignIn />);
    const loginButton = signIn.root.findByProps({ testID: 'login-submit' });
    const emailInput = signIn.root.findByProps({ testID: 'email-input' });
    const passwordInput = signIn.root.findByProps({ testID: 'password-input' });

    act(() => {
      emailInput.props.onChangeText('test@example.com');
      passwordInput.props.onChangeText('password');
      loginButton.props.onPress();
    });

    await act(async () => {
      jest.runAllTimers();
    });

    expect(fetch).toHaveBeenCalledWith('https://dev.occupi.tech/auth/login', expect.any(Object));
    expect(router.push).toHaveBeenCalledWith('/home');
  });

  it('should perform signup API call and navigate to verification', async () => {
    const signUp = renderer.create(<SignUp />);
    const signUpButton = signUp.root.findByProps({ testID: 'signup-submit' });
    const emailInput = signUp.root.findByProps({ testID: 'email-input' });
    const passwordInput = signUp.root.findByProps({ testID: 'password-input' });

    act(() => {
      emailInput.props.onChangeText('newuser@example.com');
      passwordInput.props.onChangeText('newpassword');
      signUpButton.props.onPress();
    });

    await act(async () => {
      jest.runAllTimers();
    });

    expect(fetch).toHaveBeenCalledWith('https://dev.occupi.tech/auth/signup', expect.any(Object));
    expect(router.push).toHaveBeenCalledWith('/otp-verification');
  });
});
