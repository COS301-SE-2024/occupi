// user.test.ts

import * as user from '../user';
import * as apiServices from '../../services/apiservices';
import * as secureStore from '../../services/securestore';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Mock the dependencies
jest.mock('../../services/apiservices');
jest.mock('../../services/securestore');
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('expo-secure-store');

describe('user utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      console.log = jest.fn();

      await user.fetchUserDetails('test@example.com', 'token');

      expect(console.log).toHaveBeenCalledWith(mockResponse);
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
      expect(router.replace).toHaveBeenCalledWith('login');
      expect(result).toBe('Details updated successfully');
    });
  });

  describe('fetchUsername', () => {
    it('should return the username from stored user data', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({ name: 'John Doe' }));

      const result = await user.fetchUsername();

      expect(result).toBe('John Doe');
    });
  });
});