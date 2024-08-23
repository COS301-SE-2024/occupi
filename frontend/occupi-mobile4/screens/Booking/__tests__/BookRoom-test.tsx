import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BookRoom from '../BookRoom';
import { fetchRooms } from '../../../utils/bookings';
import { useTheme } from '../../../components/ThemeContext';
import { useToast } from '@gluestack-ui/themed/build/components/Toast';
import { useNavBar } from '../../../components/NavBar';
import { useRouter } from 'expo-router';

jest.mock('../../../utils/bookings', () => ({
  fetchRooms: jest.fn(),
}));

jest.mock('@gluestack-ui/themed/build/components/Toast', () => ({
  useToast: jest.fn(() => ({
    showToast: jest.fn(),
    hideToast: jest.fn(),
  })),
}));

jest.mock('../../../components/NavBar', () => ({
  useNavBar: jest.fn().mockReturnValue({
    currentTab: 'Home',
    setCurrentTab: jest.fn(),
  }),
}));

jest.mock('../../../components/ThemeContext', () => ({
  useTheme: jest.fn().mockReturnValue({ theme: 'light' }),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    back: jest.fn(),
  }),
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

    const { getByText } = render(<BookRoom />);
    await waitFor(() => expect(getByText('Room 1')).toBeTruthy());
  });

  it('should show a toast when the room is booked', async () => {
    const mockShowToast = jest.fn();
    useToast.mockReturnValue({ showToast: mockShowToast, hideToast: jest.fn() });

    const { getByTestId } = render(<BookRoom />);
    const bookButton = getByTestId('book-button');
    fireEvent.press(bookButton);

    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Room booked successfully',
    }));
  });

  it('should show an error toast when the room booking fails', async () => {
    const mockShowToast = jest.fn();
    useToast.mockReturnValue({ showToast: mockShowToast, hideToast: jest.fn() });

    fetchRooms.mockRejectedValue(new Error('Failed to fetch rooms'));

    const { getByTestId } = render(<BookRoom />);
    const bookButton = getByTestId('book-button');
    fireEvent.press(bookButton);

    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to book room: Failed to fetch rooms',
    }));
  });

  it('should update the Navbar currentTab when the BookRoom component mounts', () => {
    const setCurrentTabMock = jest.fn();
    useNavBar.mockReturnValue({ currentTab: 'Home', setCurrentTab: setCurrentTabMock });

    render(<BookRoom />);

    expect(setCurrentTabMock).toHaveBeenCalledWith('Booking');
  });
});
