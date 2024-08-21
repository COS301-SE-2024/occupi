import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import Dashboard from '../Dashboard';
import { ThemeProvider } from '@/components/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { fetchUsername, fetchUserBookings } from '@/utils/user';
import { getFormattedPredictionData, getFormattedDailyPredictionData } from '@/utils/occupancy';
import { storeCheckInValue } from '@/services/securestore';

jest.mock('expo-secure-store');
jest.mock('expo-location');
jest.mock('@/utils/user');
jest.mock('@/utils/occupancy');
jest.mock('@/services/securestore');

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    );

    expect(screen.getByText('Hi Guest 👋')).toBeTruthy();
    expect(screen.getByText('Welcome back to Occupi')).toBeTruthy();
    expect(screen.getByText('Next booking:')).toBeTruthy();
    expect(screen.getByText('Capacity')).toBeTruthy();
    expect(screen.getByText('Predicted:')).toBeTruthy();
    expect(screen.getByText('Weekly')).toBeTruthy();
    expect(screen.getByText('Hourly')).toBeTruthy();
    expect(screen.getByText('Check in')).toBeTruthy();
  });

  it('fetches and displays the username correctly', async () => {
    fetchUsername.mockResolvedValueOnce('John Doe');

    render(
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    );

    await waitFor(() => expect(screen.getByText('Hi John Doe 👋')).toBeTruthy());
  });

  it('fetches and displays the user bookings correctly', async () => {
    const mockBooking = {
      roomName: 'Meeting Room 1',
      date: '2023-08-21',
      start: '09:00',
      end: '10:00',
      checkedIn: false,
      creator: 'John Doe',
      emails: ['john@example.com'],
      floorNo: '2',
    };
    fetchUserBookings.mockResolvedValueOnce([mockBooking]);

    render(
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    );

    await waitFor(() => expect(screen.getByText('Meeting Room 1')).toBeTruthy());
    expect(screen.getByText('21 Aug 2023')).toBeTruthy();
    expect(screen.getByText('09:00-10:00')).toBeTruthy();
  });

  it('fetches and displays the weekly prediction data correctly', async () => {
    const mockPredictionData = [
      { label: 'Mon', value: 80 },
      { label: 'Tue', value: 90 },
      { label: 'Wed', value: 85 },
      { label: 'Thu', value: 92 },
      { label: 'Fri', value: 75 },
      { label: 'Sat', value: 60 },
      { label: 'Sun', value: 50 },
    ];
    getFormattedPredictionData.mockResolvedValueOnce(mockPredictionData);

    render(
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    );

    await waitFor(() => expect(screen.getByText('Weekly')).toBeTruthy());
  });

  it('fetches and displays the daily prediction data correctly', async () => {
    const mockDayPredictionData = {
      class: 'low',
      attendance: 50,
    };
    getFormattedDailyPredictionData.mockResolvedValueOnce(mockDayPredictionData);

    render(
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    );

    await waitFor(() => expect(screen.getByText('Level: low')).toBeTruthy());
    expect(screen.getByText('50 people')).toBeTruthy();
  });

  it('handles check-in and check-out correctly', async () => {
    SecureStore.getItemAsync.mockResolvedValueOnce('false');
    SecureStore.getItemAsync.mockResolvedValueOnce('greenyellow');
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValueOnce({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    });
    storeCheckInValue.mockResolvedValueOnce(true);

    render(
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    );

    await waitFor(() => expect(screen.getByText('Check in')).toBeTruthy());
    fireEvent.press(screen.getByText('Check in'));

    await waitFor(() => expect(screen.getByText('Check out')).toBeTruthy());

    fireEvent.press(screen.getByText('Check out'));
    await waitFor(() => expect(screen.getByText('Check in')).toBeTruthy());
  });
});