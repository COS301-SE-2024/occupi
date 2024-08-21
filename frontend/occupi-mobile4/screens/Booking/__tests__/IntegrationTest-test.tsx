import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { fetchRooms, userCheckin, userCancelBooking, fetchUserBookings } from '@/utils/bookings';
import BookRoom from '../BookRoom';
import ViewBookingDetails from '../ViewBookingDetails';
import ViewBookings from '../ViewBookings';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('@/utils/bookings', () => ({
  fetchRooms: jest.fn(),
  userCheckin: jest.fn(),
  userCancelBooking: jest.fn(),
  fetchUserBookings: jest.fn(),
}));

describe('Integration Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('BookRoom component', async () => {
    const mockRooms = [
      {
        _id: '1',
        roomName: 'Room 1',
        roomId: 'room1',
        roomNo: 1,
        floorNo: 1,
        minOccupancy: 2,
        maxOccupancy: 6,
        description: 'This is Room 1',
      },
      {
        _id: '2',
        roomName: 'Room 2',
        roomId: 'room2',
        roomNo: 2,
        floorNo: 2,
        minOccupancy: 3,
        maxOccupancy: 8,
        description: 'This is Room 2',
      },
    ];

    fetchRooms.mockResolvedValue(mockRooms);
    useRouter.mockReturnValue({ push: jest.fn() });

    const { getByText, getByTestId } = render(<BookRoom />);

    await waitFor(() => expect(fetchRooms).toHaveBeenCalled());

    fireEvent.press(getByTestId('room-1'));
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('CurrentRoom', JSON.stringify(mockRooms[0]));
    expect(useRouter().push).toHaveBeenCalledWith('/office-details');
  });

  test('ViewBookingDetails component', async () => {
    const mockRoom = {
      _id: '1',
      roomName: 'Room 1',
      roomId: 'room1',
      floorNo: 1,
      minOccupancy: 2,
      maxOccupancy: 6,
      description: 'This is Room 1',
      emails: ['user1@example.com', 'user2@example.com'],
      checkedIn: false,
      date: '2023-08-21T10:00:00.000Z',
      start: '2023-08-21T10:00:00.000Z',
      end: '2023-08-21T11:00:00.000Z',
    };

    SecureStore.getItemAsync.mockResolvedValue(JSON.stringify(mockRoom));
    userCheckin.mockResolvedValue('Successfully checked in!');
    userCancelBooking.mockResolvedValue('Successfully cancelled booking!');
    useRouter.mockReturnValue({ back: jest.fn() });

    const { getByText, getByTestId } = render(<ViewBookingDetails />);

    await waitFor(() => expect(SecureStore.getItemAsync).toHaveBeenCalledWith('CurrentRoom'));

    fireEvent.press(getByTestId('check-in'));
    await waitFor(() => expect(userCheckin).toHaveBeenCalled());

    fireEvent.press(getByTestId('cancel-booking'));
    await waitFor(() => expect(userCancelBooking).toHaveBeenCalled());

    fireEvent.press(getByTestId('back-button'));
    expect(useRouter().back).toHaveBeenCalled();
  });

  test('ViewBookings component', async () => {
    const mockBookings = [
      {
        _id: '1',
        roomName: 'Room 1',
        roomId: 'room1',
        floorNo: 1,
        minOccupancy: 2,
        maxOccupancy: 6,
        description: 'This is Room 1',
        emails: ['user1@example.com', 'user2@example.com'],
        checkedIn: false,
        date: '2023-08-21T10:00:00.000Z',
        start: '2023-08-21T10:00:00.000Z',
        end: '2023-08-21T11:00:00.000Z',
      },
      {
        _id: '2',
        roomName: 'Room 2',
        roomId: 'room2',
        floorNo: 2,
        minOccupancy: 3,
        maxOccupancy: 8,
        description: 'This is Room 2',
        emails: ['user3@example.com', 'user4@example.com'],
        checkedIn: true,
        date: '2023-08-22T14:00:00.000Z',
        start: '2023-08-22T14:00:00.000Z',
        end: '2023-08-22T15:00:00.000Z',
      },
    ];

    fetchUserBookings.mockResolvedValue(mockBookings);
    useRouter.mockReturnValue({ push: jest.fn() });

    const { getByText, getByTestId } = render(<ViewBookings />);

    await waitFor(() => expect(fetchUserBookings).toHaveBeenCalled());

    fireEvent.press(getByTestId('room-1'));
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('CurrentRoom', JSON.stringify(mockBookings[0]));
    expect(useRouter().push).toHaveBeenCalledWith('/viewbookingdetails');
  });
});