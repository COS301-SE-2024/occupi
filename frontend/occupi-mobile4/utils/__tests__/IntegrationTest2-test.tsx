import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { fetchUserDetails, fetchNotificationSettings, fetchSecuritySettings, updateSecurity, updateDetails, updateNotifications, fetchUsername } from '../user';
import { getUserDetails, getNotificationSettings, getSecuritySettings, updateSecuritySettings, updateUserDetails, updateNotificationSettings } from "../../services/apiservices";
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

jest.mock('../../services/apiservices');
jest.mock('../../services/securestore');
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe('Integration Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Module', () => {
    it('should fetch user details', async () => {
      const mockResponse = { status: 200, data: { name: 'John Doe', email: 'test@example.com' } };
      (getUserDetails as jest.Mock).mockResolvedValue(mockResponse);
      
      await fetchUserDetails('test@example.com', 'abc123');
      
      expect(getUserDetails).toHaveBeenCalledWith('test@example.com', 'abc123');
    });

    it('should fetch notification settings', async () => {
      const mockResponse = { status: 200, data: { invites: true, bookingReminder: false } };
      (getNotificationSettings as jest.Mock).mockResolvedValue(mockResponse);
      
      await fetchNotificationSettings('test@example.com');
      
      expect(getNotificationSettings).toHaveBeenCalledWith('test@example.com');
    });

    it('should fetch security settings', async () => {
      const mockResponse = { status: 200, data: { mfa: true, forceLogout: false } };
      (getSecuritySettings as jest.Mock).mockResolvedValue(mockResponse);
      
      await fetchSecuritySettings('test@example.com');
      
      expect(getSecuritySettings).toHaveBeenCalledWith('test@example.com');
    });

    it('should update security settings', async () => {
      const mockResponse = { status: 200, message: 'Settings updated successfully' };
      (updateSecuritySettings as jest.Mock).mockResolvedValue(mockResponse);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({ email: 'test@example.com' }));
      
      const message = await updateSecurity('settings', { mfa: true, forceLogout: true });
      
      expect(message).toBe('Settings updated successfully');
      expect(router.replace).toHaveBeenCalledWith('/settings');
    });

    it('should update user details', async () => {
      const mockResponse = { status: 200, message: 'Details updated successfully' };
      (updateUserDetails as jest.Mock).mockResolvedValue(mockResponse);
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key) => {
        if (key === 'Email') return Promise.resolve('test@example.com');
        if (key === 'AppState') return Promise.resolve('logged_in');
        return Promise.resolve(null);
      });
      
      const message = await updateDetails('John Doe', '1990-01-01', 'Male', '1234567890', 'He/Him');
      
      expect(message).toBe('Details updated successfully');
      expect(router.replace).toHaveBeenCalledWith('/settings');
    });

    it('should update notification settings', async () => {
      const mockResponse = { status: 200, message: 'Settings updated successfully' };
      (updateNotificationSettings as jest.Mock).mockResolvedValue(mockResponse);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({ email: 'test@example.com' }));
      
      const message = await updateNotifications({ invites: true, bookingReminder: true });
      
      expect(message).toBe('Settings updated successfully');
      expect(router.replace).toHaveBeenCalledWith('/settings');
    });

    it('should fetch the username', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({ name: 'John Doe' }));
      
      const username = await fetchUsername();
      
      expect(username).toBe('John Doe');
    });
  });
});