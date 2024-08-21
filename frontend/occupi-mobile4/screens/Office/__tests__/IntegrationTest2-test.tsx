import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OfficeDetails from '../OfficeDetails';
import { ThemeProvider } from '@/components/ThemeContext';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe('OfficeDetails', () => {
  it('should render the component correctly', () => {
    const { getByText } = render(
      <ThemeProvider>
        <OfficeDetails />
      </ThemeProvider>
    );

    expect(getByText('Test Room')).toBeTruthy();
  });

  it('should handle booking a room successfully', async () => {
    jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValue(
      JSON.stringify({
        roomName: 'Test Room',
        roomId: 'test-room-id',
        floorNo: '1',
        minOccupancy: 2,
        maxOccupancy: 6,
      })
    );

    const { getByText, getByPlaceholderText } = render(
      <ThemeProvider>
        <OfficeDetails />
      </ThemeProvider>
    );

    fireEvent.press(getByPlaceholderText('Select a date'));
    fireEvent.press(getByText(upcomingDates[0]));

    fireEvent.press(getByPlaceholderText('Select a time'));
    fireEvent.press(getByText('09:00'));

    fireEvent.press(getByPlaceholderText('Select a time'));
    fireEvent.press(getByText('10:00'));

    fireEvent.press(getByText('Check availability'));
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('/booking-details'));
  });
});