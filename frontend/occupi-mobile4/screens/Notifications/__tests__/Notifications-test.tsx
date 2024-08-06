import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Notifications from '../Notifications';
import { getUserNotifications } from '@/utils/notifications';
import * as SecureStore from 'expo-secure-store';
import { ThemeProvider } from '@/components/ThemeContext';

// Mock the dependencies
jest.mock('@/utils/notifications');
jest.mock('expo-secure-store');
jest.mock('@gluestack-ui/themed', () => ({
  ...jest.requireActual('@gluestack-ui/themed'),
  useToast: jest.fn(),
}));
jest.mock('@/components/NavBar', () => 'Navbar');
jest.mock('@expo/vector-icons', () => ({
  AntDesign: 'AntDesign',
  Entypo: 'Entypo',
  FontAwesome6: 'FontAwesome6',
}));
jest.mock('moti/skeleton', () => ({
  Skeleton: 'Skeleton'
}));

describe('Notifications Component', () => {
  const mockNotifications = [
    { title: 'Booking Invitation', message: 'You have a new booking invitation', send_time: new Date().toISOString() },
    { title: 'Reminder', message: 'Meeting in 1 hour', send_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { title: 'Update', message: 'System update completed', send_time: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getUserNotifications as jest.Mock).mockResolvedValue(mockNotifications);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('greenyellow');
  });

  it('renders loading state initially', async () => {
    const { getAllByTestId } = render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );
    await waitFor(() => {
      expect(getAllByTestId('skeleton').length).toBe(8);
    });
  });

  it('renders notifications after loading', async () => {
    const { getByText, queryAllByTestId } = render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(queryAllByTestId('skeleton').length).toBe(0);
      expect(getByText('You have a new booking invitation')).toBeTruthy();
      expect(getByText('Meeting in 1 hour')).toBeTruthy();
      expect(getByText('System update completed')).toBeTruthy();
    });
  });

  it('categorizes notifications correctly', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Recent')).toBeTruthy();
      expect(getByText('Yesterday')).toBeTruthy();
      expect(getByText('Older')).toBeTruthy();
    });
  });

  it('applies the accent color from SecureStore', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    await waitFor(() => {
      const accentColorView = getByTestId('accent-color-view');
      expect(accentColorView.props.style.backgroundColor).toBe('greenyellow');
    });
  });

  it('handles error when fetching notifications', async () => {
    (getUserNotifications as jest.Mock).mockRejectedValue(new Error('Failed to fetch notifications'));
    
    const { getByText } = render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Failed to load notifications')).toBeTruthy();
    });
  });
});