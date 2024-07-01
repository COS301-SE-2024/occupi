import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BookingDetails from '../BookingDetails';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  useColorScheme: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

describe('BookingDetails', () => {
  const mockNavigation = { goBack: jest.fn() };
  const mockRouter = { back: jest.fn(), push: jest.fn() };
  const mockParams = {
    email: 'test@example.com',
    slot: '1',
    roomId: '123',
    floorNo: '1',
    roomData: JSON.stringify({ roomName: 'Test Room', minOccupancy: 1, maxOccupancy: 10, floorNo: 1 }),
  };

  beforeEach(() => {
    useNavigation.mockReturnValue(mockNavigation);
    useRouter.mockReturnValue(mockRouter);
    useLocalSearchParams.mockReturnValue(mockParams);
    useColorScheme.mockReturnValue('light');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders BookingDetails component correctly', () => {
    const { getByText } = render(<BookingDetails />);

    expect(getByText('Booking details')).toBeTruthy();
    expect(getByText('Confirm booking')).toBeTruthy();
  });

  it('handles biometric authentication and advances to next step', async () => {
    const { getByText } = render(<BookingDetails />);

    fireEvent.press(getByText('Confirm booking'));

    await waitFor(() => {
      expect(getByText('Invite attendees')).toBeTruthy();
    });
  });

  it('adds an attendee when email is entered and button is pressed', () => {
    const { getByPlaceholderText, getByText } = render(<BookingDetails />);
    const emailInput = getByPlaceholderText("Enter attendee's email or employee id");
    const addButton = getByText('+');

    fireEvent.changeText(emailInput, 'attendee@example.com');
    fireEvent.press(addButton);

    expect(getByText('attendee@example.com')).toBeTruthy();
  });

  it('removes an attendee when remove button is pressed', () => {
    const { getByText, queryByText } = render(<BookingDetails />);
    const removeButton = getByText('attendee@example.com').parentNode.querySelector('Ionicons[name="close"]');

    fireEvent.press(removeButton);

    expect(queryByText('attendee@example.com')).toBeNull();
  });

  it('submits booking and displays receipt', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Booking successful' }),
      })
    );

    const { getByText } = render(<BookingDetails />);
    fireEvent.press(getByText('Send invites'));

    await waitFor(() => {
      expect(getByText('Download PDF')).toBeTruthy();
    });
  });
});
