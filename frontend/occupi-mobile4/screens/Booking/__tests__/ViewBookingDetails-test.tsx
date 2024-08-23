import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ViewBookingDetails from '../ViewBookingDetails';
import * as SecureStore from 'expo-secure-store';
import { userCheckin, userCancelBooking } from '../../../utils/bookings';
import { useTheme } from '@/components/ThemeContext';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
}));

jest.mock('../../../utils/bookings', () => ({
  userCheckin: jest.fn(),
  userCancelBooking: jest.fn(),
}));

jest.mock('../../../components/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

describe('ViewBookingDetails', () => {
  it('should render correctly', async () => {
    SecureStore.getItemAsync.mockResolvedValue(
      JSON.stringify({
        _id: '1',
        roomName: 'Room 1',
        roomId: '1',
        roomNo: 1,
        floorNo: 1,
        minOccupancy: 2,
        maxOccupancy: 4,
        description: 'This is Room 1',
        checkedIn: false,
      })
    );

    useTheme.mockReturnValue({ theme: 'light' });

    const { toJSON } = render(<ViewBookingDetails />);
    await waitFor(() => expect(toJSON()).toMatchSnapshot());
  });

  it('should check in the user', async () => {
    SecureStore.getItemAsync.mockResolvedValue(
      JSON.stringify({
        _id: '1',
        roomName: 'Room 1',
        roomId: '1',
        roomNo: 1,
        floorNo: 1,
        minOccupancy: 2,
        maxOccupancy: 4,
        description: 'This is Room 1',
        checkedIn: false,
      })
    );

    userCheckin.mockResolvedValue('Successfully checked in!');

    useTheme.mockReturnValue({ theme: 'light' });

    const { getByText } = render(<ViewBookingDetails />);
    fireEvent.press(getByText('Check in'));
    await waitFor(() => expect(getByText('Successfully checked in!')).toBeTruthy());
  });

  it('should cancel the booking', async () => {
    SecureStore.getItemAsync.mockResolvedValue(
      JSON.stringify({
        _id: '1',
        roomName: 'Room 1',
        roomId: '1',
        roomNo: 1,
        floorNo: 1,
        minOccupancy: 2,
        maxOccupancy: 4,
        description: 'This is Room 1',
        checkedIn: false,
      })
    );

    userCancelBooking.mockResolvedValue('Successfully cancelled booking!');

    useTheme.mockReturnValue({ theme: 'light' });

    const { getByText } = render(<ViewBookingDetails />);
    fireEvent.press(getByText('Cancel Booking'));
    await waitFor(() => expect(getByText('Successfully cancelled booking!')).toBeTruthy());
  });
});