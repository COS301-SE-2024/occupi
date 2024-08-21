import * as user from '../user';
import * as apiServices from '../../services/apiservices';
import * as secureStore from '../../services/securestore';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

jest.mock('../../services/apiservices');
jest.mock('../../services/securestore');
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('expo-secure-store');

describe('user utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('fetchUserDetails', () => {
    it('should fetch and store user details on successful response', async () => {
      const mockResponse = { status: 200, data: { name: 'John Doe' } };
      (apiServices.getUserDetails as jest.Mock).mockResolvedValue(mockResponse);

      await user.fetchUserDetails('test@example.com', 'token');

      expect(apiServices.getUserDetails).toHaveBeenCalledWith('test@example.com', 'token');
      expect(secureStore.storeUserData).toHaveBeenCalledWith(JSON.stringify(mockResponse.data));
    });

    it('should log error on failed response', async () => {
      const mockResponse = { status: 400, message: 'Bad Request' };
      (apiServices.getUserDetails as jest.Mock).mockResolvedValue(mockResponse);

      await user.fetchUserDetails('test@example.com', 'token');

      expect(console.log).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle and log errors', async () => {
      (apiServices.getUserDetails as jest.Mock).mockRejectedValue(new Error('Network error'));

      await user.fetchUserDetails('test@example.com', 'token');

      expect(console.error).toHaveBeenCalledWith('Error:', expect.any(Error));
    });
  });

  describe('fetchNotificationSettings', () => {
    it('should fetch and store notification settings on successful response', async () => {
      const mockResponse = { status: 200, data: { invites: true, bookingReminder: false } };
      (apiServices.getNotificationSettings as jest.Mock).mockResolvedValue(mockResponse);

      await user.fetchNotificationSettings('test@example.com');

      expect(apiServices.getNotificationSettings).toHaveBeenCalledWith('test@example.com');
      expect(secureStore.storeNotificationSettings).toHaveBeenCalledWith(JSON.stringify({
        invites: true,
        bookingReminder: false
      }));
    });

    it('should log error on failed response', async () => {
      const mockResponse = { status: 400, message: 'Bad Request' };
      (apiServices.getNotificationSettings as jest.Mock).mockResolvedValue(mockResponse);

      await user.fetchNotificationSettings('test@example.com');

      expect(console.log).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle and log errors', async () => {
      (apiServices.getNotificationSettings as jest.Mock).mockRejectedValue(new Error('Network error'));

      await user.fetchNotificationSettings('test@example.com');

      expect(console.error).toHaveBeenCalledWith('Error:', expect.any(Error));
    });
  });

  describe('fetchSecuritySettings', () => {
    it('should fetch and store security settings on successful response', async () => {
      const mockResponse = { status: 200, data: { mfa: true, forceLogout: false } };
      (apiServices.getSecuritySettings as jest.Mock).mockResolvedValue(mockResponse);

      await user.fetchSecuritySettings('test@example.com');

      expect(apiServices.getSecuritySettings).toHaveBeenCalledWith('test@example.com');
      expect(secureStore.storeSecuritySettings).toHaveBeenCalledWith(JSON.stringify({
        mfa: true,
        forcelogout: false
      }));
    });

    it('should log error on failed response', async () => {
      const mockResponse = { status: 400, message: 'Bad Request' };
      (apiServices.getSecuritySettings as jest.Mock).mockResolvedValue(mockResponse);

      await user.fetchSecuritySettings('test@example.com');

      expect(console.log).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle and log errors', async () => {
      (apiServices.getSecuritySettings as jest.Mock).mockRejectedValue(new Error('Network error'));

      await user.fetchSecuritySettings('test@example.com');

      expect(console.error).toHaveBeenCalledWith('Error:', expect.any(Error));
    });
  });

  describe('updateSecurity', () => {
    beforeEach(() => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({ email: 'test@example.com' }));
    });

    it('should update security settings', async () => {
      const mockResponse = { status: 200 };
      (apiServices.updateSecuritySettings as jest.Mock).mockResolvedValue(mockResponse);

      const result = await user.updateSecurity('settings', { mfa: true, forceLogout: false });

      expect(apiServices.updateSecuritySettings).toHaveBeenCalledWith({
        email: 'test@example.com',
        mfa: true,
        forceLogout: false
      });
      expect(secureStore.storeSecuritySettings).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith('/settings');
      expect(result).toBe('Settings updated successfully');
      expect(console.log).toHaveBeenCalledWith('settings response', mockResponse);
      expect(console.log).toHaveBeenCalledWith({ mfa: true, forceLogout: false });
    });

    it('should handle non-200 status responses for security settings', async () => {
      const mockResponse = { status: 400, message: 'Bad Request' };
      (apiServices.updateSecuritySettings as jest.Mock).mockResolvedValue(mockResponse);

      const result = await user.updateSecurity('settings', { mfa: true, forceLogout: false });

      expect(result).toBe('Bad Request');
    });

    it('should update password', async () => {
      const mockResponse = { status: 200 };
      (apiServices.updateSecuritySettings as jest.Mock).mockResolvedValue(mockResponse);

      const result = await user.updateSecurity('password', {
        currentPassword: 'old',
        newPassword: 'new',
        newPasswordConfirm: 'new'
      });

      expect(apiServices.updateSecuritySettings).toHaveBeenCalledWith({
        email: 'test@example.com',
        currentPassword: 'old',
        newPassword: 'new',
        newPasswordConfirm: 'new'
      });
      expect(router.replace).toHaveBeenCalledWith('/set-security');
      expect(result).toBe('Successfully changed password');
    });

    it('should handle non-200 status responses for password update', async () => {
      const mockResponse = { status: 400, message: 'Invalid password' };
      (apiServices.updateSecuritySettings as jest.Mock).mockResolvedValue(mockResponse);

      const result = await user.updateSecurity('password', {
        currentPassword: 'old',
        newPassword: 'new',
        newPasswordConfirm: 'new'
      });

      expect(result).toBe('Invalid password');
    });

    it('should handle and log errors when updating security settings', async () => {
      (apiServices.updateSecuritySettings as jest.Mock).mockRejectedValue(new Error('Network error'));

      await user.updateSecurity('settings', { mfa: true, forceLogout: false });

      expect(console.error).toHaveBeenCalledWith('Error:', expect.any(Error));
    });

    it('should handle and log errors when updating password', async () => {
      (apiServices.updateSecuritySettings as jest.Mock).mockRejectedValue(new Error('Network error'));

      await user.updateSecurity('password', {
        currentPassword: 'old',
        newPassword: 'new',
        newPasswordConfirm: 'new'
      });

      expect(console.error).toHaveBeenCalledWith('Error:', expect.any(Error));
    });
  });

  describe('updateDetails', () => {
    beforeEach(() => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('test@example.com')
        .mockResolvedValueOnce('verify_otp_register');
    });

    it('should update user details', async () => {
      const mockResponse = { status: 200 };
      (apiServices.updateUserDetails as jest.Mock).mockResolvedValue(mockResponse);

      const result = await user.updateDetails('John Doe', '1990-01-01', 'Male', '1234567890', 'He/Him');

      expect(apiServices.updateUserDetails).toHaveBeenCalledWith({
        session_email: 'test@example.com',
        name: 'John Doe',
        dob: '1990-01-01T00:00:00.000Z',
        gender: 'Male',
        number: '1234567890',
        pronouns: 'He/Him'
      });
      expect(secureStore.setState).toHaveBeenCalledWith('logged_out');
      expect(router.replace).toHaveBeenCalledWith('/home');
      expect(result).toBe('Details updated successfully');
      expect(console.log).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle non-200 status responses', async () => {
      const mockResponse = { status: 400, message: 'Invalid details' };
      (apiServices.updateUserDetails as jest.Mock).mockResolvedValue(mockResponse);

      const result = await user.updateDetails('John Doe', '1990-01-01', 'Male', '1234567890', 'He/Him');

      expect(result).toBe('Invalid details');
    });

    it('should handle and log errors when updating details', async () => {
      (apiServices.updateUserDetails as jest.Mock).mockRejectedValue(new Error('Network error'));

      await user.updateDetails('John Doe', '1990-01-01', 'Male', '1234567890', 'He/Him');

      expect(console.error).toHaveBeenCalledWith('Error:', expect.any(Error));
    });
  });

  describe('updateNotifications', () => {
    beforeEach(() => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({ email: 'test@example.com' }));
    });

    it('should update notification settings', async () => {
      const mockResponse = { status: 200 };
      (apiServices.updateNotificationSettings as jest.Mock).mockResolvedValue(mockResponse);

      const result = await user.updateNotifications({ invites: true, bookingReminder: false });

      expect(apiServices.updateNotificationSettings).toHaveBeenCalledWith({
        email: 'test@example.com',
        invites: true,
        bookingReminder: false
      });
      expect(secureStore.storeNotificationSettings).toHaveBeenCalledWith(JSON.stringify({
        invites: true,
        bookingReminder: false
      }));
      expect(router.replace).toHaveBeenCalledWith('/settings');
      expect(result).toBe('Settings updated successfully');
      expect(console.log).toHaveBeenCalledWith('settings response', mockResponse);
      expect(console.log).toHaveBeenCalledWith({ invites: true, bookingReminder: false });
    });

    it('should handle non-200 status responses', async () => {
      const mockResponse = { status: 400, message: 'Invalid settings' };
      (apiServices.updateNotificationSettings as jest.Mock).mockResolvedValue(mockResponse);

      const result = await user.updateNotifications({ invites: true, bookingReminder: false });

      expect(console.log).toHaveBeenCalledWith(mockResponse);
      expect(result).toBe('Invalid settings');
    });

    it('should handle and log errors when updating notification settings', async () => {
      (apiServices.updateNotificationSettings as jest.Mock).mockRejectedValue(new Error('Network error'));

      await user.updateNotifications({ invites: true, bookingReminder: false });

      expect(console.error).toHaveBeenCalledWith('Error:', expect.any(Error));
    });
  });

  describe('fetchUsername', () => {
    it('should return the username from stored user data', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({ name: 'John Doe' }));

      const result = await user.fetchUsername();

      expect(result).toBe('John Doe');
    });

    it('should return undefined if no user data is stored', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await user.fetchUsername();

      expect(result).toBeUndefined();
    });
  });
});