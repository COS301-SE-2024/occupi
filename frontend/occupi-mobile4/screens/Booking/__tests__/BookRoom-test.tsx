import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BookRoom from '../BookRoom';
import { fetchRooms } from '@/utils/bookings';
import { useTheme } from '@/components/ThemeContext';

jest.mock('@/utils/bookings', () => ({
  fetchRooms: jest.fn(),
}));

jest.mock('@/components/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

describe('BookRoom', () => {
  it('should render correctly', () => {
    const { toJSON } = render(<BookRoom />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should toggle the layout when the layout button is pressed', () => {
    const { getByTestId } = render(<BookRoom />);
    const layoutButton = getByTestId('layout-button');
    fireEvent.press(layoutButton);
    expect(getByTestId('layout-button')).toHaveStyle({ backgroundColor: 'greenyellow' });
  });

  it('should fetch room data and display it', async () => {
    fetchRooms.mockResolvedValue([
      {
        _id: '1',
        roomName: 'Room 1',
        roomId: '1',
        roomNo: 1,
        floorNo: 1,
        minOccupancy: 2,
        maxOccupancy: 4,
        description: 'This is Room 1',
      },
    ]);

    useTheme.mockReturnValue({ theme: 'light' });

    const { getByText } = render(<BookRoom />);
    await waitFor(() => expect(getByText('Room 1')).toBeTruthy());
  });
});