import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ViewBookings from '../ViewBookings';
import { fetchUserBookings } from '@/utils/bookings';
import { useTheme } from '@/components/ThemeContext';

jest.mock('@/utils/bookings', () => ({
  fetchUserBookings: jest.fn(),
}));

jest.mock('@/components/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

describe('ViewBookings', () => {
  it('should render correctly', async () => {
    fetchUserBookings.mockResolvedValue([
      {
        _id: '1',
        roomName: 'Room 1',
        roomId: '1',
        roomNo: 1,
        floorNo: 1,
        minOccupancy: 2,
        maxOccupancy: 4,
        description: 'This is Room 1',
        date: '2023-08-21T12:00:00Z',
        start: '2023-08-21T12:00:00Z',
        end: '2023-08-21T13:00:00Z',
        emails: ['user1@example.com', 'user2@example.com'],
      },
    ]);

    useTheme.mockReturnValue({ theme: 'light' });

    const { toJSON } = render(<ViewBookings />);
    await waitFor(() => expect(toJSON()).toMatchSnapshot());
  });

  it('should toggle the layout when the layout button is pressed', () => {
    const { getByTestId } = render(<ViewBookings />);
    const layoutButton = getByTestId('layout-button');
    fireEvent.press(layoutButton);
    expect(getByTestId('layout-button')).toHaveStyle({ backgroundColor: 'greenyellow' });
  });

  it('should refresh the booking data', async () => {
    fetchUserBookings.mockResolvedValue([
      {
        _id: '1',
        roomName: 'Room 1',
        roomId: '1',
        roomNo: 1,
        floorNo: 1,
        minOccupancy: 2,
        maxOccupancy: 4,
        description: 'This is Room 1',
        date: '2023-08-21T12:00:00Z',
        start: '2023-08-21T12:00:00Z',
        end: '2023-08-21T13:00:00Z',
        emails: ['user1@example.com', 'user2@example.com'],
      },
    ]);

    useTheme.mockReturnValue({ theme: 'light' });

    const { getByText, getByTestId } = render(<ViewBookings />);
    const refreshControl = getByTestId('refresh-control');
    fireEvent(refreshControl, 'refresh');
    await waitFor(() => expect(getByText('Room 1')).toBeTruthy());
  });
});