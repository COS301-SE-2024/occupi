import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { StyledProvider, Theme } from '@gluestack-ui/themed';
import Dashboard from '../Dashboard';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper'); // To prevent warnings about Animated module

jest.mock('@gluestack-ui/themed', () => ({
  ...jest.requireActual('@gluestack-ui/themed'),
  useToast: () => ({
    show: jest.fn(),
  }),
}));

const renderWithProvider = (component) => {
  return render(
    <StyledProvider theme={Theme}>
      {component}
    </StyledProvider>
  );
};

describe('Dashboard component', () => {
  // it('renders correctly and matches snapshot', () => {
  //   const tree = renderWithProvider(<Dashboard />).toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  it('renders text correctly', () => {
    const { getByText } = renderWithProvider(<Dashboard />);
    expect(getByText('Hi Sabrina 👋')).toBeTruthy();
    expect(getByText('Welcome to Occupi')).toBeTruthy();
  });

  it('changes button text on check-in/check-out', () => {
    const { getByText } = renderWithProvider(<Dashboard />);
    const checkInButton = getByText('Check in');

    fireEvent.press(checkInButton);
    expect(getByText('Check out')).toBeTruthy();

    fireEvent.press(checkInButton);
    expect(getByText('Check in')).toBeTruthy();
  });
});
