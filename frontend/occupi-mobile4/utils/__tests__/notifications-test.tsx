import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { getNotifications } from '@/services/apiservices';
import {
  retrievePushToken,
  sendPushNotification,
  getUserNotifications
} from '../notifications';

jest.mock('expo-device', () => ({
  isDevice: jest.fn(),
}));

jest.mock('expo-secure-store');
jest.mock('@/services/apiservices');

global.alert = jest.fn();
describe('Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Device.isDevice as jest.Mock).mockReset();
    (Notifications.getPermissionsAsync as jest.Mock).mockReset();
    (Notifications.requestPermissionsAsync as jest.Mock).mockReset();
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockReset();
    (Notifications.setNotificationChannelAsync as jest.Mock).mockReset();
    (SecureStore.getItemAsync as jest.Mock).mockReset();
    console.log = jest.fn();
    console.error = jest.fn();
    global.fetch = jest.fn();
    global.alert = jest.fn();
  });

  
  describe('retrievePushToken', () => {
    it('should retrieve push token successfully', async () => {
      const mockToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      (Device.isDevice as jest.Mock).mockReturnValue(true);
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: mockToken });

      const result = await retrievePushToken();

      expect(result).toBe(mockToken);
    });

    it('should handle Android platform', async () => {
      const originalOS = Platform.OS;
      Platform.OS = 'android';
      const mockToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      (Device.isDevice as jest.Mock).mockReturnValue(true);
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: mockToken });
    
      await retrievePushToken();
    
      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', expect.any(Object));
      Platform.OS = originalOS;
    });

    it('should request permissions if not granted', async () => {
      const mockToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      (Device.isDevice as jest.Mock).mockReturnValue(true);
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: mockToken });
    
      const result = await retrievePushToken();
    
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(result).toBe(mockToken);
    });

    it('should alert if permissions are not granted', async () => {
      (Device.isDevice as jest.Mock).mockReturnValue(true);
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    
      await retrievePushToken();
    
      expect(global.alert).toHaveBeenCalledWith('Failed to get push token for push notification!');
    });

    it('should handle error when getting push token', async () => {
      (Device.isDevice as jest.Mock).mockReturnValue(true);
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValue(new Error('Token error'));
    
      const result = await retrievePushToken();
    
      expect(result).toBe('Error: Token error');
    });

    describe('retrievePushToken', () => {
      it('should alert if not on a physical device', async () => {
        // Mock Device.isDevice to return false
        (Device.isDevice as jest.Mock).mockReturnValue(false);
    
        // Call the function
        const result = await retrievePushToken();
    
        // Check if alert was called
        expect(global.alert).toHaveBeenCalledWith('Must use physical device for Push Notifications');
        expect(result).toBeUndefined();
    
        // Ensure permissions were not checked
        expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
        expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
      });
    });
    
    
    
  });

  describe('sendPushNotification', () => {
    it('should send push notifications to all tokens', async () => {
      const mockTokens = ['token1', 'token2'];
      const mockTitle = 'Test Title';
      const mockBody = 'Test Body';
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await sendPushNotification(mockTokens, mockTitle, mockBody);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: expect.any(String),
        })
      );
    });
  });

  describe('getUserNotifications', () => {
    it('should get user notifications successfully', async () => {
      const mockEmail = 'test@example.com';
      const mockNotifications = [{ id: 1, message: 'Test notification' }];
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockEmail);
      (getNotifications as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockNotifications,
      });

      const result = await getUserNotifications();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('Email');
      expect(getNotifications).toHaveBeenCalledWith({
        filter: { emails: [mockEmail] },
      });
      expect(result).toEqual(mockNotifications);
    });

    it('should handle non-200 response', async () => {
      const mockEmail = 'test@example.com';
      const mockResponse = { status: 400, data: 'Error' };
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockEmail);
      (getNotifications as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getUserNotifications();

      expect(console.log).toHaveBeenCalledWith(mockResponse);
      expect(result).toBe('Error');
    });

    it('should handle errors', async () => {
      const mockError = new Error('API Error');
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test@example.com');
      (getNotifications as jest.Mock).mockRejectedValue(mockError);

      await getUserNotifications();

      expect(console.error).toHaveBeenCalledWith('Error:', mockError);
    });
  });
});