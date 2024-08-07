import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NotifTester from '../NotifTester';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('expo-device');
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: 'mock-project-id'
      }
    }
  }
}));

describe('NotifTester Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Device.isDevice as unknown as jest.Mock).mockReturnValue(true);
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'ExponentPushToken[mock-token]' });
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  it('renders correctly', async () => {
    const { getByText } = render(<NotifTester />);

    await waitFor(() => {
      expect(getByText('Your Expo push token: ExponentPushToken[mock-token]')).toBeTruthy();
      expect(getByText('Press to Send Notification')).toBeTruthy();
    });
  });

  it('registers for push notifications on mount', async () => {
    render(<NotifTester />);

    await waitFor(() => {
      expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
        projectId: 'mock-project-id'
      });
    });
  });

  it('handles permission not granted', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { getByText } = render(<NotifTester />);

    await waitFor(() => {
      expect(getByText('Your Expo push token: Permission not granted to get push token for push notification!')).toBeTruthy();
    });
  });

  it('handles device not being physical', async () => {
    (Device.isDevice as unknown as jest.Mock).mockReturnValue(false);

    const { getByText } = render(<NotifTester />);

    await waitFor(() => {
      expect(getByText('Your Expo push token: Must use physical device for push notifications')).toBeTruthy();
    });
  });

  it('sends push notification when button is pressed', async () => {
    const { getByText } = render(<NotifTester />);

    await waitFor(() => {
      fireEvent.press(getByText('Press to Send Notification'));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://exp.host/--/api/v2/push/send', expect.any(Object));
    });
  });

  it('displays received notification', async () => {
    const { getByText } = render(<NotifTester />);

    const mockNotification = {
      request: {
        content: {
          title: 'Test Title',
          body: 'Test Body',
          data: { testData: 'test' }
        }
      }
    };

    await waitFor(() => {
      const listener = (Notifications.addNotificationReceivedListener as jest.Mock).mock.calls[0][0];
      listener(mockNotification);
    });

    expect(getByText('Title: Test Title')).toBeTruthy();
    expect(getByText('Body: Test Body')).toBeTruthy();
    expect(getByText('Data: {"testData":"test"}')).toBeTruthy();
  });

  it('cleans up listeners on unmount', () => {
    const { unmount } = render(<NotifTester />);

    unmount();

    expect(Notifications.removeNotificationSubscription).toHaveBeenCalledTimes(2);
  });
});