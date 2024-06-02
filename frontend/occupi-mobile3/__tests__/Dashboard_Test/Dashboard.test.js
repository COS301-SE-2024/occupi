import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Dashboard from '../Dashboard'; // Adjust the import path accordingly
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('Dashboard Component', () => {
  it('renders correctly', () => {
    const { getByText, getByAltText } = render(<Dashboard />);

    expect(getByText('Hi Tina 👋')).toBeTruthy();
    expect(getByText('Welcome to Occupi')).toBeTruthy();
    expect(getByText('Office analytics')).toBeTruthy();
    expect(getByAltText('logo')).toBeTruthy();
  });

  it('navigates to bookings screen on "Book a space" button press', () => {
    const { getByText } = render(<Dashboard />);

    const bookSpaceButton = getByText('Book a space');
    fireEvent.press(bookSpaceButton);

    expect(router.push).toHaveBeenCalledWith('/bookings');
  });
});
