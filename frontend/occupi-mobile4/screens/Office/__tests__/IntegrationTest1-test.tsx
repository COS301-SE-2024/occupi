import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BookingDetails from '../BookingDetails';
import { ThemeProvider } from '@/components/ThemeContext';
import * as LocalAuthentication from 'expo-local-authentication';
import { userBookRoom } from '@/utils/bookings';
import * as SecureStore from 'expo-secure-store';
import { NavigationContainer } from '@react-navigation/native';

// Mock dependencies
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});


jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}), { virtual: true });

jest.mock('@/utils/bookings', () => ({
  userBookRoom: jest.fn(),
}));

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

describe('BookingDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    SecureStore.getItemAsync.mockResolvedValue(JSON.stringify({
      startTime: '10:00',
      endTime: '11:00',
      roomName: 'Test Room',
      roomId: 'test-room-id',
      floorNo: '1',
      minOccupancy: 2,
      maxOccupancy: 6,
    }));

    LocalAuthentication.hasHardwareAsync.mockResolvedValue(true);
    LocalAuthentication.isEnrolledAsync.mockResolvedValue(true);
    LocalAuthentication.supportedAuthenticationTypesAsync.mockResolvedValue([1]);
    LocalAuthentication.authenticateAsync.mockResolvedValue({ success: true });

    userBookRoom.mockResolvedValue('Successfully booked!');
  });

  const renderComponent = () => {
    return render(
      <NavigationContainer>
        <ThemeProvider>
          <BookingDetails />
        </ThemeProvider>
      </NavigationContainer>
    );
  };

  it('should render the component correctly', async () => {
    const { getByText } = renderComponent();
    await waitFor(() => expect(getByText('Booking details')).toBeTruthy());
  });

  it('should handle biometric authentication successfully', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => expect(getByText('Confirm booking')).toBeTruthy());
    await fireEvent.press(getByText('Confirm booking'));

    await waitFor(() => expect(getByText('Invite attendees')).toBeTruthy());
  });

  it('should handle booking successfully', async () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    await waitFor(() => expect(getByText('Confirm booking')).toBeTruthy());
    await fireEvent.press(getByText('Confirm booking'));

    await waitFor(() => expect(getByText('Invite attendees')).toBeTruthy());

    const input = getByPlaceholderText("Enter attendee's email or employee id");
    await fireEvent.changeText(input, 'test@example.com');
    
    await fireEvent.press(getByText('Send invites'));

    await waitFor(() => expect(getByText('Successfully booked!')).toBeTruthy());
  });
});