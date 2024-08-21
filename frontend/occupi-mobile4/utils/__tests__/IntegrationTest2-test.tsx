import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { fetchUserDetails, fetchNotificationSettings, fetchSecuritySettings, updateSecurity, updateDetails, updateNotifications, fetchUsername } from '../user';
import { getAccentColour, getTheme, extractDateFromTimestamp } from '../utils';

describe('Integration Test Suite', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('User Module', () => {
    it('should fetch user details', async () => {
      mock.onGet('/user-details').reply(200, { name: 'John Doe', email: 'test@example.com' });
      await fetchUserDetails('test@example.com', 'abc123');
      const userData = await SecureStore.getItemAsync('UserData');
      expect(JSON.parse(userData)).toEqual({ name: 'John Doe', email: 'test@example.com' });
    });

    it('should fetch notification settings', async () => {
      mock.onGet('/notification-settings').reply(200, { invites: true, bookingReminder: false });
      await fetchNotificationSettings('test@example.com');
      const notificationSettings = await SecureStore.getItemAsync('NotificationSettings');
      expect(JSON.parse(notificationSettings)).toEqual({ invites: true, bookingReminder: false });
    });

    it('should fetch security settings', async () => {
      mock.onGet('/security-settings').reply(200, { mfa: true, forceLogout: false });
      await fetchSecuritySettings('test@example.com');
      const securitySettings = await SecureStore.getItemAsync('SecuritySettings');
      expect(JSON.parse(securitySettings)).toEqual({ mfa: true, forceLogout: false });
    });

    it('should update security settings', async () => {
      mock.onPut('/security-settings').reply(200, { message: 'Settings updated successfully' });
      const message = await updateSecurity('settings', { mfa: true, forceLogout: true });
      expect(message).toBe('Settings updated successfully');
    });

    it('should update user details', async () => {
      mock.onPut('/user-details').reply(200, { message: 'Details updated successfully' });
      const message = await updateDetails('John Doe', '1990-01-01', 'Male', '1234567890', 'He/Him');
      expect(message).toBe('Details updated successfully');
    });

    it('should update notification settings', async () => {
      mock.onPut('/notification-settings').reply(200, { message: 'Settings updated successfully' });
      const message = await updateNotifications({ invites: true, bookingReminder: true });
      expect(message).toBe('Settings updated successfully');
    });

    it('should fetch the username', async () => {
      await SecureStore.setItemAsync('UserData', JSON.stringify({ name: 'John Doe' }));
      const username = await fetchUsername();
      expect(username).toBe('John Doe');
    });
  });

  describe('Utils Module', () => {
    it('should get the accent color', async () => {
      await SecureStore.setItemAsync('accentColour', 'blue');
      const accentColor = await getAccentColour();
      expect(accentColor).toBe('blue');
    });

    it('should get the theme', async () => {
      await SecureStore.setItemAsync('Theme', 'light');
      const theme = await getTheme();
      expect(theme).toBe('light');
    });

    it('should extract the date from a timestamp', () => {
      const timestamp = '2023-05-01T12:00:00.000Z';
      const date = extractDateFromTimestamp(timestamp);
      expect(date).toBe('2023-05-02');
    });
  });
});