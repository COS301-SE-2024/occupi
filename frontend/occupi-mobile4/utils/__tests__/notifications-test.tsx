import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { getNotifications } from '@/services/apiservices';
import {
  retrievePushToken,
  sendPushNotification,
  getUserNotifications,
  registerForPushNotificationsAsync,
  setupNotificationHandler
} from '../notifications';

jest.mock('expo-device', () => ({
  isDevice: jest.fn().mockReturnValue(true),
}));

// jest.mock('expo-notifications', () => ({
//   getPermissionsAsync: jest.fn(),
//   requestPermissionsAsync: jest.fn(),
//   getExpoPushTokenAsync: jest.fn(),
//   setNotificationChannelAsync: jest.fn(),
//   setNotificationHandler: jest.fn(),
//   AndroidImportance: {
//     MAX: 5,
//   },
// }));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'undetermined' })
  ),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getExpoPushTokenAsync: jest.fn(() =>
    Promise.resolve({ data: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' })
  ),
  setNotificationChannelAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  AndroidImportance: {
    MAX: 5,
  },
}));




jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: 'testProjectId',
      },
    },
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: {
    ExpoSecureStore: {
      getValueWithKeyAsync: jest.fn(),
      setValueWithKeyAsync: jest.fn(),
      deleteValueWithKeyAsync: jest.fn(),
    },
  },
}));

jest.mock('@/services/apiservices', () => ({
  getNotifications: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));
jest.mock('expo-notifications');
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: 'testProjectId',
      },
    },
  },
}));

global.alert = jest.fn();

jest.mock('expo-device');
jest.mock('expo-notifications');
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: 'mockProjectId'
      }
    }
  }
}));
jest.mock('expo-secure-store');
jest.mock('@/services/apiservices');
jest.mock('expo-device', () => ({
  isDevice: jest.fn(),
}));

global.alert = jest.fn();
global.fetch = jest.fn();

describe('Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('setupNotificationHandler', () => {
    it('should set up the notification handler correctly', () => {
      setupNotificationHandler();
      expect(Notifications.setNotificationHandler).toHaveBeenCalledWith({
        handleNotification: expect.any(Function),
      });
    });
  });

  describe('retrievePushToken', () => {
    // it('should alert if not on a physical device in registerForPushNotificationsAsync', async () => {
    //   // Ensure Device.isDevice returns false to simulate not running on a physical device
    //   (Device.isDevice as jest.Mock).mockReturnValue(false);
    
    //   const alertMock = jest.spyOn(global, 'alert').mockImplementation(() => {});
    
    //   // Call the function that should trigger the alert
    //   await retrievePushToken();
    
    //   // Assert that the alert was called with the correct message
    //   expect(alertMock).toHaveBeenCalledWith('Must use physical device for Push Notifications');
    
    //   alertMock.mockRestore(); // Restore the original alert implementation
    // });
    

    it('should set notification handler', () => {
      setupNotificationHandler();
      expect(Notifications.setNotificationHandler).toHaveBeenCalledWith({
        handleNotification: expect.any(Function),
      });
    });

    it('should retrieve push token successfully', async () => {
      const mockToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      (Device.isDevice as jest.Mock).mockReturnValue(true);
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: mockToken });

      const result = await retrievePushToken();
      expect(result).toBe(mockToken);
    });

    it('should set up Android notification channel', async () => {
      const originalPlatform = Platform.OS;
      Platform.OS = 'android';
      (Device.isDevice as jest.Mock).mockReturnValue(true);
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'mock-token' });

      await retrievePushToken();

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', expect.objectContaining({
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      }));

      Platform.OS = originalPlatform;
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

    it('should handle missing projectId gracefully', async () => {
      (Device.isDevice as jest.Mock).mockReturnValue(true);
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      jest.resetModules();
      jest.doMock('expo-constants', () => ({}));
      const { retrievePushToken: retrievePushTokenNoProjectId } = require('../notifications');

      const result = await retrievePushTokenNoProjectId();
      expect(result).toBe('Error: Project ID not found');
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
        operator: "eq"
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
      expect(getNotifications).toHaveBeenCalledWith({
        filter: { emails: [mockEmail] },
        operator: "eq"
      });
    });

    it('should handle null email', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (getNotifications as jest.Mock).mockResolvedValue({
        status: 200,
        data: [],
      });

      const result = await getUserNotifications();

      expect(getNotifications).toHaveBeenCalledWith({
        filter: { emails: [null] },
        operator: "eq"
      });
      expect(result).toEqual([]);
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
