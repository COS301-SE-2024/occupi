// import React from 'react';
// import { render, fireEvent } from '@testing-library/react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import Onboarding3, { GradientButton } from '../Onboarding3'; // Adjust the import path accordingly
// import { router } from 'expo-router';

// jest.mock('expo-router', () => ({
//   router: {
//     push: jest.fn(),
//   },
// }));

// jest.mock('expo-linear-gradient', () => ({
//   LinearGradient: jest.fn().mockImplementation(({ children }) => children),
// }));

// describe('Onboarding3 Component', () => {
//   it('renders correctly', () => {
//     const { getByText, getByAltText } = render(<Onboarding3 />);

//     expect(getByText("Log in. Let's Plan.")).toBeTruthy();
//     expect(getByText('Predict. Plan. Perfect.')).toBeTruthy();
//     expect(getByText('Login')).toBeTruthy();
//     expect(getByText('Register')).toBeTruthy();
//     expect(getByAltText('logo')).toBeTruthy();
//   });

//   it('navigates to login screen on login button press', () => {
//     const { getByText } = render(<Onboarding3 />);

//     const loginButton = getByText('Login');
//     fireEvent.press(loginButton);

//     expect(router.push).toHaveBeenCalledWith('/login');
//   });

//   it('navigates to signup screen on register text press', () => {
//     const { getByText } = render(<Onboarding3 />);

//     const registerText = getByText('Register');
//     fireEvent.press(registerText);

//     expect(router.push).toHaveBeenCalledWith('/signup');
//   });
// });

// describe('GradientButton Component', () => {
//   it('renders correctly with given text', () => {
//     const { getByText } = render(<GradientButton onPress={() => {}} text="Test Button" />);

//     expect(getByText('Test Button')).toBeTruthy();
//   });

//   it('calls onPress when pressed', () => {
//     const mockOnPress = jest.fn();
//     const { getByText } = render(<GradientButton onPress={mockOnPress} text="Test Button" />);

//     const button = getByText('Test Button');
//     fireEvent.press(button);

//     expect(mockOnPress).toHaveBeenCalled();
//   });
// });
