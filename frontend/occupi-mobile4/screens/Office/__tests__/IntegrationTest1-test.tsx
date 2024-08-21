import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BookingDetails from '../BookingDetails';
import { ThemeProvider } from '@/components/ThemeContext';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('@/utils/bookings', () => ({
  userBookRoom: jest.fn(),
}));

describe('BookingDetails', () => {
  it('should render the component correctly', () => {
    const { getByText } = render(
      <ThemeProvider>
        <BookingDetails />
      </ThemeProvider>
    );

    expect(getByText('Booking details')).toBeTruthy();
  });

  it('should handle biometric authentication successfully', async () => {
    jest.spyOn(LocalAuthentication, 'hasHardwareAsync').mockResolvedValue(true);
    jest.spyOn(LocalAuthentication, 'isEnrolledAsync').mockResolvedValue(true);
    jest.spyOn(LocalAuthentication, 'supportedAuthenticationTypesAsync').mockResolvedValue([]);
    jest.spyOn(LocalAuthentication, 'authenticateAsync').mockResolvedValue({ success: true });

    const { getByText } = render(
      <ThemeProvider>
        <BookingDetails />
      </ThemeProvider>
    );

    fireEvent.press(getByText('Confirm booking'));
    await waitFor(() => expect(getByText('Invite attendees')).toBeTruthy());
  });

  it('should handle booking successfully', async () => {
    jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValue(
      JSON.stringify({
        startTime: '10:00',
        endTime: '11:00',
        roomName: 'Test Room',
        roomId: 'test-room-id',
        floorNo: '1',
        minOccupancy: 2,
        maxOccupancy: 6,
      })
    );
    jest.spyOn(userBookRoom).mockResolvedValue('Successfully booked!');

    const { getByText, getByPlaceholderText, queryByText } = render(
      <ThemeProvider>
        <BookingDetails />
      </ThemeProvider>
    );

    fireEvent.press(getByText('Confirm booking'));
    await waitFor(() => expect(getByText('Invite attendees')).toBeTruthy());

    fireEvent.changeText(getByPlaceholderText('Enter attendee\'s email or employee id'), 'test@example.com');
    fireEvent.press(getByText('Send invites'));
    await waitFor(() => expect(queryByText('Successfully booked!')).toBeTruthy());
  });
});