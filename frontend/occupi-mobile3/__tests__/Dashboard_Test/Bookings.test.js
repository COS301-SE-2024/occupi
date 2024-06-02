import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Bookings from '../';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('Bookings Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Bookings />);

    expect(getByText('Offices')).toBeTruthy();
    expect(getByText('Book Table')).toBeTruthy();
    expect(getByText('HDMI Room')).toBeTruthy();
    expect(getByText('Conference Room')).toBeTruthy();
    expect(getByText('Meeting Room 1')).toBeTruthy();
    expect(getByText('Meeting Room 2')).toBeTruthy();
  });

  it('navigates to bookings screen on button press', () => {
    const { getByText } = render(<Bookings />);

    const buttons = getByText('Available now');
    fireEvent.press(buttons);

    expect(router.push).toHaveBeenCalledWith('/bookings');
  });
});
