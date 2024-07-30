import { UserLogin, UserLogout } from '../auth';
import { login, logout } from "../../services/authservices";
import { fetchNotificationSettings, fetchSecuritySettings, fetchUserDetails } from "../user";
import { router } from 'expo-router';
import { storeUserEmail, storeToken, setState, deleteToken, deleteUserData, deleteUserEmail, deleteNotificationSettings, deleteSecuritySettings } from "../../services/securestore";

// Mock dependencies
jest.mock('../../services/authservices');
jest.mock('../user');
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));
jest.mock('../../services/securestore');

describe('auth.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UserLogin', () => {
    it('should login successfully and set up user data', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = 'password123';
      const mockToken = 'mock-token';

      (login as jest.Mock).mockResolvedValue({
        status: 200,
        data: { token: mockToken },
        message: 'Login successful'
      });

      const result = await UserLogin(mockEmail, mockPassword);

      expect(storeUserEmail).toHaveBeenCalledWith(mockEmail);
      expect(login).toHaveBeenCalledWith({ email: mockEmail, password: mockPassword });
      expect(setState).toHaveBeenCalledWith('logged_in');
      expect(storeToken).toHaveBeenCalledWith(mockToken);
      expect(fetchUserDetails).toHaveBeenCalledWith(mockEmail, mockToken);
      expect(fetchNotificationSettings).toHaveBeenCalledWith(mockEmail);
      expect(fetchSecuritySettings).toHaveBeenCalledWith(mockEmail);
      expect(router.replace).toHaveBeenCalledWith('/home');
      expect(result).toBe('Login successful');
    });

    it('should handle login failure', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = 'wrong-password';

      (login as jest.Mock).mockResolvedValue({
        status: 401,
        message: 'Invalid credentials'
      });

      const result = await UserLogin(mockEmail, mockPassword);

      expect(storeUserEmail).toHaveBeenCalledWith(mockEmail);
      expect(login).toHaveBeenCalledWith({ email: mockEmail, password: mockPassword });
      expect(setState).not.toHaveBeenCalled();
      expect(storeToken).not.toHaveBeenCalled();
      expect(fetchUserDetails).not.toHaveBeenCalled();
      expect(fetchNotificationSettings).not.toHaveBeenCalled();
      expect(fetchSecuritySettings).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
      expect(result).toBe('Invalid credentials');
    });

    it('should handle errors during login', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = 'password123';

      (login as jest.Mock).mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await UserLogin(mockEmail, mockPassword);

      expect(consoleSpy).toHaveBeenCalledWith('Error:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('UserLogout', () => {
    it('should logout successfully and clear user data', async () => {
      (logout as jest.Mock).mockResolvedValue({
        status: 200,
        message: 'Logout successful'
      });

      const result = await UserLogout();

      expect(logout).toHaveBeenCalled();
      expect(setState).toHaveBeenCalledWith('logged_out');
      expect(deleteNotificationSettings).toHaveBeenCalled();
      expect(deleteSecuritySettings).toHaveBeenCalled();
      expect(deleteUserData).toHaveBeenCalled();
      expect(deleteToken).toHaveBeenCalled();
      expect(deleteUserEmail).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith('/login');
      expect(result).toBe('Logout successful');
    });

    it('should handle logout failure', async () => {
      (logout as jest.Mock).mockResolvedValue({
        status: 400,
        message: 'Logout failed'
      });

      const result = await UserLogout();

      expect(logout).toHaveBeenCalled();
      expect(setState).not.toHaveBeenCalled();
      expect(deleteNotificationSettings).not.toHaveBeenCalled();
      expect(deleteSecuritySettings).not.toHaveBeenCalled();
      expect(deleteUserData).not.toHaveBeenCalled();
      expect(deleteToken).not.toHaveBeenCalled();
      expect(deleteUserEmail).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
      expect(result).toBe('Logout failed');
    });

    it('should handle errors during logout', async () => {
      (logout as jest.Mock).mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await UserLogout();

      expect(consoleSpy).toHaveBeenCalledWith('Error:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});