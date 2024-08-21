import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BookingDetails from '../BookingDetails';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { userBookRoom } from '@/utils/bookings';

jest.mock('expo-local-authentication');
jest.mock('expo-secure-store');
jest.mock('@/utils/bookings');

describe('BookingDetails component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component correctly', () => {
    const { getByText, getByTestId } = render(<BookingDetails />);
    expect(getByText('Set Account Details')).toBeTruthy();
    expect(getByText('Full name')).toBeTruthy();
    expect(getByText('Date of birth')).toBeTruthy();
    expect(getByText('Gender')).toBeTruthy();
    expect(getByText('Cell No')).toBeTruthy();
    expect(getByText('Pronouns (optional)')).toBeTruthy();
    expect(getByText('Confirm')).toBeTruthy();
  });

  it('updates the name state correctly', () => {
    const { getByPlaceholderText } = render(<BookingDetails />);
    const nameInput = getByPlaceholderText('Full name');
    fireEvent.changeText(nameInput, 'John Doe');
    expect(nameInput.props.value).toBe('John Doe');
  });

  it('updates the phone number state correctly', () => {
    const { getByPlaceholderText } = render(<BookingDetails />);
    const phoneInput = getByPlaceholderText('Cell No');
    fireEvent.changeText(phoneInput, '1234567890');
    expect(phoneInput.props.value).toBe('1234567890');
  });

  it('updates the pronouns state correctly', () => {
    const { getByPlaceholderText } = render(<BookingDetails />);
    const pronounsInput = getByPlaceholderText('Pronouns (optional)');
    fireEvent.changeText(pronounsInput, 'they/them');
    expect(pronounsInput.props.value).toBe('they/them');
  });

  it('updates the gender state correctly', () => {
    const { getByLabelText } = render(<BookingDetails />);
    const maleRadio = getByLabelText('Male');
    const femaleRadio = getByLabelText('Female');
    const otherRadio = getByLabelText('Other');

    fireEvent.press(maleRadio);
    expect(maleRadio.props.value).toBe('Male');

    fireEvent.press(femaleRadio);
    expect(femaleRadio.props.value).toBe('Female');

    fireEvent.press(otherRadio);
    expect(otherRadio.props.value).toBe('Other');
  });

  it('calls the biometric authentication correctly', async () => {
    const hasHardwareAsync = jest.spyOn(LocalAuthentication, 'hasHardwareAsync').mockResolvedValue(true);
    const isEnrolledAsync = jest.spyOn(LocalAuthentication, 'isEnrolledAsync').mockResolvedValue(true);
    const authenticateAsync = jest.spyOn(LocalAuthentication, 'authenticateAsync').mockResolvedValue({ success: true });

    const { getByText } = render(<BookingDetails />);
    const confirmButton = getByText('Confirm booking');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(hasHardwareAsync).toHaveBeenCalled();
      expect(isEnrolledAsync).toHaveBeenCalled();
      expect(authenticateAsync).toHaveBeenCalled();
    });
  });

  it('calls the userBookRoom function correctly', async () => {
    const mockResponse = 'Successfully booked!';
    (userBookRoom as jest.Mock).mockResolvedValue(mockResponse);

    const { getByText } = render(<BookingDetails />);
    const sendInvitesButton = getByText('Send invites');
    fireEvent.press(sendInvitesButton);

    await waitFor(() => {
      expect(userBookRoom).toHaveBeenCalledWith([''], '00:00', '00:00');
    });
  });

  it('saves the booking information correctly', async () => {
    const mockBookingInfo = {
      date: '2023-08-21',
      startTime: '08:00',
      endTime: '10:00',
      roomName: 'Test Room',
      roomId: '1',
      floorNo: '1',
      minOccupancy: 2,
      maxOccupancy: 10
    };

    jest.spyOn(SecureStore, 'setItemAsync').mockResolvedValue();

    const { getByText } = render(<BookingDetails />);
    const confirmButton = getByText('Confirm booking');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('BookingInfo', JSON.stringify(mockBookingInfo));
    });
  });
});