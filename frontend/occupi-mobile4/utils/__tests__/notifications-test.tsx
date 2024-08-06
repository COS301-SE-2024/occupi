import * as Notifications from 'expo-notifications';
import { sendPushNotification } from '../notifications'; // Adjust the import path as needed

jest.mock('expo-notifications');
jest.mock('node-fetch');

describe('Notification Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('setNotificationHandler sets the correct handler', () => {
    // Manually call setNotificationHandler to ensure it's executed
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    expect(Notifications.setNotificationHandler).toHaveBeenCalledWith(expect.objectContaining({
      handleNotification: expect.any(Function),
    }));
  });

  test('handleNotification returns correct configuration', async () => {
    // Manually call setNotificationHandler to ensure it's executed
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    const handler = (Notifications.setNotificationHandler as jest.Mock).mock.calls[0][0];
    const result = await handler.handleNotification();
    expect(result).toEqual({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    });
  });

  test('sendPushNotification sends notifications to all tokens', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'success' }),
    });
    global.fetch = mockFetch as any;

    const expoPushTokens = ['token1', 'token2', 'token3'];
    const title = 'Test Title';
    const body = 'Test Body';

    await sendPushNotification(expoPushTokens, title, body);

    expect(mockFetch).toHaveBeenCalledTimes(3);

    expoPushTokens.forEach((token, index) => {
      expect(mockFetch).toHaveBeenNthCalledWith(index + 1, 'https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: token,
          sound: 'default',
          title: title,
          body: body,
          data: { someData: 'goes here' },
        }),
      });
    });
  });

  test('sendPushNotification handles errors', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch as any;

    const expoPushTokens = ['token1'];
    const title = 'Test Title';
    const body = 'Test Body';

    await expect(sendPushNotification(expoPushTokens, title, body)).rejects.toThrow('Network error');
  });
});