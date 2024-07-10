import React from 'react';
import { render } from '@testing-library/react-native';
import Profile from '../Profile'; // Adjust the import based on your file structure

// Mocking SecureStore and router
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: () => ({ replace: jest.fn() }),
}));

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Profile component with initial state', async () => {
    // Mock data that would typically come from SecureStore
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

    // Render the component
    const { getByText } = render(<Profile />);

    // Assertions for initial render
    expect(getByText('My account')).toBeTruthy();
    expect(getByText('Full name')).toBeTruthy();
    // expect(getByPlaceholderText('Kamogelo Moeket')).toBeTruthy(); // Example: Change to actual initial value
    expect(getByText('Date of birth')).toBeTruthy();
    expect(getByText('Gender')).toBeTruthy();
    expect(getByText('Email Address')).toBeTruthy();
    // expect(getByPlaceholderText('johndoe@example.com')).toBeTruthy(); // Example: Change to actual initial value
    expect(getByText('Occupi ID')).toBeTruthy();
    // expect(getByPlaceholderText('EMP12345')).toBeTruthy(); // Example: Change to actual initial value
    expect(getByText('Cell No')).toBeTruthy();
    expect(getByText('Pronouns (optional)')).toBeTruthy();
    // expect(getByPlaceholderText('He/Him')).toBeTruthy(); // Example: Change to actual initial value
    expect(getByText('Save')).toBeTruthy(); // Assuming there's a "Save" button
  });

  // Add more tests as needed for specific UI components
});

