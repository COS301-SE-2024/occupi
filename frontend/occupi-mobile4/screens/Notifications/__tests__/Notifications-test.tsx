import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import Notifications from '../Notifications';
import { ThemeProvider } from '@/components/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import { getUserNotifications } from '@/utils/notifications';

jest.mock('expo-secure-store');
jest.mock('@/utils/notifications');

describe('Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    expect(screen.getByText('Notifications')).toBeTruthy();
    expect(screen.getByTestId('notification-list')).toBeTruthy();
  });

  it('fetches and displays the user notifications correctly', async () => {
    const mockNotifications = [
      {
        title: 'Booking Invitation',
        message: 'You have been invited to a meeting',
        send_time: '2023-08-21T09:00:00Z',
      },
      {
        title: 'Occupancy Update',
        message: 'Occupancy level is low',
        send_time: '2023-08-20T15:30:00Z',
      },
      {
        title: 'Room Availability',
        message: 'A new room is available for booking',
        send_time: '2023-08-19T11:45:00Z',
      },
    ];
    getUserNotifications.mockResolvedValueOnce(mockNotifications);
    SecureStore.getItemAsync.mockResolvedValueOnce('greenyellow');

    render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    await waitFor(() => expect(screen.getAllByTestId('notification-item')).toHaveLength(3));
    expect(screen.getByText('You have been invited to a meeting')).toBeTruthy();
    expect(screen.getByText('Occupancy level is low')).toBeTruthy();
    expect(screen.getByText('A new room is available for booking')).toBeTruthy();
  });

  it('formats the notification date correctly', async () => {
    getUserNotifications.mockResolvedValueOnce([
      {
        title: 'Booking Invitation',
        message: 'You have been invited to a meeting',
        send_time: '2023-08-21T09:00:00Z',
      },
      {
        title: 'Occupancy Update',
        message: 'Occupancy level is low',
        send_time: '2023-08-20T15:30:00Z',
      },
      {
        title: 'Room Availability',
        message: 'A new room is available for booking',
        send_time: '2023-08-19T11:45:00Z',
      },
    ]);
    SecureStore.getItemAsync.mockResolvedValueOnce('greenyellow');

    render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    await waitFor(() => expect(screen.getByText('less than an hour ago')).toBeTruthy());
    expect(screen.getByText('yesterday')).toBeTruthy();
    expect(screen.getByText('Aug 19, 2023')).toBeTruthy();
  });
});