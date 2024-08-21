import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OfficeDetails from '../OfficeDetails';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

jest.mock('expo-secure-store');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('OfficeDetails component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component correctly', () => {
    const { getByText, getByTestId } = render(<OfficeDetails />);
    expect(getByText('Set Account Details')).toBeTruthy();
    expect(getByText('Full name')).toBeTruthy();
    expect(getByText('Date of birth')).toBeTruthy();
    expect(getByText('Gender')).toBeTruthy();
    expect(getByText('Cell No')).toBeTruthy();
    expect(getByText('Pronouns (optional)')).toBeTruthy();
    expect(getByText('Confirm')).toBeTruthy();
  });

  it('updates the date state correctly', () => {
    const { getByText } = render(<OfficeDetails />);
    const dateInput = getByText('Date');
    fireEvent.press(dateInput);
    const confirmButton = getByText('Confirm');
    fireEvent.press(confirmButton);
    expect(dateInput.props.value).toBeTruthy();
  });

  it('updates the start time state correctly', () => {
    const { getByText } = render(<OfficeDetails />);
    const startTimeInput = getByText('Start Time');
    fireEvent.press(startTimeInput);
    const timeOption = getByText('09:00');
    fireEvent.press(timeOption);
    expect(startTimeInput.props.value).toBe('09:00');
  });

  it('updates the end time state correctly', () => {
    const { getByText } = render(<OfficeDetails />);
    const endTimeInput = getByText('End Time');
    fireEvent.press(endTimeInput);
    const timeOption = getByText('16:00');
    fireEvent.press(timeOption);
    expect(endTimeInput.props.value).toBe('16:00');
  });

  it('calls the handleBookRoom function correctly', async () => {
    const mockRouter = {
      replace: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.spyOn(SecureStore, 'setItemAsync').mockResolvedValue();

    const { getByText } = render(<OfficeDetails />);
    const dateInput = getByText('Date');
    fireEvent.press(dateInput);
    const confirmDateButton = getByText('Confirm');
    fireEvent.press(confirmDateButton);

    const startTimeInput = getByText('Start Time');
    fireEvent.press(startTimeInput);
    const startTimeOption = getByText('09:00');
    fireEvent.press(startTimeOption);

    const endTimeInput = getByText('End Time');
    fireEvent.press(endTimeInput);
    const endTimeOption = getByText('16:00');
    fireEvent.press(endTimeOption);

    const bookButton = getByText('Check availability');
    fireEvent.press(bookButton);

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'BookingInfo',
        expect.any(String)
      );
      expect(mockRouter.replace).toHaveBeenCalledWith('/booking-details');
    });
  });

  it('fetches the current room information correctly', async () => {
    const mockRoom = {
      roomName: 'Test Room',
      roomId: '1',
      floorNo: 1,
      minOccupancy: 2,
      maxOccupancy: 10,
    };
    jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValue(JSON.stringify(mockRoom));

    const { getByText } = render(<OfficeDetails />);
    await waitFor(() => {
      expect(getByText('Test Room')).toBeTruthy();
    });
  });
});