import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyledProvider, Theme } from '@gluestack-ui/themed';
import Dashboard from '../Dashboard';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper'); // To prevent warnings about Animated module

jest.mock('@gluestack-ui/themed', () => ({
  ...jest.requireActual('@gluestack-ui/themed'),
  useToast: () => ({
    show: jest.fn(),
  }),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
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

  const mockedData = {
    data: {
      details: {
        name: 'John Doe',
        contactNo: '1234567890',
        pronouns: 'He/Him',
        dob: '1990-01-01T00:00:00Z', // Make sure the format matches your component's expectations
      },
      email: 'johndoe@example.com',
      occupiId: 'EMP12345',
    },
  };

  // Mock SecureStore getItemAsync to resolve with the mocked data
  require('expo-secure-store').getItemAsync.mockResolvedValueOnce(JSON.stringify(mockedData));

  it('renders text correctly', () => {
    const { getByText } = renderWithProvider(<Dashboard />);
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
